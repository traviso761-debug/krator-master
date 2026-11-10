"""Build 6 Krator outfits (torso + head pieces) inspired by the 5 user reference images.

Generates skinned .glb and .morph.bin files in core/charactermodels/pieces/mpfb_male/,
registers them in core/charactermodels/data/mpfb_male/kit.json, and packs dist/cosmetic-lab.html.
"""
import base64
import concurrent.futures
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
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[3]          # core/charactermodels (this file: tools/garments/cultures/)
sys.path.insert(0, str(ROOT / 'tools'))
import arms2
import glbio
import make_kit
import make_mpfb
import make_pieces as mp
# the package's own functions (2026-11-10: this file carried copies of them, some from an older core)
from garments.core import J, spine_at, first_hit, nearest, frame, head_frame, ring_points, smooth_push, hang, hull2, hull_rows, register_entries
from garments.types.torso import torso_tube, collar_disc, band, pauldron
from garments.types.limbs import limb_tube, sleeves
from garments.types.accoutrements import flap, blob, horn
from garments.types.headgear import head_rings, brim, tower_hat, hood

TEX = 1024
LIB = ROOT.parent.parent / 'core' / 'materials' / 'library'

# Linear colour palette from make_garments.py + custom shades for the 6 reference outfits
C = {
    'maguey': (0.70, 0.64, 0.52), 'cotton': (0.86, 0.82, 0.72), 'earth': (0.42, 0.30, 0.20), 'soot': (0.10, 0.09, 0.09),
    'ochre': (0.66, 0.42, 0.13), 'madder': (0.58, 0.18, 0.12), 'indigo': (0.10, 0.13, 0.28), 'rust': (0.55, 0.28, 0.14),
    'clay': (0.66, 0.38, 0.24), 'umber': (0.30, 0.21, 0.15), 'purple': (0.17, 0.06, 0.22), 'ash': (0.86, 0.84, 0.82),
    'crimson': (0.42, 0.04, 0.07), 'gold': (0.86, 0.64, 0.22), 'jade': (0.16, 0.48, 0.36), 'quetzal': (0.10, 0.42, 0.30),
    'leather': (0.36, 0.22, 0.12), 'hide': (0.58, 0.42, 0.28), 'black': (0.06, 0.05, 0.05), 'teal': (0.12, 0.36, 0.38),
    'oat': (0.70, 0.64, 0.52), 'moss': (0.30, 0.33, 0.21), 'bark': (0.30, 0.23, 0.17), 'sand': (0.78, 0.62, 0.42),
    'saddle': (0.45, 0.27, 0.14), 'slate': (0.27, 0.29, 0.31), 'verdigris': (0.26, 0.52, 0.46), 'cream': (0.88, 0.84, 0.74),
    'copper': (0.62, 0.35, 0.18), 'ancient': (0.86, 0.88, 0.89), 'sunorange': (0.86, 0.47, 0.13), 'deepgreen': (0.08, 0.18, 0.13),
    'buck': (0.72, 0.56, 0.38), 'bone': (0.88, 0.84, 0.72), 'fur': (0.44, 0.33, 0.22), 'darkfur': (0.20, 0.15, 0.11),
    'jungle': (0.20, 0.44, 0.26), 'mint': (0.52, 0.88, 0.62), 'rose': (0.84, 0.54, 0.50), 'lilac': (0.64, 0.56, 0.78),
    'turq': (0.20, 0.62, 0.62), 'mongolblue': (0.16, 0.30, 0.58), 'saffron': (0.93, 0.66, 0.20), 'maroon': (0.42, 0.11, 0.14),
    'peach': (0.90, 0.64, 0.42), 'sky': (0.42, 0.66, 0.84),
    'sealinen': (0.87, 0.85, 0.78), 'nacre': (0.91, 0.90, 0.92), 'bronze': (0.64, 0.45, 0.20), 'olive': (0.42, 0.40, 0.24),
    'slateblue': (0.32, 0.41, 0.54), 'deepsea': (0.10, 0.20, 0.31),
    'terracotta': (0.70, 0.36, 0.22), 'holyred': (0.74, 0.10, 0.10), 'godteal': (0.28, 0.88, 0.72), 'white': (0.95, 0.94, 0.91),
    'yuniyellow': (0.96, 0.78, 0.18), 'mud': (0.40, 0.28, 0.18), 'sahel': (0.93, 0.91, 0.84), 'orderblue': (0.20, 0.36, 0.70),
    'silver': (0.78, 0.78, 0.80), 'pomegranate': (0.62, 0.12, 0.16), 'peacock': (0.06, 0.42, 0.44), 'lacrose': (0.72, 0.42, 0.52),
    'yakbrown': (0.34, 0.24, 0.16), 'heather': (0.42, 0.34, 0.36), 'loden': (0.22, 0.28, 0.18), 'iron': (0.30, 0.31, 0.33),
    'repred': (0.68, 0.08, 0.08), 'repochre': (0.78, 0.55, 0.18), 'repcream': (0.92, 0.88, 0.78), 'felt': (0.46, 0.45, 0.43),
    'linen': (0.88, 0.85, 0.76), 'velvet': (0.07, 0.06, 0.07), 'brass': (0.78, 0.62, 0.28), 'greyblue': (0.34, 0.38, 0.44),
    'repgrey': (0.38, 0.39, 0.37), 'repgreyd': (0.24, 0.25, 0.24), 'drab': (0.40, 0.38, 0.29), 'drabd': (0.30, 0.28, 0.21),
    'repblack': (0.11, 0.11, 0.12),
    # Custom shades tuned for the 5 reference images
    'dunesand': (0.52, 0.48, 0.34),
    'duneumber': (0.26, 0.21, 0.18),
    'shroudtaupe': (0.44, 0.36, 0.34),
    'shroudoat': (0.58, 0.54, 0.42),
    'ashrobe': (0.48, 0.44, 0.38),
    'oxblood': (0.16, 0.02, 0.04),
    'sable': (0.12, 0.07, 0.04),
    'emerald': (0.04, 0.28, 0.19),
    'darkemerald': (0.02, 0.14, 0.10),
    'cobalt': (0.12, 0.26, 0.58),
    'magenta': (0.58, 0.14, 0.30),
    'magentapink': (0.76, 0.26, 0.46),
    'porcelain': (0.93, 0.92, 0.90),
    'porcelainblue': (0.52, 0.72, 0.76),
    'amber': (0.96, 0.58, 0.08),
    'neonmagenta': (0.92, 0.14, 0.72),
    'cybercyan': (0.22, 0.82, 0.95),
    'taupe': (0.58, 0.52, 0.44),
    'charcoal': (0.14, 0.14, 0.15),
    'neonyellow': (0.98, 0.92, 0.16),
    'rustred': (0.64, 0.18, 0.12),
    'ivory': (0.92, 0.89, 0.80),
    'sage': (0.48, 0.56, 0.44),
    'scarlet': (0.78, 0.12, 0.12),
    'khaki': (0.68, 0.62, 0.46),
    'olivegrey': (0.38, 0.40, 0.34),
    'steel': (0.52, 0.55, 0.58),
    'plum': (0.36, 0.14, 0.28),
    'wine': (0.38, 0.08, 0.14),
}

FABRIC = {
    'cloth.weave.plain': 0.12, 'cloth.weave.twill': 0.15, 'cloth.plain': 0.25, 'cloth.silk': 0.3, 'cloth.felt': 0.3,
    'cloth.weave.burlap': 0.2, 'cloth.cotton.coarse': 0.2, 'cloth.wool': 0.2, 'cloth.velvet': 0.2, 'cloth.quilted': 0.3,
    'cloth.bazin': 0.3, 'cloth.oiled': 0.3, 'leather.polished': 0.25, 'leather.buckskin': 0.3, 'fur.short': 0.2,
    'fur.astrakhan': 0.15, 'straw.plaited': 0.2, 'beads.glass': 0.12, 'shell.nacre': 0.3, 'metal.gold': 0.3,
    'metal.bronze': 0.3, 'metal.iron': 0.3
}
FABRIC_OF = {
    'maguey': 'cloth.weave.burlap', 'cotton': 'cloth.cotton.coarse', 'sahel': 'cloth.cotton.coarse',
    'white': 'cloth.cotton.coarse', 'linen': 'cloth.plain', 'sealinen': 'cloth.plain', 'cream': 'cloth.plain',
    'leather': 'leather.polished', 'saddle': 'leather.polished', 'hide': 'leather.buckskin', 'buck': 'leather.buckskin',
    'fur': 'fur.short', 'darkfur': 'fur.short', 'felt': 'cloth.felt', 'velvet': 'cloth.velvet',
    'purple': 'cloth.silk', 'crimson': 'cloth.silk', 'mongolblue': 'cloth.silk', 'saffron': 'cloth.silk', 'maroon': 'cloth.silk',
    'yuniyellow': 'cloth.bazin', 'drab': 'cloth.quilted', 'repgrey': 'cloth.wool', 'repgreyd': 'cloth.wool',
    'repblack': 'cloth.wool', 'repred': 'cloth.wool', 'repochre': 'cloth.wool', 'repcream': 'cloth.plain',
    'nacre': 'shell.nacre', 'gold': 'metal.gold', 'bronze': 'metal.bronze', 'copper': 'metal.bronze', 'brass': 'metal.bronze',
    'iron': 'metal.iron', 'silver': 'metal.iron', 'yakbrown': 'cloth.wool', 'earth': 'cloth.wool', 'umber': 'cloth.wool',
    'dunesand': 'cloth.cotton.coarse', 'duneumber': 'cloth.wool', 'shroudtaupe': 'cloth.cotton.coarse',
    'shroudoat': 'cloth.weave.burlap', 'ashrobe': 'cloth.weave.burlap'
}
GRAIN = {}


def grain(fid):
    if fid not in GRAIN:
        path = LIB / fid / 'albedo.jpg'
        g = None
        if path.exists() and path.stat().st_size > 1000:
            im = Image.open(path).convert('RGB')
            px = np.asarray(im, dtype=np.float32) / 255.0
            px = np.power(px, 2.2)
            lum = px @ np.array([0.299, 0.587, 0.114], np.float32)
            g = (lum / max(float(lum.mean()), 1e-3)).clip(0.4, 1.6)
        GRAIN[fid] = g
    return GRAIN[fid]


# ---------------------------------------------------------------------------------------------------------------
# Load base male mesh & rig in Blender coordinates (Z up, -Y forward, +X left) to match make_garments.py
BASE_GLB = ROOT / 'pieces' / 'mpfb_male' / 'base.glb'
RIG = mp.load(str(BASE_GLB))
RIG.J = {n: i for i, n in enumerate(RIG.joints)}

_, BP_GL, BT = make_mpfb.body_primitive(str(BASE_GLB))
CO = arms2.from_gl(BP_GL)
POLY = BT

# Read base skin JOINTS_0 and WEIGHTS_0 for skinning transfer
_bj, _bb = glbio.read_glb(BASE_GLB.read_bytes())
_bprim = next(p for m in _bj['meshes'] for p in m['primitives']
              if 'material' in p and _bj['materials'][p['material']]['name'].endswith('.body'))
BASE_JJ = glbio.accessor(_bj, _bb, _bprim['attributes']['JOINTS_0']).astype(np.int32)
BASE_WW = glbio.accessor(_bj, _bb, _bprim['attributes']['WEIGHTS_0']).astype(np.float32)
BASE_WW /= np.maximum(BASE_WW.sum(axis=1, keepdims=True), 1e-9)
BASE_VIDX = np.rint(glbio.accessor(_bj, _bb, _bprim['attributes']['_VIDX']).reshape(-1)).astype(np.int32)
BASE_TREE_GL = cKDTree(BP_GL)
_bskin = _bj['skins'][0]
_bjoint_names = [_bj['nodes'][k].get('name', '').split(':')[-1] for k in _bskin['joints']]
_arm_j_mask = np.array([
    any(nm.startswith(p) for p in ('LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand', 'Head'))
    for nm in _bjoint_names
], dtype=bool)
BASE_ARM_W = (BASE_WW * _arm_j_mask[BASE_JJ]).sum(axis=1)
TRUNK_IDX = np.nonzero(BASE_ARM_W < 0.08)[0]
TRUNK_TREE_GL = cKDTree(BP_GL[TRUNK_IDX])


class FastBVH:
    """Fast pure-Python replacement for Blender's BVHTree on CO and triangle subset T."""
    def __init__(self, V, T):
        self.V = np.asarray(V, dtype=np.float64)
        self.T = np.asarray(T, dtype=np.int32)
        self.a = self.V[self.T[:, 0]]
        self.b = self.V[self.T[:, 1]]
        self.c = self.V[self.T[:, 2]]
        self.e1 = self.b - self.a
        self.e2 = self.c - self.a
        fn = np.cross(self.e1, self.e2)
        fl = np.linalg.norm(fn, axis=1, keepdims=True)
        self.fn = fn / np.maximum(fl, 1e-12)
        self.ctr = (self.a + self.b + self.c) / 3.0
        v_nrm = np.zeros_like(self.V)
        for k in range(3):
            np.add.at(v_nrm, self.T[:, k], fn)
        vl = np.linalg.norm(v_nrm, axis=1, keepdims=True)
        self.vn = v_nrm / np.maximum(vl, 1e-12)
        used = np.unique(self.T.reshape(-1))
        self.used = used
        self.vtree = cKDTree(self.V[used])
        self.tmin = np.minimum(np.minimum(self.a, self.b), self.c)
        self.tmax = np.maximum(np.maximum(self.a, self.b), self.c)

    def nearest(self, p):
        _, idx = self.vtree.query(p)
        vi = self.used[idx]
        return self.V[vi].copy(), self.vn[vi].copy()

    def ray_cast(self, o, d, maxd=0.6):
        o = np.asarray(o, dtype=np.float64)
        d = np.asarray(d, dtype=np.float64)
        p1 = o + d * maxd
        rmin = np.minimum(o, p1) - 0.005
        rmax = np.maximum(o, p1) + 0.005
        cand = np.nonzero(
            (self.tmax[:, 0] >= rmin[0]) & (self.tmin[:, 0] <= rmax[0]) &
            (self.tmax[:, 1] >= rmin[1]) & (self.tmin[:, 1] <= rmax[1]) &
            (self.tmax[:, 2] >= rmin[2]) & (self.tmin[:, 2] <= rmax[2])
        )[0]
        if not len(cand):
            return None
        e1 = self.e1[cand]
        e2 = self.e2[cand]
        pv = np.cross(d[None, :], e2)
        det = (e1 * pv).sum(axis=1)
        ok = np.abs(det) > 1e-10
        if not ok.any():
            return None
        inv = np.where(ok, 1.0 / np.where(ok, det, 1.0), 0.0)
        tv = o[None, :] - self.a[cand]
        u = (tv * pv).sum(axis=1) * inv
        qv = np.cross(tv, e1)
        v = (d[None, :] * qv).sum(axis=1) * inv
        t = (e2 * qv).sum(axis=1) * inv
        good = ok & (u >= -1e-5) & (v >= -1e-5) & (u + v <= 1.0 + 1e-5) & (t >= 0.0) & (t <= maxd)
        if not good.any():
            return None
        return float(t[good].min())


TAIL_MAP = {
    'LeftHand': 'LeftHandMiddle1',
    'RightHand': 'RightHandMiddle1',
    'LeftToeBase': 'LeftToe_End',
    'RightToeBase': 'RightToe_End',
}


def _arm_mask():
    arm = BASE_ARM_W > 0.08
    for s in ('Left', 'Right'):
        a, b = J(s + 'Arm'), J(s + 'Hand', 'tail')
        d = (b - a) / np.linalg.norm(b - a)
        t = (CO - a) @ d
        dist = np.linalg.norm(CO - a - np.outer(t, d), axis=1)
        arm |= (t > 0.015) & (dist < 0.12)
    return arm


def _limb_mask():
    m = np.zeros(len(CO), bool)
    for s in ('Left', 'Right'):
        for a, b in ((J(s + 'Arm') - (J(s + 'ForeArm') - J(s + 'Arm')) * 0.45, J(s + 'ForeArm')),
                     (J(s + 'ForeArm'), J(s + 'Hand', 'tail'))):
            d = b - a
            L = np.linalg.norm(d)
            d = d / L
            t = (CO - a) @ d
            dist = np.linalg.norm(CO - a - np.outer(t, d), axis=1)
            m |= (t > -0.02) & (t < L + 0.02) & (dist < 0.12)
    return m


ARM = _arm_mask()
_LM = _limb_mask()
BVH = FastBVH(CO, POLY)
BVH_T = FastBVH(CO, [p for p in POLY if not any(ARM[i] for i in p)])
BVH_A = FastBVH(CO, [p for p in POLY if all(_LM[i] for i in p)])

HIPS, NECK, HEAD = J('Hips'), J('Neck'), J('Head')
CROTCH = J('LeftUpLeg')[2] - 0.075
WAIST = J('Spine')[2] + 0.02
CHEST = J('Spine2')[2] + 0.02
TOP = NECK[2] + 0.005
KNEE = J('LeftLeg')[2]
ANKLE = J('LeftFoot')[2]
SHOULDER = J('LeftArm')[2]
FRONT = np.array([0, -1.0, 0])
L, R = 'Left', 'Right'


def _out(c, d, extra):
    h = first_hit(c, d)
    return c + d * ((h or 0.12) + extra)


def _front(z, extra, x=0.0):
    c = spine_at(z) + np.array([x, 0.0, 0.0])
    d = np.array([0, -1.0, 0])
    h = first_hit(c, d, bvh=BVH_T)
    return c + d * ((h or 0.12) + extra)


class Part:
    def __init__(self, name, P, closed, group, paint, rigid_joint=None):
        self.name = name
        self.P = np.asarray(P, dtype=np.float64)
        self.closed = closed
        self.group = group
        self.paint = paint
        self.cloth = None
        self.rigid_joint = rigid_joint
        self.is_arm = False

    def lengths(self):
        P = self.P
        cols = np.linalg.norm(np.diff(P, axis=0), axis=2).sum(0).mean()
        R = np.concatenate([P, P[:, :1]], 1) if self.closed else P
        rows = np.linalg.norm(np.diff(R, axis=1), axis=2).sum(1).mean()
        return rows, cols


# ---------------------------------------------------------------------------------------------------------------
# Texture painting with custom motifs (formline, quatrefoil diamond, fluted brass, wood slats, pleat ribs)
rng = np.random.default_rng(7)
FRET = [
    "XXXXXXXXXXXX",
    "X..........X",
    "X.XXXXXXXX.X",
    "X.X......X.X",
    "X.X.XXXX.X.X",
    "X.X.X..X.X.X",
    "X.X.X..XXX.X",
    "X.X.X......X",
    "X.X.XXXXXXXX",
    "X.X.........",
    "X.XXXXXXXXXX",
    "X..........."
]
FRETA = np.array([[c == 'X' for c in r] for r in FRET])


def P(base, weave=0.07, bands=(), panels=(), fabric=None):
    f = fabric or (FABRIC_OF.get(base, 'cloth.weave.plain') if isinstance(base, str) else 'cloth.weave.plain')
    return {
        'base': C[base] if isinstance(base, str) else base,
        'weave': weave,
        'bands': list(bands),
        'panels': list(panels),
        'fabric': f
    }


def PN(u0, u1, style, fg, bg, rep=0.25, down=None):
    return (u0, u1, style, C[fg] if isinstance(fg, str) else fg, C[bg] if isinstance(bg, str) else bg, rep, down)


def B(where, a, b, style, fg, bg=None, rep=0.08):
    return (where, a, b, style, C[fg] if isinstance(fg, str) else fg,
            (C[bg] if isinstance(bg, str) else bg) if bg else None, rep)


def motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((h, w, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)
    if style == 'solid':
        img[:] = fg
    elif style == 'fret':
        m = FRETA[(v * FRETA.shape[0]).astype(int).clip(0, FRETA.shape[0] - 1),
                  (u * FRETA.shape[1]).astype(int).clip(0, FRETA.shape[1] - 1)]
        img[m] = fg
    elif style == 'steps':
        s = np.floor(np.minimum(u, 1 - u) * 8) / 4
        img[(1 - v) < s] = fg
    elif style in ('zigzag', 'chevron', 'chevrons'):
        tri = np.abs(((u * 2) % 2) - 1)
        img[np.abs(v - (0.15 + 0.7 * tri)) < 0.16] = fg
    elif style == 'diamonds':
        d = np.abs(u - 0.5) * 2 + np.abs(v - 0.5) * 2
        img[(d < 0.92) & (d > 0.48)] = fg
        img[d < 0.22] = fg
    elif style == 'nomad_diamond':
        # Ornate diamond-and-quatrefoil cross tapestry motif from Ref Image 1
        dx, dy = np.abs(u - 0.5) * 2, np.abs(v - 0.5) * 2
        d = dx + dy
        # Outer stepped frame in madder/rose
        img[(dx > 0.86) | (dy > 0.86)] = C['madder']
        # Diamond band in cream/sky
        img[(d < 0.90) & (d > 0.64)] = C['cream']
        img[(d < 0.78) & (d > 0.70)] = C['madder']
        # Inner dark diamond field
        img[d <= 0.64] = C['soot']
        # Central 4-petal star/cross in cream & sky
        cross = ((dx < 0.14) & (dy < 0.46)) | ((dy < 0.14) & (dx < 0.46)) | ((dx + dy) < 0.26)
        img[cross] = fg
        # Corner triangles in lilac/rose
        img[(d > 0.90) & (dx < 0.86) & (dy < 0.86)] = C['lacrose']
    elif style == 'formline_eye':
        # PNW Formline ovoid eye joint from Ref Image 5
        ax, ay = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        # Rounded rectangle / ovoid outer black/madder formline
        ov = (ax ** 2) * 0.75 + (ay ** 2) * 1.15
        img[ov < 0.82] = fg  # outer madder/red or black
        img[ov < 0.54] = C['bone']  # white sclera
        img[ov < 0.28] = C['turq']  # turquoise iris rim
        img[ov < 0.14] = C['soot']  # dark pupil
        # White highlight dot
        img[((ax - 0.12) ** 2 + (ay + 0.10) ** 2) < 0.018] = C['white']
    elif style == 'formline_visage':
        # Totemic helmet face: in tower_hat, v=0 is bottom (brim) and v=1 is top (crown), so vf = 1.0 - v!
        vf = 1.0 - v
        ax = np.abs(u - 0.5) * 2.0
        # Eye sockets left & right
        ex = (np.abs(u - 0.5) - 0.22) * 4.2
        ey = (vf - 0.36) * 4.2
        e_ov = ex ** 2 + ey ** 2
        img[e_ov < 0.95] = C['turq']
        img[e_ov < 0.55] = C['white']
        img[e_ov < 0.20] = C['soot']
        # Nose/beak bridge at center
        img[(ax < 0.16) & (vf > 0.15) & (vf < 0.52)] = C['ochre']
        # Grinning mouth arch at lower helmet above the brim
        mx = (u - 0.5) * 2.0
        my = (vf - 0.74) * 3.2
        m_arch = (np.abs(mx) < 0.68) & (np.abs(my + 0.18 * (1 - mx ** 2)) < 0.52)
        img[m_arch] = C['ochre']
        m_in = (np.abs(mx) < 0.58) & (np.abs(my + 0.18 * (1 - mx ** 2)) < 0.32)
        img[m_in] = C['bone']
        # Vertical teeth bars and center lip line
        teeth_grid = ((np.floor(u * 18) % 2 == 0) | (np.abs(my + 0.18 * (1 - mx ** 2)) < 0.05))
        img[m_in & teeth_grid] = C['soot']
    elif style == 'slat_wood':
        # Bound wooden rod-and-slat armour: vertical wooden slats + horizontal rawhide lashing
        slat_edge = ((u * 16) % 1) < 0.14
        img[slat_edge] = C['soot']
        lash = ((v * 3) % 1) < 0.22
        img[lash] = fg
        lash_cord = lash & (((u * 48) % 1) < 0.3)
        img[lash_cord] = C['soot']
    elif style == 'gold_grid':
        # Magistrate's dark-green & gold lattice under-cassock (Ref Image 3)
        gu, gv = (u * 2) % 1, (v * 2) % 1
        line = (gu < 0.12) | (gv < 0.12)
        dot = (np.abs(gu - 0.56) < 0.16) & (np.abs(gv - 0.56) < 0.16)
        img[line | dot] = fg
    elif style == 'fluted':
        # Fluted brass ribs
        rib = 0.5 + 0.5 * np.sin(u * 2 * math.pi * 3)
        img[:] = np.asarray(bg)[None, None, :] * (0.72 + 0.38 * rib[:, :, None])
        img[(u * 6) % 1 < 0.12] = fg
    elif style == 'checks':
        img[((u * 2).astype(int) + (v * 2).astype(int)) % 2 == 0] = fg
    elif style == 'stripes':
        img[(v * 4).astype(int) % 2 == 0] = fg
    elif style == 'vstripes':
        img[(u * 4).astype(int) % 2 == 0] = fg
    elif style == 'dots':
        img[((u - 0.5) ** 2 + (v - 0.5) ** 2) < 0.06] = fg
    elif style == 'teeth':
        img[v < (1 - np.abs(u - 0.5) * 2) * 0.85] = fg
    elif style == 'dentils':
        # White shell/tooth rim band
        img[((u * 4) % 1) < 0.68] = fg
        img[v < 0.15] = C['soot']
        img[v > 0.85] = C['soot']
    elif style == 'rays':
        img[(u * 2).astype(int) % 2 == 0] = fg
    elif style == 'quilt':
        a1, a2 = ((u + v) * 1.0) % 1, ((u - v) * 1.0) % 1
        img[(np.abs(a1 - 0.5) < 0.045) | (np.abs(a2 - 0.5) < 0.045)] = fg
    elif style == 'cross':
        gu, gv = np.floor(u * 9), np.floor(v * 9)
        d = np.abs(gu - 4) + np.abs(gv - 4)
        img[(d == 4) | ((d <= 1) & ((gu == 4) | (gv == 4)))] = fg
    elif style == 'beads':
        img[(((u * 3) % 1 - 0.5) ** 2 + ((v * 2) % 1 - 0.5) ** 2) < 0.12] = fg
    elif style == 'coin_veil':
        # Overlapping antique silver coin-mail lattice + carnelian beads (Batch 2 Image 1)
        row_idx = np.floor(v * 6).astype(int)
        cu = (u * 8 + 0.5 * (row_idx % 2)) % 1 - 0.5
        cv = (v * 6) % 1 - 0.5
        r2 = cu ** 2 + cv ** 2
        # Coin disc in tarnished silver with dark engraved ring and bright center boss
        img[r2 < 0.24] = C['iron']
        img[r2 < 0.20] = fg
        img[(r2 < 0.12) & (r2 > 0.07)] = C['iron']
        img[r2 < 0.03] = C['white']
        # Carnelian orange-red bead accents on every 3rd row
        bead_m = ((row_idx % 3) == 1) & (((u * 8) % 1 - 0.5) ** 2 + (cv + 0.35) ** 2 < 0.055)
        img[bead_m] = C['sunorange']
    elif style == 'polos_mosaic':
        # Black-and-cream tessellated mosaic tiles / sea-foam cells (Batch 2 Image 2 Center)
        row_m = np.floor(v * 8).astype(int)
        mu = (u * 8 + 0.37 * (row_m % 3)) % 1
        mv = (v * 8) % 1
        tile = (mu > 0.14) & (mu < 0.86) & (mv > 0.16) & (mv < 0.86)
        img[:] = bg
        img[tile] = fg
    elif style == 'fluted_beard':
        # Vertically-fluted ceremonial mask beard (Batch 2 Image 2)
        rib = 0.5 + 0.5 * np.sin(u * 2 * math.pi * 14)
        img[:] = np.asarray(fg)[None, None, :] * (0.52 + 0.55 * rib[:, :, None])
        img[((u * 14) % 1) < 0.16] = np.asarray(fg) * 0.25
        img[(v < 0.04) | (v > 0.95)] = np.asarray(fg) * 0.35
    elif style == 'star_stole':
        # Saffron stole scattered with dark blue 5-pointed/6-pointed stars (Batch 2 Image 2 Center)
        img[:] = bg
        for sx, sy, col_s in ((0.28, 0.20, fg), (0.72, 0.45, fg), (0.32, 0.72, C['ochre']), (0.68, 0.88, fg)):
            dx, dy = (u - sx) * 2.2, (v - sy) * 3.8
            rr = np.hypot(dx, dy)
            th = np.arctan2(dy, dx)
            star = rr < 0.32 * (0.52 + 0.48 * np.cos(5 * th))
            img[star] = col_s
    elif style == 'pelagic_stole':
        # Central liturgical stole with sun-ray chest register, dotted indigo ladder & totemic registers (Batch 2 Image 2)
        img[:] = bg
        # 1. Upper chest sun-ray fan (v = 0.03 .. 0.20)
        in_top = (v > 0.03) & (v < 0.20) & (np.abs(u - 0.5) < 0.42)
        ray_an = np.arctan2(0.21 - v, u - 0.5)
        rays_m = in_top & (((ray_an / math.pi * 9) % 1) < 0.52)
        img[in_top] = C['soot']
        img[rays_m] = C['holyred']
        # 2. White-dotted indigo ladder column along center (v = 0.20 .. 0.52)
        ladder = (np.abs(u - 0.5) < 0.22) & (v >= 0.20) & (v < 0.52)
        img[ladder] = C['indigo']
        dots_l = ladder & (((u * 12) % 1 - 0.5) ** 2 + ((v * 28) % 1 - 0.5) ** 2 < 0.12)
        img[dots_l] = C['white']
        # 3. Lower totemic registers (green mask, red band, white zigzag, orange pillars)
        reg_g = (np.abs(u - 0.5) < 0.34) & (v >= 0.52) & (v < 0.68)
        img[reg_g] = C['jungle']
        img[reg_g & (np.abs(np.abs(u - 0.5) - 0.14) < 0.06) & (np.abs(v - 0.59) < 0.025)] = C['holyred']
        reg_r = (np.abs(u - 0.5) < 0.34) & (v >= 0.68) & (v < 0.80)
        img[reg_r] = C['holyred']
        zig = reg_r & (np.abs((v - 0.71) * 28 - np.abs(((u * 10) % 2) - 1)) < 0.38)
        img[zig] = C['white']
        reg_b = (np.abs(u - 0.5) < 0.36) & (v >= 0.80)
        img[reg_b & (np.abs(u - 0.5) > 0.14)] = C['sunorange']
    elif style == 'net_mesh':
        # Reticulated black fishing-net diamond mesh over vermilion red (Batch 2 Image 2 Flanking)
        img[:] = bg
        d1 = np.abs(((u * 3 + v * 2) % 1) - 0.5)
        d2 = np.abs(((u * 3 - v * 2) % 1) - 0.5)
        cord = (d1 < 0.13) | (d2 < 0.13)
        knot = (d1 < 0.18) & (d2 < 0.18)
        img[cord] = fg
        img[knot] = C['soot']
    elif style == 'labyrinth_panel':
        # Raised madder-and-cream rectangular labyrinth/circuitry embroidery (Batch 2 Image 3)
        img[:] = bg
        bx = np.minimum(u, 1.0 - u)
        by = np.minimum(v, 1.0 - v)
        # Outer cream & madder rectangular frames
        img[(bx < 0.14) | (by < 0.10)] = C['madder']
        img[((bx >= 0.04) & (bx < 0.09)) | ((by >= 0.03) & (by < 0.065))] = C['cream']
        # Inner labyrinth meander grid
        in_box = (bx >= 0.16) & (by >= 0.12)
        gu = np.floor(u * 12).astype(int)
        gv = np.floor(v * 16).astype(int)
        maze = ((gu % 2 == 0) & (gv % 3 != 1)) | ((gv % 2 == 0) & (gu % 3 != 2))
        img[in_box & maze] = fg
        img[in_box & ~maze & (((gu + gv) % 3) == 0)] = C['madder']
    elif style == 'kiln_mask':
        # Fired terracotta/umber beehive mask with red bands, white arch-eyes & black mouth hole (Batch 2 Image 4)
        vf = 1.0 - v
        img[:] = bg
        # Horizontal red-ochre painted stripes
        for yc in (0.20, 0.48, 0.74):
            img[np.abs(vf - yc) < 0.042] = C['holyred']
        # White D-shaped arch eyes & center vertical brow mark
        ex = (np.abs(u - 0.5) - 0.16) * 5.2
        ey = (vf - 0.42) * 6.0
        arch = (ey <= 0.15) & (ey >= -0.85) & ((ex ** 2 + (ey - 0.15) ** 2) < 0.85)
        arch_hole = (ey <= 0.02) & (ey >= -0.55) & ((ex ** 2 + (ey - 0.02) ** 2) < 0.28)
        img[arch] = C['white']
        img[arch_hole] = C['umber']
        img[(np.abs(u - 0.5) < 0.035) & (vf > 0.26) & (vf < 0.42)] = C['white']
        # Dark circular mouth aperture at lower front rimmed in white clay slip
        mx = (u - 0.5) * 3.8
        my = (vf - 0.78) * 3.2
        m_r2 = mx ** 2 + my ** 2
        img[m_r2 < 0.82] = C['white']
        img[m_r2 < 0.54] = C['soot']
    elif style == 'gourd_holes':
        # Perforated terracotta gourd leg-rattles with acoustic holes & red-ochre band (Batch 2 Image 4)
        img[:] = bg
        img[np.abs(v - 0.52) < 0.08] = C['holyred']
        for hx, hy in ((0.22, 0.34), (0.52, 0.70), (0.78, 0.36)):
            hr2 = ((u - hx) * 3.2) ** 2 + ((v - hy) * 2.6) ** 2
            img[hr2 < 0.22] = C['soot']
    elif style == 'pleated_kilt':
        # Finely pleated indigo-blue skirt with diagonal fold sheen & red lower border (Batch 2 Image 5)
        pleat = 0.5 + 0.5 * np.sin((u * 28 + v * 1.5) * 2 * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * (0.72 + 0.42 * pleat[:, :, None])
        img[v > 0.92] = C['madder']
        img[(v > 0.89) & (v <= 0.92)] = C['sky']
    elif style == 'fila_embroidery':
        # Circular silver-rose rosette medallions & foliate scroll sprays on maroon velvet (Batch 3 Image 1)
        img[:] = bg
        cx = ((u * 2.0) % 1.0) - 0.5
        cy = v - 0.5
        r = np.sqrt(cx ** 2 + cy ** 2)
        ang = np.arctan2(cy, cx)
        # Rosette ring + inner 8-petal star
        rosette = (np.abs(r - 0.28) < 0.045) | ((r < 0.22) & (np.abs(np.cos(ang * 4)) > 0.65))
        # Flanking foliate scroll vines
        vine = (np.abs(cx) > 0.30) & (np.abs(cy - 0.18 * np.sin(cx * 10.0)) < 0.055)
        img[rosette | vine] = fg
    elif style == 'agbada_scroll':
        # Symmetrical rose-cream chain-stitch S-scrolls & heart volutes on deep burgundy agbada chest (Batch 3 Image 1)
        img[:] = bg
        sx = np.abs(u - 0.5) * 2.0  # 0 at center, 1 at panel edge
        # Pointed shield-shaped lower plastron boundary
        in_shield = v < (0.94 - 0.26 * sx)
        # Three stacked pairs of symmetrical S-volute scrolls
        vy = (v * 3.2) % 1.0 - 0.5
        vx = sx - 0.44 - 0.20 * np.sin(vy * math.pi * 2.0)
        scroll = in_shield & ((np.abs(vx) < 0.13) | (np.abs(vx) < 0.22) & (np.abs(vy) < 0.16))
        scroll_core = in_shield & (np.abs(vx) < 0.05)
        # Center vertical seam & pointed tip chevron
        seam = in_shield & ((sx < 0.06) | (np.abs(v - (0.90 - 0.26 * sx)) < 0.035))
        img[scroll | seam] = fg
        img[scroll_core] = C['lacrose']
    elif style == 'arabesque_border':
        # Black-on-rust scrolling floral/arabesque tapestry border (Batch 3 Image 2)
        img[:] = bg
        bx = np.minimum(u, 1.0 - u) * 2.0
        # Outer black guard stripes
        guard = (bx < 0.16) | ((bx > 0.22) & (bx < 0.28))
        # Scrolling vine wave in center channel
        wy = (v * 6.0) % 1.0 - 0.5
        wx = (u - 0.5) * 2.0
        vine = (bx >= 0.28) & ((np.abs(wx - 0.35 * np.sin(wy * 2 * math.pi)) < 0.18) |
                               (((wx + 0.25 * np.cos(wy * 2 * math.pi)) ** 2 + (wy * 1.4) ** 2) < 0.18))
        img[guard | vine] = fg
    elif style == 'heliophant_pectoral':
        # Multi-tiered turquoise & gold collar + dangling rectangular turquoise/orange tablets on cream poncho (Batch 3 Image 3)
        img[:] = bg
        ax = (u - 0.5) * 2.0
        r = np.sqrt((ax * 0.95) ** 2 + (v * 1.35) ** 2)
        ang = np.arctan2(v * 1.35, ax * 0.95)
        # Concentric turquoise & gold collar bands near throat (r < 0.48)
        img[(r > 0.18) & (r < 0.30)] = C['turq']
        img[(r >= 0.30) & (r < 0.35)] = C['soot']
        img[(r >= 0.35) & (r < 0.44) & ((np.floor(ang * 14) % 2) == 0)] = C['sunorange']
        # Beaded necklace arc at r ~ 0.54
        img[(np.abs(r - 0.54) < 0.035) & ((np.floor(ang * 18) % 2) == 0)] = C['turq']
        # Dangling vertical turquoise & saffron-orange rectangular pendant tablets below the arc
        col_idx = np.floor((u * 11.0)).astype(int)
        cu = (u * 11.0) % 1.0 - 0.5
        p_top = 0.36 + 0.16 * (1.0 - ax ** 2)
        p_bot = p_top + 0.24 + 0.06 * ((col_idx % 2) == 0)
        in_pend = (np.abs(ax) < 0.82) & (np.abs(cu) < 0.26) & (v > p_top) & (v < p_bot)
        img[in_pend & ((col_idx % 2) == 0)] = C['turq']
        img[in_pend & ((col_idx % 2) == 1)] = C['sunorange']
        img[in_pend & (v < p_top + 0.035)] = C['gold']
    elif style == 'wing_spots':
        # Coral-orange perforated wing pauldrons with yellow-rimmed turquoise eye-spots (Batch 3 Image 3)
        img[:] = bg
        for sx, sy, sr in ((0.25, 0.38, 0.18), (0.52, 0.52, 0.22), (0.76, 0.36, 0.18), (0.36, 0.74, 0.15), (0.66, 0.76, 0.15)):
            d2 = ((u - sx) * 2.2) ** 2 + ((v - sy) * 2.2) ** 2
            img[d2 < (sr * 2.2) ** 2] = C['yuniyellow']
            img[d2 < (sr * 1.45) ** 2] = C['turq']
        # Dark indigo lower scalloped border
        scallop = 0.82 + 0.08 * np.cos(u * 6.0 * math.pi)
        img[v > scallop] = C['indigo']
    elif style == 'brocade_skirt':
        # Crimson brocade skirt with horizontal gold-and-black tapestry bands (Batch 3 Image 4)
        img[:] = bg
        for yc, bw in ((0.28, 0.08), (0.58, 0.11), (0.84, 0.09)):
            in_b = np.abs(v - yc) < bw
            edge = np.abs(np.abs(v - yc) - bw) < 0.018
            med = in_b & ((((np.floor(u * 16) + np.floor(v * 24)) % 2) == 0) | (np.abs(((u * 8) % 1.0) - 0.5) < 0.18))
            img[in_b] = C['madder']
            img[med] = C['gold']
            img[edge] = C['gold']
    elif style == 'diamond_quilt':
        # Puffy 3D-shaded snow-white diamond-quilted gambeson padding with slate seam valleys (Batch 3 Image 5)
        du = (u * 5.0 + v * 3.0) % 1.0 - 0.5
        dv = (u * 5.0 - v * 3.0) % 1.0 - 0.5
        seam_dist = np.minimum(0.5 - np.abs(du), 0.5 - np.abs(dv))
        pillow = np.clip(seam_dist * 3.2, 0.0, 1.0) ** 0.55
        hl = 1.0 + 0.08 * (du + dv)
        shade = (0.72 + 0.32 * pillow) * hl
        img[:] = np.asarray(fg)[None, None, :] * shade[:, :, None]
        img[seam_dist < 0.06] = bg
    elif style == 'ancient_hex':
        # Salvaged Ancient ghost-white hexagonal composite plate lattice with bevelled slate seams & turquoise nodes
        nx = max(4.0, round(3.5 * aspect))
        su = u * nx
        sv = v * 3.5 * 0.866
        r_hex = np.floor(sv).astype(int)
        hu = (su + 0.5 * (r_hex % 2)) % 1.0 - 0.5
        hv = (sv % 1.0) - 0.5
        hex_d = np.maximum(np.abs(hu), np.abs(hu) * 0.5 + np.abs(hv) * 0.866)
        bevel = np.clip((0.46 - hex_d) * 5.0, 0.0, 1.0)
        img[:] = np.asarray(fg)[None, None, :] * (0.82 + 0.22 * bevel[:, :, None])
        img[hex_d > 0.41] = bg
        # Glowing turquoise conduit nodes at hex corners
        node = (hex_d > 0.38) & (np.abs(hv) > 0.34)
        img[node] = C['turq']
        # Gold top/bottom plate rim
        img[(v < 0.05) | (v > 0.95)] = C['gold']
    elif style == 'ancient_visor':
        # Ghost-white Ancient hex faceplate with bold glowing turquoise ocular visor slit & gold brow/nasal trim
        nx = max(5.0, round(4.0 * aspect))
        su = u * nx
        sv = v * 4.5 * 0.866
        r_hex = np.floor(sv).astype(int)
        hu = (su + 0.5 * (r_hex % 2)) % 1.0 - 0.5
        hv = (sv % 1.0) - 0.5
        hex_d = np.maximum(np.abs(hu), np.abs(hu) * 0.5 + np.abs(hv) * 0.866)
        bevel = np.clip((0.46 - hex_d) * 5.0, 0.0, 1.0)
        img[:] = np.asarray(fg)[None, None, :] * (0.82 + 0.22 * bevel[:, :, None])
        img[hex_d > 0.41] = bg
        # Gold brow & lower chin rims + central vertical nasal ridge
        img[(v < 0.08) | (v > 0.92)] = C['gold']
        img[(v > 0.28) & (np.abs(u - 0.5) < 0.035)] = C['gold']
        img[(v > 0.30) & (np.abs(u - 0.5) < 0.016)] = C['turq']
        # Glowing turquoise ocular slit across eye level (v = 0.14..0.28)
        in_visor = (v >= 0.14) & (v <= 0.28) & (np.abs(u - 0.5) < 0.36)
        visor_rim = (np.abs(v - 0.13) < 0.02) | (np.abs(v - 0.29) < 0.02)
        img[visor_rim & (np.abs(u - 0.5) < 0.38)] = C['gold']
        img[in_visor] = C['turq']
    elif style == 'lorica_lames':
        # Articulated horizontal bronze-and-gold lorica segmentata lames with rivets & verdigris inlay
        lame_v = (v * 3.5) % 1.0
        lame_shade = 0.76 + 0.32 * np.sin(lame_v * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * lame_shade[:, :, None]
        # Gold rim at bottom of each overlapping lame + dark shadow step
        img[(lame_v > 0.76) & (lame_v <= 0.88)] = fg
        img[lame_v > 0.88] = C['soot']
        # Copper/gold rivets spaced proportionally along each lame
        nx = max(6.0, round(3.5 * aspect))
        riv_u = (u * nx) % 1.0 - 0.5
        riv = (riv_u ** 2 + ((lame_v - 0.35) * 2.0) ** 2) < 0.045
        img[riv] = C['gold']
    elif style == 'lamellar_scale':
        # Overlapping D-shaped copper, bronze, and ghost-white Ancient salvage lamellar scales with leather lacing
        nx = max(8.0, round(4.5 * aspect))
        row_s = np.floor(v * 4.0).astype(int)
        su = (u * nx + 0.5 * (row_s % 2)) % 1.0 - 0.5
        sv = (v * 4.0) % 1.0
        arch = (su * 1.65) ** 2 + ((sv - 0.55) * 1.35) ** 2
        img[:] = C['soot']
        in_scale = arch < 0.82
        # Every 5th scale is salvaged white Ancient plate; others alternate bronze and copper
        is_anc = ((np.floor(u * nx).astype(int) + row_s * 3) % 5) == 0
        img[in_scale] = bg
        img[in_scale & is_anc] = C['ancient']
        img[in_scale & (arch > 0.56)] = fg
        # Crimson lacing cord at top of each scale row
        lace = (sv < 0.24) & (np.abs(su) < 0.18)
        img[lace] = C['crimson']
    elif style == 'quetzal_scale':
        # Iridescent emerald/turquoise/mint quetzal-carapace scale armor with golden quill shafts
        nx = max(6.0, round(5.5 * max(aspect, 1.0)))
        row_s = np.floor(v * 4.0).astype(int)
        su = (u * nx + 0.5 * (row_s % 2)) % 1.0 - 0.5
        sv = (v * 4.0) % 1.0
        arch = (su * 1.55) ** 2 + ((sv - 0.52) * 1.35) ** 2
        img[:] = C['deepgreen']
        in_scale = arch < 0.86
        is_turq = ((np.floor(u * nx).astype(int) + row_s * 2) % 3) == 0
        is_mint = ((np.floor(u * nx).astype(int) + row_s) % 4) == 0
        img[in_scale] = bg  # jungle green base
        img[in_scale & is_turq] = C['turq']
        img[in_scale & is_mint & (arch < 0.45)] = C['mint']
        img[in_scale & (arch > 0.62)] = fg  # iridescent rim
        # Central golden feather-quill shaft & crimson rawhide lacing knot
        shaft = in_scale & (np.abs(su) < 0.06) & (sv > 0.18) & (sv < 0.82)
        img[shaft] = C['saffron']
        knot = (sv < 0.22) & (np.abs(su) < 0.16)
        img[knot] = C['maroon']
    elif style == 'bone_lamellar':
        # Carved ivory saurian-bone lamellar lames laced with crimson & turquoise rawhide thongs
        nx = max(8.0, round(7.0 * max(aspect, 1.0)))
        row_b = np.floor(v * 3.0).astype(int)
        su = (u * nx + 0.25 * (row_b % 2)) % 1.0
        sv = (v * 3.0) % 1.0
        img[:] = C['darkfur']
        lame = (su > 0.09) & (su < 0.91) & (sv > 0.08) & (sv < 0.92)
        img[lame] = C['bone']
        # Subtle vertical bone fluting & warm cream bevel
        img[lame & ((su < 0.22) | (su > 0.78))] = C['cream']
        # Horizontal crimson and turquoise rawhide lacing bands across the bone plates
        lace_band = (sv > 0.22) & (sv < 0.36)
        img[lace_band] = C['maroon']
        img[lace_band & (((su * 2.0) % 1.0) < 0.42)] = C['turq']
        rivet = ((su - 0.5) ** 2 + (sv - 0.72) ** 2) < 0.018
        img[rivet] = C['brass']
    elif style == 'tiger_pelt':
        # Golden-saffron hyperjungle cat pelt with jagged dark tiger stripes
        img[:] = C['saffron']
        wave = 0.12 * np.sin(u * 2 * math.pi * max(2.0, round(aspect * 2.0)))
        stripe = np.abs(((v * 5.0 + wave) % 1.0) - 0.5) < 0.18
        img[stripe] = C['soot']
        img[(~stripe) & (np.abs(((v * 5.0 + wave) % 1.0) - 0.5) < 0.26)] = C['ochre']
    elif style == 'leopard_spots':
        # Authentic hyperjungle leopard-pelt rosettes (dark umber/soot broken rings around warm ochre centers on golden-sand hide)
        img[:] = bg
        nx = max(5.0, round(5.0 * max(aspect, 0.8)))
        ny = 5.0
        row_l = np.floor(v * ny).astype(int)
        su = (u * nx + 0.5 * (row_l % 2)) % 1.0 - 0.5
        sv = (v * ny) % 1.0 - 0.5
        ang_l = np.arctan2(sv, su)
        rad_l = np.hypot(su * 1.15, sv * 1.15) * (1.0 + 0.16 * np.cos(ang_l * 3.0) + 0.10 * np.sin(ang_l * 5.0))
        img[rad_l < 0.34] = C['ochre']
        ring_mask = (rad_l >= 0.22) & (rad_l <= 0.42) & (np.cos(ang_l * 4.0 + (row_l % 3)) > -0.55)
        img[ring_mask] = fg
    elif style == 'eternian_icons':
        # Eternal State courtly logograph stole: Eye, Power-Switch, Document/Door, Flame/Drop, Warning-Triangle, Padlock, Arrow
        img[:] = bg
        # Double border lines along left/right edges of stole
        border = (np.abs(u - 0.06) < 0.020) | (np.abs(u - 0.94) < 0.020) | (u < 0.025) | (u > 0.975)
        img[border] = fg
        # Normalize aspect ratio so ideograms are upright 1:1.1 calligraphic symbols and never horizontally stretched!
        n_ic = max(2.0, round(3.4 / max(aspect, 0.18)))
        nx_ic = max(1.0, round(aspect * n_ic * 0.85))
        sub_aspect = (aspect * n_ic) / nx_ic
        col_ic = np.floor(u * nx_ic).astype(int)
        row_ic = np.floor(v * n_ic).astype(int)
        idx_ic = (row_ic + col_ic * 2) % 4
        lu = (u * nx_ic) % 1.0 - 0.5
        lv = (v * n_ic) % 1.0 - 0.5
        iu = lu * 2.4 * max(0.88, sub_aspect * 1.15)
        iv = lv * 2.4 * max(1.0, 0.88 / max(sub_aspect, 0.15))
        r_ic = np.hypot(iu, iv)
        # Column divider lines when multiple columns are tiled across wide bands/panels
        if nx_ic > 1.5:
            col_div = np.abs(np.abs(lu) - 0.48) < 0.025
            img[col_div] = fg
        # Icon 0: The All-Seeing Eye (almond outline + iris ring + pupil)
        eye_top = 0.42 * (1.0 - (iu / 0.78) ** 2)
        in_eye = (np.abs(iu) < 0.78) & (np.abs(iv) <= np.maximum(0.0, eye_top))
        eye_rim = in_eye & (np.abs(np.abs(iv) - eye_top) < 0.11)
        iris = (r_ic < 0.28) & (r_ic > 0.16)
        pupil = r_ic < 0.10
        m0 = (idx_ic == 0) & (eye_rim | iris | pupil)
        # Icon 1: The Power Switch (broken circle + top vertical bar)
        ring1 = (r_ic > 0.44) & (r_ic < 0.58) & (~((iv < -0.22) & (np.abs(iu) < 0.24)))
        bar1 = (np.abs(iu) < 0.09) & (iv > -0.68) & (iv < 0.08)
        m1 = (idx_ic == 1) & (ring1 | bar1)
        # Icon 2: Warning Triangle with exclamation mark / Document frame
        tri_w = 0.68 * (iv + 0.58) / 1.15
        in_tri = (iv > -0.58) & (iv < 0.58) & (np.abs(iu) < tri_w)
        tri_rim = in_tri & ((np.abs(np.abs(iu) - tri_w) < 0.11) | (iv > 0.46))
        excl = ((np.abs(iu) < 0.07) & (iv > -0.22) & (iv < 0.18)) | ((np.abs(iu) < 0.08) & (np.abs(iv - 0.32) < 0.07))
        m2 = (idx_ic == 2) & (tri_rim | excl)
        # Icon 3: Sacred Teardrop / Flame + Padlock base
        drop_w = 0.46 * np.sin(np.clip((iv + 0.62) / 1.20, 0.0, 1.0) * math.pi) ** 0.75
        in_drop = (iv > -0.62) & (iv < 0.58) & (np.abs(iu) < drop_w)
        m3 = (idx_ic == 3) & in_drop & (~((r_ic < 0.16) & (iv > 0.10)))
        img[m0 | m1 | m2 | m3] = fg
    elif style == 'voth_glyphs':
        # Voth Priest & Ordinator sacred geometric/alchemical stole glyphs
        img[:] = bg
        border = (np.abs(u - 0.08) < 0.028) | (np.abs(u - 0.92) < 0.028) | (u < 0.03) | (u > 0.97)
        img[border] = fg
        n_gv = max(2.0, round(2.6 / max(aspect, 0.20)))
        nx_gv = max(1.0, round(aspect * n_gv * 0.85))
        sub_asp = (aspect * n_gv) / nx_gv
        gv = ((v * n_gv) % 1.0 - 0.5) * max(1.0, 0.9 / max(sub_asp, 0.15))
        gu = ((u * nx_gv) % 1.0 - 0.5) * 2.2 * max(0.85, sub_asp * 1.1)
        gr = np.hypot(gu, gv * 1.55)
        # Concentric sun-wheel, crescent horns, diamond lattice, and crossbars along the vertical spine
        wheel = ((gr > 0.30) & (gr < 0.42)) | ((gr > 0.13) & (gr < 0.22)) | (gr < 0.07)
        spine = (np.abs(gu) < 0.055) & (np.abs(gv) < 0.46)
        diamond = np.abs((np.abs(gu) + np.abs((gv + 0.30) * 1.7)) - 0.36) < 0.065
        crescent = (np.hypot(gu, (gv - 0.28) * 1.7) < 0.38) & (np.hypot(gu, (gv - 0.36) * 1.7) > 0.30)
        rungs = (np.abs(gu) < 0.38) & (np.abs(((v * 16.0) % 1.0) - 0.5) < 0.12)
        img[wheel | spine | diamond | crescent | rungs] = fg
    elif style == 'sun_burst_ikat':
        # Tzintzun royal solar burst & stepped ikat tapestry (aspect-normalized so sun-wheels are circular!)
        img[:] = bg
        nx_sb = max(1.0, round(max(aspect, 0.5) * 1.6))
        ny_sb = max(1.0, round(1.6 / max(aspect, 0.35)))
        sub_asp = (aspect * ny_sb) / nx_sb
        su = ((u * nx_sb) % 1.0 - 0.5) * 2.0 * max(1.0, sub_asp)
        sv = ((v * ny_sb) % 1.0 - 0.5) * 2.0 * max(1.0, 1.0 / max(sub_asp, 0.2))
        sr = np.hypot(su, sv)
        sang = np.arctan2(sv, su)
        ray_len = 0.54 + 0.34 * np.cos(sang * 16.0)
        is_ray = (sr < ray_len) & (sr > 0.20)
        ring = (sr >= 0.13) & (sr <= 0.23)
        core = sr < 0.08
        step_border = ((np.abs(su) > 0.78) | (np.abs(sv) > 0.80)) & (((np.floor(u * 16 * nx_sb) + np.floor(v * 18 * ny_sb)) % 2) == 0)
        img[is_ray | ring | core | step_border] = fg
        img[(sr > 0.08) & (sr < 0.13)] = C['crimson']
    elif style == 'tzintzun_tapestry':
        # Bespoke Tzintzun royal split-tunic & trouser brocade: alternating circular 16-rayed golden sun-wheels
        # and stepped Aztec/Andean diamond-ikat bands in gold, crimson, and obsidian!
        img[:] = bg
        nx_t = max(1.0, round(max(aspect, 0.45) * 2.2))
        ny_t = max(2.0, round(2.4 / max(aspect, 0.35)))
        sub_asp = (aspect * ny_t) / nx_t
        col_t = np.floor(u * nx_t).astype(int)
        row_t = np.floor(v * ny_t).astype(int)
        su = ((u * nx_t) % 1.0 - 0.5) * 2.0 * max(1.0, sub_asp)
        sv = ((v * ny_t) % 1.0 - 0.5) * 2.0 * max(1.0, 1.0 / max(sub_asp, 0.2))
        sr = np.hypot(su, sv)
        sang = np.arctan2(sv, su)
        # Sun-wheel medallion with 16 sharp rays, concentric rings, and 4-point star center
        ray_w = 0.58 + 0.30 * np.cos(sang * 16.0)
        in_sun = (sr < ray_w) & (sr > 0.28) & (np.cos(sang * 16.0) > -0.15)
        outer_ring = (sr >= 0.22) & (sr <= 0.30)
        inner_ring = (sr >= 0.10) & (sr <= 0.15)
        star_core = (np.abs(su) * 0.4 + np.abs(sv) < 0.12) | (np.abs(sv) * 0.4 + np.abs(su) < 0.12)
        # Stepped diamond ikat frame around each sun medallion
        d_dist = np.abs(np.round(su * 6.0) / 6.0) + np.abs(np.round(sv * 6.0) / 6.0)
        ikat_frame = (np.abs(d_dist - 1.15) < 0.12) | (np.abs(d_dist - 1.42) < 0.08)
        corner_zig = (np.abs(su) > 0.55) & (np.abs(sv) > 0.55) & (np.abs((np.abs(su) + np.abs(sv)) - 1.55) < 0.11)
        img[in_sun | outer_ring | inner_ring | star_core | ikat_frame | corner_zig] = fg
        img[(sr > 0.15) & (sr < 0.22)] = C['soot']
        img[(d_dist > 1.24) & (d_dist < 1.34)] = C['crimson']
    elif style == 'ordinator_mask':
        # Indoril Ordinator golden face-mask: white enamel upper forehead plates, raised central ridge,
        # fierce angled brow, recessed dark-indigo slanted eye slits, sharp nose bridge, dark cheek cutouts & mouth guard
        img[:] = bg  # gold base
        mu = (u - 0.5) * 2.0  # -1..1 across face
        mv = v                # 0 (top forehead) .. 1 (chin)
        abs_u = np.abs(mu)
        # White/ivory enameled upper forehead plates flanking central gold ridge (v < 0.30)
        fore_arch = 0.29 - 0.12 * ((abs_u - 0.28) ** 2)
        in_enamel = (mv > 0.04) & (mv < fore_arch) & (abs_u > 0.07) & (abs_u < 0.68)
        img[in_enamel] = C['cream']
        # Decorative gold border and central forehead arch line
        enamel_rim = (np.abs(mv - fore_arch) < 0.025) & (abs_u < 0.72)
        img[enamel_rim] = fg
        # Fierce V-shaped brow shadow & slanted dark eye slits (v ~ 0.34 .. 0.47)
        eye_v_center = 0.42 - 0.11 * (abs_u - 0.12)
        in_eye = (abs_u > 0.11) & (abs_u < 0.52) & (np.abs(mv - eye_v_center) < 0.042 * (1.0 - 0.6 * np.abs(abs_u - 0.31) / 0.22))
        brow_ridge = (abs_u > 0.08) & (abs_u < 0.56) & (mv > eye_v_center - 0.070) & (mv < eye_v_center - 0.038)
        img[brow_ridge] = fg
        img[in_eye] = C['soot']
        # Sharp nasal ridge with bright gold highlight and dark side-Grooves (v: 0.32 .. 0.66)
        nose_edge = (mv > 0.30) & (mv < 0.66) & (np.abs(abs_u - (0.045 + 0.035 * (mv - 0.30))) < 0.018)
        img[nose_edge] = C['umber']
        nose_hi = (mv > 0.28) & (mv < 0.65) & (abs_u < 0.035)
        img[nose_hi] = C['cream']
        # Dark recessed under-cheekbone cutouts & angular cheek plates (v: 0.50 .. 0.72)
        cheek_line = 0.54 + 0.22 * (abs_u - 0.16)
        cheek_recess = (abs_u > 0.18) & (abs_u < 0.58) & (np.abs(mv - cheek_line) < 0.032)
        img[cheek_recess] = C['soot']
        # Sculpted mouth-slit / vertical-slotted respirator guard on lower jaw (v: 0.70 .. 0.90)
        mouth_arch = (mv > 0.70) & (mv < 0.88) & (abs_u < 0.26 * (1.0 - 0.5 * (mv - 0.70)))
        mouth_slits = mouth_arch & ((np.abs(((mu * 18.0) % 1.0) - 0.5) < 0.22) | (np.abs(mv - 0.76) < 0.018))
        img[mouth_slits] = C['soot']
        # Outer jaw / temple dark trim
        jaw_trim = (abs_u > 0.68) | (mv > 0.93)
        img[jaw_trim] = C['umber']
    elif style == 'ordinator_cuirass':
        # Voth Temple Ordinator breastplate: upper emerald chest with ornate gold baroque scrollwork & central gold sun-medallion,
        # framed by a cream-and-gold Greek-key pectoral arch, over dark-emerald horizontal articulated abdominal lames!
        img[:] = bg  # deepgreen / jade base
        cu = (u - 0.5) * 2.0  # -1..1 (0 is front center when used in PN(0.25, 0.75))
        cv = v                # 0 (top collar) .. 1 (waist)
        abs_u = np.abs(cu)
        pect_arch = 0.48 + 0.14 * np.cos(cu * math.pi * 0.85)
        # Upper chest plate (cv < pect_arch): rich emerald with embossed gold scrollwork
        in_pect = cv < pect_arch
        scroll_1 = np.abs(np.sin(cu * 4.5 * math.pi) * 0.12 + (cv - 0.24)) < 0.038
        scroll_2 = np.abs(np.cos(cu * 3.0 * math.pi) * 0.10 - (cv - 0.20)) < 0.032
        sun_r = np.hypot(cu * 1.15, (cv - 0.23) * 1.65)
        sun_med = (sun_r < 0.16) | ((sun_r < 0.26) & (np.cos(np.arctan2(cv - 0.23, cu) * 12.0) > 0.25))
        img[in_pect & (scroll_1 | scroll_2 | sun_med)] = fg
        # Pectoral arch border with cream-and-gold Greek key band
        arch_band = np.abs(cv - pect_arch) < 0.048
        img[arch_band] = fg
        key_dots = arch_band & (np.abs(cv - pect_arch) < 0.024) & (((np.floor(u * 28.0) + np.floor(v * 20.0)) % 2) == 0)
        img[key_dots] = C['cream']
        # Lower abdominal articulated horizontal lames (cv > pect_arch + 0.048)
        in_abs = cv >= (pect_arch + 0.048)
        lame_phase = ((cv - pect_arch) * 9.5) % 1.0
        img[in_abs] = C['deepgreen']
        img[in_abs & (lame_phase < 0.22)] = C['soot']
        img[in_abs & (lame_phase >= 0.22) & (lame_phase < 0.36)] = fg
        # Central vertical spine ridge on abdominal lames
        img[in_abs & (abs_u < 0.06)] = fg
    elif style == 'tzintzun_mask':
        # Tzintzun's Oval Golden Sun-God Faceplate: black obsidian diamond forehead gem in raised gold bezel,
        # arched double-line eyebrows, dark recessed almond eyes, sculpted nose & golden lips, and radiant cheek engravings
        img[:] = bg  # gold base
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Black obsidian diamond gem on forehead (v ~ 0.18)
        gem_d = abs_u * 1.35 + np.abs(mv - 0.18) * 1.65
        img[(gem_d >= 0.12) & (gem_d <= 0.17)] = C['umber']
        img[gem_d < 0.12] = C['soot']
        img[(gem_d < 0.05) & (mv < 0.17)] = C['silver']  # specular glint on obsidian gem
        # Arched double-ridged golden eyebrows (v ~ 0.31)
        brow_v = 0.33 - 0.06 * np.sin(np.clip((abs_u - 0.06) / 0.44, 0.0, 1.0) * math.pi)
        brow_line = (abs_u > 0.06) & (abs_u < 0.52) & ((np.abs(mv - brow_v) < 0.016) | (np.abs(mv - (brow_v - 0.028)) < 0.014))
        img[brow_line] = C['umber']
        # Dark almond eye openings with golden eyelid rims (v ~ 0.41)
        eye_u = (abs_u - 0.26) / 0.17
        eye_arch = 0.042 * np.maximum(0.0, 1.0 - eye_u ** 2)
        in_eye = (np.abs(eye_u) < 1.0) & (np.abs(mv - 0.41) < eye_arch)
        eye_rim = (np.abs(eye_u) < 1.08) & (np.abs(np.abs(mv - 0.41) - eye_arch) < 0.016)
        img[eye_rim] = C['umber']
        img[in_eye] = C['soot']
        # Sculpted nose bridge and nostrils (v: 0.35 .. 0.64)
        nose_w = 0.038 + 0.045 * np.clip((mv - 0.35) / 0.28, 0.0, 1.0) ** 1.4
        nose_contour = (mv > 0.35) & (mv < 0.64) & (np.abs(abs_u - nose_w) < 0.016)
        nostril = (np.hypot(abs_u - 0.055, mv - 0.62) < 0.024)
        img[nose_contour] = C['umber']
        img[nostril] = C['soot']
        img[(mv > 0.34) & (mv < 0.61) & (abs_u < 0.025)] = C['cream']
        # Sculpted calm golden lips with dark parting line (v ~ 0.74)
        lip_u = abs_u / 0.19
        up_lip = 0.74 - 0.032 * np.maximum(0.0, 1.0 - (lip_u - 0.25) ** 2)
        lo_lip = 0.74 + 0.036 * np.maximum(0.0, 1.0 - lip_u ** 2)
        lip_outline = (lip_u < 1.0) & ((np.abs(mv - up_lip) < 0.014) | (np.abs(mv - lo_lip) < 0.014))
        lip_part = (lip_u < 0.95) & (np.abs(mv - 0.74) < 0.012)
        img[lip_outline] = C['umber']
        img[lip_part] = C['soot']
        # Subtle sun-ray cheek engravings & oval border rim
        cheek_ray = (abs_u > 0.36) & (np.abs(((np.arctan2(mv - 0.50, abs_u) * 14.0) % 1.0) - 0.5) < 0.14)
        img[cheek_ray] = C['umber']
    elif style == 'priest_mask':
        # Voth Sun-Priest slotted bronze-and-gold architectural mask: angled gold brow plates over dark eye slits,
        # vertical slotted bronze visor bars across the nose/cheeks/jaw, and crimson temple accents
        img[:] = bg  # bronze base
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Vertical slotted visor bars & dark slits
        slit = (abs_u < 0.62) & (mv > 0.12) & (mv < 0.92) & (np.abs(((mu * 11.0) % 1.0) - 0.5) < 0.22) & (abs_u > 0.05)
        img[slit] = C['soot']
        # Central vertical golden nasal/forehead spine bar
        img[abs_u < 0.055] = fg
        # Angled golden brow plates & recessed dark eye slits (v ~ 0.38)
        eye_v = 0.40 - 0.07 * (abs_u - 0.10)
        brow_plate = (abs_u > 0.06) & (abs_u < 0.54) & (mv > eye_v - 0.065) & (mv < eye_v - 0.015)
        eye_open = (abs_u > 0.10) & (abs_u < 0.48) & (np.abs(mv - (eye_v + 0.015)) < 0.032)
        img[brow_plate] = fg
        img[eye_open] = C['soot']
        # Horizontal cheekbone and forehead gold cross-bands
        cross_band = (np.abs(mv - 0.18) < 0.028) | (np.abs(mv - 0.54) < 0.025) | (np.abs(mv - 0.78) < 0.024)
        img[cross_band] = fg
        img[(abs_u > 0.52) & (mv > 0.22) & (mv < 0.52)] = C['crimson']
    elif style == 'chosen_kabuki_mask':
        # Chosen of Tzintzun white porcelain face-mask with bold crimson-and-black kabuki war-stripes
        img[:] = bg  # cream/ancient white porcelain base
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Bold crimson kabuki war-paint bands sweeping from inner brows over temples and down cheeks to jaw
        brow_sweep = np.abs(mv - (0.30 - 0.14 * (abs_u - 0.08))) < 0.042
        cheek_sweep = (mv > 0.44) & (np.abs(abs_u - (0.20 + 0.22 * (mv - 0.44))) < 0.058)
        chin_stripe = (mv > 0.76) & (abs_u < 0.07)
        img[(brow_sweep | cheek_sweep | chin_stripe) & (abs_u > 0.04)] = fg  # crimson
        # Fierce dark eye sockets & black eyeliner wings
        eye_u = (abs_u - 0.26) / 0.17
        eye_arch = 0.040 * np.maximum(0.0, 1.0 - eye_u ** 2)
        in_eye = (np.abs(eye_u) < 1.05) & (np.abs(mv - 0.40) < eye_arch)
        eye_wing = (abs_u > 0.26) & (abs_u < 0.56) & (np.abs(mv - (0.40 - 0.12 * (abs_u - 0.26))) < 0.020)
        img[in_eye | eye_wing] = C['soot']
        # Subtle nose shadow & dark painted lips
        img[(mv > 0.35) & (mv < 0.62) & (np.abs(abs_u - 0.045) < 0.012)] = C['taupe']
        lip = (abs_u < 0.16) & (np.abs(mv - 0.73) < 0.026 * (1.0 - (abs_u / 0.16) ** 2))
        img[lip] = C['soot']
    elif style == 'chosen_tapestry':
        # Chosen of Tzintzun woven crimson, oat, and soot stepped diamond-and-chevron textile
        img[:] = bg
        nx_c = max(2.0, round(max(aspect, 0.5) * 4.0))
        ny_c = max(2.0, round(4.0 / max(aspect, 0.35)))
        su = ((u * nx_c) % 1.0 - 0.5) * 2.0
        sv = ((v * ny_c) % 1.0 - 0.5) * 2.0
        d = np.abs(np.round(su * 4.0) / 4.0) + np.abs(np.round(sv * 4.0) / 4.0)
        diamond_ring = (np.abs(d - 0.75) < 0.18)
        center_cross = (np.abs(su) < 0.16) & (np.abs(sv) < 0.38) | (np.abs(sv) < 0.16) & (np.abs(su) < 0.38)
        border_zig = np.abs(np.abs(sv) - 0.85) < 0.09
        img[diamond_ring | border_zig] = fg
        img[center_cross] = C['oat']
        img[(np.abs(d - 0.50) < 0.10)] = C['soot']
    elif style == 'lightkeeper_mask':
        # Yusar Light-Keeper asymmetric 4-lens opto-mask (3 right lenses + 1 large left lens + brass respirator snout)
        img[:] = bg  # soot / slate base
        mu = (u - 0.5) * 2.0
        mv = v
        # Brass face-plate frame over brow and nose
        plate = (np.abs(mu) < 0.62) & (mv > 0.22) & (mv < 0.86)
        img[plate] = C['slate']
        # Left eye (mu > 0): 1 large glowing yellow lens with brass bezel
        r_L = np.hypot((mu - 0.25) * 1.1, (mv - 0.40) * 1.4)
        # Right eye (mu < 0): cluster of 3 smaller glowing yellow lenses
        r_R1 = np.hypot((mu + 0.20) * 1.2, (mv - 0.35) * 1.5)
        r_R2 = np.hypot((mu + 0.34) * 1.2, (mv - 0.42) * 1.5)
        r_R3 = np.hypot((mu + 0.21) * 1.2, (mv - 0.47) * 1.5)
        bezel = ((r_L >= 0.09) & (r_L <= 0.13)) | ((r_R1 >= 0.055) & (r_R1 <= 0.085)) | ((r_R2 >= 0.055) & (r_R2 <= 0.085)) | ((r_R3 >= 0.055) & (r_R3 <= 0.085))
        lens = (r_L < 0.09) | (r_R1 < 0.055) | (r_R2 < 0.055) | (r_R3 < 0.055)
        img[bezel] = C['brass']
        img[lens] = fg  # yuniyellow glow
        # Respirator grille on lower snout
        grille = (np.abs(mu) < 0.26) & (mv > 0.62) & (mv < 0.84) & (np.abs(((mu * 14.0) % 1.0) - 0.5) < 0.22)
        img[grille] = C['brass']
    elif style == 'electromonk_mask':
        # Yusar Electro-Monk dark iron faceplate with white painted forehead triangle rune, twin glowing amber goggles & mouth grille
        img[:] = bg  # soot / darkiron base
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # White painted triangle/chevron rune on forehead (v: 0.10 .. 0.30)
        tri_w = 0.28 * (0.30 - mv) / 0.20
        in_rune = (mv > 0.09) & (mv < 0.30) & ((np.abs(abs_u - tri_w) < 0.032) | ((np.abs(mv - 0.12) < 0.024) & (abs_u < 0.26)) | ((abs_u < 0.028) & (mv < 0.34)))
        img[in_rune] = C['cream']
        # Twin glowing amber-gold circular goggles (v ~ 0.42)
        r_eye = np.hypot((abs_u - 0.25) * 1.15, (mv - 0.42) * 1.45)
        img[(r_eye >= 0.085) & (r_eye <= 0.125)] = C['brass']
        img[r_eye < 0.085] = fg  # sunorange / yuniyellow
        # Vertical slatted iron mouth-grille (v: 0.64 .. 0.86)
        grille = (abs_u < 0.28) & (mv > 0.64) & (mv < 0.86) & (np.abs(((mu * 14.0) % 1.0) - 0.5) < 0.22)
        img[grille] = C['silver']
    elif style == 'corsair_skull_mask':
        # Yusar Hive-Corsair brass skull faceplate with 3 neon-magenta crosshair lenses & articulated brass teeth grille
        img[:] = bg  # soot base
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Sculpted brass skull maxilla/cheekplate (v: 0.32 .. 0.88)
        skull_plate = (mv > 0.30) & (mv < 0.88) & (abs_u < (0.56 - 0.24 * np.maximum(0.0, mv - 0.52)))
        img[skull_plate] = C['brass']
        # 3 neon-magenta lenses arranged in a triangle (two eye sockets + central forehead third-eye)
        r_eye = np.hypot((abs_u - 0.24) * 1.15, (mv - 0.43) * 1.45)
        r_top = np.hypot(mu * 1.15, (mv - 0.25) * 1.45)
        socket = (r_eye < 0.13) | (r_top < 0.11)
        lens = (r_eye < 0.085) | (r_top < 0.075)
        crosshair = lens & ((np.abs(abs_u - 0.24) < 0.015) | (np.abs(mv - 0.43) < 0.015) | (abs_u < 0.015) | (np.abs(mv - 0.25) < 0.015))
        img[socket] = C['soot']
        img[lens] = fg  # violet / magenta
        img[crosshair] = C['cream']
        # Skull nasal cavity & vertical brass teeth bars (v: 0.64 .. 0.86)
        nasal = (mv > 0.48) & (mv < 0.60) & (abs_u < 0.065 * (mv - 0.46) / 0.14)
        teeth_gap = (mv > 0.64) & (mv < 0.86) & (abs_u < 0.28) & ((np.abs(((mu * 14.0) % 1.0) - 0.5) < 0.18) | (np.abs(mv - 0.75) < 0.018))
        img[nasal | teeth_gap] = C['soot']
    elif style == 'circuit_schematic':
        # Orthogonal circuit-board maze traces, IC nodes, and schematic lines (Eternal State & Yusar)
        img[:] = bg
        nx_cs = max(4.0, round(8.0 * max(aspect, 0.4)))
        ny_cs = max(4.0, round(8.0 / max(aspect, 0.4)))
        gu = (u * nx_cs) % 1.0
        gv = (v * ny_cs) % 1.0
        cell_i = (np.floor(u * nx_cs).astype(int) * 7 + np.floor(v * ny_cs).astype(int) * 13) % 6
        h_trace = (cell_i < 3) & (np.abs(gv - 0.5) < 0.08)
        v_trace = (cell_i >= 2) & (cell_i < 5) & (np.abs(gu - 0.5) < 0.08)
        diag_trace = (cell_i == 5) & (np.abs(gu - gv) < 0.10)
        pad_ring = (np.hypot(gu - 0.5, gv - 0.5) < 0.24) & (np.hypot(gu - 0.5, gv - 0.5) > 0.12)
        border = (u < 0.05) | (u > 0.95) | (np.abs(u - 0.5) < 0.025)
        img[h_trace | v_trace | diag_trace | pad_ring | border] = fg
    elif style == 'baroque_scroll':
        # Ornate scrolling baroque/Celtic gold-and-cream vine embroidery
        img[:] = bg
        su = (u - 0.5) * 2.0
        sv = v * 4.0 * math.pi
        wave1 = np.abs(su - 0.42 * np.sin(sv)) < 0.13
        wave2 = np.abs(su + 0.42 * np.sin(sv + 0.8)) < 0.11
        curl = np.abs(np.hypot(su - 0.25 * np.cos(sv), ((v * 4.0) % 1.0 - 0.5) * 1.6) - 0.34) < 0.08
        border = (np.abs(su) > 0.84)
        img[wave1 | wave2 | curl | border] = fg
    return img


def paint_strip(spec, W, H, circ, length):
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = spec['base']
    g = spec.get('weave', 0.06)
    fab = spec.get('fabric')
    gr = grain(fab) if fab in FABRIC else None
    if g and gr is None:
        n = rng.normal(0, g * 0.5, (H, W, 1))
        thread = (((np.arange(W) % 3) == 0)[None, :, None] * 0.5 + ((np.arange(H) % 3) == 0)[:, None, None] * 0.5) * g
        img = img * (1 + n - thread)

    panels = spec.get('panels', [])
    bands = spec.get('bands', [])

    # Compute where the bottom border bands start so narrow vertical stoles don't erase the bottom hem trim
    bot_band_r = H
    for where, f0, f1, _st, _fg, _bg, _rep in bands:
        if where == 'bottom' and f0 <= 0.02:
            r0 = int(max(0, round((1 - f1 / max(length, 1e-4)) * H)))
            bot_band_r = min(bot_band_r, r0)

    def _draw_panel(p_spec, respect_bot_hem=False):
        u0, u1, style, fg, bg, rep, down = p_spec
        c0, c1 = int(max(0, round(u0 * W))), int(min(W, round(u1 * W)))
        if c1 - c0 < 1:
            return
        n_rep = max(1, int(round(length / rep))) if rep else 1
        ch = max(2, H // n_rep)
        cell = motif(style, c1 - c0, ch, np.array(fg), np.array(bg), aspect=(u1 - u0) * circ / max(length / n_rep, 1e-4))
        hh = (bot_band_r if respect_bot_hem else H) if down is None else min(H, int(round(down / max(length, 1e-4) * H)))
        if hh < 1:
            return
        img[:hh, c0:c1] = np.tile(cell, (H // ch + 1, 1, 1))[:hh] * (1 + rng.normal(0, 0.015, (hh, c1 - c0, 1)))

    # 1. Paint wide field/body panels (down is None and width > 0.22) BEFORE bands so top/bottom borders remain intact!
    for p_spec in panels:
        if p_spec[6] is None and (p_spec[1] - p_spec[0]) > 0.22:
            _draw_panel(p_spec, respect_bot_hem=False)

    # 2. Paint horizontal bands (collars, waistbands, cuffs, hem borders)
    for where, f0, f1, style, fg, bg, rep in bands:
        if where == 'bottom':
            r0, r1 = (1 - f1 / max(length, 1e-4)) * H, (1 - f0 / max(length, 1e-4)) * H
        else:
            r0, r1 = f0 / max(length, 1e-4) * H, f1 / max(length, 1e-4) * H
        r0, r1 = int(max(0, round(r0))), int(min(H, round(r1)))
        if r1 - r0 < 1:
            continue
        n_rep = max(1, int(round(circ / rep))) if rep else 1
        cw = max(2, W // n_rep)
        band_h_m = max(abs(f1 - f0), 1e-4)
        cell = motif(style, cw, r1 - r0, np.array(fg), np.array(bg if bg is not None else spec['base']), aspect=(circ / n_rep) / band_h_m)
        band_arr = np.tile(cell, (1, W // cw + 1, 1))[:, :W]
        img[r0:r1] = band_arr * (1 + rng.normal(0, 0.015, (r1 - r0, W, 1)))

    # 3. Paint narrow vertical stoles (respecting bottom hem border) and explicit upper-bib/eye panels (down is not None)
    for p_spec in panels:
        if p_spec[6] is not None:
            _draw_panel(p_spec, respect_bot_hem=False)
        elif (p_spec[1] - p_spec[0]) <= 0.22:
            _draw_panel(p_spec, respect_bot_hem=(bot_band_r < H and bot_band_r > H // 2))

    if gr is not None:
        n = gr.shape[0]
        tile = FABRIC[fab]
        ix = (np.arange(W) * (circ / max(W, 1)) / tile * n).astype(int) % n
        iy = (np.arange(H) * (length / max(H, 1)) / tile * n).astype(int) % n
        k = min(1.0, max(g, 0.02) / 0.07)
        img = img * (1 + (gr[np.ix_(iy, ix)][:, :, None] - 1) * k)
    return img.clip(0, 1)


# ---------------------------------------------------------------------------------------------------------------
# Build GLB & Morphs from Parts
BODY_ID = 'mpfb_male'
TEMPLATE_GLB = ROOT / 'pieces' / 'mpfb_male' / 'dalab_m_trade_cap.glb'
TPL_J, TPL_B = glbio.read_glb(TEMPLATE_GLB.read_bytes())
BASE_MORPH_ENTS = make_mpfb.unpack_morphs((ROOT / 'pieces' / 'mpfb_male' / 'base.morph.bin').read_bytes())
_N_TARGETS = len(json.loads((ROOT / 'data' / 'mpfb_male' / 'kit.json').read_text(encoding='utf-8'))['morph']['targets'])
BASE_MORPH_D = make_mpfb.dense_morphs(next(x for x in BASE_MORPH_ENTS if 'Human.body' in x[0]), _N_TARGETS)
BODY_CONTACT = make_mpfb.body_contact(str(BASE_GLB))


def set_body(body_id='mpfb_male'):
    """Switch active body globals between 'mpfb_male' and 'mpfb_female'."""
    global BODY_ID, BASE_GLB, RIG, BP_GL, BT, CO, POLY, BASE_JJ, BASE_WW, BASE_VIDX, BASE_TREE_GL
    global BASE_ARM_W, TRUNK_IDX, TRUNK_TREE_GL, ARM, _LM, BVH, BVH_T, BVH_A, HIPS, NECK, HEAD, CROTCH
    global WAIST, CHEST, TOP, KNEE, ANKLE, SHOULDER
    global TEMPLATE_GLB, TPL_J, TPL_B, BASE_MORPH_ENTS, _N_TARGETS, BASE_MORPH_D, BODY_CONTACT
    if BODY_ID == body_id:
        return
    BODY_ID = body_id
    BASE_GLB = ROOT / 'pieces' / body_id / 'base.glb'
    RIG = mp.load(str(BASE_GLB))
    RIG.J = {n: i for i, n in enumerate(RIG.joints)}
    _, BP_GL, BT = make_mpfb.body_primitive(str(BASE_GLB))
    CO = arms2.from_gl(BP_GL)
    POLY = BT
    _bj, _bb = glbio.read_glb(BASE_GLB.read_bytes())
    _bprim = next(p for m in _bj['meshes'] for p in m['primitives']
                  if 'material' in p and _bj['materials'][p['material']]['name'].endswith('.body'))
    BASE_JJ = glbio.accessor(_bj, _bb, _bprim['attributes']['JOINTS_0']).astype(np.int32)
    BASE_WW = glbio.accessor(_bj, _bb, _bprim['attributes']['WEIGHTS_0']).astype(np.float32)
    BASE_WW /= np.maximum(BASE_WW.sum(axis=1, keepdims=True), 1e-9)
    BASE_VIDX = np.rint(glbio.accessor(_bj, _bb, _bprim['attributes']['_VIDX']).reshape(-1)).astype(np.int32)
    BASE_TREE_GL = cKDTree(BP_GL)
    _bskin = _bj['skins'][0]
    _bjoint_names = [_bj['nodes'][k].get('name', '').split(':')[-1] for k in _bskin['joints']]
    _arm_j_mask = np.array([
        any(nm.startswith(p) for p in ('LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand', 'Head'))
        for nm in _bjoint_names
    ], dtype=bool)
    BASE_ARM_W = (BASE_WW * _arm_j_mask[BASE_JJ]).sum(axis=1)
    TRUNK_IDX = np.nonzero(BASE_ARM_W < 0.08)[0]
    TRUNK_TREE_GL = cKDTree(BP_GL[TRUNK_IDX])
    ARM = _arm_mask()
    _LM = _limb_mask()
    BVH = FastBVH(CO, POLY)
    BVH_T = FastBVH(CO, [p for p in POLY if not any(ARM[i] for i in p)])
    BVH_A = FastBVH(CO, [p for p in POLY if all(_LM[i] for i in p)])
    HIPS, NECK, HEAD = J('Hips'), J('Neck'), J('Head')
    CROTCH = J('LeftUpLeg')[2] - 0.075
    WAIST = J('Spine')[2] + 0.02
    CHEST = J('Spine2')[2] + 0.02
    TOP = NECK[2] + 0.005
    KNEE = J('LeftLeg')[2]
    ANKLE = J('LeftFoot')[2]
    SHOULDER = J('LeftArm')[2]
    tpl_name = 'dalab_f_trade_cap.glb' if body_id == 'mpfb_female' else 'dalab_m_trade_cap.glb'
    TEMPLATE_GLB = ROOT / 'pieces' / body_id / tpl_name
    TPL_J, TPL_B = glbio.read_glb(TEMPLATE_GLB.read_bytes())
    BASE_MORPH_ENTS = make_mpfb.unpack_morphs((ROOT / 'pieces' / body_id / 'base.morph.bin').read_bytes())
    _N_TARGETS = len(json.loads((ROOT / 'data' / body_id / 'kit.json').read_text(encoding='utf-8'))['morph']['targets'])
    BASE_MORPH_D = make_mpfb.dense_morphs(next(x for x in BASE_MORPH_ENTS if 'Human.body' in x[0]), _N_TARGETS)
    BODY_CONTACT = make_mpfb.body_contact(str(BASE_GLB))
    import garments.core as _gcore
    _gcore.set_body(body_id)


def assemble_garment(gid, label, slot, culture, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    import garments.core as _gcore
    _gcore.set_body(BODY_ID)
    return _gcore.assemble_garment(
        gid, label, slot, culture, parts,
        covers_hair=covers_hair, covers_face=covers_face,
        open_torso=open_torso, legged=legged
    )


def _legacy_assemble_garment(gid, label, slot, culture, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    """Assemble Part list into a skinned GLB + .morph.bin, apply skirt/head/cloth weights, and return kit.json entry."""
    lens = [p.lengths() for p in parts]
    share = np.array([max(0.08, l[1]) for l in lens])
    share = share / share.sum()
    img = np.zeros((TEX, TEX, 3), dtype=np.float64)

    all_P, all_N, all_UV, all_VI, all_T, all_use_trunk = [], [], [], [], [], []
    rigid_overrides = []  # (v_start, v_end, joint_name)
    c_specs = []
    hip_ranges = []
    y0 = 0
    vi_offset = 0
    gi_offset = 0

    for k, (p, (circ, length)) in enumerate(zip(parts, lens)):
        h = TEX - y0 if k == len(parts) - 1 else max(4, int(round(share[k] * TEX)))
        if y0 + h > TEX:
            h = max(1, TEX - y0)
        img[y0:y0 + h] = paint_strip(p.paint, TEX, h, max(circ, 0.02), max(length, 0.02))
        v_top, v_bot = y0 / TEX, (y0 + h) / TEX
        pad = 1.5 / TEX
        R_cnt, C_cnt = p.P.shape[:2]

        # Convert Blender coords to glTF coords
        P_gl = arms2.to_gl(p.P.reshape(-1, 3)).reshape(R_cnt, C_cnt, 3)

        # Build quad grid with duplicate seam column when closed so UV u runs cleanly 0..1
        cols_uv = C_cnt + 1 if p.closed else C_cnt
        part_P = np.zeros((R_cnt, cols_uv, 3), dtype=np.float32)
        part_UV = np.zeros((R_cnt, cols_uv, 2), dtype=np.float32)
        part_VI = np.zeros((R_cnt, cols_uv), dtype=np.int32)

        for i in range(R_cnt):
            v_coord = v_top + pad + (v_bot - v_top - 2 * pad) * (i / max(R_cnt - 1, 1))
            for j in range(cols_uv):
                jc = j % C_cnt
                part_P[i, j] = P_gl[i, jc]
                part_UV[i, j] = (j / max(cols_uv - 1, 1), v_coord)
                part_VI[i, j] = vi_offset + i * C_cnt + jc

        part_tris = []
        for i in range(R_cnt - 1):
            for j in range(cols_uv - 1):
                v00 = i * cols_uv + j
                v10 = (i + 1) * cols_uv + j
                v11 = (i + 1) * cols_uv + (j + 1)
                v01 = i * cols_uv + (j + 1)
                part_tris.append((v00, v10, v11))
                part_tris.append((v00, v11, v01))
        part_tris = np.array(part_tris, dtype=np.int32)

        flat_P = part_P.reshape(-1, 3)
        flat_VI = part_VI.reshape(-1)

        # Orient face winding outward from the body or part centroid
        va = flat_P[part_tris[:, 0]]
        vb = flat_P[part_tris[:, 1]]
        vc = flat_P[part_tris[:, 2]]
        fn = np.cross(vb - va, vc - va)
        f_ctr = (va + vb + vc) / 3.0
        _, near_idx = BASE_TREE_GL.query(f_ctr)
        out_vec = f_ctr - BP_GL[near_idx]
        vote = np.sum(np.sign(np.sum(fn * out_vec, axis=1)) * np.linalg.norm(fn, axis=1))
        if vote < 0:
            part_tris = part_tris[:, [0, 2, 1]]
            va = flat_P[part_tris[:, 0]]
            vb = flat_P[part_tris[:, 1]]
            vc = flat_P[part_tris[:, 2]]
            fn = np.cross(vb - va, vc - va)

        # Smooth vertex normals per unique VI within this part
        n_part_vi = R_cnt * C_cnt
        vn = np.zeros((n_part_vi, 3), dtype=np.float64)
        local_vi = flat_VI - vi_offset
        for c_idx in range(3):
            np.add.at(vn, local_vi[part_tris[:, c_idx]], fn)
        vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
        flat_N = vn[local_vi].astype(np.float32)

        if p.rigid_joint:
            rigid_overrides.append((gi_offset, gi_offset + len(flat_P), p.rigid_joint))
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
        elif slot in ('torso', 'legs') and any(p.name.endswith(sfx) or (sfx + '_') in p.name for sfx in (
            '_belt', '_obi', '_furbelt', '_cinch', '_war_belt', '_waist', '_buckle'
        )) and getattr(p, 'cloth', None) is None:
            rigid_overrides.append((gi_offset, gi_offset + len(flat_P), 'Hips'))
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])

        cs = cloth_spec(p, vi_offset, slot)
        if cs:
            c_specs.append(cs)

        is_arm_part = getattr(p, 'is_arm', False) or any(k in p.name for k in (
            'sleeve', 'cuff', 'vambrace', 'wrist', 'bangle', 'bracelet', 'gauntlet', 'wraps', 'bracer',
            'pauldron', 'epaulette', 'sh_', 'wing_L', 'wing_R', 'wing_drape', 'stoleL', 'stoleR',
            'fringeL', 'fringeR', 'yokeL', 'yokeR', 'shoulder_', 'bellcap_', 'hex_plate_', 'spaulder_'
        ))
        if slot in ('legs', 'feet', 'back'):
            use_trunk = np.ones(len(flat_P), dtype=bool)
        elif slot == 'torso' and not is_arm_part:
            use_trunk = np.ones(len(flat_P), dtype=bool)
        else:
            use_trunk = np.zeros(len(flat_P), dtype=bool)
        all_use_trunk.append(use_trunk)

        all_P.append(flat_P)
        all_N.append(flat_N)
        all_UV.append(part_UV.reshape(-1, 2))
        all_VI.append(flat_VI)
        all_T.append(part_tris + gi_offset)

        y0 = min(TEX - 1, y0 + h)
        vi_offset += n_part_vi
        gi_offset += len(flat_P)

    P_arr = np.concatenate(all_P, axis=0).astype(np.float32)
    N_arr = np.concatenate(all_N, axis=0).astype(np.float32)
    UV_arr = np.concatenate(all_UV, axis=0).astype(np.float32)
    VI_arr = np.concatenate(all_VI, axis=0).astype(np.int32)
    T_arr = np.concatenate(all_T, axis=0).astype(np.int32)

    # Transfer skinning weights from nearest base skin vertex (excluding A-pose arm/hand/head vertices on trunk/skirt/leg parts!)
    use_trunk_arr = np.concatenate(all_use_trunk, axis=0)
    if slot in ('head', 'beard', 'hair', 'implant'):
        # Project head query points to the upper cranium above the brow so hanging veils, masks, and visors inherit
        # uniform cranium morphs and never get pulled into the eye sockets, nose, or lips by facial morphs!
        Q_head = P_arr.copy()
        brow_y = float(RIG.jpos[RIG.J['Head']][1]) + 0.12
        Q_head[:, 1] = np.maximum(Q_head[:, 1], brow_y)
        r_xz = np.hypot(Q_head[:, 0], Q_head[:, 2])
        scale_r = np.where(r_xz > 1e-4, np.minimum(r_xz, 0.085) / np.maximum(r_xz, 1e-4), 1.0)
        Q_head[:, 0] *= scale_r
        Q_head[:, 2] *= scale_r
        _, near_base = BASE_TREE_GL.query(Q_head)
    else:
        _, near_base = BASE_TREE_GL.query(P_arr)
    near_morph = near_base.copy()
    if use_trunk_arr.any():
        Q_trunk = P_arr[use_trunk_arr].copy()
        Q_morph = Q_trunk.copy()
        if slot == 'torso' or (slot == 'legs' and not legged):
            crotch_y = float(RIG.jpos[RIG.J['LeftUpLeg']][1]) - 0.01
            # For static body morphs (.morph.bin), clamp height above crotch_y so skirts never split at the midline
            Q_morph[:, 1] = np.maximum(Q_morph[:, 1], crotch_y)
            r_xz_m = np.hypot(Q_morph[:, 0], Q_morph[:, 2])
            sc_m = np.where(r_xz_m > 1e-4, np.minimum(r_xz_m, 0.085) / np.maximum(r_xz_m, 1e-4), 1.0)
            Q_morph[:, 0] *= sc_m
            Q_morph[:, 2] *= sc_m
            # For skinning weights, allow vertices below crotch_y to query leg vertices so make_mpfb.skirt_weights and cloth_bones
            # can smoothly skin the lower skirt to the legs + cloth chains (preventing texture sliding/scrolling!)
            above = Q_trunk[:, 1] >= crotch_y
            r_xz = np.hypot(Q_trunk[:, 0], Q_trunk[:, 2])
            sc_r = np.where(r_xz > 1e-4, np.minimum(r_xz, 0.085) / np.maximum(r_xz, 1e-4), 1.0)
            Q_trunk[above, 0] *= sc_r[above]
            Q_trunk[above, 2] *= sc_r[above]
            below = ~above
            Q_trunk[below, 0] = np.where(Q_trunk[below, 0] >= 0, np.maximum(Q_trunk[below, 0], 0.05), np.minimum(Q_trunk[below, 0], -0.05))
        _, near_trunk = TRUNK_TREE_GL.query(Q_trunk)
        near_base[use_trunk_arr] = TRUNK_IDX[near_trunk]
        _, near_trunk_m = TRUNK_TREE_GL.query(Q_morph)
        near_morph[use_trunk_arr] = TRUNK_IDX[near_trunk_m]
    JJ_arr = BASE_JJ[near_base].copy()
    WW_arr = BASE_WW[near_base].copy()

    # Apply any explicit rigid joint overrides (e.g. Head, Spine2, LeftShoulder, Hips)
    j_tpl = copy.deepcopy(TPL_J)
    b_tpl = bytearray(TPL_B)
    node = next(n for n in j_tpl['nodes'] if 'mesh' in n and 'skin' in n)
    skin = j_tpl['skins'][node['skin']]
    joint_names = [j_tpl['nodes'][k].get('name', '').split(':')[-1] for k in skin['joints']]

    for gs, ge, jname in rigid_overrides:
        if jname in joint_names:
            j_idx = joint_names.index(jname)
            JJ_arr[gs:ge] = 0
            WW_arr[gs:ge] = 0.0
            JJ_arr[gs:ge, 0] = j_idx
            WW_arr[gs:ge, 0] = 1.0

    # Rename mesh, node, material, image to gid
    node['name'] = gid
    j_tpl['meshes'][node['mesh']]['name'] = gid
    j_tpl['materials'][0]['name'] = gid
    j_tpl['materials'][0]['doubleSided'] = True
    metal_share = sum(
        sh for p, sh in zip(parts, share)
        if ((getattr(p, 'paint', None) or {}).get('fabric') or '').startswith(('metal.', 'shell.nacre', 'beads.glass'))
    )
    if metal_share >= 0.22:
        pbr = j_tpl['materials'][0].setdefault('pbrMetallicRoughness', {})
        pbr['metallicFactor'] = 0.26
        pbr['roughnessFactor'] = 0.42
        j_tpl['materials'][0]['extensions'] = {
            'KHR_materials_clearcoat': {'clearcoatFactor': 0.20, 'clearcoatRoughnessFactor': 0.34}
        }
    if j_tpl.get('images'):
        j_tpl['images'][0]['name'] = gid

    # Convert linear texture to sRGB PIL Image (note: paint_strip row 0 is v=0 top in glTF!)
    srgb = np.power(np.clip(img, 0.0, 1.0), 1.0 / 2.2)
    pil_img = Image.fromarray(np.rint(srgb * 255).astype(np.uint8), 'RGB')

    # Write into template GLB buffers
    prim = j_tpl['meshes'][0]['primitives'][0]
    at = prim['attributes']
    blobs = {}

    def set_acc(ai, arr, ctype=None, minmax=False):
        a = j_tpl['accessors'][ai]
        if ctype is not None:
            a['componentType'] = ctype
        a['count'] = len(arr)
        if minmax:
            a['min'] = [float(x) for x in arr.min(axis=0)]
            a['max'] = [float(x) for x in arr.max(axis=0)]
        bv_idx = a['bufferView']
        j_tpl['bufferViews'][bv_idx].pop('byteStride', None)
        blobs[bv_idx] = np.ascontiguousarray(arr).tobytes()

    set_acc(at['_VIDX'], VI_arr.astype(np.float32).reshape(-1, 1), 5126)
    set_acc(at['POSITION'], P_arr.astype(np.float32), 5126, minmax=True)
    set_acc(at['NORMAL'], N_arr.astype(np.float32), 5126)
    set_acc(at['TEXCOORD_0'], UV_arr.astype(np.float32), 5126)
    set_acc(at['JOINTS_0'], JJ_arr.astype(np.uint8), 5121)

    aw = j_tpl['accessors'][at['WEIGHTS_0']]
    w_ct = aw['componentType']
    w_dt = glbio.CT[w_ct]
    if w_ct == 5126:
        w_arr = WW_arr.astype(np.float32)
    else:
        w_arr = np.round(np.clip(WW_arr, 0.0, 1.0) * np.iinfo(w_dt).max).astype(w_dt)
    set_acc(at['WEIGHTS_0'], w_arr, w_ct)
    set_acc(prim['indices'], T_arr.reshape(-1).astype(np.uint16), 5123)

    if j_tpl.get('images'):
        im_meta = j_tpl['images'][0]
        bio = io.BytesIO()
        pil_img.save(bio, 'JPEG', quality=92)
        im_meta['mimeType'] = 'image/jpeg'
        blobs[im_meta['bufferView']] = bio.getvalue()

    buf_parts, off = [], 0
    for k, v in enumerate(j_tpl['bufferViews']):
        o = v.get('byteOffset', 0)
        data = blobs.get(k, bytes(b_tpl[o:o + v['byteLength']]))
        pad = (-off) % 4
        buf_parts.append(b'\0' * pad)
        off += pad
        v['byteOffset'], v['byteLength'] = off, len(data)
        buf_parts.append(data)
        off += len(data)
    binb = bytearray(b''.join(buf_parts) + b'\0' * ((-off) % 4))
    j_tpl['buffers'] = [{'byteLength': len(binb)}]

    # Apply make_mpfb weight post-processors (skirt_weights for robes/coats, head_weights for headgear)
    crotch_gl = float(RIG.jpos[RIG.J['LeftUpLeg']][1]) - 0.06
    if slot == 'torso' or (slot == 'legs' and not legged):
        make_mpfb.skirt_weights(j_tpl, binb, crotch_gl, rigid=(not bool(c_specs)))
    elif slot in ('head', 'beard', 'hair', 'implant'):
        make_mpfb.head_weights(j_tpl, binb, RIG.jpos[RIG.J['Neck']][1] + 0.02)

    # Re-apply explicit rigid_overrides after skirt_weights/head_weights so rigid props (hip buckler, shin rattles, beard, belts) stay 100% locked
    if rigid_overrides:
        JJ_post = glbio.accessor(j_tpl, bytes(binb), at['JOINTS_0']).copy()
        WW_post = glbio.accessor(j_tpl, bytes(binb), at['WEIGHTS_0']).astype(np.float32).copy()
        if w_ct != 5126 and not aw.get('normalized'):
            WW_post /= float(np.iinfo(w_dt).max)
        for gs, ge, jname in rigid_overrides:
            if jname in joint_names:
                j_idx = joint_names.index(jname)
                JJ_post[gs:ge] = 0
                WW_post[gs:ge] = 0.0
                JJ_post[gs:ge, 0] = j_idx
                WW_post[gs:ge, 0] = 1.0
        bv_j = j_tpl['bufferViews'][j_tpl['accessors'][at['JOINTS_0']]['bufferView']]
        j_bytes = np.ascontiguousarray(JJ_post.astype(glbio.CT[j_tpl['accessors'][at['JOINTS_0']]['componentType']])).tobytes()
        binb[bv_j['byteOffset']:bv_j['byteOffset'] + len(j_bytes)] = j_bytes
        bv_w = j_tpl['bufferViews'][aw['bufferView']]
        if w_ct == 5126:
            w_bytes = np.ascontiguousarray(WW_post.astype(np.float32)).tobytes()
        else:
            w_bytes = np.ascontiguousarray(np.round(np.clip(WW_post, 0.0, 1.0) * np.iinfo(w_dt).max).astype(w_dt)).tobytes()
        binb[bv_w['byteOffset']:bv_w['byteOffset'] + len(w_bytes)] = w_bytes

    cloth_out = None
    if c_specs:
        cloth_blobs = {}
        cloth_out = make_mpfb.cloth_bones(
            j_tpl, bytes(binb), gid, {'parts': c_specs, 'hips': hip_ranges},
            cloth_blobs, body=BODY_CONTACT if slot not in ('legs', 'head') else None
        )
        if cloth_blobs:
            buf_parts2, off2 = [], 0
            for k, v in enumerate(j_tpl['bufferViews']):
                o = v.get('byteOffset', 0)
                data = cloth_blobs.get(k, bytes(binb[o:o + v['byteLength']]))
                pad = (-off2) % 4
                buf_parts2.append(b'\0' * pad)
                off2 += pad
                v['byteOffset'], v['byteLength'] = off2, len(data)
                buf_parts2.append(data)
                off2 += len(data)
            binb = bytearray(b''.join(buf_parts2) + b'\0' * ((-off2) % 4))
            j_tpl['buffers'] = [{'byteLength': len(binb)}]

    out_glb = ROOT / 'pieces' / BODY_ID / f'{gid}.glb'
    js = json.dumps(j_tpl, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(out_glb, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))

    # Build .morph.bin by mapping each unique garment VI to its nearest base skin _VIDX
    used_vi = np.unique(VI_arr)
    first_gi = np.zeros(int(used_vi.max()) + 1, dtype=np.int32)
    for gi, vi in enumerate(VI_arr):
        first_gi[vi] = gi
    base_vidx_for_vi = BASE_VIDX[near_morph[first_gi[used_vi]]]
    D_garment = np.zeros((BASE_MORPH_D.shape[0], int(used_vi.max()) + 1, 3), dtype=np.float32)
    D_garment[:, used_vi, :] = BASE_MORPH_D[:, base_vidx_for_vi, :]
    morph_bytes = make_mpfb.pack_morphs([(gid, [gid], used_vi)], {'d_' + gid: D_garment})
    (ROOT / 'pieces' / BODY_ID / f'{gid}.morph.bin').write_bytes(morph_bytes)

    # Build kit.json item entry
    entry = {
        'id': gid,
        'name': label,
        'slot': slot,
        'glb': f'pieces/{BODY_ID}/{gid}.glb',
        'culture': culture,
        '_body': BODY_ID,
    }
    if covers_hair:
        entry['covers_hair'] = True
        if slot == 'head' and P_arr[:, 1].min() < RIG.jpos[RIG.J['Neck']][1]:
            tris = make_mpfb.covered(BP_GL, BT, str(out_glb))
            neck_y = RIG.jpos[RIG.J['Neck']][1] - 0.10
            head_y = RIG.jpos[RIG.J['Head']][1] + 0.01
            tris = tris[(BP_GL[BT[tris], 1] > neck_y).all(1) & (BP_GL[BT[tris], 1] < head_y).all(1)]
            if len(tris):
                entry['hide'] = make_mpfb.bits(len(BT), tris)
                entry['hides'] = int(len(tris))
                entry['hide_by'] = 'rays'
    if covers_face:
        entry['hide_parts'] = ['Human.lips', 'Human.eyelashes', 'Human.eyebrows']
    if cloth_out:
        entry['cloth'] = cloth_out
    if slot == 'torso':
        entry['tucks'] = True
        if cloth_out or P_arr[:, 1].min() < float(RIG.jpos[RIG.J['Hips']][1]) - 0.04:
            entry['loose'] = True
        if P_arr[:, 1].min() < RIG.jpos[RIG.J['LeftLeg']][1]:
            entry['long'] = True
        entry['hem'] = make_mpfb.hem_depth(RIG, str(out_glb))
        if not open_torso:
            tris = make_mpfb.covered(BP_GL, BT, str(out_glb), out=0.055, inward=0.025)
            top_span = BP_GL[:, 1].max() - BP_GL[:, 1].min()
            y_cut = 0.36 * top_span if entry.get('long') else 0.48 * top_span
            tris = tris[(BP_GL[BT[tris], 1] > BP_GL[:, 1].min() + y_cut).all(1)]
            entry['hide'] = make_mpfb.bits(len(BT), tris)
            entry['hides'] = int(len(tris))
            entry['hide_by'] = 'rays'
        entry['hide_parts'] = ['Human.nipple']
    elif slot == 'legs':
        if not legged:
            if cloth_out or P_arr[:, 1].min() < float(RIG.jpos[RIG.J['Hips']][1]) - 0.04:
                entry['loose'] = True
            tris = make_mpfb.covered(BP_GL, BT, str(out_glb))
            top_span = BP_GL[:, 1].max() - BP_GL[:, 1].min()
            tris = tris[(BP_GL[BT[tris], 1] > BP_GL[:, 1].min() + 0.5 * top_span).all(1)]
        else:
            tris = make_mpfb.covered(BP_GL, BT, str(out_glb), **make_mpfb.TROUSERS_COVER)
        entry['hide'] = make_mpfb.bits(len(BT), tris)
        entry['hides'] = int(len(tris))
        entry['hide_by'] = 'rays'
    elif slot == 'feet':
        tris = make_mpfb.covered(BP_GL, BT, str(out_glb))
        entry['hide'] = make_mpfb.bits(len(BT), tris)
        entry['hides'] = int(len(tris))
        entry['hide_by'] = 'rays'
    print(f'Built {gid:28s} ({slot:5s}): {len(P_arr):5d} verts, {len(T_arr):5d} tris -> {out_glb.name}')
    return entry


# ===============================================================================================================
# OUTFIT 1: Eastern Nomads — "Star-Reckoner / Caravan Patriarch" (Ref Image 1)
# ===============================================================================================================
def build_nomad_patriarch():
    # --- HEADPIECE: Striped backward-curving horn-cap with dangling brass bells & white couvre-nuque ---
    gid_h = 'nomad_m_patriarch_cap'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # White neck-cloth (couvre-nuque) draping around back and sides of head down to shoulders
    drape_paint = P('white', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'sky'), B('top', 0.0, 0.015, 'solid', 'cream')])
    parts_h.append(hood(gid_h + '_drape', drape_paint, ease=0.024, ease_low=0.052, open_front=1.05, low=-0.50, rows=12, n=32, peak=0.01))

    # Striped brow-wrap & backward-curving Phrygian horn-cap
    stripe_paint = P('cream', 0.05, [B('top', 0.0, 0.55, 'stripes', 'madder', 'cream', 0.038)],
                     [PN(0.0, 1.0, 'stripes', 'madder', 'cream', 0.042)])
    parts_h.append(head_rings(gid_h + '_band', 0.48, 0.68, 0.024, stripe_paint, n=36, rows=4))

    # Curved horn path arching up from crown and sweeping backward over the occiput
    c0 = a + (b - a) * 0.66
    horn_path = [
        c0 - bk * 0.01,
        c0 + up * 0.07 + bk * 0.02,
        c0 + up * 0.14 + bk * 0.09,
        c0 + up * 0.17 + bk * 0.18,
        c0 + up * 0.15 + bk * 0.27,
        c0 + up * 0.11 + bk * 0.34,
    ]
    parts_h.append(horn(gid_h + '_horn', horn_path, 0.092, 0.012, stripe_paint, n=24, rows=16, rigid_joint='Head'))

    # Red knotted cloth bow at the nape
    nape = a + (b - a) * 0.32 + bk * 0.11
    parts_h.append(blob(gid_h + '_knot', nape, (0.08, 0.05, 0.07), P('madder', 0.05), out=bk, rigid_joint='Head'))
    parts_h.append(flap(gid_h + '_napetail', nape - up * 0.02, 0.09, 0.14, bk, P('madder', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'cream')]),
                        cols=5, rows=6, push=False, rigid_joint='Head'))

    # 7 dangling brass bells along the underside of the backward-curving horn
    bell_paint = P('brass', 0.02)
    for k in range(7):
        t = (k + 1) / 7.5
        idx_f = t * (len(horn_path) - 1)
        i0 = min(len(horn_path) - 2, int(idx_f))
        frac = idx_f - i0
        pt = horn_path[i0] * (1 - frac) + horn_path[i0 + 1] * frac
        rad_here = 0.092 * (1 - t) + 0.012 * t
        bell_pos = pt - up * (rad_here + 0.018) + bk * 0.01
        parts_h.append(blob(f'{gid_h}_bell{k}', bell_pos, (0.018, 0.018, 0.022), bell_paint, n=8, rows=5, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Star-Reckoner Horn-Cap & Bells', 'head', 'eastern_nomads', parts_h, covers_hair=True)

    # --- TORSO: Wide batwing umber caftan with tassel bands & geometric diamond/cross pallium stole ---
    gid_t = 'nomad_m_patriarch_robe'
    parts_t = []

    # Single continuous floor-length earth/umber caftan with indigo/sky hem trim, radiating crimson & ash tassel stripes
    # AND central floor-length diamond/cross pallium on front (u=0.5)
    caftan_paint = P('umber', 0.08, [
        B('bottom', 0.0, 0.025, 'solid', 'indigo'),
        B('bottom', 0.025, 0.048, 'rays', 'sky', 'indigo', 0.022),
        B('bottom', 0.048, 0.068, 'solid', 'ochre'),
        B('bottom', 0.08, 0.24, 'rays', 'madder', 'umber', 0.055),
        B('bottom', 0.28, 0.44, 'rays', 'ash', 'earth', 0.055),
        B('bottom', 0.48, 0.64, 'rays', 'madder', 'umber', 0.055),
        B('bottom', 0.68, 0.84, 'rays', 'ash', 'earth', 0.055),
        B('top', 0.0, 0.03, 'solid', 'ochre'),
    ], [
        # Central front pallium (u around 0.5) with sky-blue fringe borders and stacked diamond-and-cross medallions!
        PN(0.395, 0.420, 'solid', 'sky', 'sky', 1.0),
        PN(0.420, 0.435, 'solid', 'madder', 'madder', 1.0),
        PN(0.435, 0.565, 'nomad_diamond', 'cream', 'purple', 0.14),
        PN(0.565, 0.580, 'solid', 'madder', 'madder', 1.0),
        PN(0.580, 0.605, 'solid', 'sky', 'sky', 1.0),
    ])
    parts_t.append(torso_tube(gid_t + '_caftan', TOP + 0.005, ANKLE + 0.03, 0.022, caftan_paint, n=48,
                              hang_from=WAIST - 0.02, hang_side=WAIST - 0.02, flare=0.10,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02, over_arms=False))

    # Wide flaring batwing sleeves with sky-blue inner cuffs and radiating red/white tassel bands along the sleeve
    sl_paint = P('umber', 0.08, [
        B('bottom', 0.0, 0.038, 'solid', 'sky'),
        B('bottom', 0.04, 0.15, 'rays', 'madder', 'earth', 0.045),
        B('bottom', 0.17, 0.28, 'rays', 'ash', 'umber', 0.045),
        B('bottom', 0.30, 0.42, 'rays', 'madder', 'earth', 0.045),
    ])
    parts_t += sleeves(gid_t, 'wrist', 0.026, sl_paint, ease_end=0.13, rows=10, n=22, rmax=0.22)

    # Square-shouldered geometric diamond-and-cross tapestry stole over chest & shoulders with sky-blue tassel fringe
    yoke_paint = P('purple', 0.05, [
        B('bottom', 0.0, 0.045, 'rays', 'sky', 'indigo', 0.020),
        B('top', 0.0, 0.025, 'rays', 'sky', 'indigo', 0.020),
    ], [
        PN(0.0, 1.0, 'nomad_diamond', 'cream', 'purple', 0.13),
    ])
    parts_t.append(torso_tube(gid_t + '_yoke', TOP + 0.012, CHEST - 0.09, 0.038, yoke_paint, n=48,
                              scale=(1.02, 1.22), over_arms=False, rows=10, hull_from=TOP + 0.01))
    # Square shoulder extensions of the geometric stole over left and right upper arms
    parts_t.append(pauldron(gid_t + '_stoleL', L, yoke_paint, reach=0.38, ease=0.040, flare_end=0.95, span=1.75))
    parts_t.append(pauldron(gid_t + '_stoleR', R, yoke_paint, reach=0.38, ease=0.040, flare_end=0.95, span=1.75))

    # 3D relief tassel clusters fanning across the front of the caftan (alternating madder red and ash white)
    for tier, z_t in enumerate((CHEST - 0.14, WAIST - 0.06, CROTCH - 0.10)):
        for side in (-1, 1):
            for col_i in range(3):
                ang = math.pi + side * (0.34 + 0.16 * col_i)
                d_vec = np.array([math.sin(ang), math.cos(ang), 0.0])
                c_pt = spine_at(z_t) + d_vec * (0.155 + 0.014 * tier + 0.010 * col_i)
                t_col = 'madder' if (tier + col_i) % 2 == 0 else 'ash'
                parts_t.append(blob(f'{gid_t}_tas_{tier}_{side}_{col_i}', c_pt, (0.022, 0.014, 0.045), P(t_col, 0.04), n=8, rows=5, out=d_vec))

    entry_t = assemble_garment(gid_t, 'Star-Reckoner Winged Caftan & Pallium', 'torso', 'eastern_nomads', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 2: Eastern Nomads of Shade — "Shade-Walker / Cistern Guide" (Ref Image 2 Left)
# ===============================================================================================================
def build_nomad_walker():
    # --- HEADPIECE: Tall monolithic domed cowl + dark horizontally-pleated face-veil ---
    gid_h = 'nomad_m_walker_cowl'
    a, b, up, bk, left = head_frame()
    parts_h = []

    cowl_paint = P('duneumber', 0.07, [
        B('bottom', 0.0, 0.02, 'solid', 'soot'),
        B('top', 0.0, 0.02, 'solid', 'bark'),
    ], fabric='cloth.cotton.coarse')
    veil_paint = P('soot', 0.06, [B('top', 0.0, 0.45, 'stripes', 'duneumber', 'soot', 0.014)],
                   [PN(0.0, 1.0, 'stripes', 'duneumber', 'soot', 0.016)])

    # Dark finely-ribbed inner face veil hanging straight down from the brow under gravity with subtle lower flare
    fs_v = np.linspace(-0.30, 0.82, 12)
    angs_v = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    V_grid = []
    for f in fs_v:
        c = a + (b - a) * f
        drop = max(0.0, 0.62 - f)
        rx = 0.104 + 0.016 * drop
        ry = 0.140 + 0.016 * drop
        V_grid.append([c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - 0.032) for an in angs_v])
    parts_h.append(Part(gid_h + '_veil', np.array(V_grid), True, ['body'] * len(fs_v), veil_paint, rigid_joint='Head'))

    # Tall smooth monolithic domed cowl rising high above the crown (f from -0.28 to 1.48), open at the front slot
    fs_d = np.linspace(-0.28, 1.48, 18)
    angs_d = np.linspace(-(math.pi - 0.48), math.pi - 0.48, 36)
    D_grid = []
    for k, f in enumerate(fs_d):
        u_f = k / (len(fs_d) - 1)
        c = a + (b - a) * f
        # Smooth elongated bullet-dome taper above f=0.75
        dome_scale = 1.0 if f < 0.72 else max(0.08, math.cos(math.pi * 0.5 * ((f - 0.72) / 0.76)) ** 0.85)
        drop_d = max(0.0, 0.58 - f)
        rx = (0.116 + 0.012 * (1 - u_f) + 0.012 * drop_d) * dome_scale
        ry = (0.144 + 0.010 * (1 - u_f) + 0.010 * drop_d) * dome_scale
        # Close the front slot smoothly above the brow (f > 0.58)
        slot_close = max(0.0, min(1.0, (f - 0.58) / 0.18))
        half_span = (math.pi - 0.48) * (1.0 - slot_close) + math.pi * slot_close
        row = []
        for j in range(len(angs_d)):
            an_eff = -half_span + 2.0 * half_span * (j / (len(angs_d) - 1))
            row.append(c + left * (math.sin(an_eff) * rx) + bk * (math.cos(an_eff) * ry - 0.028 * dome_scale))
        D_grid.append(row)
    D_grid[-1] = [np.mean(D_grid[-1], axis=0)] * len(angs_d)
    parts_h.append(Part(gid_h + '_dome', np.array(D_grid), False, ['body'] * len(fs_d), cowl_paint, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Shade-Walker Domed Cowl & Pleated Veil', 'head', 'eastern_nomads', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Sharp-pointed wing-shoulder V-plunge mantle + voluminous ballooned olive-sand desert robe ---
    gid_t = 'nomad_m_walker_robe'
    parts_t = []

    robe_paint = P('dunesand', 0.07, [
        B('bottom', 0.0, 0.07, 'solid', 'duneumber'),
        B('bottom', 0.07, 0.085, 'solid', 'soot'),
        B('top', 0.0, 0.02, 'solid', 'bark'),
    ], [
        # Central dark-ash vertical inner column down the front (u around 0.5)
        PN(0.455, 0.545, 'solid', 'duneumber', 'dunesand', 1.0),
    ], fabric='cloth.cotton.coarse')

    # Sculpted diamond-ballooned desert robe: narrow at chest, billowing to angular hip/thigh points at CROTCH-0.12,
    # then tapering back into dark gathered ankle cuffs!
    zs = np.linspace(TOP, ANKLE + 0.04, 28)
    n_c = 48
    angs = np.linspace(0, 2 * math.pi, n_c, endpoint=False)
    R_grid = []
    for z in zs:
        c = spine_at(z)
        z_peak = CROTCH - 0.12
        if z >= z_peak:
            b_fac = math.sin(math.pi * 0.5 * np.clip((TOP - z) / max(TOP - z_peak, 1e-4), 0, 1)) ** 1.35
        else:
            b_fac = math.sin(math.pi * 0.5 * np.clip((z - (ANKLE + 0.04)) / max(z_peak - (ANKLE + 0.04), 1e-4), 0, 1)) ** 0.85

        row = []
        for an in angs:
            d = np.array([math.sin(an), math.cos(an), 0.0])
            h = first_hit(c, d, bvh=BVH_T) or (0.14 if z > CROTCH else 0.12)
            lat = abs(math.sin(an)) ** 1.5
            pleat = 0.005 * math.cos(16 * an) * b_fac
            r_base = max(h + 0.020, 0.140 if z > ANKLE + 0.16 else 0.115)
            rad = r_base + b_fac * (0.060 * lat + 0.025 * (1 - lat)) + pleat
            row.append(np.array([c[0] + d[0] * rad, c[1] + d[1] * rad, z]))
        R_grid.append(row)

    pt_robe = Part(gid_t, np.array(R_grid), True, ['helper-skirt' if z < CROTCH + 0.02 else 'body' for z in zs], robe_paint)
    pt_robe.cloth = {'start': int(np.argmin(np.abs(zs - (WAIST - 0.02)))), 'stiff': 0.08}
    parts_t.append(pt_robe)
    parts_t += sleeves(gid_t, 'wrist', 0.018, P('duneumber', 0.07, fabric='cloth.cotton.coarse'), ease_end=0.025, rows=8)

    # Sharp-pointed triangular wing-shoulder mantle plunging in a deep V down the chest (on torso so it stays level with shoulders!)
    n_ang = 48
    n_rows = 14
    angles = np.linspace(0, 2 * math.pi, n_ang, endpoint=False)
    Q = []
    for r_i in range(n_rows):
        s = r_i / (n_rows - 1)
        row = []
        for an in angles:
            lat = abs(math.sin(an)) ** 2.2
            frontness = max(0.0, -math.cos(an)) ** 2.0
            backness = max(0.0, math.cos(an)) ** 1.6
            w_sum = max(lat + frontness + backness, 1e-6)
            z_top = TOP + 0.04
            z_bot = ((SHOULDER + 0.015) * lat + (WAIST - 0.02) * frontness + (CHEST - 0.02) * backness) / w_sum
            z = z_top * (1 - s) + z_bot * s
            c = spine_at(z)
            d = np.array([math.sin(an), math.cos(an), 0.0])
            h_body = first_hit(c, d, bvh=BVH_T) or 0.14
            r_neck = 0.105 + 0.015 * lat
            r_outer = max(h_body + 0.036, 0.35 * (lat ** 0.65) + 0.175 * frontness + 0.175 * backness)
            rad = r_neck * (1 - s ** 0.85) + r_outer * (s ** 0.85)
            row.append(np.array([c[0] + d[0] * rad, c[1] + d[1] * rad, z]))
        Q.append(row)
    parts_t.append(Part(gid_t + '_wings', np.array(Q), True, ['body'] * n_rows, cowl_paint, rigid_joint='Spine2'))

    for sd, sname in ((1, 'L'), (-1, 'R')):
        W_grid = []
        for ri in range(6):
            sv = ri / 5.0
            w_row = []
            for cj in range(9):
                su = (cj / 8.0 - 0.5) * 2.0
                wx = sd * (0.15 + 0.19 * (1 - sv * 0.55))
                wy = su * (0.11 * (1 - sv * 0.3))
                wz = SHOULDER + 0.015 - sv * 0.16 - (1 - su ** 2) * 0.02
                w_row.append(np.array([wx, wy, wz]))
            W_grid.append(w_row)
        parts_t.append(Part(f'{gid_t}_vault_{sname}', np.array(W_grid), False, ['body'] * 6, cowl_paint, rigid_joint='Spine2'))

    entry_t = assemble_garment(gid_t, 'Shade-Walker Wing-Mantle & Ballooned Robe', 'torso', 'eastern_nomads', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 3: Eastern Nomads of Shade — "High Desert Oracle / Dune-Cantor" (Ref Image 2 Right)
# ===============================================================================================================
def build_nomad_oracle():
    # --- HEADPIECE: Wide flat-crested horizontal anvil/horn-cowl with vertical eye-slit ---
    gid_h = 'nomad_m_oracle_cowl'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # Sculpted horizontal anvil-cowl: from neck (f=-0.35) up to wide flat horizontal top ridge (f=1.18),
    # flaring laterally to +-0.26 m at the top corners with a narrow vertical slit down the front!
    cowl_paint = P('shroudoat', 0.06, [
        B('top', 0.0, 0.015, 'solid', 'bark'),
    ], [
        # Narrow vertical dark veil-slit down the front center (u around 0.5)
        PN(0.472, 0.528, 'solid', 'soot', 'soot', 1.0),
        PN(0.455, 0.472, 'solid', 'duneumber', 'shroudoat', 1.0),
        PN(0.528, 0.545, 'solid', 'duneumber', 'shroudoat', 1.0),
    ], fabric='cloth.cotton.coarse')

    fs = np.linspace(-0.38, 1.16, 16)
    n_c = 44
    angs = np.linspace(0, 2 * math.pi, n_c, endpoint=False)
    C_grid = []
    for k, f in enumerate(fs):
        u_f = k / (len(fs) - 1)  # 0 at neck base, 1 at flat anvil crest
        c = a + (b - a) * f
        drop = max(0.0, 0.58 - f)
        # Lateral width flares dramatically toward the top horizontal anvil corners (+-0.26 m) and drapes smoothly below!
        lat_flare = 0.114 + 0.012 * drop + 0.155 * (u_f ** 1.45)
        # Front-to-back depth hangs straight down below brow (0.162 m + drape flare), tapering to a blade at the top crest!
        fb_depth = (0.162 + 0.012 * drop) * (1.0 - 0.78 * (max(0.0, (u_f - 0.42) / 0.58) ** 1.8)) + 0.018
        row = []
        for an in angs:
            lx = math.sin(an) * lat_flare
            by = math.cos(an) * fb_depth - 0.032 * (1.0 - u_f * 0.65)
            z_lift = 0.016 * (abs(math.sin(an)) ** 2) * (u_f ** 2)
            pt = c + left * lx + bk * by + up * z_lift
            row.append(pt)
        C_grid.append(row)
    top_row = []
    c_top = a + (b - a) * 1.17
    for an in angs:
        lx = math.sin(an) * 0.260
        by = math.cos(an) * 0.002
        top_row.append(c_top + left * lx + bk * by + up * (0.016 * (abs(math.sin(an)) ** 2)))
    C_grid.append(top_row)

    parts_h.append(Part(gid_h, np.array(C_grid), True, ['body'] * len(C_grid), cowl_paint, rigid_joint='Head'))
    entry_h = assemble_garment(gid_h, 'Dune-Cantor Horizontal Anvil-Cowl', 'head', 'eastern_nomads', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Monolithic floor-length vertical pleated shroud (taupe outer walls + pale oat inner column) ---
    gid_t = 'nomad_m_oracle_shroud'
    parts_t = []

    shroud_paint = P('shroudtaupe', 0.07, [
        B('bottom', 0.0, 0.025, 'solid', 'duneumber'),
    ], [
        # Central pale olive-oat column down the front (u from 0.42 to 0.58)
        PN(0.425, 0.575, 'solid', 'shroudoat', 'shroudoat', 1.0),
        # Deep vertical pleat shadow lines flanking the central column
        PN(0.395, 0.425, 'vstripes', 'duneumber', 'shroudtaupe', 0.04),
        PN(0.575, 0.605, 'vstripes', 'duneumber', 'shroudtaupe', 0.04),
        PN(0.340, 0.380, 'vstripes', 'duneumber', 'shroudtaupe', 0.05),
        PN(0.620, 0.660, 'vstripes', 'duneumber', 'shroudtaupe', 0.05),
    ], fabric='cloth.cotton.coarse')

    # Sculpted monolithic column shroud enclosing shoulders, chest and arms, falling straight to the floor with 3D pleats
    zs = np.linspace(TOP + 0.03, ANKLE + 0.02, 28)
    n_c = 56
    angs = np.linspace(0, 2 * math.pi, n_c, endpoint=False)
    S_grid = []
    for k, z in enumerate(zs):
        c = spine_at(z)
        if z > SHOULDER - 0.08:
            t_sh = (TOP + 0.03 - z) / max((TOP + 0.03) - (SHOULDER - 0.08), 1e-4)
            w_x = 0.14 + 0.065 * math.sin(math.pi * 0.5 * min(1.0, t_sh))
            w_y = 0.15 + 0.045 * math.sin(math.pi * 0.5 * min(1.0, t_sh))
        else:
            t_low = (SHOULDER - 0.08 - z) / max((SHOULDER - 0.08) - (ANKLE + 0.02), 1e-4)
            w_x = 0.205 + 0.020 * t_low
            w_y = 0.195 + 0.020 * t_low

        row = []
        for an in angs:
            d = np.array([math.sin(an), math.cos(an), 0.0])
            h_body = first_hit(c, d, bvh=BVH_T) or 0.14
            is_front_col = abs(an - math.pi) < 0.42
            recess = -0.014 if is_front_col else 0.0
            pleat = 0.0 if is_front_col else 0.008 * math.cos(20 * an)
            rx = (w_x + pleat) * math.sin(an)
            ry = (w_y + recess + pleat) * math.cos(an)
            r_cur = math.hypot(rx, ry)
            r_min = h_body + (0.024 if is_front_col else 0.038)
            if r_cur < r_min:
                rx *= r_min / max(r_cur, 1e-6)
                ry *= r_min / max(r_cur, 1e-6)
            row.append(np.array([c[0] + rx, c[1] + ry, z]))
        S_grid.append(row)

    pt_shroud = Part(gid_t, np.array(S_grid), True, ['helper-skirt' if z < CROTCH + 0.02 else 'body' for z in zs], shroud_paint)
    pt_shroud.cloth = {'start': int(np.argmin(np.abs(zs - (WAIST - 0.02)))), 'stiff': 0.08}
    parts_t.append(pt_shroud)
    parts_t += sleeves(gid_t, 'wrist', 0.022, P('shroudtaupe', 0.07, fabric='cloth.cotton.coarse'), ease_end=0.035, rows=8)
    entry_t = assemble_garment(gid_t, 'Dune-Cantor Monolithic Pleated Shroud', 'torso', 'eastern_nomads', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 4: Iron Republic — "High Magistrate of the Salvage Court" (Ref Image 3)
# ===============================================================================================================
def build_rep_magistrate():
    # --- HEADPIECE: Wide razor-flat scarlet disc hat + tall fluted-brass cone crown + dark spectacles ---
    gid_h = 'rep_m_magistrate_hat'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # Wide razor-flat scarlet disc brim (width=0.24m, zero droop, sitting level over the brow)
    brim_paint = P('repred', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.0, 0.025, 'solid', 'brass'),
        B('bottom', 0.02, 0.16, 'rays', 'repcream', 'repred', 0.045),
    ])
    parts_h.append(brim(gid_h + '_brim', 0.62, 0.24, brim_paint, ease=0.018, rows=5, n=44, droop=0.0, lift=0.002))

    # Tall fluted-brass truncated cone crown (height=0.33m, tapering from 1.0 to 0.48) with scarlet top cap
    crown_paint = P('brass', 0.03, [
        B('bottom', 0.0, 0.035, 'solid', 'repred'),
        B('bottom', 0.035, 0.048, 'solid', 'repblack'),
        B('top', 0.0, 0.025, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'fluted', 'repblack', 'brass', 0.06),
    ], fabric='metal.bronze')
    parts_h.append(tower_hat(gid_h + '_cone', 0.33, lambda s: 1.0 - 0.52 * s, crown_paint, f=0.62, ease=0.016, rows=14, n=40))

    # Dark pince-nez spectacles on bridge of nose
    eye_c = a + (b - a) * 0.40 - bk * 0.115
    for sd in (-1, 1):
        parts_h.append(blob(f'{gid_h}_lens_{sd}', eye_c + left * sd * 0.032, (0.028, 0.012, 0.028), P('repblack', 0.02),
                            n=12, rows=5, out=-bk, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_bridge', eye_c, (0.024, 0.008, 0.008), P('brass', 0.02), n=8, rows=4, out=-bk, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Magistrate Fluted-Brass Cone Hat & Spectacles', 'head', 'iron_republic', parts_h, covers_hair=True)

    # --- TORSO: Scarlet greatcoat, notched green revers, fluted brass pauldrons & rondels, chest chain, green/gold cassock ---
    gid_t = 'rep_m_magistrate_coat'
    parts_t = []

    # 1. Unified Scarlet A-line Greatcoat & dark-green gold-lattice front cassock (single continuous 360° tube so inner/outer layers never intersect!)
    coat_paint = P('repred', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.018, 0.11, 'solid', 'deepgreen'),
        B('bottom', 0.11, 0.122, 'solid', 'gold'),
        B('top', 0.0, 0.02, 'solid', 'gold'),
    ], [
        PN(0.38, 0.41, 'quilt', 'loden', 'deepgreen', 0.08),
        PN(0.41, 0.42, 'solid', 'gold', 'gold', 1.0),
        PN(0.42, 0.58, 'gold_grid', 'gold', 'deepgreen', 0.065),
        PN(0.58, 0.59, 'solid', 'gold', 'gold', 1.0),
        PN(0.59, 0.62, 'quilt', 'loden', 'deepgreen', 0.08),
    ])
    parts_t.append(torso_tube(gid_t + '_coat', TOP + 0.005, ANKLE + 0.10, 0.028, coat_paint, n=52,
                              hang_from=WAIST - 0.02, hang_side=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02, over_arms=False))

    # Crimson pleated waist sash over the cassock
    sash_paint = P('repred', 0.04, [B('top', 0.0, 0.08, 'stripes', 'crimson', 'repred', 0.02)])
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.045, WAIST - 0.035, 0.032, sash_paint, rows=4, n=40, hull_from=WAIST + 0.1))

    # 3. Wide notched dark-green quilted lapels/revers contoured flush to the chest surface (no rigid_joint detachment!)
    lapel_paint = P('deepgreen', 0.05, [
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
        B('top', 0.0, 0.012, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'quilt', 'loden', 'deepgreen', 0.07)])
    x_ax, y_ax = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    for sd, sname in ((1, 'L'), (-1, 'R')):
        L_grid = []
        for ri in range(8):
            sv = ri / 7.0
            z_l = (SHOULDER + 0.01) * (1 - sv) + (WAIST - 0.02) * sv
            ang_in = math.pi + sd * (0.16 + 0.05 * (1 - sv))
            ang_out = math.pi + sd * (0.58 if sv < 0.42 else (0.68 - 0.36 * ((sv - 0.42) / 0.58)))
            angs_l = np.linspace(ang_in, ang_out, 6) if sd > 0 else np.linspace(ang_out, ang_in, 6)
            L_grid.append(ring_points(spine_at(z_l), x_ax, y_ax, angs_l, 0.032, rmin=0.08, rmax=0.24, bvh=BVH_T))
        parts_t.append(Part(f'{gid_t}_lapel_{sname}', np.array(L_grid), False, ['body'] * 8, lapel_paint))

    # 4. High curved dark-green quilted standing collar framing the jaw
    collar_paint = P('deepgreen', 0.05, [B('top', 0.0, 0.012, 'solid', 'brass'), B('bottom', 0.0, 0.01, 'solid', 'brass')],
                     [PN(0.0, 1.0, 'quilt', 'loden', 'deepgreen', 0.06)])
    parts_t.append(torso_tube(gid_t + '_collar', TOP + 0.095, TOP - 0.01, 0.036, collar_paint, n=36, rows=5,
                              ease_bottom=0.048, arc=(-(math.pi - 0.42), math.pi - 0.42)))

    # 5. Massive fluted-brass pauldrons with scalloped fringe + circular front rondels + attached chest chain
    pauldron_paint = P('brass', 0.03, [
        B('bottom', 0.0, 0.035, 'dentils', 'brass', 'repblack', 0.025),
        B('top', 0.0, 0.015, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'fluted', 'repblack', 'brass', 0.045)], fabric='metal.bronze')
    for sd, sname in ((L, 'L'), (R, 'R')):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{sname}', sd, pauldron_paint, reach=0.42, ease=0.064, flare_end=0.90, span=1.85, rows=8, n=18))

    rondel_paint = P('brass', 0.02, [B('top', 0.0, 0.5, 'stripes', 'gold', 'brass', 0.02)], fabric='metal.bronze')
    for sd in (-1, 1):
        r_ang = math.pi + sd * 0.44
        r_pos = ring_points(spine_at(SHOULDER - 0.02), x_ax, y_ax, [r_ang], 0.036, rmin=0.08, rmax=0.24, bvh=BVH_T)[0]
        parts_t.append(blob(f'{gid_t}_rondel_{sd}', r_pos, (0.068, 0.016, 0.068), rondel_paint, n=16, rows=6,
                            out=np.array([sd * 0.35, -1.0, 0.0])))

    chain_pts = []
    for k in range(11):
        u_c = (k / 10.0 - 0.5) * 2.0
        c_ang = math.pi + u_c * 0.44
        cz = (SHOULDER - 0.02) - 0.075 * (1.0 - u_c ** 2)
        c_pos = ring_points(spine_at(cz), x_ax, y_ax, [c_ang], 0.036, rmin=0.08, rmax=0.24, bvh=BVH_T)[0]
        chain_pts.append(c_pos)
        parts_t.append(blob(f'{gid_t}_chain_{k}', c_pos, (0.022, 0.012, 0.018), P('gold', 0.02, fabric='metal.gold'), n=8, rows=4))
    parts_t.append(horn(gid_t + '_chain_cord', chain_pts, 0.007, 0.007, P('gold', 0.02, fabric='metal.gold'), n=8, rows=12))

    # 6. Wide scarlet bell-sleeves with dark-green turned cuffs & brass buttons
    bell_sl_paint = P('repred', 0.04, [
        B('bottom', 0.0, 0.095, 'solid', 'deepgreen'),
        B('bottom', 0.095, 0.108, 'solid', 'gold'),
        B('bottom', 0.11, 0.22, 'cross', 'repblack', 'repred', 0.04),
    ])
    parts_t += sleeves(gid_t, 'wrist', 0.032, bell_sl_paint, ease_end=0.092, rows=10, n=22, rmax=0.20)

    entry_t = assemble_garment(gid_t, 'Magistrate Scarlet Greatcoat & Brass Pauldrons', 'torso', 'iron_republic', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 5: Abyssal Salt-Marsh People — "Miasma-Dredger / Alchemical Scavenger" (Ref Image 4)
# ===============================================================================================================
def build_abyssal_dredger():
    # --- HEADPIECE: Weathered bronze/reed kasa hat with hanging ward-tags + glowing green goggled respirator ---
    gid_h = 'abyssal_m_dredger_kasa'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Alchemical respirator head-wrap & mask (standing well clear of nose/lips)
    mask_paint = P('umber', 0.08, [B('bottom', 0.0, 0.03, 'solid', 'copper'), B('top', 0.0, 0.03, 'solid', 'bark')],
                   fabric='cloth.cotton.coarse')
    fs_m = np.linspace(-0.22, 0.86, 10)
    angs_m = np.linspace(0, 2 * math.pi, 32, endpoint=False)
    M_grid = []
    for f in fs_m:
        c = a + (b - a) * f
        M_grid.append([c + left * (math.sin(an) * 0.098) + bk * (math.cos(an) * 0.126 - 0.012) for an in angs_m])
    parts_h.append(Part(gid_h + '_mask', np.array(M_grid), True, ['body'] * len(fs_m), mask_paint, rigid_joint='Head'))

    # Protruding cylindrical snout-respirator at the mouth
    snout_c = a + (b - a) * 0.16 - bk * 0.135
    snout_paint = P('copper', 0.04, [B('top', 0.0, 0.08, 'vstripes', 'soot', 'copper', 0.015)], fabric='metal.bronze')
    parts_h.append(blob(gid_h + '_snout', snout_c, (0.072, 0.058, 0.072), snout_paint, n=14, rows=6, out=-bk, rigid_joint='Head'))

    # Two glowing green ocular goggle-lenses
    lens_paint = P('godteal', 0.01, [B('top', 0.0, 0.015, 'solid', 'mint')])
    for sd in (-1, 1):
        g_pos = a + (b - a) * 0.42 - bk * 0.125 + left * sd * 0.036
        parts_h.append(blob(f'{gid_h}_goggle_rim_{sd}', g_pos, (0.042, 0.030, 0.042), P('copper', 0.03), n=12, rows=5, out=-bk, rigid_joint='Head'))
        parts_h.append(blob(f'{gid_h}_goggle_lens_{sd}', g_pos - bk * 0.012, (0.030, 0.018, 0.030), lens_paint, n=10, rows=5, out=-bk, rigid_joint='Head'))

    # Corrugated turquoise breather-hoses curving from the snout/cheeks down into the collar
    hose_paint = P('godteal', 0.04, [B('top', 0.0, 0.3, 'stripes', 'teal', 'godteal', 0.02)])
    for sd in (-1, 1):
        h_path = [
            snout_c + left * sd * 0.030 - up * 0.01,
            a + (b - a) * 0.04 - bk * 0.115 + left * sd * 0.068,
            a - up * 0.05 - bk * 0.085 + left * sd * 0.088,
            a - up * 0.10 - bk * 0.050 + left * sd * 0.058,
        ]
        parts_h.append(horn(f'{gid_h}_hose_{sd}', h_path, 0.015, 0.014, hose_paint, n=10, rows=8, rigid_joint='Head'))

    # 2. Wide low-sloping weathered bronze-and-reed kasa hat sitting level over the brow
    kasa_paint = P('clay', 0.07, [
        B('bottom', 0.0, 0.02, 'solid', 'umber'),
        B('top', 0.0, 0.05, 'solid', 'ochre'),
        B('bottom', 0.02, 0.22, 'rays', 'umber', 'clay', 0.04),
    ], fabric='cloth.cotton.coarse')
    parts_h.append(brim(gid_h + '_kasa', 0.72, 0.22, kasa_paint, ease=0.016, rows=6, n=44, droop=0.048))
    parts_h.append(head_rings(gid_h + '_kasacrown', 0.68, 0.96, 0.020, P('ochre', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'umber')]), n=32, rows=5, apex=True))

    # 16 hanging rectangular talisman/ward tags around the underside of the kasa brim!
    tag_paint = P('peach', 0.05, [B('bottom', 0.0, 0.01, 'solid', 'umber'), B('top', 0.0, 0.008, 'solid', 'madder')])
    c_brim = a + (b - a) * 0.72
    for k in range(16):
        an = 2 * math.pi * k / 16.0
        if abs(an - math.pi) < 0.24:
            continue
        d_tag = bk * math.cos(an) + left * math.sin(an)
        tag_top = c_brim + d_tag * 0.25 - up * 0.028
        parts_h.append(flap(f'{gid_h}_tag_{k}', tag_top, 0.024, 0.050, d_tag, tag_paint, cols=3, rows=4, push=False, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Miasma-Dredger Ward-Kasa & Respirator', 'head', 'abyssal', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Tattered ash-taupe dust-robe, copper carapace yoke & gourd fetishes ---
    gid_t = 'abyssal_m_dredger_robe'
    parts_t = []

    # 1. Unified long tattered layered ash-taupe & maguey dust-robe (single continuous 360° tube so side panels never intersect!)
    robe_paint = P('ashrobe', 0.07, [
        B('bottom', 0.0, 0.045, 'teeth', 'soot', 'bark', 0.045),
        B('bottom', 0.045, 0.14, 'rays', 'bark', 'ashrobe', 0.06),
    ], [
        PN(0.0, 0.30, 'solid', 'maguey', 'ashrobe', 0.65),
        PN(0.70, 1.0, 'solid', 'maguey', 'ashrobe', 0.65),
        PN(0.32, 0.34, 'solid', 'bark', 'ashrobe', 1.0),
        PN(0.48, 0.50, 'solid', 'bark', 'ashrobe', 1.0),
        PN(0.66, 0.68, 'solid', 'bark', 'ashrobe', 1.0),
    ], fabric='cloth.cotton.coarse')
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.02, 0.020, robe_paint, n=48,
                              hang_from=WAIST - 0.02, hang_side=WAIST - 0.02, flare=0.10,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Dark-teal padded shoulder pleats & wrapped salvage sleeves
    sl_paint = P('copper', 0.06, [
        B('top', 0.0, 0.14, 'stripes', 'soot', 'teal', 0.025),
        B('bottom', 0.0, 0.16, 'stripes', 'soot', 'teal', 0.03),
    ], fabric='cloth.cotton.coarse')
    parts_t += sleeves(gid_t, 'wrist', 0.020, sl_paint, ease_end=0.026, rows=9)

    # 2. Heavy riveted copper/bronze carapace yoke over shoulders & upper chest with glowing green glyph
    yoke_paint = P('copper', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'soot'),
        B('top', 0.0, 0.02, 'solid', 'bronze'),
    ], [
        PN(0.44, 0.56, 'fret', 'godteal', 'copper', 0.08, down=0.18),
    ], fabric='metal.bronze')
    parts_t.append(torso_tube(gid_t + '_yoke', TOP + 0.02, CHEST - 0.07, 0.032, yoke_paint, n=44, rows=8,
                              ease_bottom=0.036, hull_from=TOP + 0.02))

    # Horizontal teal valve-manifold cylinder at throat & white pressure gauge on left chest (mounted flush on _yoke!)
    throat_c = _front(TOP - 0.02, 0.038)
    parts_t.append(horn(gid_t + '_manifold', [throat_c - np.array([0.065, 0, 0]), throat_c + np.array([0.065, 0, 0])],
                        0.020, 0.020, P('teal', 0.03, [B('top', 0.0, 0.02, 'solid', 'godteal')]), n=12, rows=6, rigid_joint='Spine2'))
    gauge_c = _front(CHEST + 0.02, 0.038, x=0.070)
    parts_t.append(blob(gid_t + '_gauge', gauge_c, (0.038, 0.018, 0.038), P('white', 0.02, [B('top', 0.0, 0.01, 'solid', 'soot')]),
                        n=10, rows=5, out=FRONT, rigid_joint='Spine2'))

    # 3. Cluster of hanging gourd-ampoules, bead fetishes, medicine pouch & ward-slips across the chest (flush with _yoke/_robe!)
    pouch_c = _front(CHEST - 0.02, 0.038, x=-0.068)
    parts_t.append(blob(gid_t + '_medpouch', pouch_c, (0.054, 0.034, 0.068), P('madder', 0.05), n=10, rows=6, out=FRONT, rigid_joint='Spine2'))

    gourd_paint = P('peach', 0.04, [B('top', 0.0, 0.01, 'solid', 'umber')])
    for row_i in range(4):
        z_g = (CHEST - 0.03) - row_i * 0.038
        for col_j in range(5):
            u_g = (col_j / 4.0 - 0.5) * 2.0
            gx = u_g * (0.068 - 0.006 * row_i) + 0.012
            gy_drop = -0.015 * (1.0 - u_g ** 2)
            g_pos = _front(z_g + gy_drop, 0.034 + 0.003 * (row_i % 2), x=gx)
            parts_t.append(blob(f'{gid_t}_gourd_{row_i}_{col_j}', g_pos, (0.026, 0.022, 0.030), gourd_paint,
                                n=8, rows=5, out=FRONT, rigid_joint='Spine1'))

    slip_paint = P('cream', 0.05, [B('bottom', 0.0, 0.01, 'solid', 'bark')])
    for k in range(5):
        sx = (k / 4.0 - 0.5) * 0.12 + 0.01
        s_top = _front(WAIST + 0.02, 0.034, x=sx)
        parts_t.append(flap(f'{gid_t}_slip_{k}', s_top, 0.022, 0.055, FRONT, slip_paint, cols=3, rows=4, push=False, rigid_joint='Spine'))

    entry_t = assemble_garment(gid_t, 'Miasma-Dredger Carapace & Tattered Dust-Robe', 'torso', 'abyssal', parts_t)

    # --- BACK: Equippable dorsal canister pack, bio-globes & articulated 3rd servo-arm (positioned well clear of R/L arms!) ---
    gid_b = 'abyssal_m_dredger_pack'
    parts_b = []
    tank_paint = P('slate', 0.04, [B('top', 0.0, 0.03, 'solid', 'copper'), B('bottom', 0.0, 0.03, 'solid', 'copper')], fabric='metal.iron')
    back_hi = spine_at(CHEST + 0.04)
    back_lo = spine_at(WAIST + 0.02)
    # Dorsal harness frame plate on upper back
    parts_b.append(blob(gid_b + '_frame', back_hi + np.array([0.0, 0.135, -0.04]), (0.20, 0.045, 0.22),
                        P('copper', 0.04, fabric='metal.bronze'), n=14, rows=6, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))
    # Primary & secondary dorsal tanks mounted behind the right-of-center back (x = -0.065 to -0.085, y = +0.165 behind back, well clear of RightArm at x = -0.19!)
    tank1_a = back_hi + np.array([-0.055, 0.165, 0.08])
    tank1_b = back_lo + np.array([-0.060, 0.165, 0.04])
    parts_b.append(horn(gid_b + '_tank1', [tank1_a, tank1_b], 0.050, 0.048, tank_paint, n=14, rows=8, rigid_joint='Spine2'))
    tank2_a = back_hi + np.array([0.035, 0.160, 0.04])
    tank2_b = back_lo + np.array([0.030, 0.158, 0.01])
    parts_b.append(horn(gid_b + '_tank2', [tank2_a, tank2_b], 0.044, 0.040, P('copper', 0.04, fabric='metal.bronze'), n=12, rows=6, rigid_joint='Spine2'))

    globe_paint = P('godteal', 0.02, [B('top', 0.0, 0.02, 'solid', 'mint')])
    for k, off_g in enumerate(((-0.065, 0.162, -0.02), (-0.095, 0.148, -0.05), (-0.025, 0.168, -0.05))):
        parts_b.append(blob(f'{gid_b}_bioglobe_{k}', back_lo + np.array(off_g), (0.046, 0.046, 0.046), globe_paint,
                            n=12, rows=6, rigid_joint='Spine2'))

    # Articulated mechanical third servo-arm rising from the left-upper dorsal frame and arching high above the left shoulder
    servo_paint = P('copper', 0.04, [B('top', 0.0, 0.02, 'solid', 'soot'), B('bottom', 0.0, 0.02, 'solid', 'iron')], fabric='metal.bronze')
    s_base = back_hi + np.array([0.085, 0.135, 0.05])
    s_elbow = s_base + np.array([0.065, 0.015, 0.17])
    s_wrist = s_elbow + np.array([0.045, -0.095, 0.06])
    parts_b.append(blob(gid_b + '_servo_turret', s_base, (0.068, 0.068, 0.058), P('copper', 0.04), n=12, rows=5, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_servo_boom', [s_base, s_elbow], 0.022, 0.018, servo_paint, n=10, rows=6, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_servo_elbow', s_elbow, (0.040, 0.040, 0.040), P('iron', 0.03), n=10, rows=5, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_servo_fore', [s_elbow, s_wrist], 0.019, 0.014, servo_paint, n=10, rows=6, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_servo_palm', s_wrist - np.array([0, 0, 0.02]), (0.036, 0.024, 0.040), P('copper', 0.04), n=10, rows=5, rigid_joint='Spine2'))
    for fi, fx in enumerate((-0.015, 0.0, 0.015)):
        f_start = s_wrist + np.array([fx, -0.005 * fi, -0.032])
        f_mid = f_start + np.array([fx * 0.4, -0.01, -0.042])
        f_tip = f_mid + np.array([-0.010, 0.008, -0.032])
        parts_b.append(horn(f'{gid_b}_servo_claw_{fi}', [f_start, f_mid, f_tip], 0.008, 0.004, P('copper', 0.04), n=8, rows=5, rigid_joint='Spine2'))

    entry_b = assemble_garment(gid_b, 'Miasma-Dredger Dorsal Canisters & Servo-Rig', 'back', 'abyssal', parts_b)
    return [entry_t, entry_h, entry_b]


# ===============================================================================================================
# OUTFIT 6: Painted Men — "Totem-Warden / Slat-Armour Warleader" (Ref Image 5)
# ===============================================================================================================
def build_painted_warden():
    # --- HEADPIECE: Cylindrical wooden slat neck-guard + carved totemic crest-helmet with bristle brush ---
    gid_h = 'painted_m_warden_helm'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. High cylindrical wooden slat neck-guard / face-collar from collarbones up to just below the eyes,
    # rimmed top and bottom with white shell/tooth dentil bands and painted with PNW formline ovoid eye-joints!
    collar_paint = P('bark', 0.08, [
        B('top', 0.0, 0.024, 'dentils', 'white', 'soot', 0.018),
        B('top', 0.024, 0.032, 'solid', 'ochre'),
        B('bottom', 0.0, 0.024, 'dentils', 'white', 'soot', 0.018),
        B('bottom', 0.024, 0.032, 'solid', 'ochre'),
    ], [
        PN(0.32, 0.48, 'formline_eye', 'ochre', 'bark', 0.22),
        PN(0.52, 0.68, 'formline_eye', 'ochre', 'bark', 0.22),
        PN(0.16, 0.30, 'formline_eye', 'madder', 'bark', 0.22),
        PN(0.70, 0.84, 'formline_eye', 'madder', 'bark', 0.22),
    ])
    # Shifted slightly forward (-bk * 0.022) with r_col = 0.132 so it clears the chin, lips, and nose completely!
    fs_col = np.linspace(-0.40, 0.34, 10)
    angs_col = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    Col_grid = []
    for f in fs_col:
        c = a + (b - a) * f - bk * 0.022
        r_col = 0.132 + 0.012 * max(0.0, (0.1 - f))
        Col_grid.append([c + (bk * math.cos(an) * 1.05 + left * math.sin(an) * 0.98) * r_col for an in angs_col])
    parts_h.append(Part(gid_h + '_neckguard', np.array(Col_grid), True, ['body'] * len(fs_col), collar_paint, rigid_joint='Head'))

    # Shadowed eye-slit band between the neck-guard and the helmet brim
    parts_h.append(head_rings(gid_h + '_eyeslit', 0.30, 0.52, 0.018, P('soot', 0.05), n=28, rows=4))

    # 2. Tall carved wooden totemic crest-helmet sitting above the eye-slit (f=0.44 up to f=1.40)
    helm_paint = P('bark', 0.06, [
        B('bottom', 0.0, 0.016, 'solid', 'soot'),
        B('bottom', 0.016, 0.028, 'solid', 'ochre'),
        B('top', 0.0, 0.03, 'dots', 'white', 'bark', 0.025),
    ], [
        PN(0.28, 0.72, 'formline_visage', 'ochre', 'bark', 0.22),
    ])

    def helm_profile(s):
        if s < 0.18:
            return 1.34 - 0.26 * (s / 0.18)
        elif s < 0.65:
            return 1.08 + 0.08 * math.sin(math.pi * (s - 0.18) / 0.47)
        else:
            u_top = (s - 0.65) / 0.35
            return 1.08 * (1.0 - 0.42 * (u_top ** 1.5))

    parts_h.append(tower_hat(gid_h + '_helm', 0.22, helm_profile, helm_paint, f=0.44, ease=0.022, rows=14, n=44))

    # 3D sculpted protruding carved snout/mouth & upper raptor beak on the front of the helmet + circular ear-bosses
    snout_pos = a + (b - a) * 0.64 - bk * 0.132
    snout_paint = P('ochre', 0.04, [B('top', 0.0, 0.08, 'dentils', 'white', 'soot', 0.014)])
    parts_h.append(blob(gid_h + '_snout', snout_pos, (0.11, 0.048, 0.068), snout_paint, n=14, rows=6, out=-bk, rigid_joint='Head'))

    beak_pos = a + (b - a) * 1.08 - bk * 0.122
    parts_h.append(horn(gid_h + '_beak', [beak_pos, beak_pos - bk * 0.048 - up * 0.025], 0.028, 0.006,
                        P('ochre', 0.04, [B('top', 0.0, 0.02, 'solid', 'soot')]), n=10, rows=6, rigid_joint='Head'))

    for sd in (-1, 1):
        ear_pos = a + (b - a) * 0.84 + left * sd * 0.118 - bk * 0.01
        parts_h.append(blob(f'{gid_h}_earboss_{sd}', ear_pos, (0.065, 0.022, 0.065),
                            P('ochre', 0.04, [B('top', 0.0, 0.02, 'solid', 'turq')]), n=12, rows=5, out=left * sd, rigid_joint='Head'))

    # 3. Thick brush of dark-and-red bristles crowning the helmet
    bristle_paint = P('darkfur', 0.10, [
        B('top', 0.0, 0.045, 'rays', 'holyred', 'madder', 0.012),
        B('bottom', 0.0, 0.02, 'solid', 'soot'),
    ])
    c_crown = a + (b - a) * 1.38
    B_grid = []
    for ri in range(6):
        sv = ri / 5.0
        b_row = []
        for cj in range(16):
            an = 2 * math.pi * cj / 16.0
            rad_b = (0.068 + 0.032 * sv) * (1.0 + 0.08 * math.cos(8 * an))
            b_row.append(c_crown + (left * math.sin(an) * 0.95 + bk * math.cos(an) * 1.05) * rad_b + up * (0.095 * sv))
        B_grid.append(b_row)
    parts_h.append(Part(gid_h + '_bristles', np.array(B_grid), True, ['body'] * 6, bristle_paint, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Totem-Warden Carved Crest-Helmet & Slat Collar', 'head', 'painted_men', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Bound wooden rod-and-slat cuirass over fringed formline buckskin tunic & diagonal hide baldric ---
    gid_t = 'painted_m_warden_cuirass'
    parts_t = []

    # 1. Fringed buckskin upper tunic & formline-painted sleeves
    tunic_paint = P('buck', 0.07, [
        B('bottom', 0.0, 0.045, 'rays', 'buck', 'earth', 0.016),
        B('top', 0.0, 0.025, 'solid', 'cream'),
    ])
    parts_t.append(torso_tube(gid_t + '_tunic', TOP, WAIST - 0.05, 0.015, tunic_paint, n=42, rows=10))

    sl_paint = P('buck', 0.06, [
        B('bottom', 0.0, 0.09, 'formline_eye', 'madder', 'turq', 0.09),
        B('bottom', 0.09, 0.11, 'dentils', 'bone', 'soot', 0.02),
        B('top', 0.04, 0.14, 'formline_eye', 'madder', 'buck', 0.10),
    ])
    parts_t += sleeves(gid_t, 'wrist', 0.020, sl_paint, ease_end=0.032, rows=9, n=20)

    ep_paint = P('buck', 0.07, [
        B('bottom', 0.0, 0.045, 'rays', 'cream', 'earth', 0.016),
        B('top', 0.0, 0.05, 'formline_eye', 'madder', 'buck', 0.08),
    ])
    parts_t.append(pauldron(gid_t + '_fringeL', L, ep_paint, reach=0.36, ease=0.036, flare_end=0.95))
    parts_t.append(pauldron(gid_t + '_fringeR', R, ep_paint, reach=0.36, ease=0.036, flare_end=0.95))

    # 2. Bound wooden rod-and-slat cuirass with single bold central formline totem eye motif, laced buckskin waist cinch & lower slat tassets
    cuirass_paint = P('ochre', 0.08, [
        B('bottom', 0.0, 0.08, 'slat_wood', 'bark', 'ochre', 0.09),
        B('bottom', 0.08, 0.145, 'cross', 'soot', 'buck', 0.055),
        B('top', 0.0, 0.018, 'solid', 'bark'),
    ], [
        PN(0.0, 0.36, 'slat_wood', 'bark', 'ochre', 0.09),
        PN(0.36, 0.64, 'formline_eye', 'madder', 'ochre', 0.28, down=0.20),
        PN(0.64, 1.0, 'slat_wood', 'bark', 'ochre', 0.09),
    ])
    parts_t.append(torso_tube(gid_t + '_cuirass', CHEST + 0.055, CROTCH + 0.03, 0.032, cuirass_paint, n=48, rows=14,
                              hull_from=CHEST + 0.06))

    # 3. Diagonal fringed pale-buckskin baldric from left shoulder to right chest/hip
    baldric_paint = P('cream', 0.06, [
        B('bottom', 0.0, 0.035, 'rays', 'cream', 'buck', 0.015),
        B('top', 0.0, 0.01, 'solid', 'ochre'),
    ])
    parts_t.append(band(gid_t + '_baldric', WAIST + 0.01, SHOULDER + 0.04, 0.075, 0.048, baldric_paint, high=math.pi / 2, rows=5))

    # 4. Carved bone-hilted dagger in fringed hide sheath mounted flush ON the wooden slat cuirass & baldric (below CHEST + 0.055!)
    sh_bot = _front(CHEST - 0.16, 0.028, x=-0.068)
    sh_top = _front(CHEST - 0.05, 0.028, x=-0.058)
    hl_mid = _front(CHEST - 0.01, 0.028, x=-0.054)
    hl_top = _front(CHEST + 0.03, 0.028, x=-0.050)
    parts_t.append(horn(gid_t + '_sheath', [sh_bot, sh_top],
                        0.015, 0.019, P('cream', 0.06, [B('top', 0.0, 0.04, 'rays', 'cream', 'buck', 0.012)]), n=10, rows=6, rigid_joint='Spine2'))
    parts_t.append(horn(gid_t + '_hilt', [sh_top, hl_mid, hl_top],
                        0.013, 0.006, P('bone', 0.03, [B('bottom', 0.0, 0.03, 'stripes', 'soot', 'bone', 0.01)]), n=10, rows=6, rigid_joint='Spine2'))

    entry_t = assemble_garment(gid_t, 'Totem-Warden Wooden Slat-Cuirass & Painted Tunic', 'torso', 'painted_men', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 7 (Batch 2 Image 1): Jimjam — "Ruby Zenana Sibyl / Coin-Veiled Seer"
# ===============================================================================================================
def build_jimjam_sibyl():
    # --- HEADPIECE: Domed crimson silk head-shroud veiled in overlapping antique silver coins, carnelian beads & bell-cones ---
    gid_h = 'jimjam_m_sibyl_veil'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Crimson silk inner cowl & head-shroud wrapping cranium and hanging straight down under gravity over face & neck!
    silk_cowl_paint = P('crimson', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'maroon'),
        B('top', 0.0, 0.03, 'solid', 'pomegranate'),
    ], fabric='cloth.silk')
    fs_cowl = np.linspace(-0.42, 1.18, 16)
    angs_cowl = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    Cowl_grid = []
    for f in fs_cowl:
        c = a + (b - a) * f
        dome_s = 1.0 if f <= 0.78 else max(0.04, math.cos(math.pi * 0.5 * min(1.0, (f - 0.78) / 0.40)) ** 0.75)
        drop = max(0.0, 0.60 - f)
        rx = (0.114 + 0.018 * drop) * dome_s
        ry_front = (0.150 + 0.016 * drop) * dome_s
        ry_back = (0.132 + 0.022 * drop) * dome_s
        row_pts = []
        for an in angs_cowl:
            ca, sa = math.cos(an), math.sin(an)
            ry = ry_front if ca < 0 else ry_back
            row_pts.append(c + left * (sa * rx) + bk * (ca * ry - 0.008 * dome_s))
        Cowl_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_cowl', np.array(Cowl_grid), True, ['body'] * len(fs_cowl), silk_cowl_paint, rigid_joint='Head'))

    # 2. Domed silver coin-and-carnelian-bead lattice veil hanging straight down from the smooth forehead/brow over the eyes!
    veil_paint = P('crimson', 0.04, [
        B('bottom', 0.0, 0.022, 'dentils', 'silver', 'iron', 0.018),
        B('top', 0.0, 0.025, 'beads', 'silver', 'iron', 0.022),
    ], [
        PN(0.0, 1.0, 'coin_veil', 'silver', 'crimson', 0.085),
    ], fabric='metal.iron')
    fs_veil = np.linspace(-0.14, 1.16, 16)
    angs_veil = np.linspace(0.32 * math.pi, 1.68 * math.pi, 32)  # front + temples (centered at pi = -Y front)
    Veil_grid = []
    for f in fs_veil:
        c = a + (b - a) * f
        dome_s = 1.0 if f <= 0.78 else max(0.04, math.cos(math.pi * 0.5 * min(1.0, (f - 0.78) / 0.38)) ** 0.75)
        drop = max(0.0, 0.60 - f)
        rx = (0.118 + 0.016 * drop) * dome_s
        ry = (0.155 + 0.016 * drop) * dome_s
        row_pts = []
        for an in angs_veil:
            ca, sa = math.cos(an), math.sin(an)
            row_pts.append(c + left * (sa * rx) + bk * (ca * ry - 0.008 * dome_s))
        Veil_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_coinmesh', np.array(Veil_grid), False, ['body'] * len(fs_veil), veil_paint, rigid_joint='Head'))

    # 3. Embossed silver crescent jaw-torc & 3D boss medallions + 9 dangling chain-and-cone bell pendants
    cres_pts = []
    for k in range(11):
        an = -0.58 * math.pi + 1.16 * math.pi * (k / 10.0)
        drop_c = -0.055 * math.cos(an * 0.85)
        f_c = -0.04 + drop_c
        rx_c = 0.122 + 0.016 * max(0.0, 0.60 - f_c)
        ry_c = 0.160 + 0.016 * max(0.0, 0.60 - f_c)
        cres_pts.append(a + (b - a) * f_c + left * (math.sin(an) * rx_c) - bk * (math.cos(an * 0.72) * ry_c + 0.008))
    parts_h.append(horn(gid_h + '_crescent', cres_pts, 0.011, 0.011,
                        P('silver', 0.03, [B('top', 0.0, 0.02, 'dentils', 'white', 'iron', 0.015)], fabric='metal.iron'),
                        n=10, rows=10, rigid_joint='Head'))

    # Central forehead & nose-bridge silver coin medallions sitting flush on the smooth hanging veil
    for f_med, r_med in ((0.58, 0.038), (0.26, 0.042), (-0.06, 0.034)):
        drop_m = max(0.0, 0.60 - f_med)
        m_pos = a + (b - a) * f_med - bk * (0.165 + 0.016 * drop_m)
        parts_h.append(blob(f'{gid_h}_medallion_{f_med:.2f}', m_pos, (r_med, 0.012, r_med),
                            P('silver', 0.03, [B('top', 0.0, 0.01, 'solid', 'iron')], fabric='metal.iron'),
                            n=12, rows=5, out=-bk, rigid_joint='Head'))

    # 9 dangling silver cone-bells hanging straight down from the jaw crescent & temples
    for k in range(9):
        an = -0.52 * math.pi + 1.04 * math.pi * (k / 8.0)
        f_c = -0.04 - 0.055 * math.cos(an * 0.85)
        rx_c = 0.115 + 0.018 * max(0.0, 0.60 - f_c)
        ry_c = 0.155 + 0.018 * max(0.0, 0.60 - f_c)
        top_p = a + (b - a) * f_c + left * (math.sin(an) * rx_c) - bk * (math.cos(an * 0.72) * ry_c + 0.008)
        len_d = 0.068 + 0.038 * math.cos(an)
        bot_p = top_p - up * len_d
        parts_h.append(horn(f'{gid_h}_pend_chain_{k}', [top_p, bot_p], 0.004, 0.003, P('silver', 0.03), n=6, rows=4, rigid_joint='Head'))
        parts_h.append(blob(f'{gid_h}_pend_cone_{k}', bot_p, (0.020, 0.020, 0.026),
                            P('silver', 0.03, [B('bottom', 0.0, 0.008, 'solid', 'iron')], fabric='metal.iron'),
                            n=8, rows=5, out=-bk, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Ruby Zenana Coin-Mail & Carnelian Veil', 'head', 'jimjam', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Voluminous crimson silk cross-draped robe with diagonal swags & stacked silver forearm cuffs ---
    gid_t = 'jimjam_m_sibyl_drape'
    parts_t = []

    # 1. Floor-length crimson silk robe with pleated vertical fold shading
    robe_paint = P('crimson', 0.03, [
        B('bottom', 0.0, 0.06, 'solid', 'maroon'),
        B('top', 0.0, 0.04, 'solid', 'pomegranate'),
    ], [
        PN(0.0, 1.0, 'fluted', 'pomegranate', 'crimson', 0.14),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', TOP + 0.01, ANKLE + 0.02, 0.018, robe_paint,
                              n=48, hang_from=WAIST - 0.02, flare=0.10, group_below=CROTCH + 0.02,
                              hull_from=CHEST, over_arms=False))

    # Draped shawl mantle over the shoulders & upper chest
    shawl_paint = P('crimson', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'maroon'),
    ], [PN(0.0, 1.0, 'fluted', 'pomegranate', 'crimson', 0.10)], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_shawl', TOP + 0.015, WAIST + 0.04, 0.028, shawl_paint,
                              n=44, rows=10, hang_from=None, flare=0.02, over_arms=False))
    parts_t.append(pauldron(gid_t + '_shawl_L', L, shawl_paint, reach=0.45, ease=0.034, flare_end=1.10))
    parts_t.append(pauldron(gid_t + '_shawl_R', R, shawl_paint, reach=0.45, ease=0.034, flare_end=1.10))

    # 2. Three sculpted diagonal silk cross-draped swags over the chest, shoulders, and waist (hugging the robe smoothly!)
    swag1_paint = P('pomegranate', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'maroon'),
        B('bottom', 0.0, 0.025, 'solid', 'maroon'),
    ], [PN(0.0, 1.0, 'fluted', 'crimson', 'pomegranate', 0.07)], fabric='cloth.silk')
    parts_t.append(band(gid_t + '_swag1', WAIST + 0.01, SHOULDER + 0.03, 0.16, 0.036, swag1_paint, high=math.pi * 0.45, rows=6))
    parts_t.append(band(gid_t + '_swag2', WAIST - 0.04, SHOULDER + 0.02, 0.18, 0.038, swag1_paint, high=-math.pi * 0.45, rows=6))
    parts_t.append(band(gid_t + '_swag3', CROTCH + 0.05, WAIST + 0.06, 0.16, 0.040, swag1_paint, high=math.pi * 0.55, rows=6))

    # 3. Full crimson silk sleeves + 3 stacked wide embossed silver cuffs & dangling coin charms on each forearm
    sl_paint = P('crimson', 0.03, [
        B('bottom', 0.0, 0.18, 'dentils', 'silver', 'iron', 0.022),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.016, sl_paint, ease_end=0.018, rows=9, n=20)

    cuff_paint = P('silver', 0.03, [
        B('top', 0.0, 0.01, 'solid', 'iron'),
        B('bottom', 0.0, 0.01, 'solid', 'iron'),
        B('top', 0.01, 0.035, 'dentils', 'white', 'iron', 0.016),
    ], fabric='metal.iron')
    for s in (L, R):
        e_jt, h_jt = J(s + 'ForeArm'), J(s + 'Hand')
        for k_c, (f0, f1) in enumerate(((0.32, 0.48), (0.52, 0.68), (0.72, 0.88))):
            ca = e_jt + (h_jt - e_jt) * f0
            cb = e_jt + (h_jt - e_jt) * f1
            parts_t.append(limb_tube(f'{gid_t}_cuff_{s[0]}_{k_c}', ca, cb, 0.024, cuff_paint, n=18, rows=3, bvh=BVH_A, rmax=0.12))

    entry_t = assemble_garment(gid_t, 'Ruby Zenana Silk Drape & Silver Coin-Bangles', 'torso', 'jimjam', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 8 (Batch 2 Image 2 Center): Hykkousoi — "Pelagic Hierophant / Deep-Tide Archpriest"
# ===============================================================================================================
def build_hykk_hierophant():
    # --- HEADPIECE: Tall cylindrical mosaic polos crown, cobalt-blue ritual mask, fluted black beard & star lappets ---
    gid_h = 'hykk_m_hierophant_polos'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Cobalt-blue sculpted ritual mask face (smooth elliptical cylinder clearing nose/brow!)
    mask_paint = P('mongolblue', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'soot'),
        B('bottom', 0.0, 0.02, 'solid', 'indigo'),
    ])
    fs_m = np.linspace(-0.08, 0.62, 10)
    angs_m = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    M_grid = []
    for f in fs_m:
        c = a + (b - a) * f
        M_grid.append([c + left * (math.sin(an) * 0.105) + bk * (math.cos(an) * 0.136 - 0.018) for an in angs_m])
    parts_h.append(Part(gid_h + '_mask', np.array(M_grid), True, ['body'] * len(fs_m), mask_paint, rigid_joint='Head'))

    # Sculpted blue nose ridge & recessed dark eye sockets on front of mask
    nose_a = a + (b - a) * 0.48 - bk * 0.142
    nose_b = a + (b - a) * 0.16 - bk * 0.158
    parts_h.append(horn(gid_h + '_nose', [nose_a, nose_b], 0.014, 0.024, P('mongolblue', 0.03), n=8, rows=4, rigid_joint='Head'))
    for sd in (-1, 1):
        eye_c = a + (b - a) * 0.42 + left * sd * 0.038 - bk * 0.138
        parts_h.append(blob(f'{gid_h}_eye_{sd}', eye_c, (0.036, 0.014, 0.018), P('soot', 0.02), n=10, rows=4, out=-bk, rigid_joint='Head'))

    # 2. Towering cylindrical mosaic polos crown (height = 0.28m above f = 0.56)
    polos_paint = P('cream', 0.05, [
        B('top', 0.0, 0.018, 'solid', 'soot'),
        B('top', 0.018, 0.115, 'diamonds', 'soot', 'yuniyellow', 0.055),
        B('top', 0.115, 0.128, 'solid', 'soot'),
        B('bottom', 0.0, 0.16, 'polos_mosaic', 'soot', 'cream', 0.065),
    ])
    parts_h.append(tower_hat(gid_h + '_polos', 0.28, lambda s: 1.04 + 0.06 * s, polos_paint, f=0.56, ease=0.024, rows=14, n=40))

    # 3. Long rectangular vertically-fluted black ceremonial spade-beard hanging from beneath the nose to upper chest
    beard_paint = P('soot', 0.04, [], [PN(0.0, 1.0, 'fluted_beard', 'slate', 'soot', 0.18)])
    beard_top = a + (b - a) * 0.14 - bk * 0.150
    parts_h.append(flap(gid_h + '_beard', beard_top, 0.165, 0.195, -bk, beard_paint,
                        cols=9, rows=8, sway=0.015, push=False, rigid_joint='Head'))

    # 4. Saffron-yellow and mottled-mosaic ceremonial head-veil lappets framing the sides of the mask
    lappet_paint = P('yuniyellow', 0.05, [
        B('top', 0.0, 0.03, 'polos_mosaic', 'soot', 'cream', 0.05),
    ])
    for sd, tag in ((-1, 'R'), (1, 'L')):
        l_top = a + (b - a) * 0.54 + left * sd * 0.112 - bk * 0.042
        l_out = (left * sd * 0.75 - bk * 0.65)
        parts_h.append(flap(f'{gid_h}_lappet_{tag}', l_top, 0.075, 0.24, l_out, lappet_paint,
                            cols=5, rows=8, sway=0.025, push=False, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Izani Hierophant Mosaic Polos, Blue Mask & Fluted Beard', 'head', 'izani', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Monumental A-line pelagic vestment with sacred red fish totem, star-spangled saffron stoles & mosaic mantle ---
    gid_t = 'hykk_m_hierophant_robe'
    parts_t = []

    robe_paint = P('mongolblue', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'indigo'),
    ], [
        # Back panels
        PN(0.0, 0.14, 'star_stole', 'indigo', 'yuniyellow', 0.28),
        PN(0.86, 1.0, 'star_stole', 'indigo', 'yuniyellow', 0.28),
        # Outer mosaic shoulder-to-hem borders
        PN(0.27, 0.34, 'polos_mosaic', 'soot', 'cream', 0.14),
        PN(0.66, 0.73, 'polos_mosaic', 'soot', 'cream', 0.14),
        # Flanking saffron-yellow star-spangled stoles
        PN(0.34, 0.42, 'star_stole', 'indigo', 'yuniyellow', 0.26),
        PN(0.58, 0.66, 'star_stole', 'indigo', 'yuniyellow', 0.26),
        # Center cobalt-blue liturgical stole with sun-ray top, dotted indigo ladder & totemic registers!
        PN(0.42, 0.58, 'pelagic_stole', 'holyred', 'mongolblue', 1.35),
    ])
    parts_t.append(collar_disc(gid_t + '_yoke', 0.11, P('mongolblue', 0.05, [B('bottom', 0.0, 0.03, 'polos_mosaic', 'soot', 'cream', 0.06)]),
                               drop=0.042, rows=5, n=40, scallop=0.0, ease=0.012, z_off=0.004, rigid_joint='Spine2'))
    parts_t.append(torso_tube(gid_t + '_robe', TOP + 0.015, ANKLE + 0.01, 0.018, robe_paint,
                              n=56, hang_from=WAIST - 0.02, flare=0.10, group_below=CROTCH + 0.02,
                              hull_from=CHEST + 0.04, over_arms=False))
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, P('mongolblue', 0.05, [B('bottom', 0.0, 0.04, 'polos_mosaic', 'soot', 'cream', 0.06)]),
                            reach=0.45, ease=0.028, flare_end=1.05))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, P('mongolblue', 0.05, [B('bottom', 0.0, 0.04, 'polos_mosaic', 'soot', 'cream', 0.06)]),
                            reach=0.45, ease=0.028, flare_end=1.05))

    # 2. Raised 3D sculpted scarlet-and-indigo fish totem plaque on the solar plexus!
    fish_c = _front(CHEST - 0.03, 0.042)
    fish_paint = P('holyred', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'holyred'),
        B('bottom', 0.0, 0.022, 'solid', 'holyred'),
    ], [
        PN(0.28, 0.72, 'solid', 'indigo', 'holyred', 0.20),
    ])
    parts_t.append(blob(gid_t + '_fish_body', fish_c + np.array([0.015, 0.0, 0.0]), (0.21, 0.028, 0.092),
                        fish_paint, n=16, rows=6, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(flap(gid_t + '_fish_tail', fish_c + np.array([-0.098, -0.005, 0.038]), 0.058, 0.075,
                        np.array([-0.35, -0.94, 0.0]), P('holyred', 0.03), cols=4, rows=4, push=False, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_fish_eye', fish_c + np.array([0.075, -0.014, 0.006]), (0.026, 0.014, 0.026),
                        P('white', 0.02, [B('top', 0.0, 0.008, 'solid', 'soot')]), n=10, rows=4, out=FRONT, rigid_joint='Spine2'))

    parts_t += sleeves(gid_t, 'wrist', 0.018, P('mongolblue', 0.05, [B('bottom', 0.0, 0.06, 'polos_mosaic', 'soot', 'cream', 0.06)]),
                       ease_end=0.028, rows=8, n=18)

    entry_t = assemble_garment(gid_t, 'Izani Hierophant Star-Stole & Sacred Fish Vestment', 'torso', 'izani', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 9 (Batch 2 Image 2 Left/Right): Izani — "Heliarch Cantor / Solar Net-Celebrant"
# ===============================================================================================================
def build_hykk_heliarch():
    # --- HEADPIECE: 14-ray golden sunburst crown, turquoise brow tablet, vermilion mask & fluted red beard ---
    gid_h = 'hykk_m_heliarch_halo'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Vermilion-red sculpted ritual mask face (smooth elliptical cylinder clearing nose/brow!)
    mask_paint = P('holyred', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'soot'),
        B('bottom', 0.0, 0.02, 'solid', 'madder'),
    ])
    fs_m = np.linspace(-0.08, 0.60, 10)
    angs_m = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    M_grid = []
    for f in fs_m:
        c = a + (b - a) * f
        M_grid.append([c + left * (math.sin(an) * 0.105) + bk * (math.cos(an) * 0.136 - 0.018) for an in angs_m])
    parts_h.append(Part(gid_h + '_mask', np.array(M_grid), True, ['body'] * len(fs_m), mask_paint, rigid_joint='Head'))

    nose_a = a + (b - a) * 0.46 - bk * 0.142
    nose_b = a + (b - a) * 0.16 - bk * 0.158
    parts_h.append(horn(gid_h + '_nose', [nose_a, nose_b], 0.014, 0.024, P('holyred', 0.03), n=8, rows=4, rigid_joint='Head'))
    for sd in (-1, 1):
        eye_c = a + (b - a) * 0.42 + left * sd * 0.038 - bk * 0.138
        parts_h.append(blob(f'{gid_h}_eye_{sd}', eye_c, (0.036, 0.014, 0.018), P('soot', 0.02), n=10, rows=4, out=-bk, rigid_joint='Head'))

    # 2. Golden-yellow domed headband cap with turquoise-and-black geometric brow plaque
    cap_paint = P('yuniyellow', 0.04, [
        B('top', 0.0, 0.016, 'solid', 'saffron'),
    ], [
        PN(0.36, 0.64, 'diamonds', 'soot', 'turq', 0.055, down=0.085),
    ])
    parts_h.append(tower_hat(gid_h + '_cap', 0.13, lambda s: 1.04 - 0.18 * (s ** 2), cap_paint, f=0.52, ease=0.026, rows=8, n=36))

    # 3. Halo of 14 long tapered golden sun-rays radiating in a wide coronal fan!
    ray_paint = P('yuniyellow', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'saffron')])
    c_halo = a + (b - a) * 0.78 - bk * 0.015
    for k in range(14):
        ang = (-118.0 + 236.0 * (k / 13.0)) * math.pi / 180.0
        dir_r = left * math.sin(ang) + up * math.cos(ang) - bk * 0.05
        dir_r /= np.linalg.norm(dir_r)
        r_start = c_halo + dir_r * 0.095
        r_end = c_halo + dir_r * 0.305
        parts_h.append(horn(f'{gid_h}_ray_{k}', [r_start, r_end], 0.020, 0.004, ray_paint, n=8, rows=5, rigid_joint='Head'))

    # 4. Long rectangular vertically-fluted vermilion-red ceremonial beard + crimson side lappets
    beard_paint = P('holyred', 0.04, [], [PN(0.0, 1.0, 'fluted_beard', 'holyred', 'madder', 0.18)])
    beard_top = a + (b - a) * 0.14 - bk * 0.150
    parts_h.append(flap(gid_h + '_beard', beard_top, 0.155, 0.185, -bk, beard_paint,
                        cols=9, rows=8, sway=0.015, push=False, rigid_joint='Head'))

    for sd, tag in ((-1, 'R'), (1, 'L')):
        l_top = a + (b - a) * 0.50 + left * sd * 0.110 - bk * 0.038
        l_out = (left * sd * 0.75 - bk * 0.65)
        parts_h.append(flap(f'{gid_h}_lappet_{tag}', l_top, 0.068, 0.22, l_out, P('holyred', 0.04),
                            cols=4, rows=7, sway=0.02, push=False, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Izani Heliarch 14-Ray Sunburst Halo, Red Mask & Fluted Beard', 'head', 'izani', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Reticulated black-on-red fishing-net ceremonial cloak over pelagic sun-and-fish stole ---
    gid_t = 'hykk_m_heliarch_mantle'
    parts_t = []

    mantle_paint = P('holyred', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'madder'),
    ], [
        # Black-on-vermilion reticulated diamond fishing-net outer cloak
        PN(0.0, 0.38, 'net_mesh', 'soot', 'holyred', 0.12),
        PN(0.62, 1.0, 'net_mesh', 'soot', 'holyred', 0.12),
        # Saffron inner border stoles
        PN(0.38, 0.43, 'solid', 'yuniyellow', 'yuniyellow', 0.20),
        PN(0.57, 0.62, 'solid', 'yuniyellow', 'yuniyellow', 0.20),
        # Central liturgical stole with sun-rays and totemic registers
        PN(0.43, 0.57, 'pelagic_stole', 'holyred', 'indigo', 1.35),
    ])
    parts_t.append(collar_disc(gid_t + '_yoke', 0.11, P('holyred', 0.05, [B('bottom', 0.0, 0.04, 'net_mesh', 'soot', 'holyred', 0.08)]),
                               drop=0.042, rows=5, n=40, scallop=0.0, ease=0.012, z_off=0.004, rigid_joint='Spine2'))
    parts_t.append(torso_tube(gid_t + '_mantle', TOP + 0.015, ANKLE + 0.01, 0.018, mantle_paint,
                              n=52, hang_from=WAIST - 0.02, flare=0.10, group_below=CROTCH + 0.02,
                              hull_from=CHEST + 0.04, over_arms=False))
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, P('holyred', 0.05, [B('bottom', 0.0, 0.08, 'net_mesh', 'soot', 'holyred', 0.08)]),
                            reach=0.45, ease=0.028, flare_end=1.05))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, P('holyred', 0.05, [B('bottom', 0.0, 0.08, 'net_mesh', 'soot', 'holyred', 0.08)]),
                            reach=0.45, ease=0.028, flare_end=1.05))

    # 3D sculpted green-and-gold sacred fish plaque on the chest (with tail fin & white-and-black eye)
    fish_c = _front(CHEST - 0.03, 0.042)
    parts_t.append(blob(gid_t + '_fish', fish_c + np.array([0.012, 0.0, 0.0]), (0.19, 0.028, 0.082),
                        P('jungle', 0.03, [B('top', 0.0, 0.018, 'solid', 'yuniyellow')]),
                        n=14, rows=5, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(flap(gid_t + '_fish_tail', fish_c + np.array([-0.088, -0.005, 0.034]), 0.052, 0.068,
                        np.array([-0.35, -0.94, 0.0]), P('jungle', 0.03), cols=4, rows=4, push=False, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_fish_eye', fish_c + np.array([0.068, -0.014, 0.005]), (0.024, 0.014, 0.024),
                        P('white', 0.02, [B('top', 0.0, 0.008, 'solid', 'soot')]), n=10, rows=4, out=FRONT, rigid_joint='Spine2'))

    parts_t += sleeves(gid_t, 'wrist', 0.018, P('holyred', 0.05, [B('bottom', 0.0, 0.12, 'net_mesh', 'soot', 'holyred', 0.08)]),
                       ease_end=0.026, rows=8, n=18)

    entry_t = assemble_garment(gid_t, 'Izani Heliarch Reticulated Net-Mantle & Solar Stole', 'torso', 'izani', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 10 (Batch 2 Image 3): The Order of Historians — "Grand Cartographer / Relic-Surveyor"
# ===============================================================================================================
def build_order_cartographer():
    # --- HEADPIECE: Flat-topped cylindrical labyrinth-embroidered kufi cap & round crimson-ruby spectacles ---
    gid_h = 'order_m_cartographer_cap'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Flat-topped cylindrical pillbox/kufi cap with raised madder-and-cream labyrinth embroidery
    cap_paint = P('cream', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'madder'),
        B('bottom', 0.0, 0.012, 'solid', 'madder'),
    ], [
        PN(0.0, 1.0, 'labyrinth_panel', 'cream', 'rust', 0.095),
    ])
    parts_h.append(tower_hat(gid_h + '_kufi', 0.105, lambda s: 1.0 + 0.055 * s, cap_paint, f=0.58, ease=0.014, rows=8, n=40))

    # 2. Round crimson-ruby spectacles with bronze rims & nose-bridge perched clearly in front of the eyes!
    lens_paint = P('holyred', 0.01, [B('top', 0.0, 0.010, 'solid', 'soot')], fabric='metal.bronze')
    eye_f = 0.36
    h_eye = first_hit(a + (b - a) * eye_f, -bk) or 0.112
    for sd in (-1, 1):
        l_pos = a + (b - a) * eye_f + left * sd * 0.035 - bk * (h_eye + 0.020)
        parts_h.append(blob(f'{gid_h}_lens_{sd}', l_pos, (0.040, 0.012, 0.038), lens_paint, n=14, rows=5, out=-bk, rigid_joint='Head'))
        ear_p = a + (b - a) * (eye_f + 0.02) + left * sd * 0.084 - bk * 0.015
        parts_h.append(horn(f'{gid_h}_temple_{sd}', [l_pos + left * sd * 0.019, ear_p], 0.003, 0.0025, P('soot', 0.02), n=6, rows=4, rigid_joint='Head'))

    br_l = a + (b - a) * (eye_f + 0.005) - left * 0.018 - bk * (h_eye + 0.022)
    br_r = a + (b - a) * (eye_f + 0.005) + left * 0.018 - bk * (h_eye + 0.022)
    parts_h.append(horn(gid_h + '_bridge', [br_l, br_r], 0.0035, 0.0035, P('soot', 0.02), n=6, rows=3, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Cartographer Labyrinth Kufi & Ruby Spectacles', 'head', 'historians', parts_h,
                               covers_hair=False, covers_face=False)

    # --- TORSO: Slate-blue wool greatcoat with stiff standing collar, labyrinth tapestry panels & leather codex pack ---
    gid_t = 'order_m_cartographer_coat'
    parts_t = []

    # 1. Tailored calf-length dark slate-blue wool greatcoat with center-front embroidered waistcoat panel & labyrinth tapestry lapels
    coat_paint = P('slate', 0.06, [
        B('bottom', 0.0, 0.24, 'labyrinth_panel', 'cream', 'madder', 0.22),
        B('bottom', 0.24, 0.26, 'solid', 'cream'),
        B('top', 0.0, 0.08, 'labyrinth_panel', 'cream', 'madder', 0.14),
    ], [
        # Center-front madder-and-cream waistcoat panel framed by madder lapel borders + wide labyrinth-panelled front lapels/skirts!
        PN(0.46, 0.54, 'labyrinth_panel', 'cream', 'madder', 0.16, down=0.58),
        PN(0.32, 0.45, 'labyrinth_panel', 'cream', 'slate', 0.26),
        PN(0.55, 0.68, 'labyrinth_panel', 'cream', 'slate', 0.26),
        PN(0.45, 0.47, 'solid', 'madder', 'cream', 0.10),
        PN(0.53, 0.55, 'solid', 'madder', 'cream', 0.10),
        # Back tapestry spine column
        PN(0.0, 0.08, 'labyrinth_panel', 'cream', 'madder', 0.24),
        PN(0.92, 1.0, 'labyrinth_panel', 'cream', 'madder', 0.24),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_coat', TOP + 0.01, KNEE - 0.14, 0.022, coat_paint,
                              n=52, hang_from=WAIST - 0.02, flare=0.10, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # 3. High stiff standing embroidered collar with front opening
    col_paint = P('madder', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'cream'),
        B('bottom', 0.0, 0.012, 'solid', 'cream'),
        B('top', 0.012, 0.055, 'fret', 'cream', 'madder', 0.045),
    ])
    zs_col = np.linspace(TOP + 0.055, TOP - 0.008, 5)
    angs_col = np.linspace(-0.84 * math.pi, 0.84 * math.pi, 32)
    Col_pts = np.array([ring_points(spine_at(z), np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), angs_col,
                                    0.018 + 0.008 * (1 - k / 4.0), rmin=0.05) for k, z in enumerate(zs_col)])
    parts_t.append(Part(gid_t + '_collar', Col_pts, False, ['body'] * 5, col_paint))

    # 4. Slate-blue wool sleeves with ornate multi-banded madder/cream cuffs & upper-arm embroidered medallions
    sl_paint = P('slate', 0.06, [
        B('bottom', 0.0, 0.14, 'labyrinth_panel', 'cream', 'madder', 0.10),
        B('bottom', 0.14, 0.16, 'solid', 'cream'),
        B('top', 0.08, 0.20, 'labyrinth_panel', 'cream', 'madder', 0.12),
    ], fabric='cloth.wool')
    parts_t += sleeves(gid_t, 'wrist', 0.020, sl_paint, ease_end=0.026, rows=10, n=20)

    yoke_paint = P('madder', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'cream'), B('top', 0.0, 0.08, 'fret', 'cream', 'madder', 0.05)])
    parts_t.append(collar_disc(gid_t + '_shoulder_yoke', 0.11, yoke_paint, drop=0.042, rows=5, n=40, scallop=0.0, ease=0.026, z_off=0.002))
    parts_t.append(pauldron(gid_t + '_yokeL', L, yoke_paint, reach=0.34, ease=0.032, flare_end=0.9))
    parts_t.append(pauldron(gid_t + '_yokeR', R, yoke_paint, reach=0.34, ease=0.032, flare_end=0.9))

    entry_t = assemble_garment(gid_t, 'Cartographer Labyrinth Greatcoat & Waistcoat', 'torso', 'historians', parts_t)

    # --- BACK: Equippable structured saddle-leather field pack / codex rucksack ---
    gid_b = 'order_m_cartographer_pack'
    parts_b = []
    pack_paint = P('clay', 0.05, [
        B('top', 0.0, 0.04, 'solid', 'leather'),
        B('bottom', 0.0, 0.03, 'solid', 'leather'),
    ], [
        PN(0.18, 0.24, 'solid', 'leather', 'clay', 0.10),
        PN(0.76, 0.82, 'solid', 'leather', 'clay', 0.10),
    ], fabric='leather.polished')
    back_c = spine_at(CHEST - 0.03) + np.array([0.0, 0.165, 0.0])
    parts_b.append(blob(gid_b + '_backpack', back_c, (0.24, 0.13, 0.30), pack_paint,
                        n=16, rows=7, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_pack_top', back_c + np.array([0.0, 0.0, 0.13]), (0.22, 0.12, 0.08),
                        P('leather', 0.05), n=12, rows=5, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))
    for sd in (-1, 1):
        parts_b.append(blob(f'{gid_b}_pack_pocket_{sd}', back_c + np.array([sd * 0.115, -0.01, -0.03]), (0.06, 0.09, 0.16),
                            P('clay', 0.05, [B('top', 0.0, 0.02, 'solid', 'brass')]), n=10, rows=5,
                            out=np.array([sd * 1.0, 0, 0]), rigid_joint='Spine2'))
        # Leather shoulder straps arching over the clavicles
        st_a = back_c + np.array([sd * 0.075, -0.04, 0.12])
        st_b = spine_at(TOP + 0.005) + np.array([sd * 0.095, -0.01, 0.02])
        st_c = _front(CHEST + 0.02, 0.038, x=sd * 0.095)
        parts_b.append(horn(f'{gid_b}_strap_{sd}', [st_a, st_b, st_c], 0.014, 0.012,
                            P('leather', 0.05, fabric='leather.polished'), n=8, rows=6, rigid_joint='Spine2'))

    entry_b = assemble_garment(gid_b, 'Cartographer Leather Codex Rucksack', 'back', 'historians', parts_b)

    # --- FEET: Ornate madder-and-cream labyrinth embroidered high boots with brass side-zipper trim ---
    gid_f = 'order_m_cartographer_boots'
    parts_f = []
    boot_sole_paint = P('madder', 0.05, [B('top', 0.0, 0.01, 'solid', 'cream')], fabric='leather.polished')
    boot_upper_paint = P('madder', 0.05, [
        B('top', 0.0, 0.04, 'solid', 'holyred'),
        B('bottom', 0.0, 0.03, 'solid', 'leather'),
    ], [
        PN(0.0, 1.0, 'labyrinth_panel', 'cream', 'madder', 0.12),
        PN(0.22, 0.26, 'solid', 'brass', 'madder', 0.10),
        PN(0.74, 0.78, 'solid', 'brass', 'madder', 0.10),
    ], fabric='leather.polished')

    for s in (L, R):
        foot, toe, tip, knee = J(s + 'Foot'), J(s + 'ToeBase'), J(s + 'ToeBase', 'tail'), J(s + 'Leg')
        heel = np.array([foot[0], foot[1] + 0.05, 0.0])
        front = np.array([tip[0], tip[1] - 0.015, 0.0])
        axis = front - heel
        Q_sole = []
        for k in range(10):
            c = heel + axis * k / 9.0
            c[2] = 0.010
            w_s = 0.052 + 0.012 * math.sin(math.pi * min(1.0, k / 9.0 * 1.2))
            Q_sole.append([c + np.array([math.cos(an) * w_s, 0, math.sin(an) * 0.010]) for an in np.linspace(0, 2 * math.pi, 16, endpoint=False)])
        parts_f.append(Part(f'{gid_f}_sole_{s[0]}', np.array(Q_sole), True, ['body'] * 10, boot_sole_paint))

        up_pt = foot + (knee - foot) * 0.68
        parts_f.append(limb_tube(f'{gid_f}_shaft_{s[0]}', up_pt, np.array([foot[0], foot[1], 0.03]), 0.028,
                                 boot_upper_paint, n=18, rows=9, ease_end=0.014, rmax=0.14))
        hb = first_hit(np.array([foot[0], foot[1], 0.035]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05
        fa = np.array([foot[0], foot[1] + hb - 0.008, 0.04])
        fb = np.array([tip[0], tip[1] - 0.016, 0.026])
        u_foot = limb_tube(f'{gid_f}_foot_{s[0]}', fa, fb, 0.014, boot_upper_paint, n=18, rows=12, ease_end=0.016, rmax=0.09)
        for k in (0, -1):
            c = u_foot.P[k].mean(0)
            u_foot.P[k] = c + (u_foot.P[k] - c) * 0.3
        parts_f.append(u_foot)

    entry_f = assemble_garment(gid_f, 'Cartographer Embroidered Labyrinth High Boots', 'feet', 'historians', parts_f)
    return [entry_t, entry_h, entry_f, entry_b]


# ===============================================================================================================
# OUTFIT 11 (Batch 2 Image 4): Ring Sea Islanders — "Kiln-Mask Bell-Shaman / Ash-Spirit Caller"
# ===============================================================================================================
def build_island_shaman():
    # --- HEADPIECE: Tall conical terracotta kiln-mask with white arch-eyes, black mouth aperture & lateral clay pegs ---
    gid_h = 'island_m_shaman_mask'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Tall beehive/conical terracotta helmet (from neck f=-0.18 up to 0.39m above f=0.0, pushed forward by -bk * 0.028)
    mask_paint = P('umber', 0.08, [
        B('top', 0.0, 0.02, 'solid', 'terracotta'),
        B('bottom', 0.0, 0.025, 'solid', 'soot'),
    ], [
        PN(0.24, 0.76, 'kiln_mask', 'white', 'umber', 0.38),
    ])

    def kiln_profile(s):
        if s < 0.25:
            return 1.08 + 0.04 * (s / 0.25)
        else:
            u_s = (s - 0.25) / 0.75
            return 1.12 * (1.0 - 0.56 * (u_s ** 1.35))

    c_base = a - up * 0.03 - bk * 0.028
    h_tot = 0.39
    angs_k = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    base_k = []
    for an in angs_k:
        d = bk * math.cos(an) + left * math.sin(an)
        r_ell = math.hypot(math.cos(an) * 0.132, math.sin(an) * 0.112)
        base_k.append((d, r_ell))
    Q_kiln = []
    for k in range(15):
        sk = k / 14.0
        Q_kiln.append([c_base + up * h_tot * sk + d * r * kiln_profile(sk) for d, r in base_k])
    top_k = c_base + up * h_tot
    Q_kiln.append([top_k + (q - top_k) * 0.22 for q in Q_kiln[-1]])
    parts_h.append(Part(gid_h + '_cone', np.array(Q_kiln), True, ['body'] * 16, mask_paint, rigid_joint='Head'))

    # 2. 14 horizontal protruding clay pegs along the left and right profiles (7 tiers per side)
    peg_paint = P('terracotta', 0.06, [B('bottom', 0.0, 0.012, 'solid', 'bone')])
    for tier in range(7):
        sk = 0.14 + 0.74 * (tier / 6.0)
        z_p = c_base + up * (h_tot * sk)
        r_p = 0.118 * kiln_profile(sk)
        for sd in (-1, 1):
            p0 = z_p + left * sd * (r_p - 0.008)
            p1 = z_p + left * sd * (r_p + 0.036) + up * 0.004
            parts_h.append(horn(f'{gid_h}_peg_{tier}_{sd}', [p0, p1], 0.010, 0.007, peg_paint, n=8, rows=4, rigid_joint='Head'))

    # White knotted chin-cord under the mouth opening
    chin_p = c_base + up * 0.02 - bk * 0.125
    for sd in (-1, 1):
        parts_h.append(horn(f'{gid_h}_cord_{sd}', [chin_p, chin_p + left * sd * 0.015 - up * 0.065],
                            0.005, 0.003, P('white', 0.03), n=6, rows=4, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Kiln-Mask Pegged Terracotta Beehive Helm', 'head', 'islanders', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Plaited golden-straw shoulder capelet with 28 3D iron/bronze clapper-bells, cowrie chest harness & spiked clay gauntlet ---
    gid_t = 'island_m_shaman_mantle'
    parts_t = []

    # 1. Dark ritual body-paint & cowrie-bone beaded chest/waist bands
    chest_paint = P('umber', 0.06, [
        B('bottom', 0.0, 0.035, 'beads', 'terracotta', 'soot', 0.035),
        B('bottom', 0.04, 0.075, 'beads', 'bone', 'umber', 0.035),
        B('top', 0.06, 0.16, 'beads', 'bone', 'umber', 0.04),
    ])
    parts_t.append(torso_tube(gid_t + '_harness', CHEST + 0.04, WAIST - 0.03, 0.010, chest_paint, n=36, rows=8))

    # 2. Wide thick plaited golden-straw / raffia shoulder capelet with dense radial grass fibers
    straw_paint = P('ochre', 0.12, [
        B('bottom', 0.0, 0.05, 'rays', 'gold', 'umber', 0.016),
        B('top', 0.0, 0.05, 'rays', 'sand', 'ochre', 0.016),
    ], fabric='straw.plaited')
    parts_t.append(collar_disc(gid_t + '_straw_top', 0.25, straw_paint, drop=0.11, rows=6, n=48, scallop=0.06, ease=0.024, z_off=0.01))
    parts_t.append(torso_tube(gid_t + '_straw_skirt', TOP + 0.005, CHEST - 0.01, 0.032, straw_paint,
                              n=48, rows=7, hang_from=TOP, flare=0.55, over_arms=True))

    # 3. Three concentric staggered rings of 3D flared iron/bronze clapper-bells around the straw capelet + dangling cord tassels!
    bell_paint = P('iron', 0.04, [
        B('bottom', 0.0, 0.012, 'solid', 'silver'),
        B('top', 0.0, 0.012, 'solid', 'soot'),
    ], fabric='metal.iron')
    c_neck = spine_at(TOP)
    for ring_idx, (n_bells, rad_scale, z_drop, tilt_out) in enumerate(((12, 0.90, 0.055, 0.025), (14, 1.04, 0.095, 0.028), (14, 1.18, 0.140, 0.032))):
        for k in range(n_bells):
            an = (2 * math.pi * (k + 0.5 * ring_idx)) / n_bells
            d = np.array([math.sin(an), math.cos(an), 0.0])
            h_body = first_hit(c_neck, d, bvh=BVH) or 0.09
            b_top = c_neck + d * ((h_body + 0.15) * rad_scale) + np.array([0.0, 0.0, -z_drop])
            b_bot = b_top + d * tilt_out + np.array([0.0, 0.0, -0.052])
            parts_t.append(horn(f'{gid_t}_bell_{ring_idx}_{k}', [b_top, b_bot], 0.010, 0.024, bell_paint,
                                n=8, rows=4, rigid_joint='Spine2'))

    # 8 long hanging cord tassels with clay bead weights beneath the straw capelet
    for k in range(8):
        an = (2 * math.pi * k) / 8.0 + 0.25
        if abs(math.cos(an)) > 0.78:
            continue
        d = np.array([math.sin(an), math.cos(an), 0.0])
        t_top = c_neck + d * 0.26 + np.array([0.0, 0.0, -0.14])
        t_bot = t_top + np.array([0.0, 0.0, -0.26 - 0.05 * (k % 2)])
        parts_t.append(horn(f'{gid_t}_tassel_{k}', [t_top, t_bot], 0.0035, 0.003, P('cream', 0.05), n=6, rows=5, rigid_joint='Spine2'))
        parts_t.append(blob(f'{gid_t}_tassel_bead_{k}', t_bot, (0.018, 0.018, 0.022), P('ochre', 0.05), n=8, rows=4, rigid_joint='Spine2'))

    # 4. Spiked terracotta clay gauntlet on the right forearm & yellow cord wraps on the left forearm
    r_e, r_h = J('RightForeArm'), J('RightHand')
    gaunt_paint = P('terracotta', 0.07, [B('top', 0.0, 0.03, 'dots', 'soot', 'umber', 0.03), B('bottom', 0.0, 0.02, 'solid', 'umber')])
    parts_t.append(limb_tube(gid_t + '_gauntlet_R', r_e + (r_h - r_e) * 0.15, r_e + (r_h - r_e) * 0.88,
                             0.022, gaunt_paint, n=16, rows=6, bvh=BVH_A, rmax=0.12))
    l_e, l_h = J('LeftForeArm'), J('LeftHand')
    wrap_paint = P('yuniyellow', 0.05, [B('top', 0.0, 0.12, 'stripes', 'ochre', 'yuniyellow', 0.02)])
    parts_t.append(limb_tube(gid_t + '_wraps_L', l_e + (l_h - l_e) * 0.18, l_e + (l_h - l_e) * 0.85,
                             0.010, wrap_paint, n=16, rows=6, bvh=BVH_A, rmax=0.10))

    entry_t = assemble_garment(gid_t, 'Kiln-Shaman Straw Bell-Capelet & Cowrie Harness', 'torso', 'islanders', parts_t)

    # --- LEGS: Saffron-ochre wrapped loincloth with long front sash & bulbous perforated terracotta gourd leg-rattles ---
    gid_l = 'island_m_shaman_kilt'
    parts_l = []

    waist_paint = P('yuniyellow', 0.06, [
        B('top', 0.0, 0.02, 'solid', 'ochre'),
        B('bottom', 0.0, 0.02, 'solid', 'saffron'),
    ])
    parts_l.append(torso_tube(gid_l + '_waist', WAIST - 0.01, CROTCH + 0.03, 0.016, waist_paint, n=36, rows=6, hull_from=WAIST))

    sash_paint = P('yuniyellow', 0.06, [
        B('bottom', 0.0, 0.12, 'stripes', 'rust', 'jungle', 0.04),
        B('bottom', 0.12, 0.22, 'solid', 'saffron'),
    ])
    sash_top = _front(WAIST - 0.04, 0.024)
    parts_l.append(flap(gid_l + '_sash_front', sash_top, 0.15, 0.44, FRONT, sash_paint,
                        cols=7, rows=10, group_below=CROTCH + 0.02, sway=0.018))
    back_top = spine_at(WAIST - 0.04) + np.array([0.0, 0.14, 0.0])
    parts_l.append(flap(gid_l + '_sash_back', back_top, 0.15, 0.34, np.array([0, 1.0, 0]), waist_paint,
                        cols=6, rows=8, group_below=CROTCH + 0.02, sway=0.015))

    r_hip, r_knee = J('RightUpLeg'), J('RightLeg')
    parts_l.append(limb_tube(gid_l + '_thigh_rings_R', r_hip + (r_knee - r_hip) * 0.42, r_hip + (r_knee - r_hip) * 0.68,
                             0.012, P('terracotta', 0.05, [B('top', 0.0, 0.10, 'stripes', 'umber', 'terracotta', 0.02)]),
                             n=16, rows=5, rmax=0.14))

    gourd_rattle_paint = P('umber', 0.07, [], [PN(0.0, 1.0, 'gourd_holes', 'soot', 'terracotta', 0.16)])
    for s in (L, R):
        sx = 1.0 if s == 'Left' else -1.0
        knee_j, foot_j = J(s + 'Leg'), J(s + 'Foot')
        shin_c = knee_j + (foot_j - knee_j) * 0.48
        parts_l.append(blob(f'{gid_l}_gourd_main_{s[0]}', shin_c + np.array([sx * 0.025, -0.035, 0.0]),
                            (0.155, 0.145, 0.135), gourd_rattle_paint, n=16, rows=7, out=FRONT, rigid_joint=s + 'Leg'))
        parts_l.append(blob(f'{gid_l}_gourd_lobe1_{s[0]}', shin_c + np.array([sx * 0.075, -0.025, 0.068]),
                            (0.092, 0.088, 0.085), gourd_rattle_paint, n=12, rows=5, out=FRONT, rigid_joint=s + 'Leg'))
        parts_l.append(blob(f'{gid_l}_gourd_lobe2_{s[0]}', shin_c + np.array([-sx * 0.025, -0.038, 0.058]),
                            (0.078, 0.075, 0.075), gourd_rattle_paint, n=12, rows=5, out=FRONT, rigid_joint=s + 'Leg'))

    entry_l = assemble_garment(gid_l, 'Kiln-Shaman Saffron Loincloth & Clay Gourd Leg-Rattles', 'legs', 'islanders', parts_l)
    return [entry_t, entry_h, entry_l]


# ===============================================================================================================
# OUTFIT 12 (Batch 2 Image 5): Yuni — "Outer-Wall Sentinel / Butte-Gate Warden"
# ===============================================================================================================
def build_yuni_sentinel():
    # --- HEADPIECE: Domed verdigris-and-gold radial kasa helm with rectangular cheek-lappets & glowing orange V-visor ---
    gid_h = 'yuni_m_sentinel_helm'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Dark faceted iron faceplate with glowing amber-orange V-chevron ocular slit
    visor_paint = P('soot', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'iron'),
        B('bottom', 0.0, 0.025, 'solid', 'iron'),
    ], [
        PN(0.41, 0.59, 'chevron', 'sunorange', 'soot', 0.08, down=0.075),
    ], fabric='metal.iron')
    fs_v = np.linspace(0.68, -0.10, 11)
    angs_v = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    V_grid = []
    for f in fs_v:
        c = a + (b - a) * f
        drop = max(0.0, 0.58 - f)
        rx = 0.098 + 0.006 * drop
        ry = 0.124 + 0.006 * drop
        V_grid.append([c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - 0.012) for an in angs_v])
    parts_h.append(Part(gid_h + '_faceplate', np.array(V_grid), True, ['body'] * len(fs_v), visor_paint, rigid_joint='Head'))

    # 2. Two rectangular verdigris-and-gold armored cheek-guard lappets flanking the faceplate
    lappet_paint = P('teal', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'brass'),
        B('top', 0.0, 0.025, 'solid', 'brass'),
        B('bottom', 0.025, 0.14, 'fret', 'brass', 'teal', 0.045),
    ], fabric='metal.bronze')
    for sd, tag in ((-1, 'R'), (1, 'L')):
        lap_top = a + (b - a) * 0.58 + left * (sd * 0.092) - bk * 0.085
        parts_h.append(flap(f'{gid_h}_cheek_{tag}', lap_top, 0.054, 0.145,
                            left * (sd * 0.35) - bk * 0.94, lappet_paint,
                            cols=4, rows=6, push=False, rigid_joint='Head'))

    # 3. Wide domed verdigris-patinated bronze & brass-ribbed mushroom dome helm + apex finial knob
    dome_paint = P('teal', 0.05, [
        B('bottom', 0.0, 0.022, 'solid', 'brass'),
        B('top', 0.0, 0.030, 'solid', 'brass'),
        B('bottom', 0.022, 0.22, 'rays', 'brass', 'teal', 0.045),
    ], [
        PN(0.42, 0.58, 'fret', 'brass', 'teal', 0.09),
    ], fabric='metal.bronze')
    c_dome = a + (b - a) * 0.58 - bk * 0.010
    angs_s = np.linspace(0, 2 * math.pi, 48, endpoint=False)
    Dome_grid = []
    # Top-to-bottom row ordering so exterior normals point outward/upward
    for h_off, rad_mult in (
        (0.135, 0.03),
        (0.125, 0.22),
        (0.105, 0.48),
        (0.072, 0.76),
        (0.032, 0.96),
        (0.006, 1.00),
        (0.000, 0.48),
    ):
        row_s = []
        for an in angs_s:
            ca, sa = math.cos(an), math.sin(an)
            d_pt = (bk * ca + left * sa) * (0.235 * rad_mult)
            row_s.append(c_dome + up * h_off + d_pt)
        Dome_grid.append(row_s)
    parts_h.append(Part(gid_h + '_dome', np.array(Dome_grid), True, ['body'] * len(Dome_grid), dome_paint, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_finial', c_dome + up * 0.142, (0.032, 0.032, 0.022),
                        P('brass', 0.02, fabric='metal.gold'), n=12, rows=5, out=up, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Sentinel Verdigris Dome-Helm, Cheek-Lappets & Orange Visor', 'head', 'yuni', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Gunmetal cuirass with glowing orange chest-core & conduits, massive verdigris right pauldron, ochre left cloak & verdigris tassets ---
    gid_t = 'yuni_m_sentinel_mantle'
    parts_t = []

    # 1. Gunmetal-steel mechanical cuirass with brass collar & belt
    cuirass_paint = P('slate', 0.04, [
        B('top', 0.0, 0.035, 'fret', 'brass', 'teal', 0.045),
        B('bottom', 0.0, 0.045, 'dentils', 'brass', 'umber', 0.04),
    ], [
        PN(0.38, 0.62, 'fluted', 'iron', 'slate', 0.08),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass', TOP, WAIST - 0.03, 0.022, cuirass_paint, n=44, rows=10))

    # Central glowing amber-orange chest core & brass housing + 4 radiating orange power conduits!
    core_c = _front(CHEST + 0.02, 0.034)
    parts_t.append(blob(gid_t + '_core_rim', core_c, (0.056, 0.018, 0.056),
                        P('brass', 0.02, fabric='metal.gold'), n=14, rows=5, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_core_lens', core_c + np.array([0.0, -0.008, 0.0]), (0.038, 0.016, 0.038),
                        P('sunorange', 0.01, [B('top', 0.0, 0.02, 'solid', 'yuniyellow')]), n=12, rows=5, out=FRONT, rigid_joint='Spine2'))
    conduit_p = P('sunorange', 0.02, [B('top', 0.0, 0.02, 'solid', 'brass'), B('bottom', 0.0, 0.02, 'solid', 'brass')])
    for k_c, (dx1, dz1, dx2, dz2) in enumerate((
        (-0.042, 0.022, -0.085, 0.055),
        (-0.042, -0.022, -0.075, -0.075),
        (0.042, 0.022, 0.085, 0.055),
        (0.042, -0.022, 0.075, -0.075),
    )):
        p_a = _front(CHEST + 0.02 + dz1, 0.032, x=dx1)
        p_m = _front(CHEST + 0.02 + (dz1 + dz2) * 0.5, 0.036, x=(dx1 + dx2) * 0.55)
        p_b = _front(CHEST + 0.02 + dz2, 0.030, x=dx2)
        parts_t.append(horn(f'{gid_t}_conduit_{k_c}', [p_a, p_m, p_b], 0.009, 0.008, conduit_p, n=8, rows=6, rigid_joint='Spine2'))

    # Central circular brass belt buckle
    buckle_c = _front(WAIST - 0.01, 0.034)
    parts_t.append(blob(gid_t + '_belt_buckle', buckle_c, (0.046, 0.016, 0.046),
                        P('brass', 0.02, fabric='metal.gold'), n=12, rows=5, out=FRONT, rigid_joint='Hips'))

    # 2. Tiered verdigris-and-gold plated hip tassets + asymmetric left-side golden-ochre mantle skirt (unified 360° tube)
    kilt_paint = P('teal', 0.05, [
        B('bottom', 0.0, 0.035, 'solid', 'brass'),
        B('bottom', 0.09, 0.11, 'solid', 'brass'),
        B('bottom', 0.18, 0.20, 'solid', 'brass'),
    ], [
        # Right & back tiered verdigris-and-brass armor tassets + center-front narrow verdigris lappet
        PN(0.0, 0.52, 'fret', 'brass', 'teal', 0.12),
        # Left-side long golden-ochre asymmetric mantle drape with white solar arc lines
        PN(0.52, 0.92, 'fluted', 'ochre', 'saffron', 0.14),
        PN(0.58, 0.84, 'heliarch_solar', 'cream', 'ochre', 0.22),
    ], fabric='metal.bronze')
    kilt_tube = torso_tube(gid_t + '_kilt', WAIST - 0.02, KNEE - 0.04, 0.024, kilt_paint,
                           n=48, hang_from=WAIST - 0.02, flare=0.075, group_below=CROTCH + 0.02, hull_from=WAIST)
    kilt_tube.cloth = None
    parts_t.append(kilt_tube)

    # 3. Massive layered verdigris-and-gold domed right shoulder pauldron + circular rondel boss!
    pauldron_r_paint = P('teal', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'brass'),
        B('top', 0.0, 0.025, 'solid', 'brass'),
        B('bottom', 0.03, 0.12, 'fret', 'brass', 'teal', 0.05),
    ], fabric='metal.bronze')
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, pauldron_r_paint, reach=0.58, ease=0.046, flare_end=1.18))
    sh_r = J('RightArm') + np.array([-0.065, -0.010, -0.025])
    parts_t.append(blob(gid_t + '_rondel_boss_R', sh_r, (0.068, 0.024, 0.068),
                        P('brass', 0.02, [B('top', 0.0, 0.02, 'solid', 'teal')], fabric='metal.gold'),
                        n=14, rows=5, out=np.array([-0.92, -0.38, 0.0]), rigid_joint='RightArm'))

    # 4. Left-shoulder golden-ochre swathed cloak & circular bronze fibula clasp
    cloak_paint = P('ochre', 0.05, [
        B('bottom', 0.0, 0.035, 'solid', 'saffron'),
        B('top', 0.0, 0.025, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'fluted', 'saffron', 'ochre', 0.14),
    ], fabric='cloth.bazin')
    cowl_sc = collar_disc(gid_t + '_cowl_scarf', 0.145, cloak_paint, drop=0.085, rows=7, n=44, scallop=0.03, ease=0.026, z_off=0.008)
    cowl_sc.cloth = None
    parts_t.append(cowl_sc)
    parts_t.append(pauldron(gid_t + '_shoulder_drape_L', L, cloak_paint, reach=0.54, ease=0.042, flare_end=1.15))
    parts_t.append(torso_tube(gid_t + '_cloak', TOP + 0.005, WAIST - 0.02, 0.028, cloak_paint,
                              n=32, arc=(-0.05 * math.pi, 0.82 * math.pi), over_arms=False))
    fib_c = _front(SHOULDER - 0.01, 0.038, x=0.068)
    parts_t.append(blob(gid_t + '_fibula_L', fib_c, (0.038, 0.015, 0.038),
                        P('brass', 0.02, fabric='metal.gold'), n=12, rows=5, out=FRONT, rigid_joint='Spine2'))

    # 5. Articulated steel vambrace sleeves with glowing orange forearm conduits
    sl_paint = P('slate', 0.04, [
        B('bottom', 0.0, 0.06, 'solid', 'iron'),
        B('bottom', 0.06, 0.16, 'stripes', 'sunorange', 'slate', 0.025),
        B('top', 0.0, 0.08, 'solid', 'soot'),
    ], fabric='metal.iron')
    parts_t += sleeves(gid_t, 'wrist', 0.018, sl_paint, ease_end=0.022, rows=9, n=18)

    entry_t = assemble_garment(gid_t, 'Sentinel Verdigris Pauldron, Orange-Core Cuirass & Ochre Mantle', 'torso', 'yuni', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 13 (Batch 3 Image 1 — iziz4.avif): Izani — "Curule Aedile / Crimson Factor"
# ===============================================================================================================
def build_iziz_aedile():
    # --- HEADPIECE: Embroidered burgundy-maroon velvet fila cap with rosette medallions & amber-tinted spectacles ---
    gid_h = 'iziz_m_aedile_fila'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Flat-topped cylindrical burgundy velvet fila cap with silver-pink rosette & scroll embroidery
    fila_paint = P('oxblood', 0.04, [
        B('top', 0.0, 0.015, 'solid', 'lacrose'),
        B('bottom', 0.0, 0.012, 'solid', 'lacrose'),
        B('bottom', 0.012, 0.115, 'fila_embroidery', 'cream', 'oxblood', 0.14),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_cap', 0.135, lambda s: 1.03 - 0.04 * s, fila_paint, f=0.50, ease=0.022, rows=9, n=36))

    # 2. Dark tortoiseshell/iron-framed rectangular-oval amber-tinted sunglasses sitting proud of the brow/eyes
    c_eye = a + (b - a) * 0.36
    h_eye = first_hit(c_eye, -bk) or 0.105
    lens_paint = P('sunorange', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'soot'),
        B('bottom', 0.0, 0.010, 'solid', 'soot'),
    ], fabric='leather.polished')
    for sd in (-1, 1):
        l_pos = c_eye + left * (sd * 0.035) - bk * (h_eye + 0.022)
        parts_h.append(blob(f'{gid_h}_lens_{sd}', l_pos, (0.036, 0.012, 0.028), lens_paint,
                            n=12, rows=5, out=-bk, rigid_joint='Head'))
        t_start = l_pos + left * (sd * 0.020)
        t_end = c_eye + left * (sd * 0.082) - bk * 0.010
        parts_h.append(horn(f'{gid_h}_temple_{sd}', [t_start, t_end], 0.0045, 0.0035, P('soot', 0.02),
                            n=6, rows=4, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_bridge', [
        c_eye - left * 0.018 - bk * (h_eye + 0.024),
        c_eye + left * 0.018 - bk * (h_eye + 0.024)
    ], 0.005, 0.005, P('soot', 0.02), n=6, rows=3, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Curule Aedile Embroidered Fila Cap & Amber Spectacles', 'head', 'izani', parts_h,
                               covers_hair=True, covers_face=False)

    # --- TORSO: Deep burgundy agbada with rose-white chain-stitch scroll plastron, striped wing-drapes & silver bead necklace ---
    gid_t = 'iziz_m_aedile_agbada'
    parts_t = []

    # 1. Unified full-length deep burgundy-maroon agbada with symmetrical rose-cream S-scroll chest plastron & striped wing columns!
    agbada_paint = P('oxblood', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'crimson'),
        B('top', 0.0, 0.025, 'solid', 'lacrose'),
    ], [
        # Left and right striped maroon-and-rose wing columns flanking the central plastron
        PN(0.18, 0.34, 'stripes', 'lacrose', 'oxblood', 0.055),
        PN(0.66, 0.82, 'stripes', 'lacrose', 'oxblood', 0.055),
        PN(0.33, 0.36, 'solid', 'soot', 'oxblood', 0.10),
        PN(0.64, 0.67, 'solid', 'soot', 'oxblood', 0.10),
        # Central symmetrical S-scroll & heart-volute chain-stitch plastron down to mid-thigh
        PN(0.36, 0.64, 'agbada_scroll', 'cream', 'oxblood', 0.62, down=0.72),
    ], fabric='cloth.bazin')
    parts_t.append(torso_tube(gid_t + '_tunic', TOP + 0.015, ANKLE + 0.06, 0.024, agbada_paint,
                              n=52, hang_from=WAIST - 0.02, flare=0.09, group_below=CROTCH + 0.02, hull_from=WAIST, over_arms=False))
    parts_t.append(collar_disc(gid_t + '_yoke', 0.095, P('oxblood', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'lacrose')], fabric='cloth.bazin'),
                               drop=0.045, ease=0.022, z_off=0.008))

    # 2. Wide pleated shoulder wing drapes!
    wing_paint = P('oxblood', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'lacrose'),
    ], [
        PN(0.0, 1.0, 'stripes', 'lacrose', 'oxblood', 0.055),
    ], fabric='cloth.bazin')
    parts_t.append(pauldron(gid_t + '_wing_drape_L', L, wing_paint, reach=0.58, ease=0.040, flare_end=1.22))
    parts_t.append(pauldron(gid_t + '_wing_drape_R', R, wing_paint, reach=0.58, ease=0.040, flare_end=1.22))

    # 3. Elbow-length burgundy inner sleeves + 3D silver wrist bracelets
    sl_paint = P('oxblood', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'lacrose')], fabric='cloth.bazin')
    parts_t += sleeves(gid_t, 'elbow', 0.018, sl_paint, ease_end=0.028, rows=7, n=18)
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        parts_t.append(limb_tube(f'{gid_t}_bracelet_{s[0]}', e_j + (h_j - e_j) * 0.78, e_j + (h_j - e_j) * 0.88,
                                 0.014, P('silver', 0.03, [B('top', 0.0, 0.01, 'solid', 'soot')], fabric='metal.iron'),
                                 n=16, rows=3, bvh=BVH_A, rmax=0.09))

    # 4. Long double-looped 3D tubular silver-and-obsidian bead necklace hanging to the solar plexus!
    bead_silv = P('silver', 0.03, [B('top', 0.0, 0.008, 'solid', 'soot')], fabric='metal.iron')
    bead_obs = P('soot', 0.03, [B('top', 0.0, 0.008, 'solid', 'silver')], fabric='metal.iron')
    for loop_idx, (w_loop, drop_z, n_beads) in enumerate(((0.078, 0.25, 19), (0.092, 0.29, 21))):
        for k in range(n_beads):
            u_b = k / float(n_beads - 1)
            ang_b = (u_b - 0.5) * math.pi
            bx_off = math.sin(ang_b) * w_loop
            bz = TOP - 0.01 - math.cos(ang_b) * drop_z
            b_pos = _front(bz, 0.040 + 0.006 * loop_idx) + np.array([bx_off, 0.0, 0.0])
            bp = bead_silv if ((k + loop_idx) % 3 != 0) else bead_obs
            parts_t.append(blob(f'{gid_t}_bead_{loop_idx}_{k}', b_pos, (0.016, 0.014, 0.024), bp,
                                n=8, rows=4, out=FRONT, rigid_joint='Spine2'))

    entry_t = assemble_garment(gid_t, 'Curule Aedile Scroll-Embroidered Agbada & Silver Beads', 'torso', 'izani', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 14 (Batch 3 Image 2 — 31d434c3.avif): Chichani — "Ash-Cowl Confessor / Caldera Justiciar"
# ===============================================================================================================
def build_voth_confessor():
    # --- HEADPIECE: Deep pointed rust-ochre burlap inquisitor hood with black arabesque border & pitch-black shadow face ---
    gid_h = 'voth_m_confessor_hood'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Smooth pitch-black shadow veil hanging straight down inside the hood (never hugging the eyes!)
    fs_sh = np.linspace(0.68, -0.16, 10)
    angs_sh = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    Sh_grid = []
    for f in fs_sh:
        c = a + (b - a) * f
        drop = max(0.0, 0.58 - f)
        rx = 0.105 + 0.014 * drop
        ry = 0.138 + 0.014 * drop
        Sh_grid.append([c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - 0.018) for an in angs_sh])
    parts_h.append(Part(gid_h + '_shadow', np.array(Sh_grid), True, ['body'] * len(fs_sh), P('soot', 0.02), rigid_joint='Head'))

    # 2. Wide, pointed burnt-sienna / rust-ochre heavy woven OPEN hood with overhanging arabesque brow visor!
    hood_paint = P('rust', 0.09, [
        B('bottom', 0.0, 0.03, 'arabesque_border', 'soot', 'rust', 0.10),
        B('top', 0.0, 0.05, 'arabesque_border', 'soot', 'rust', 0.12),
    ], [
        # Wide black-and-rust embroidered border running along both front hood edges (u near 0 and 1 of the open arc!)
        PN(0.0, 0.16, 'arabesque_border', 'soot', 'rust', 0.14),
        PN(0.84, 1.0, 'arabesque_border', 'soot', 'rust', 0.14),
    ], fabric='cloth.canvas')
    # Lower/side open hood cowl (top-to-bottom f = 0.64 .. -0.36, hanging straight down around _shadow!)
    fs_hd = np.linspace(0.64, -0.36, 10)
    angs_hd = np.linspace(-0.76 * math.pi, 0.76 * math.pi, 36)
    Hd_grid = []
    for f in fs_hd:
        c = a + (b - a) * f
        drop = max(0.0, 0.58 - f)
        rx = 0.132 + 0.036 * drop
        ry = 0.158 + 0.028 * drop
        row_pts = [c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - 0.032) for an in angs_hd]
        Hd_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_hood_sides', np.array(Hd_grid), False, ['body'] * len(fs_hd), hood_paint, rigid_joint='Head'))

    # Upper pointed hood crown & forward-overhanging brow arch (top-to-bottom f = 1.26 .. 0.54, closed 360 deg above the eyes!)
    peak_paint = P('rust', 0.09, [
        B('bottom', 0.0, 0.075, 'arabesque_border', 'soot', 'rust', 0.12),
    ], fabric='cloth.canvas')
    fs_pk = np.linspace(1.26, 0.54, 10)
    angs_pk = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    Pk_grid = []
    for f in fs_pk:
        c = a + (b - a) * f
        t_pk = max(0.0, (f - 0.54) / 0.72)
        rx = 0.134 * (1.0 - 0.25 * t_pk)
        ry = 0.164 * (1.0 - 0.22 * t_pk)
        fwd_oh = 0.048 * (1.0 - 0.45 * t_pk)
        row_pts = [c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - fwd_oh) for an in angs_pk]
        if f > 0.76:
            u_peak = (f - 0.76) / 0.50
            peak_c = c - bk * (0.040 * (1.0 - 0.4 * u_peak)) + up * (0.025 * u_peak)
            scale_x = max(0.04, 1.0 - 0.94 * (u_peak ** 1.25))
            row_pts = [peak_c + (p - peak_c) * scale_x for p in row_pts]
        Pk_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_hood_peak', np.array(Pk_grid), True, ['body'] * len(fs_pk), peak_paint, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Ash-Cowl Pointed Rust Burlap Hood & Shadow Veil', 'head', 'chichani', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Floor-length rust-ochre greatcoat with black arabesque borders, Inverness shoulder capelet & black brigandine ---
    gid_t = 'voth_m_confessor_coat'
    parts_t = []

    # 1. Unified floor-length rust-ochre greatcoat with black arabesque borders & center-front black pleated cassock/brigandine!
    coat_paint = P('rust', 0.09, [
        B('bottom', 0.0, 0.035, 'arabesque_border', 'soot', 'rust', 0.12),
    ], [
        PN(0.34, 0.42, 'arabesque_border', 'soot', 'rust', 0.18),
        PN(0.58, 0.66, 'arabesque_border', 'soot', 'rust', 0.18),
        PN(0.42, 0.435, 'solid', 'soot', 'rust', 0.10),
        PN(0.565, 0.58, 'solid', 'soot', 'rust', 0.10),
        PN(0.435, 0.565, 'fluted', 'slate', 'soot', 0.08),
    ], fabric='cloth.canvas')
    parts_t.append(torso_tube(gid_t + '_coat', TOP + 0.01, ANKLE + 0.015, 0.022, coat_paint,
                              n=52, hang_from=WAIST - 0.02, flare=0.10,
                              group_below=CROTCH + 0.02, hull_from=WAIST, over_arms=False))

    # 3D square silver belt buckle at the waist center
    buckle_c = _front(WAIST - 0.01, 0.032)
    parts_t.append(blob(gid_t + '_buckle', buckle_c, (0.068, 0.018, 0.058),
                        P('silver', 0.03, [B('top', 0.0, 0.012, 'solid', 'soot'), B('bottom', 0.0, 0.012, 'solid', 'soot')], fabric='metal.iron'),
                        n=12, rows=5, out=FRONT, rigid_joint='Spine'))

    # 3. Tiered Inverness / coachman shoulder capelet over the upper chest & shoulders with black embroidered border!
    cape_paint = P('rust', 0.09, [
        B('bottom', 0.0, 0.055, 'arabesque_border', 'soot', 'rust', 0.10),
        B('top', 0.0, 0.025, 'solid', 'soot'),
    ], [
        PN(0.0, 0.12, 'arabesque_border', 'soot', 'rust', 0.12),
        PN(0.88, 1.0, 'arabesque_border', 'soot', 'rust', 0.12),
    ], fabric='cloth.canvas')
    parts_t.append(torso_tube(gid_t + '_capelet', TOP + 0.018, CHEST - 0.04, 0.030, cape_paint,
                              n=42, rows=8, arc=(-0.80 * math.pi, 0.80 * math.pi), hang_from=TOP + 0.01, flare=0.10, over_arms=False))
    parts_t.append(pauldron(gid_t + '_shoulder_L', L, cape_paint, reach=0.52, ease=0.046, flare_end=1.25))
    parts_t.append(pauldron(gid_t + '_shoulder_R', R, cape_paint, reach=0.52, ease=0.046, flare_end=1.25))

    # 4. Rust-ochre sleeves with wide, flared dark-umber/black embossed leather-and-brocade gauntlet cuffs!
    sl_paint = P('rust', 0.08, [
        B('bottom', 0.0, 0.24, 'arabesque_border', 'soot', 'umber', 0.10),
        B('bottom', 0.24, 0.26, 'solid', 'soot'),
    ], fabric='cloth.canvas')
    parts_t += sleeves(gid_t, 'wrist', 0.020, sl_paint, ease_end=0.036, rows=10, n=20)

    entry_t = assemble_garment(gid_t, 'Ash-Cowl Confessor Rust Greatcoat, Capelet & Brigandine', 'torso', 'chichani', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 15 (Batch 3 Image 3 — 69aa6be3.jpg): Dalabites — "Heliophant Sovereign / Solar-Horned Arch-Augur"
# ===============================================================================================================
def build_dalab_heliophant():
    # --- HEADPIECE: Bronze spirit mask with cyan chin-bar, 4-horned turquoise-and-coral crown, gold solar ring & chimes ---
    gid_h = 'dalab_m_heliophant_crown'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Sculpted bronze-umber spirit mask with glowing cyan almond eyes & vertical turquoise chin-bar
    mask_paint = P('umber', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'sunorange'),
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
    ], [
        # Vertical turquoise bar down the center of the chin/mouth (u=0.5 is front -Y)
        PN(0.48, 0.52, 'solid', 'turq', 'umber', 0.10),
        # Glowing cyan almond eye slits at upper eye level (top-to-bottom v ~ 0.25..0.42)
        PN(0.41, 0.46, 'chevron', 'turq', 'soot', 0.05, down=0.075),
        PN(0.54, 0.59, 'chevron', 'turq', 'soot', 0.05, down=0.075),
    ], fabric='metal.bronze')
    fs_m = np.linspace(0.58, -0.08, 14)
    angs_m = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    M_grid = []
    for f in fs_m:
        c = a + (b - a) * f
        vf = (0.58 - f) / 0.66  # 0 at brow, 1 at chin
        jaw_taper = 1.0 - 0.30 * max(0.0, (vf - 0.45) / 0.55) ** 1.4
        rx = 0.105 * jaw_taper
        ry = 0.136 * (1.0 - 0.14 * max(0.0, (vf - 0.55) / 0.45))
        row_pts = []
        for an in angs_m:
            sx = math.sin(an)
            cy = math.cos(an)  # -1 at front face
            frontness = max(0.0, -cy)
            nose = 0.016 * math.exp(-((sx / 0.14) ** 2)) * math.exp(-(((vf - 0.42) / 0.22) ** 2)) * (frontness ** 2)
            brow = 0.010 * math.exp(-(((vf - 0.18) / 0.10) ** 2)) * (frontness ** 2)
            cheek = 0.008 * math.exp(-(((abs(sx) - 0.42) / 0.18) ** 2)) * math.exp(-(((vf - 0.46) / 0.18) ** 2)) * frontness
            eye_rec = -0.007 * math.exp(-(((abs(sx) - 0.28) / 0.12) ** 2)) * math.exp(-(((vf - 0.30) / 0.09) ** 2)) * frontness
            fwd_shift = 0.018 + nose + brow + cheek + eye_rec
            row_pts.append(c + left * (sx * rx) + bk * (cy * ry - fwd_shift))
        M_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_mask', np.array(M_grid), True, ['body'] * len(fs_m), mask_paint, rigid_joint='Head'))

    # 2. Domed cream-and-coral crown diadem with large 3D glowing turquoise forehead cabochon
    diadem_paint = P('cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'sunorange'),
        B('top', 0.0, 0.03, 'solid', 'turq'),
    ], [
        PN(0.35, 0.65, 'diamonds', 'sunorange', 'cream', 0.08),
    ])
    parts_h.append(tower_hat(gid_h + '_diadem', 0.15, lambda s: 1.06 - 0.18 * (s ** 2), diadem_paint, f=0.50, ease=0.026, rows=8, n=36))

    cab_pos = a + (b - a) * 0.62 - bk * 0.148
    parts_h.append(blob(gid_h + '_forehead_gem', cab_pos, (0.056, 0.020, 0.056),
                        P('turq', 0.02, [B('top', 0.0, 0.012, 'solid', 'gold')]), n=14, rows=5, out=-bk, rigid_joint='Head'))

    # 3. Upper pair of wide sweeping cream-and-coral-tipped horns + lower pair of horizontal turquoise-studded horns with hanging gold chimes!
    upper_horn_paint = P('cream', 0.03, [
        B('bottom', 0.0, 0.08, 'solid', 'holyred'),
        B('top', 0.0, 0.05, 'solid', 'sunorange'),
    ])
    lower_horn_paint = P('cream', 0.03, [
        B('bottom', 0.0, 0.06, 'solid', 'turq'),
        B('top', 0.0, 0.05, 'solid', 'turq'),
    ])
    for sd, tag in ((-1, 'R'), (1, 'L')):
        # Upper sweeping coral-tipped horn
        u_pts = [
            a + (b - a) * 0.68 + left * (sd * 0.085) - bk * 0.03,
            a + (b - a) * 0.86 + left * (sd * 0.185) - bk * 0.02,
            a + (b - a) * 1.12 + left * (sd * 0.255) - bk * 0.01,
            a + (b - a) * 1.32 + left * (sd * 0.275),
        ]
        parts_h.append(horn(f'{gid_h}_up_horn_{tag}', u_pts, 0.034, 0.016, upper_horn_paint, n=10, rows=8, rigid_joint='Head'))

        # Lower horizontal outward-sweeping horn
        l_pts = [
            a + (b - a) * 0.58 + left * (sd * 0.095) - bk * 0.02,
            a + (b - a) * 0.66 + left * (sd * 0.220) - bk * 0.01,
            a + (b - a) * 0.76 + left * (sd * 0.320),
        ]
        parts_h.append(horn(f'{gid_h}_lo_horn_{tag}', l_pts, 0.024, 0.006, lower_horn_paint, n=8, rows=6, rigid_joint='Head'))

        # Golden chime balance-bar & two vertical hanging gold chime-strings beneath each lower horn
        bar_a = a + (b - a) * 0.50 + left * (sd * 0.145) - bk * 0.01
        bar_b = a + (b - a) * 0.50 + left * (sd * 0.305) - bk * 0.01
        parts_h.append(horn(f'{gid_h}_chime_bar_{tag}', [bar_a, bar_b], 0.004, 0.003, P('gold', 0.02), n=6, rows=4, rigid_joint='Head'))
        for c_idx, x_ch in enumerate((0.185, 0.285)):
            ch_top = a + (b - a) * 0.58 + left * (sd * x_ch) - bk * 0.01
            ch_bot = ch_top - up * (0.19 - 0.03 * c_idx)
            parts_h.append(horn(f'{gid_h}_chime_str_{tag}_{c_idx}', [ch_top, ch_bot], 0.003, 0.0025, P('gold', 0.02), n=6, rows=4, rigid_joint='Head'))
            parts_h.append(blob(f'{gid_h}_chime_disc_{tag}_{c_idx}', ch_bot + up * 0.04, (0.024, 0.008, 0.010), P('gold', 0.02), n=8, rows=4, out=-bk, rigid_joint='Head'))

        # Coral-red and turquoise-bordered side head-cloth lappets + dangling turquoise cylinder earrings
        lap_top = a + (b - a) * 0.46 + left * (sd * 0.108) - bk * 0.02
        parts_h.append(flap(f'{gid_h}_lappet_{tag}', lap_top, 0.082, 0.25, left * sd * 0.80 - bk * 0.60,
                            P('holyred', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'turq'), B('top', 0.0, 0.04, 'solid', 'cream')]),
                            cols=5, rows=7, sway=0.02, push=False, rigid_joint='Head'))
        ear_top = a + (b - a) * 0.28 + left * (sd * 0.095) - bk * 0.05
        parts_h.append(horn(f'{gid_h}_earring_{tag}', [ear_top, ear_top - up * 0.11], 0.009, 0.009, P('turq', 0.02), n=8, rows=4, rigid_joint='Head'))

    # 4. Apex golden solar halo ring & inner sun-ring at the top of the crown!
    halo_c = a + (b - a) * 1.18 - bk * 0.01
    for r_ring, r_tube, tag_r in ((0.088, 0.007, 'outer'), (0.046, 0.012, 'inner')):
        ring_pts = [
            halo_c + left * (math.cos(2 * math.pi * k / 16.0) * r_ring) + up * (math.sin(2 * math.pi * k / 16.0) * r_ring)
            for k in range(17)
        ]
        parts_h.append(horn(f'{gid_h}_solar_{tag_r}', ring_pts, r_tube, r_tube, P('gold', 0.02, fabric='metal.gold'), n=8, rows=16, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Izani Heliophant 4-Horned Solar Halo Crown & Turquoise Spirit Mask', 'head', 'izani', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Cream pectoral poncho with turquoise/orange tablet fringe, spotted coral wing-pauldrons & polychrome sashes ---
    gid_t = 'dalab_m_heliophant_mantle'
    parts_t = []

    # 1. Polychrome geometric skirt & wrapped torso base with turquoise, saffron-gold, coral & cream vertical tapestry ribbons
    skirt_paint = P('cream', 0.05, [
        B('bottom', 0.0, 0.06, 'stripes', 'turq', 'holyred', 0.05),
    ], [
        PN(0.38, 0.44, 'stripes', 'holyred', 'yuniyellow', 0.12),
        PN(0.45, 0.51, 'solid', 'turq', 'cream', 0.20),
        PN(0.51, 0.56, 'stripes', 'yuniyellow', 'sunorange', 0.14),
        PN(0.56, 0.62, 'solid', 'indigo', 'turq', 0.16),
        PN(0.0, 0.25, 'solid', 'indigo', 'indigo', 0.20),
        PN(0.75, 1.0, 'solid', 'indigo', 'indigo', 0.20),
    ])
    parts_t.append(torso_tube(gid_t + '_skirt', TOP, ANKLE + 0.02, 0.018, skirt_paint,
                              n=48, hang_from=WAIST - 0.02, flare=0.09, group_below=CROTCH + 0.02, hull_from=WAIST))

    # 2. Asymmetric cream-white pectoral poncho capelet with turquoise-and-gold collar & dangling rectangular tablet fringe!
    poncho_paint = P('cream', 0.04, [
        B('bottom', 0.0, 0.02, 'solid', 'sunorange'),
        B('top', 0.0, 0.025, 'solid', 'turq'),
    ], [
        PN(0.26, 0.74, 'heliophant_pectoral', 'turq', 'cream', 0.34),
    ])
    parts_t.append(torso_tube(gid_t + '_poncho', TOP + 0.015, WAIST + 0.01, 0.026, poncho_paint,
                              n=44, rows=10, hang_from=WAIST, flare=0.08, over_arms=False))

    # 3D glowing turquoise circular throat medallion
    throat_c = _front(CHEST + 0.06, 0.052)
    parts_t.append(blob(gid_t + '_throat_gem', throat_c, (0.058, 0.018, 0.058),
                        P('turq', 0.02, [B('top', 0.0, 0.015, 'solid', 'gold')]), n=14, rows=5, out=FRONT, rigid_joint='Spine2'))

    # 3. Flared coral-orange and eye-spotted butterfly/beetle-wing shoulder pauldrons!
    wing_pauldron_paint = P('sunorange', 0.04, [
        B('top', 0.0, 0.03, 'solid', 'holyred'),
    ], [
        PN(0.0, 1.0, 'wing_spots', 'turq', 'sunorange', 0.22),
    ])
    parts_t.append(pauldron(gid_t + '_wing_L', L, wing_pauldron_paint, reach=0.56, ease=0.046, flare_end=1.35))
    parts_t.append(pauldron(gid_t + '_wing_R', R, wing_pauldron_paint, reach=0.56, ease=0.046, flare_end=1.35))

    # 4. Knotted crimson-red hip sash bow on the left hip + turquoise-and-bronze inlaid forearm bracers!
    hip_knot_c = spine_at(WAIST - 0.02) + np.array([0.105, -0.155, 0.0])
    parts_t.append(blob(gid_t + '_sash_knot', hip_knot_c, (0.11, 0.075, 0.12),
                        P('holyred', 0.04, [B('top', 0.0, 0.02, 'solid', 'turq')]), n=12, rows=6, out=FRONT, rigid_joint='Hips'))
    sash_fl = flap(gid_t + '_sash_tail', hip_knot_c + np.array([0.01, -0.035, -0.02]), 0.11, 0.36,
                   np.array([0.28, -0.96, 0.0]), P('holyred', 0.04, [B('bottom', 0.0, 0.06, 'solid', 'turq')]),
                   cols=5, rows=8, group_below=CROTCH + 0.02, sway=0.02, push=False)
    for r_i in range(sash_fl.P.shape[0]):
        u_r = r_i / float(max(1, sash_fl.P.shape[0] - 1))
        sash_fl.P[r_i] += np.array([0.045 * u_r, -0.095 * u_r, 0.0])
    parts_t.append(sash_fl)

    bracer_paint = P('bronze', 0.04, [
        B('top', 0.0, 0.03, 'solid', 'turq'),
        B('bottom', 0.0, 0.03, 'solid', 'sunorange'),
        B('top', 0.05, 0.16, 'diamonds', 'turq', 'bronze', 0.045),
    ], fabric='metal.bronze')
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        parts_t.append(limb_tube(f'{gid_t}_bracer_{s[0]}', e_j + (h_j - e_j) * 0.12, e_j + (h_j - e_j) * 0.88,
                                 0.018, bracer_paint, n=16, rows=7, bvh=BVH_A, rmax=0.11))

    entry_t = assemble_garment(gid_t, 'Izani Heliophant Turquoise-Tablet Poncho, Spotted Wing-Pauldrons & Polychrome Sash', 'torso', 'izani', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 16 (Batch 3 Image 4 — 4d8d9eae.jpg): Xanadu — "Grand Karavan-Bashi / Sable Pelisse Magnate"
# ===============================================================================================================
def build_xan_magnate():
    # --- HEADPIECE: Domed crimson-and-gold embroidered skullcap with round crimson wool pom-pom ---
    gid_h = 'xan_m_magnate_kufi'
    a, b, up, bk, left = head_frame()
    parts_h = []

    kufi_paint = P('holyred', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.018, 0.055, 'fret', 'gold', 'holyred', 0.05),
        B('bottom', 0.055, 0.090, 'diamonds', 'gold', 'crimson', 0.045),
        B('top', 0.0, 0.025, 'beads', 'gold', 'holyred', 0.035),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_cap', 0.135, lambda s: 1.04 * (1.0 - 0.52 * (s ** 2.4)), kufi_paint,
                             f=0.48, ease=0.028, rows=10, n=36))

    # 3D round crimson wool pom-pom at the apex of the dome
    pom_c = a + (b - a) * 0.48 + up * 0.142
    parts_h.append(blob(gid_h + '_pompom', pom_c, (0.036, 0.036, 0.034), P('holyred', 0.08, fabric='cloth.wool'),
                        n=12, rows=5, out=up, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Karavan-Bashi Gold-Embroidered Crimson Kufi & Pom-Pom', 'head', 'xanadu', parts_h,
                               covers_hair=True, covers_face=False)

    # --- TORSO: Floor-length plush sable-brown fur pelisse coat, dark tunic, crimson brocade skirt & gold pectoral medallion ---
    gid_t = 'xan_m_magnate_pelisse'
    parts_t = []

    # 1. Unified floor-length plush sable-brown fur pelisse coat & center-front green tunic / crimson-gold brocade skirt!
    # Using a single continuous 360° tube guarantees ZERO side seam or flapping between upper and lower halves!
    pelisse_paint = P('sable', 0.10, [
        B('bottom', 0.0, 0.035, 'fret', 'gold', 'soot', 0.045),
        B('top', 0.0, 0.04, 'solid', 'darkfur'),
    ], [
        # Plush fluted sable fur around the back and sides (u = 0.0..0.38 and 0.62..1.0)
        PN(0.0, 0.38, 'fluted', 'darkfur', 'sable', 0.14),
        PN(0.62, 1.0, 'fluted', 'darkfur', 'sable', 0.14),
        # Thick dark sable fur lapel/edge trim bordering the center-front opening
        PN(0.38, 0.41, 'solid', 'darkfur', 'sable', 1.0),
        PN(0.59, 0.62, 'solid', 'darkfur', 'sable', 1.0),
        # Center-front opening: crimson-and-gold brocade skirt on lower half, dark forest-green tunic on upper half!
        PN(0.41, 0.59, 'brocade_skirt', 'gold', 'holyred', 0.32),
        PN(0.41, 0.59, 'solid', 'deepgreen', 'deepgreen', 1.0, down=0.58),
        PN(0.45, 0.55, 'diamonds', 'gold', 'soot', 0.08, down=0.22),
    ], fabric='fur.calf')
    parts_t.append(torso_tube(gid_t + '_pelisse', TOP + 0.01, ANKLE + 0.04, 0.024, pelisse_paint,
                              n=52, hang_from=WAIST - 0.02, flare=0.10,
                              group_below=CROTCH + 0.02, hull_from=WAIST, over_arms=False))

    # 2. Multi-strand 3D gold bead chains & large scalloped solid-gold pectoral medallion on the chest!
    gold_paint = P('gold', 0.02, [B('top', 0.0, 0.01, 'solid', 'ochre')], fabric='metal.gold')
    for loop_idx, (w_loop, drop_z, n_beads) in enumerate(((0.062, 0.14, 13), (0.082, 0.24, 17))):
        for k in range(n_beads):
            u_b = k / float(n_beads - 1)
            ang_b = (u_b - 0.5) * math.pi
            bx_off = math.sin(ang_b) * w_loop
            bz = TOP - 0.01 - math.cos(ang_b) * drop_z
            b_pos = _front(bz, 0.032 + 0.004 * loop_idx, x=bx_off)
            parts_t.append(blob(f'{gid_t}_chain_{loop_idx}_{k}', b_pos, (0.016, 0.014, 0.016), gold_paint,
                                n=8, rows=4, out=FRONT, rigid_joint='Spine2'))

    med_c = _front(CHEST - 0.07, 0.038)
    parts_t.append(blob(gid_t + '_medallion', med_c, (0.095, 0.020, 0.105),
                        P('gold', 0.02, [B('top', 0.0, 0.02, 'dentils', 'ochre', 'gold', 0.02)], fabric='metal.gold'),
                        n=16, rows=6, out=FRONT, rigid_joint='Spine2'))

    fur_paint = P('sable', 0.11, [
        B('bottom', 0.0, 0.05, 'solid', 'soot'),
        B('top', 0.0, 0.05, 'solid', 'darkfur'),
    ], [
        PN(0.0, 1.0, 'fluted', 'darkfur', 'sable', 0.14),
    ], fabric='fur.calf')
    # Thick pillowy sable-fur shawl collar framing the neck and upper shoulders
    zs_shawl = np.linspace(TOP + 0.065, CHEST + 0.03, 7)
    angs_shawl = np.linspace(-0.74 * math.pi, 0.74 * math.pi, 36)
    Shawl_pts = np.array([
        ring_points(spine_at(z), np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), angs_shawl,
                    0.030 + 0.018 * math.sin(math.pi * k / 6.0), rmin=0.06)
        for k, z in enumerate(zs_shawl)
    ])
    parts_t.append(Part(gid_t + '_fur_collar', Shawl_pts, False, ['body'] * 7, fur_paint))
    parts_t.append(pauldron(gid_t + '_fur_sh_L', L, fur_paint, reach=0.48, ease=0.048, flare_end=1.18))
    parts_t.append(pauldron(gid_t + '_fur_sh_R', R, fur_paint, reach=0.48, ease=0.048, flare_end=1.18))

    # 4. Plush sable-fur sleeves transitioning to wide crimson-and-gold brocade forearm cuffs!
    sl_paint = P('sable', 0.10, [
        B('bottom', 0.0, 0.18, 'fret', 'gold', 'holyred', 0.045),
        B('bottom', 0.18, 0.20, 'solid', 'gold'),
    ], fabric='fur.calf')
    parts_t += sleeves(gid_t, 'wrist', 0.026, sl_paint, ease_end=0.034, rows=10, n=20)

    entry_t = assemble_garment(gid_t, 'Karavan-Bashi Sable Fur Pelisse, Gold Medallion & Crimson Brocade', 'torso', 'xanadu', parts_t)
    return [entry_t, entry_h]


# ===============================================================================================================
# OUTFIT 17 (Batch 3 Image 5 — 369923c2.jpg): Rustic Clansmen — "Glacier-Pass Envoy / White-Gambeson Chevalier"
# ===============================================================================================================
def build_rustic_envoy():
    # --- HEADPIECE: Sleek polished-silver metallic ocular visor / blindfold mask with nose guard ---
    gid_h = 'rustic_m_envoy_visor'
    a, b, up, bk, left = head_frame()
    parts_h = []

    visor_paint = P('silver', 0.02, [
        B('top', 0.0, 0.008, 'solid', 'white'),
        B('bottom', 0.0, 0.008, 'solid', 'iron'),
    ], [
        PN(0.47, 0.53, 'diamonds', 'iron', 'silver', 0.04),
    ], fabric='metal.iron')
    # Smooth convex wrap-around visor with top & bottom return flanges sealing cleanly against the forehead/cheeks
    angs_v = np.linspace(0.34 * math.pi, 1.66 * math.pi, 28)  # wraps across front eyes & temples (pi = -Y front)
    visor_rows = [
        (0.24, 0.094, 0.118, 0.008, 1.0),
        (0.24, 0.106, 0.136, 0.020, 1.0),
        (0.30, 0.107, 0.138, 0.022, 0.65),
        (0.36, 0.107, 0.138, 0.022, 0.25),
        (0.42, 0.107, 0.138, 0.022, 0.0),
        (0.48, 0.106, 0.136, 0.020, 0.0),
        (0.50, 0.094, 0.116, 0.006, 0.0),
    ]
    V_grid = []
    for f, rx, ry, fwd_shift, dip_w in visor_rows:
        c = a + (b - a) * f
        row_pts = []
        for an in angs_v:
            nose_dip = -0.024 * dip_w * (max(0.0, -math.cos(an)) ** 3)
            row_pts.append(c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - fwd_shift) + up * nose_dip)
        V_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_visor', np.array(V_grid), False, ['body'] * len(V_grid), visor_paint, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Glacier-Pass Polished Silver Ocular Visor', 'head', 'rustic_clansmen', parts_h,
                               covers_hair=False, covers_face=False)

    # --- TORSO: Snow-white diamond-quilted gambeson greatcoat, oversized standing collar, bell-cap sleeves & cyan phial amulet ---
    gid_t = 'rustic_m_envoy_gambeson'
    parts_t = []

    # 1. Inner dark-umber pleated shirt & diamond-quilted white gambeson coat with front V-opening & leg-slit wrap skirt!
    quilt_coat_paint = P('white', 0.04, [
        B('bottom', 0.0, 0.02, 'solid', 'slate'),
    ], [
        # Diamond-quilted snow-white exterior around back, sides, and lower wrap skirt
        PN(0.0, 0.43, 'diamond_quilt', 'white', 'slate', 0.44),
        PN(0.57, 1.0, 'diamond_quilt', 'white', 'slate', 0.44),
        # Center-front lower diamond-quilted apron below waist, with dark ribbed inner shirt visible at upper chest (down=0.38)!
        PN(0.43, 0.57, 'diamond_quilt', 'white', 'slate', 0.44),
        PN(0.43, 0.57, 'fluted', 'umber', 'soot', 0.06, down=0.36),
        # Dark slate-lined vertical slit on the left front skirt below the knee
        PN(0.56, 0.60, 'solid', 'soot', 'slate', 0.20),
    ], fabric='cloth.canvas')
    # Close-fitting snow-white & umber inner neck/shoulder yoke tucked cleanly INSIDE the standing collar so zero skin is visible from above!
    parts_t.append(collar_disc(gid_t + '_inner_yoke', 0.072, P('white', 0.04, [B('top', 0.0, 0.035, 'solid', 'umber')],
                               [PN(0.42, 0.58, 'fluted', 'umber', 'soot', 0.05)]),
                               drop=0.035, rows=5, n=40, scallop=0.0, ease=0.008, z_off=-0.004, rigid_joint='Spine2'))

    parts_t.append(torso_tube(gid_t + '_coat', TOP + 0.01, KNEE - 0.14, 0.018, quilt_coat_paint,
                              ease_bottom=0.026, n=52, hang_from=WAIST - 0.02, flare=0.09, group_below=CROTCH + 0.02, hull_from=WAIST))

    # 2. Glowing cyan-turquoise crystal phial pendant on a black-and-gold cord necklace + golden knotwork waist clasp!
    for k in range(13):
        u_b = k / 12.0
        ang_b = (u_b - 0.5) * math.pi
        bx_off = math.sin(ang_b) * 0.055
        bz = TOP - 0.01 - math.cos(ang_b) * 0.16
        b_pos = _front(bz, 0.032) + np.array([bx_off, 0.0, 0.0])
        parts_t.append(blob(f'{gid_t}_cord_{k}', b_pos, (0.010, 0.010, 0.012),
                            P('gold' if k % 2 == 0 else 'soot', 0.02), n=6, rows=4, out=FRONT, rigid_joint='Spine2'))

    phial_c = _front(CHEST - 0.04, 0.036)
    parts_t.append(blob(gid_t + '_phial', phial_c, (0.034, 0.022, 0.072),
                        P('turq', 0.02, [B('top', 0.0, 0.005, 'solid', 'gold'), B('bottom', 0.0, 0.005, 'solid', 'gold')]),
                        n=12, rows=6, out=FRONT, rigid_joint='Spine2'))

    clasp_c = _front(WAIST - 0.01, 0.036)
    parts_t.append(blob(gid_t + '_belt_clasp', clasp_c, (0.078, 0.018, 0.048),
                        P('gold', 0.02, [B('top', 0.0, 0.01, 'solid', 'ochre')], fabric='metal.gold'),
                        n=12, rows=5, out=FRONT, rigid_joint='Spine'))

    # 3. Oversized standing/hooded diamond-quilted snow-collar framing the head and neck!
    collar_paint = P('white', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'slate'),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'white', 'slate', 0.16),
    ], fabric='cloth.canvas')
    zs_col = np.linspace(TOP + 0.135, TOP - 0.015, 7)
    angs_col = np.linspace(-0.80 * math.pi, 0.80 * math.pi, 36)
    Col_pts = np.array([
        ring_points(spine_at(min(z, TOP + 0.02)), np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), angs_col,
                    0.022 + 0.046 * (1.0 - k / 6.0), rmin=0.06) + np.array([0.0, 0.0, max(0.0, z - (TOP + 0.02))])
        for k, z in enumerate(zs_col)
    ])
    parts_t.append(Part(gid_t + '_collar', Col_pts, False, ['body'] * 7, collar_paint, rigid_joint='Spine2'))

    # 4. Puffed diamond-quilted bell-cap shoulder pauldrons with dark charcoal upper-arm panels over dark charcoal sleeves!
    cap_sleeve_paint = P('white', 0.04, [
        B('bottom', 0.0, 0.08, 'diamond_quilt', 'white', 'slate', 0.10),
        B('top', 0.0, 0.06, 'diamond_quilt', 'slate', 'soot', 0.10),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'white', 'slate', 0.16),
    ], fabric='cloth.canvas')
    parts_t.append(pauldron(gid_t + '_bellcap_L', L, cap_sleeve_paint, reach=0.60, ease=0.050, flare_end=1.35))
    parts_t.append(pauldron(gid_t + '_bellcap_R', R, cap_sleeve_paint, reach=0.60, ease=0.050, flare_end=1.35))

    sl_paint = P('soot', 0.05, [
        B('top', 0.0, 0.14, 'diamond_quilt', 'slate', 'soot', 0.08),
    ], fabric='cloth.wool')
    parts_t += sleeves(gid_t, 'wrist', 0.022, sl_paint, ease_end=0.032, rows=9, n=18)

    entry_t = assemble_garment(gid_t, 'Glacier-Pass Diamond-Quilted White Gambeson & Phial Amulet', 'torso', 'rustic_clansmen', parts_t)

    # --- FEET: Sleek silver-and-black pointed chevalier boots with black leather shin-guards ---
    gid_f = 'rustic_m_envoy_boots'
    parts_f = []
    boot_sole_paint = P('soot', 0.04, fabric='leather.polished')
    boot_shaft_paint = P('soot', 0.04, [
        B('bottom', 0.0, 0.16, 'solid', 'silver'),
    ], fabric='leather.polished')
    boot_foot_paint = P('silver', 0.02, [
        B('bottom', 0.0, 0.05, 'solid', 'soot'),  # Pointed black toe-cap!
    ], fabric='metal.iron')

    for s in (L, R):
        foot, toe, tip, knee = J(s + 'Foot'), J(s + 'ToeBase'), J(s + 'ToeBase', 'tail'), J(s + 'Leg')
        heel = np.array([foot[0], foot[1] + 0.05, 0.0])
        front = np.array([tip[0], tip[1] - 0.020, 0.0])
        axis = front - heel
        Q_sole = []
        for k in range(10):
            c = heel + axis * k / 9.0
            c[2] = 0.010
            w_s = 0.048 + 0.010 * math.sin(math.pi * min(1.0, k / 9.0 * 1.2))
            Q_sole.append([c + np.array([math.cos(an) * w_s, 0, math.sin(an) * 0.010]) for an in np.linspace(0, 2 * math.pi, 16, endpoint=False)])
        parts_f.append(Part(f'{gid_f}_sole_{s[0]}', np.array(Q_sole), True, ['body'] * 10, boot_sole_paint))

        up_pt = foot + (knee - foot) * 0.72
        parts_f.append(limb_tube(f'{gid_f}_shaft_{s[0]}', up_pt, np.array([foot[0], foot[1], 0.03]), 0.024,
                                 boot_shaft_paint, n=18, rows=9, ease_end=0.014, rmax=0.14))
        hb = first_hit(np.array([foot[0], foot[1], 0.035]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05
        fa = np.array([foot[0], foot[1] + hb - 0.008, 0.04])
        fb = np.array([tip[0], tip[1] - 0.020, 0.022])
        u_foot = limb_tube(f'{gid_f}_foot_{s[0]}', fa, fb, 0.014, boot_foot_paint, n=18, rows=12, ease_end=0.012, rmax=0.09)
        for k in (0, -1):
            c = u_foot.P[k].mean(0)
            u_foot.P[k] = c + (u_foot.P[k] - c) * 0.28
        parts_f.append(u_foot)

    entry_f = assemble_garment(gid_f, 'Glacier-Pass Silver & Black Pointed Chevalier Boots', 'feet', 'rustic_clansmen', parts_f)
    return [entry_t, entry_h, entry_f]


# ===============================================================================================================
# IZANI ARMOR 1: Izani Empire — "Relic-Guard Praetorian / Hex-Plate Cataphract" (Heavy Relic Plate)
# ===============================================================================================================
def build_iziz_praetorian():
    # --- HEADPIECE: Imperial bronze-and-gold crested helm, ghost-white Ancient hex faceplate, turquoise ocular visor & solar halo ---
    gid_h = 'iziz_m_praetorian_helm'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Bronze-and-gold bowl helm with verdigris brow band & neck-guard
    bowl_paint = P('bronze', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.055, 'fret', 'gold', 'verdigris', 0.045),
        B('top', 0.0, 0.035, 'rays', 'gold', 'bronze', 0.04),
    ], fabric='metal.bronze')
    parts_h.append(tower_hat(gid_h + '_bowl', 0.16, lambda s: 1.06 * (1.0 - 0.38 * (s ** 2.1)), bowl_paint,
                             f=0.42, ease=0.028, rows=10, n=36))

    # Flared bronze-and-gold lobster-tail neck guard (shikoro) at back and sides of helm
    neck_paint = P('bronze', 0.03, [
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'lorica_lames', 'gold', 'bronze', 0.10)], fabric='metal.bronze')
    fs_n = np.linspace(-0.22, 0.42, 6)
    angs_n = np.linspace(-0.62 * math.pi, 0.62 * math.pi, 26)
    N_grid = []
    for k_n, f in enumerate(fs_n):
        f_ray = max(f, 0.36)
        c_ray = a + (b - a) * f_ray
        c = a + (b - a) * f
        flare_n = 0.028 + 0.032 * (1.0 - k_n / 5.0)
        N_grid.append([p + (c - c_ray) + bk * (0.018 * (1.0 - k_n / 5.0))
                       for p in ring_points(c_ray, bk, left, angs_n, flare_n, rmin=0.05, rmax=0.20)])
    parts_h.append(Part(gid_h + '_neckguard', np.array(N_grid), False, ['body'] * len(fs_n), neck_paint, rigid_joint='Head'))

    # 2. Hinged ghost-white salvaged Ancient hexagonal-lattice faceplate with glowing turquoise ocular visor slit!
    # Includes top & bottom return flanges that seal into the helmet bowl so zero gap is visible from above!
    face_paint = P('ancient', 0.02, [], [
        PN(0.0, 1.0, 'ancient_visor', 'ancient', 'slate', 0.18),
    ], fabric='metal.iron')
    angs_f = np.linspace(0.55 * math.pi, 1.45 * math.pi, 26)
    f_rows = [
        (-0.05, 0.092, 0.116, 0.006, 0.004),
        (-0.04, 0.108, 0.136, 0.020, 0.020),
        (0.05, 0.109, 0.138, 0.022, 0.022),
        (0.14, 0.110, 0.139, 0.022, 0.022),
        (0.23, 0.110, 0.140, 0.022, 0.022),
        (0.32, 0.110, 0.140, 0.022, 0.022),
        (0.41, 0.109, 0.139, 0.022, 0.022),
        (0.49, 0.108, 0.136, 0.020, 0.018),
        (0.53, 0.100, 0.124, 0.010, 0.006),
        (0.55, 0.088, 0.108, 0.000, 0.000),
    ]
    F_grid = []
    for f, rx, ry, fwd_shift, keel_amp in f_rows:
        c = a + (b - a) * f
        row_pts = []
        for an in angs_f:
            keel = keel_amp * (max(0.0, -math.cos(an)) ** 2)
            row_pts.append(c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - fwd_shift - keel))
        F_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_faceplate', np.array(F_grid), False, ['body'] * len(F_grid), face_paint, rigid_joint='Head'))

    # 3. Imperial golden Sun-Halo crest & turquoise solar orb finial atop the helm!
    c_halo = a + (b - a) * 0.72 + bk * 0.01
    parts_h.append(blob(gid_h + '_orb', c_halo + up * 0.14, (0.065, 0.032, 0.065),
                        P('turq', 0.02, [B('top', 0.0, 0.015, 'solid', 'gold')]), n=14, rows=5, out=-bk, rigid_joint='Head'))
    ray_paint = P('gold', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'sunorange')], fabric='metal.gold')
    for k in range(11):
        ang = (-95.0 + 190.0 * (k / 10.0)) * math.pi / 180.0
        dir_r = left * math.sin(ang) + up * math.cos(ang)
        dir_r /= np.linalg.norm(dir_r)
        parts_h.append(horn(f'{gid_h}_ray_{k}', [c_halo + up * 0.06 + dir_r * 0.06, c_halo + up * 0.06 + dir_r * 0.22],
                            0.014, 0.003, ray_paint, n=8, rows=4, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Praetorian Ancient Hex-Visor Helm & Solar Halo Crest', 'head', 'izani', parts_h,
                               covers_hair=True, covers_face=True)

    # --- TORSO: Ghost-white Ancient hex-plate chest core, segmented bronze lorica lames, crimson pteruges & imperial cape ---
    gid_t = 'iziz_m_praetorian_lorica'
    parts_t = []

    # 1. Crimson silk arming tunic + double-tiered gold-studded crimson-and-verdigris leather pteruges skirt!
    pter_paint = P('crimson', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.18, 'rays', 'crimson', 'soot', 0.048),
        B('bottom', 0.18, 0.21, 'solid', 'gold'),
        B('bottom', 0.21, 0.34, 'rays', 'verdigris', 'soot', 0.048),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_pteruges', WAIST + 0.02, KNEE + 0.06, 0.028, pter_paint,
                              n=48, rows=12, hang_from=WAIST, flare=0.22, group_below=CROTCH + 0.02, hull_from=WAIST))

    # 2. Segmented bronze-and-gold lorica segmentata torso cuirass
    lorica_paint = P('bronze', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'fret', 'gold', 'verdigris', 0.045),
    ], [
        PN(0.0, 1.0, 'lorica_lames', 'gold', 'bronze', 0.24),
    ], fabric='metal.bronze')
    parts_t.append(torso_tube(gid_t + '_lorica', TOP + 0.005, WAIST - 0.03, 0.026, lorica_paint,
                              n=48, rows=12, hull_from=CHEST + 0.02))

    # 3. Rigid 3D salvaged Ancient ghost-white hexagonal composite chestplate & backplate (100% locked to Spine2!)
    hex_plate_paint = P('ancient', 0.02, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'ancient_hex', 'ancient', 'slate', 0.14),
    ], fabric='metal.iron')
    zs_pl = np.linspace(TOP - 0.015, WAIST + 0.04, 8)
    for tag, ang_span, out_sign in (('chestplate', (0.64 * math.pi, 1.36 * math.pi), -1.0),
                                    ('backplate', (-0.34 * math.pi, 0.34 * math.pi), 1.0)):
        angs_pl = np.linspace(ang_span[0], ang_span[1], 24)
        Pl_grid = []
        for k_z, z in enumerate(zs_pl):
            c = spine_at(z)
            row_pts = []
            for idx_a, p in enumerate(ring_points(c, np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), angs_pl, 0.036, bvh=BVH_T)):
                an = angs_pl[idx_a]
                keel = 0.016 * math.sin(math.pi * k_z / 7.0) * (abs(math.cos(an)) ** 2)
                row_pts.append(p + np.array([0.0, out_sign * keel, 0.0]))
            Pl_grid.append(row_pts)
        parts_t.append(Part(f'{gid_t}_{tag}', np.array(Pl_grid), False, ['body'] * len(zs_pl), hex_plate_paint, rigid_joint='Spine2'))

    # Raised turquoise-and-gold Solar Orb boss in the center of the Ancient hex chestplate!
    orb_c = _front(CHEST - 0.01, 0.054)
    parts_t.append(blob(gid_t + '_solar_boss', orb_c, (0.095, 0.024, 0.095),
                        P('gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'turq')], fabric='metal.gold'),
                        n=16, rows=6, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_solar_core', orb_c + np.array([0.0, -0.008, 0.0]), (0.052, 0.020, 0.052),
                        P('turq', 0.02), n=12, rows=5, out=FRONT, rigid_joint='Spine2'))

    # 4. Asymmetrical Relic Pauldrons: Oversized ghost-white Ancient hex cataphract shield on Left, bronze lames on Right!
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, hex_plate_paint, reach=0.56, ease=0.044, flare_end=1.22, span=1.85))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, lorica_paint, reach=0.48, ease=0.038, flare_end=1.10, span=1.70))

    # Crimson arming sleeves + rigid bronze-and-gold forearm vambraces (locked to LeftForeArm / RightForeArm!)
    parts_t += sleeves(gid_t, 'elbow', 0.018, P('crimson', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'gold')]), ease_end=0.024, rows=6)
    vamb_paint = P('bronze', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'gold'),
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'ancient_hex', 'ancient', 'bronze', 0.09)], fabric='metal.bronze')
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        vb = limb_tube(f'{gid_t}_vambrace_{s[0]}', e_j + (h_j - e_j) * 0.10, e_j + (h_j - e_j) * 0.88,
                       0.018, vamb_paint, n=16, rows=6, bvh=BVH_A, rmax=0.10)
        vb.rigid_joint = s + 'ForeArm'
        parts_t.append(vb)

    # 5. Sweeping sun-orange and verdigris imperial paludamentum back cape
    cape_paint = P('sunorange', 0.04, [
        B('bottom', 0.0, 0.05, 'fret', 'gold', 'verdigris', 0.055),
        B('bottom', 0.05, 0.07, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_cape', TOP - 0.01, KNEE - 0.08, 0.044, cape_paint,
                              n=32, arc=(-0.46 * math.pi, 0.46 * math.pi), hang_from=SHOULDER - 0.02,
                              flare=0.24, group_below=CROTCH + 0.02, over_arms=True))

    entry_t = assemble_garment(gid_t, 'Praetorian Ancient Hex-Plate Lorica, Pteruges & Sun-Cape', 'torso', 'izani', parts_t)

    # --- FEET: Rigid fluted bronze-and-gold shin greaves with ghost-white Ancient hex knee-cops over crimson caligae ---
    gid_f = 'iziz_m_praetorian_greaves'
    parts_f = []
    greave_paint = P('bronze', 0.03, [
        B('top', 0.0, 0.06, 'ancient_hex', 'ancient', 'slate', 0.07),
        B('top', 0.06, 0.08, 'solid', 'gold'),
        B('bottom', 0.0, 0.03, 'solid', 'gold'),
    ], [
        PN(0.35, 0.65, 'fluted', 'gold', 'bronze', 0.08),
    ], fabric='metal.bronze')
    boot_paint = P('crimson', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='leather.polished')

    for s in (L, R):
        foot, toe, tip, knee = J(s + 'Foot'), J(s + 'ToeBase'), J(s + 'ToeBase', 'tail'), J(s + 'Leg')
        # Rigid shin greave + hex poleyn knee-cop locked 100% to LeftLeg / RightLeg!
        grv_top = foot + (knee - foot) * 1.06
        grv_bot = np.array([foot[0], foot[1], 0.055])
        grv = limb_tube(f'{gid_f}_greave_{s[0]}', grv_top, grv_bot, 0.024, greave_paint, n=18, rows=9, ease_end=0.016, rmax=0.14)
        grv.rigid_joint = s + 'Leg'
        parts_f.append(grv)

        # Sculpted 3D ghost-white hexagonal knee-cop boss at the patella
        pat_c = knee + np.array([0.0, -0.068, 0.01])
        parts_f.append(blob(f'{gid_f}_poleyn_{s[0]}', pat_c, (0.085, 0.032, 0.095),
                            P('ancient', 0.02, [B('top', 0.0, 0.015, 'solid', 'gold')]),
                            n=12, rows=5, out=FRONT, rigid_joint=s + 'Leg'))

        hb = first_hit(np.array([foot[0], foot[1], 0.035]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05
        fa = np.array([foot[0], foot[1] + hb - 0.008, 0.04])
        fb = np.array([tip[0], tip[1] - 0.016, 0.024])
        u_foot = limb_tube(f'{gid_f}_foot_{s[0]}', fa, fb, 0.014, boot_paint, n=18, rows=10, ease_end=0.014, rmax=0.09)
        for k in (0, -1):
            c = u_foot.P[k].mean(0)
            u_foot.P[k] = c + (u_foot.P[k] - c) * 0.28
        parts_f.append(u_foot)

    entry_f = assemble_garment(gid_f, 'Praetorian Bronze Greaves & Ancient Hex Knee-Cops', 'feet', 'izani', parts_f)
    return [entry_t, entry_h, entry_f]


# ===============================================================================================================
# IZANI ARMOR 2: Izani Salvage Guilds & Watch — "Watch Auxilia / Salvage-Scale Lamellar" (Medium Guild Armor)
# ===============================================================================================================
def build_iziz_watch():
    # --- HEADPIECE: Wide-brimmed copper Watch kettle-sallet, moss turban wrap & riveted white Ancient nasal-guard ---
    gid_h = 'iziz_m_watch_sallet'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Oiled moss-green desert neck-cloth / couvre-nuque protecting neck & ears
    wrap_paint = P('moss', 0.08, [
        B('bottom', 0.0, 0.025, 'solid', 'bark'),
        B('top', 0.0, 0.02, 'solid', 'sand'),
    ], fabric='cloth.oiled')
    fs_w = np.linspace(-0.28, 0.44, 7)
    angs_w = np.linspace(-0.68 * math.pi, 0.68 * math.pi, 28)
    W_grid = []
    for k_w, f in enumerate(fs_w):
        f_ray = max(f, 0.36)
        c_ray = a + (b - a) * f_ray
        c = a + (b - a) * f
        W_grid.append([p + (c - c_ray) + bk * (0.014 * (1.0 - k_w / 6.0))
                       for p in ring_points(c_ray, bk, left, angs_w, 0.022 + 0.020 * (1.0 - k_w / 6.0), rmin=0.05, rmax=0.20)])
    parts_h.append(Part(gid_h + '_wrap', np.array(W_grid), False, ['body'] * len(fs_w), wrap_paint, rigid_joint='Head'))

    # 2. Copper-and-iron Watch kettle-sallet dome & wide sloped sun/shrapnel brim
    sallet_paint = P('copper', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'ancient'),
        B('top', 0.0, 0.04, 'rays', 'slate', 'copper', 0.05),
    ], fabric='metal.bronze')
    parts_h.append(tower_hat(gid_h + '_dome', 0.145, lambda s: 1.05 * (1.0 - 0.44 * (s ** 2.0)), sallet_paint,
                             f=0.48, ease=0.024, rows=9, n=36))
    parts_h.append(brim(gid_h + '_brim', 0.46, 0.095, sallet_paint, ease=0.022, rows=5, n=36, droop=0.032))

    # 3. Riveted ghost-white Ancient salvage brow-plate & nasal bar descending over the nose bridge!
    nasal_top = a + (b - a) * 0.48 - bk * 0.132
    nasal_bot = a + (b - a) * 0.18 - bk * 0.148
    parts_h.append(horn(gid_h + '_nasal', [nasal_top, nasal_bot], 0.018, 0.012,
                        P('ancient', 0.02, [B('top', 0.0, 0.01, 'solid', 'copper')]), n=8, rows=4, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Watch Kettle-Sallet, Moss Neck-Wrap & Ancient Nasal Bar', 'head', 'izani', parts_h,
                               covers_hair=True, covers_face=False)

    # --- TORSO: Copper & white-salvage lamellar scale cuirass, padded sand gambeson, hex shoulder shield & canister bandolier ---
    gid_t = 'iziz_m_watch_cuirass'
    parts_t = []

    # 1. Padded sand-and-saddle-leather quilted gambeson skirt with chevron border
    gamb_paint = P('sand', 0.07, [
        B('bottom', 0.0, 0.02, 'solid', 'bark'),
        B('bottom', 0.02, 0.06, 'chevron', 'saddle', 'sand', 0.06),
        B('bottom', 0.06, 0.075, 'solid', 'copper'),
    ], [
        PN(0.0, 0.45, 'quilt', 'saddle', 'sand', 0.12),
        PN(0.55, 1.0, 'quilt', 'saddle', 'sand', 0.12),
    ], fabric='cloth.quilted')
    parts_t.append(torso_tube(gid_t + '_gambeson', WAIST + 0.02, CROTCH - 0.10, 0.022, gamb_paint,
                              n=44, rows=9, hang_from=WAIST, flare=0.09, group_below=CROTCH + 0.02, hull_from=WAIST))

    # 2. Copper, bronze & salvaged white Ancient scale lamellar cuirass + thigh tassets!
    lam_paint = P('copper', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'saddle'),
        B('bottom', 0.0, 0.03, 'solid', 'ancient'),
    ], [
        PN(0.0, 1.0, 'lamellar_scale', 'saddle', 'copper', 0.22),
    ], fabric='metal.bronze')
    parts_t.append(torso_tube(gid_t + '_cuirass', TOP + 0.005, CROTCH + 0.03, 0.028, lam_paint,
                              n=48, rows=14, hang_from=WAIST - 0.02, flare=0.14, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # 3. Asymmetrical Left Shoulder Salvaged Ancient Hex-Plate Buckler & Right Saddle-Leather Spaulder
    anc_sh_paint = P('ancient', 0.02, [
        B('bottom', 0.0, 0.025, 'solid', 'copper'),
        B('top', 0.0, 0.02, 'solid', 'slate'),
    ], [PN(0.0, 1.0, 'ancient_hex', 'ancient', 'slate', 0.10)], fabric='metal.iron')
    parts_t.append(pauldron(gid_t + '_hex_plate_L', L, anc_sh_paint, reach=0.54, ease=0.042, flare_end=1.18, span=1.80))
    parts_t.append(pauldron(gid_t + '_leather_sh_R', R, P('saddle', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'copper')]),
                            reach=0.42, ease=0.032, flare_end=0.95))

    # 4. Diagonal saddle-leather bandolier with 3D copper-and-turquoise relic canisters + Watch utility belt pouches!
    band_paint = P('saddle', 0.05, [
        B('top', 0.0, 0.01, 'solid', 'copper'),
        B('bottom', 0.0, 0.01, 'solid', 'copper'),
    ], fabric='leather.polished')
    parts_t.append(band(gid_t + '_bandolier', WAIST - 0.02, SHOULDER + 0.02, 0.065, 0.038, band_paint, high=math.pi * 0.42, rows=4))

    can_paint = P('copper', 0.03, [B('top', 0.0, 0.015, 'solid', 'turq'), B('bottom', 0.0, 0.015, 'solid', 'ancient')], fabric='metal.bronze')
    for k_c, (x_off, z_off) in enumerate(((-0.065, CHEST + 0.03), (-0.015, CHEST - 0.03), (0.035, CHEST - 0.09))):
        c_pos = _front(z_off, 0.046) + np.array([x_off, 0.0, 0.0])
        parts_t.append(blob(f'{gid_t}_canister_{k_c}', c_pos, (0.032, 0.028, 0.068), can_paint,
                            n=10, rows=5, out=FRONT, rigid_joint='Spine2'))

    # Watch utility belt & 2 side relic pouches (locked to Hips)
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.01, WAIST - 0.045, 0.036, band_paint, n=40, rows=3))
    for sd in (-1, 1):
        p_c = spine_at(WAIST - 0.03) + np.array([sd * 0.165, -0.04, 0.0])
        parts_t.append(blob(f'{gid_t}_pouch_{sd}', p_c, (0.055, 0.075, 0.085),
                            P('saddle', 0.05, [B('top', 0.0, 0.02, 'solid', 'ancient')]),
                            n=10, rows=5, out=np.array([sd * 1.0, -0.3, 0.0]), rigid_joint='Hips'))

    parts_t += sleeves(gid_t, 'wrist', 0.016, P('sand', 0.07, [B('bottom', 0.0, 0.12, 'lamellar_scale', 'saddle', 'copper', 0.08)]),
                       ease_end=0.022, rows=9)

    entry_t = assemble_garment(gid_t, 'Watch Salvage-Scale Lamellar Cuirass, Hex-Pauldron & Bandolier', 'torso', 'izani', parts_t)

    # --- FEET: Tall saddle-leather Watch boots with rigid copper shin-splints & white Ancient ankle-plates ---
    gid_f = 'iziz_m_watch_boots'
    parts_f = []
    boot_paint = P('saddle', 0.05, [
        B('top', 0.0, 0.03, 'solid', 'copper'),
        B('bottom', 0.0, 0.04, 'ancient_hex', 'ancient', 'slate', 0.06),
    ], [
        PN(0.38, 0.62, 'lorica_lames', 'copper', 'ancient', 0.08),
    ], fabric='leather.polished')

    for s in (L, R):
        foot, toe, tip, knee = J(s + 'Foot'), J(s + 'ToeBase'), J(s + 'ToeBase', 'tail'), J(s + 'Leg')
        up_pt = foot + (knee - foot) * 0.78
        sh = limb_tube(f'{gid_f}_shaft_{s[0]}', up_pt, np.array([foot[0], foot[1], 0.04]), 0.022,
                       boot_paint, n=18, rows=9, ease_end=0.015, rmax=0.14)
        sh.rigid_joint = s + 'Leg'
        parts_f.append(sh)

        hb = first_hit(np.array([foot[0], foot[1], 0.035]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05
        fa = np.array([foot[0], foot[1] + hb - 0.008, 0.04])
        fb = np.array([tip[0], tip[1] - 0.016, 0.024])
        u_foot = limb_tube(f'{gid_f}_foot_{s[0]}', fa, fb, 0.014, P('bark', 0.06, [B('top', 0.0, 0.02, 'solid', 'copper')]),
                           n=18, rows=10, ease_end=0.014, rmax=0.09)
        for k in (0, -1):
            c = u_foot.P[k].mean(0)
            u_foot.P[k] = c + (u_foot.P[k] - c) * 0.28
        parts_f.append(u_foot)

    entry_f = assemble_garment(gid_f, 'Watch Splinted Saddle-Leather & Ancient-Plate Boots', 'feet', 'izani', parts_f)
    return [entry_t, entry_h, entry_f]


# ===============================================================================================================
# IZANI ARMOR 3: Izani Palace Skirmisher — "Sun-Spear Skirmisher / Verdigris Mirror-Harness" (Light Martial Set)
# ===============================================================================================================
def build_iziz_skirmisher():
    # --- HEADPIECE: Open-faced verdigris & gold war-diadem, bronze cheek-guards & tall sun-orange sagittal crest ---
    gid_h = 'iziz_m_skirmisher_crest'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Sculpted verdigris-and-gold open-faced war diadem headband sitting cleanly on the forehead above the eyes
    diadem_paint = P('verdigris', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
        B('top', 0.012, 0.050, 'fret', 'gold', 'verdigris', 0.045),
    ], fabric='metal.bronze')
    parts_h.append(head_rings(gid_h + '_diadem', 0.50, 0.74, 0.022, diadem_paint, n=36, rows=5, apex=False))

    # 2. Hinged bronze-and-verdigris cheek guards (paragnathides) framing the jaw
    cheek_paint = P('gold', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'verdigris')], fabric='metal.gold')
    for sd, tag in ((-1, 'R'), (1, 'L')):
        ch_top = a + (b - a) * 0.38 + left * sd * 0.088 - bk * 0.045
        ch_out = left * sd * 0.85 - bk * 0.52
        parts_h.append(flap(f'{gid_h}_cheek_{tag}', ch_top, 0.058, 0.115, ch_out, cheek_paint,
                            cols=4, rows=5, sway=0.008, push=False, rigid_joint='Head'))

    # 3. Tall sweeping sagittal plume crest of sun-orange and verdigris feathers mounted on a gold crest-box!
    crest_paint = P('sunorange', 0.05, [
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
        B('top', 0.0, 0.04, 'rays', 'verdigris', 'sunorange', 0.025),
    ])
    c_crest = a + (b - a) * 0.72
    for k in range(9):
        u_c = k / 8.0
        ang_c = (-55.0 + 115.0 * u_c) * math.pi / 180.0
        dir_c = up * math.cos(ang_c) + bk * math.sin(ang_c)
        dir_c /= np.linalg.norm(dir_c)
        p0 = c_crest + dir_c * 0.05
        p1 = c_crest + dir_c * (0.21 + 0.04 * math.sin(math.pi * u_c))
        parts_h.append(horn(f'{gid_h}_plume_{k}', [p0, p1], 0.022, 0.006, crest_paint, n=8, rows=4, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Sun-Spear Verdigris War-Diadem, Cheek-Guards & Sun-Crest', 'head', 'izani', parts_h,
                               covers_hair=False, covers_face=False)

    # --- TORSO: Crossed verdigris-and-gold chest harness, hammered-gold Solar Mirror pectoral & embossed copper vambraces ---
    gid_t = 'iziz_m_skirmisher_harness'
    parts_t = []

    # 1. Crossed verdigris-and-gold leather chest straps + wide bronze waist cinch
    strap_paint = P('verdigris', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
        B('top', 0.012, 0.045, 'diamonds', 'gold', 'verdigris', 0.04),
    ], fabric='leather.polished')
    parts_t.append(band(gid_t + '_strap1', WAIST + 0.01, SHOULDER + 0.02, 0.068, 0.016, strap_paint, high=math.pi * 0.44, rows=4))
    parts_t.append(band(gid_t + '_strap2', WAIST + 0.01, SHOULDER + 0.02, 0.068, 0.020, strap_paint, high=-math.pi * 0.44, rows=4))
    parts_t.append(torso_tube(gid_t + '_cinch', WAIST + 0.04, WAIST - 0.03, 0.018,
                              P('gold', 0.03, [B('top', 0.01, 0.05, 'fret', 'verdigris', 'gold', 0.045)], fabric='metal.gold'),
                              n=40, rows=4))

    # 2. Large circular hammered-gold & turquoise Solar Mirror pectoral disc on chest + dorsal mirror on back (locked to Spine2!)
    mirror_paint = P('gold', 0.02, [
        B('top', 0.0, 0.03, 'rays', 'sunorange', 'gold', 0.03),
        B('bottom', 0.0, 0.02, 'solid', 'verdigris'),
    ], fabric='metal.gold')
    f_mir = _front(CHEST - 0.01, 0.028)
    parts_t.append(blob(gid_t + '_pectoral_disc', f_mir, (0.165, 0.024, 0.165), mirror_paint,
                        n=18, rows=6, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_pectoral_gem', f_mir + np.array([0.0, -0.008, 0.0]), (0.068, 0.020, 0.068),
                        P('turq', 0.02), n=14, rows=5, out=FRONT, rigid_joint='Spine2'))

    b_mir = spine_at(CHEST - 0.01) + np.array([0.0, 0.135, 0.0])
    parts_t.append(blob(gid_t + '_back_disc', b_mir, (0.145, 0.022, 0.145), mirror_paint,
                        n=16, rows=5, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))

    # 3. Patinated verdigris-and-gold winged spaulders + rigid embossed copper vambraces
    spaulder_paint = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('top', 0.0, 0.06, 'rays', 'gold', 'verdigris', 0.04),
    ], fabric='metal.bronze')
    parts_t.append(pauldron(gid_t + '_spaulder_L', L, spaulder_paint, reach=0.40, ease=0.028, flare_end=1.12))
    parts_t.append(pauldron(gid_t + '_spaulder_R', R, spaulder_paint, reach=0.40, ease=0.028, flare_end=1.12))

    vamb_paint = P('copper', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'gold'),
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
        B('top', 0.03, 0.14, 'fret', 'gold', 'verdigris', 0.04),
    ], fabric='metal.bronze')
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        vb = limb_tube(f'{gid_t}_vambrace_{s[0]}', e_j + (h_j - e_j) * 0.12, e_j + (h_j - e_j) * 0.88,
                       0.016, vamb_paint, n=16, rows=6, bvh=BVH_A, rmax=0.10)
        vb.rigid_joint = s + 'ForeArm'
        parts_t.append(vb)

    entry_t = assemble_garment(gid_t, 'Sun-Spear Golden Solar-Mirror Harness & Copper Vambraces', 'torso', 'izani', parts_t,
                               open_torso=True)

    # --- LEGS: Pleated cream-and-verdigris war-kilt with copper-studded pteruges & sun-orange tapestry apron ---
    gid_l = 'iziz_m_skirmisher_kilt'
    parts_l = []
    kilt_paint = P('cream', 0.05, [
        B('top', 0.0, 0.04, 'fret', 'gold', 'verdigris', 0.045),
        B('bottom', 0.0, 0.035, 'solid', 'verdigris'),
        B('bottom', 0.035, 0.085, 'rays', 'sunorange', 'gold', 0.04),
    ], [
        # Copper-studded pteruges strips around sides and back
        PN(0.0, 0.42, 'rays', 'copper', 'cream', 0.055, down=0.26),
        PN(0.58, 1.0, 'rays', 'copper', 'cream', 0.055, down=0.26),
        # Central sun-orange & gold geometric royal apron
        PN(0.42, 0.58, 'diamonds', 'gold', 'sunorange', 0.09),
    ], fabric='cloth.plain')
    parts_l.append(torso_tube(gid_l + '_kilt', WAIST + 0.01, KNEE + 0.05, 0.024, kilt_paint,
                              n=48, rows=12, hang_from=WAIST, flare=0.12, group_below=CROTCH + 0.02, hull_from=WAIST))

    entry_l = assemble_garment(gid_l, 'Sun-Spear Verdigris & Sun-Orange Pteruges War-Kilt', 'legs', 'izani', parts_l)
    return [entry_t, entry_h, entry_l]


# ===============================================================================================================
# BEAST RIDER ARMOR 1: Beast Riders — "Sky-Khan Cataphract / Saurian-Bone & Quetzal Lamellar" (Heavy Saddle-Lord)
# ===============================================================================================================
def build_beast_cataphract():
    # --- HEADPIECE: Bronze-and-bone steppe spangenhelm, dark-fur earflaps, saurian-fang visor & twin quetzal wing-crest ---
    gid_h = 'beast_m_cataphract_helm'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Plush dark-fur ear and neck flaps framing the head down to the collar
    fur_flap_paint = P('darkfur', 0.09, [
        B('bottom', 0.0, 0.03, 'solid', 'saffron'),
        B('top', 0.0, 0.04, 'solid', 'fur'),
    ], fabric='fur.short')
    fs_fl = np.linspace(-0.24, 0.44, 7)
    angs_fl = np.linspace(-0.66 * math.pi, 0.66 * math.pi, 28)
    Fl_grid = []
    for k_f, f in enumerate(fs_fl):
        f_ray = max(f, 0.36)
        c_ray = a + (b - a) * f_ray
        c = a + (b - a) * f
        Fl_grid.append([p + (c - c_ray) + bk * (0.016 * (1.0 - k_f / 6.0))
                        for p in ring_points(c_ray, bk, left, angs_fl, 0.026 + 0.022 * (1.0 - k_f / 6.0), rmin=0.05, rmax=0.20)])
    parts_h.append(Part(gid_h + '_earflaps', np.array(Fl_grid), False, ['body'] * len(fs_fl), fur_flap_paint, rigid_joint='Head'))

    # 2. Conical bronze-and-bone steppe spangenhelm bowl with bone-lamellar brow band
    helm_paint = P('bronze', 0.03, [
        B('bottom', 0.0, 0.045, 'bone_lamellar', 'bone', 'maroon', 0.06),
        B('bottom', 0.045, 0.060, 'solid', 'turq'),
        B('top', 0.0, 0.04, 'rays', 'saffron', 'bronze', 0.045),
    ], [
        PN(0.0, 1.0, 'quetzal_scale', 'turq', 'jungle', 0.14),
    ], fabric='metal.bronze')
    parts_h.append(tower_hat(gid_h + '_dome', 0.18, lambda s: 1.06 * (1.0 - 0.54 * (s ** 1.65)), helm_paint,
                             f=0.42, ease=0.032, rows=10, n=36))

    # 3. Carved ivory Saurian-Skull upper face-visor with turquoise ocular rims & 6 downward-jutting bone fangs!
    # Includes top & bottom return flanges that seal into the helmet bowl so zero transparency/gap is visible from above!
    visor_paint = P('bone', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'turq'),
        B('bottom', 0.0, 0.028, 'teeth', 'soot', 'bone', 0.035),
    ], [
        PN(0.36, 0.45, 'solid', 'soot', 'bone', 0.06, down=0.08),
        PN(0.55, 0.64, 'solid', 'soot', 'bone', 0.06, down=0.08),
        PN(0.46, 0.54, 'solid', 'turq', 'bone', 0.08),
    ])
    angs_v = np.linspace(0.54 * math.pi, 1.46 * math.pi, 26)
    v_rows = [
        (0.13, 0.095, 0.118, 0.008, 0.004),
        (0.14, 0.108, 0.136, 0.020, 0.018),
        (0.21, 0.109, 0.138, 0.022, 0.020),
        (0.28, 0.110, 0.139, 0.022, 0.020),
        (0.35, 0.110, 0.139, 0.022, 0.020),
        (0.42, 0.109, 0.138, 0.022, 0.020),
        (0.48, 0.108, 0.136, 0.020, 0.018),
        (0.52, 0.100, 0.124, 0.010, 0.006),
        (0.54, 0.088, 0.108, 0.000, 0.000),
    ]
    V_grid = []
    for f, rx, ry, fwd_shift, keel_amp in v_rows:
        c = a + (b - a) * f
        row_pts = []
        for an in angs_v:
            keel = keel_amp * (max(0.0, -math.cos(an)) ** 2)
            row_pts.append(c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - fwd_shift - keel))
        V_grid.append(row_pts)
    parts_h.append(Part(gid_h + '_fang_visor', np.array(V_grid), False, ['body'] * len(V_grid), visor_paint, rigid_joint='Head'))

    # 4. Towering twin-wing crest of iridescent emerald/turquoise quetzal plumes + 2 swept-back ivory horns!
    wing_paint = P('jungle', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'saffron'),
        B('bottom', 0.0, 0.03, 'solid', 'turq'),
        B('top', 0.025, 0.14, 'rays', 'mint', 'jungle', 0.03),
    ])
    for sd, tag in ((-1, 'R'), (1, 'L')):
        w_top = a + (b - a) * 0.68 + left * (sd * 0.085) - bk * 0.01
        w_out = left * (sd * 0.86) + up * 0.38 + bk * 0.32
        w_out /= np.linalg.norm(w_out)
        parts_h.append(flap(f'{gid_h}_wing_{tag}', w_top, 0.16, 0.24, w_out, wing_paint,
                            cols=6, rows=7, sway=0.02, push=False, rigid_joint='Head'))
        h_pts = [
            a + (b - a) * 0.74 + left * (sd * 0.055),
            a + (b - a) * 0.96 + left * (sd * 0.155) + bk * 0.05,
            a + (b - a) * 1.22 + left * (sd * 0.215) + bk * 0.14,
        ]
        parts_h.append(horn(f'{gid_h}_horn_{tag}', h_pts, 0.026, 0.005,
                            P('bone', 0.03, [B('bottom', 0.0, 0.05, 'solid', 'maroon'), B('top', 0.0, 0.05, 'solid', 'saffron')]),
                            n=10, rows=7, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Sky-Khan Saurian-Fang Spangenhelm & Quetzal Wing-Crest', 'head', 'beast_riders', parts_h,
                               covers_hair=True, covers_face=False)

    # --- TORSO: Saurian-bone & emerald quetzal-scale lamellar cuirass over Mongol-blue silk deel, skull breastplate & trophy belt ---
    gid_t = 'beast_m_cataphract_cuirass'
    parts_t = []

    # 1. Knee-length Mongol-blue & saffron silk arming deel with tiger-pelt & bone-lamellar tasset border
    deel_paint = P('mongolblue', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'saffron'),
        B('bottom', 0.03, 0.11, 'tiger_pelt', 'soot', 'saffron', 0.12),
        B('bottom', 0.11, 0.22, 'bone_lamellar', 'bone', 'maroon', 0.12),
    ], [
        PN(0.38, 0.42, 'solid', 'saffron', 'mongolblue', 0.20),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_deel', WAIST + 0.02, KNEE + 0.04, 0.024, deel_paint,
                              n=48, rows=12, hang_from=WAIST, flare=0.11, group_below=CROTCH + 0.02, hull_from=WAIST))

    # 2. Overlapping carved saurian-bone & emerald quetzal-scale lamellar torso cuirass
    cuirass_paint = P('jungle', 0.04, [
        B('top', 0.0, 0.03, 'solid', 'saffron'),
        B('bottom', 0.0, 0.09, 'bone_lamellar', 'bone', 'maroon', 0.12),
    ], [
        PN(0.0, 1.0, 'quetzal_scale', 'turq', 'jungle', 0.18),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_cuirass', TOP + 0.005, CROTCH + 0.04, 0.028, cuirass_paint,
                              n=48, rows=14, hang_from=WAIST - 0.02, flare=0.07, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # 3. Rigid 3D carved Saurian-Skull sternum breastplate & dorsal bone carapace (locked 100% to Spine2!)
    bone_plate_paint = P('bone', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'turq'),
        B('bottom', 0.0, 0.025, 'solid', 'maroon'),
    ], [
        PN(0.0, 1.0, 'bone_lamellar', 'bone', 'maroon', 0.14),
    ])
    zs_pl = np.linspace(TOP - 0.015, WAIST + 0.04, 8)
    for tag, ang_span, out_sign in (('chestplate', (0.64 * math.pi, 1.36 * math.pi), -1.0),
                                    ('backplate', (-0.34 * math.pi, 0.34 * math.pi), 1.0)):
        angs_pl = np.linspace(ang_span[0], ang_span[1], 24)
        Pl_grid = []
        for k_z, z in enumerate(zs_pl):
            c = spine_at(z)
            row_pts = []
            for idx_a, p in enumerate(ring_points(c, np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), angs_pl, 0.038, bvh=BVH_T)):
                an = angs_pl[idx_a]
                keel = 0.018 * math.sin(math.pi * k_z / 7.0) * (abs(math.cos(an)) ** 2)
                row_pts.append(p + np.array([0.0, out_sign * keel, 0.0]))
            Pl_grid.append(row_pts)
        parts_t.append(Part(f'{gid_t}_{tag}', np.array(Pl_grid), False, ['body'] * len(zs_pl), bone_plate_paint, rigid_joint='Spine2'))

    # Sculpted turquoise Sky-Totem boss + 4 curved ivory rib-tusks on the chestplate!
    boss_c = _front(CHEST - 0.01, 0.056)
    parts_t.append(blob(gid_t + '_totem_boss', boss_c, (0.095, 0.026, 0.095),
                        P('turq', 0.02, [B('top', 0.0, 0.02, 'solid', 'gold')]), n=14, rows=5, out=FRONT, rigid_joint='Spine2'))
    for sd in (-1, 1):
        for r_idx, z_tusk in enumerate((CHEST + 0.02, CHEST - 0.05)):
            t0 = _front(z_tusk, 0.048) + np.array([sd * 0.042, 0.0, 0.0])
            t1 = _front(z_tusk + 0.015, 0.068) + np.array([sd * 0.115, -0.018, 0.01])
            parts_t.append(horn(f'{gid_t}_rib_tusk_{sd}_{r_idx}', [t0, t1], 0.016, 0.004,
                                P('bone', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'saffron')]), n=8, rows=5, rigid_joint='Spine2'))

    # 4. Outsized winged bone-lamellar & dark-fur shoulder pauldrons + rigid bone-splinted forearm bracers!
    sh_bone_paint = P('bone', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'darkfur'),
        B('top', 0.0, 0.03, 'solid', 'saffron'),
    ], [PN(0.0, 1.0, 'bone_lamellar', 'bone', 'maroon', 0.10)])
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, sh_bone_paint, reach=0.58, ease=0.048, flare_end=1.28, span=1.85))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, sh_bone_paint, reach=0.58, ease=0.048, flare_end=1.28, span=1.85))

    parts_t += sleeves(gid_t, 'elbow', 0.018, P('mongolblue', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'saffron')]), ease_end=0.024, rows=6)
    bracer_paint = P('bronze', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'saffron'),
        B('bottom', 0.0, 0.02, 'solid', 'turq'),
    ], [PN(0.0, 1.0, 'bone_lamellar', 'bone', 'maroon', 0.08)], fabric='metal.bronze')
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        vb = limb_tube(f'{gid_t}_bracer_{s[0]}', e_j + (h_j - e_j) * 0.10, e_j + (h_j - e_j) * 0.88,
                       0.018, bracer_paint, n=16, rows=6, bvh=BVH_A, rmax=0.10)
        vb.rigid_joint = s + 'ForeArm'
        parts_t.append(vb)

    # 5. Wide tiger-pelt & saurian-fang trophy war-belt at the waist
    belt_paint = P('saffron', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'maroon'),
        B('bottom', 0.0, 0.012, 'solid', 'turq'),
    ], [PN(0.0, 1.0, 'tiger_pelt', 'soot', 'saffron', 0.10)], fabric='fur.short')
    parts_t.append(torso_tube(gid_t + '_war_belt', WAIST + 0.03, WAIST - 0.04, 0.038, belt_paint, n=42, rows=4))

    entry_t = assemble_garment(gid_t, 'Sky-Khan Quetzal-Scale & Saurian-Bone Lamellar Cuirass', 'torso', 'beast_riders', parts_t)

    # --- FEET: Upturned Mongol riding boots with rigid bone-lamellar shin greaves & turquoise knee-bosses ---
    gid_f = 'beast_m_cataphract_boots'
    parts_f = []
    greave_paint = P('maroon', 0.04, [
        B('top', 0.0, 0.05, 'solid', 'darkfur'),
        B('bottom', 0.0, 0.03, 'solid', 'saffron'),
    ], [
        PN(0.25, 0.75, 'bone_lamellar', 'bone', 'maroon', 0.08),
    ], fabric='leather.polished')
    foot_paint = P('darkfur', 0.06, [B('top', 0.0, 0.025, 'solid', 'saffron')], fabric='leather.polished')

    for s in (L, R):
        foot, toe, tip, knee = J(s + 'Foot'), J(s + 'ToeBase'), J(s + 'ToeBase', 'tail'), J(s + 'Leg')
        grv_top = foot + (knee - foot) * 1.04
        grv_bot = np.array([foot[0], foot[1], 0.055])
        grv = limb_tube(f'{gid_f}_greave_{s[0]}', grv_top, grv_bot, 0.024, greave_paint, n=18, rows=9, ease_end=0.016, rmax=0.14)
        grv.rigid_joint = s + 'Leg'
        parts_f.append(grv)

        pat_c = knee + np.array([0.0, -0.068, 0.01])
        parts_f.append(blob(f'{gid_f}_poleyn_{s[0]}', pat_c, (0.082, 0.030, 0.090),
                            P('bone', 0.02, [B('top', 0.0, 0.02, 'solid', 'turq')]),
                            n=12, rows=5, out=FRONT, rigid_joint=s + 'Leg'))

        hb = first_hit(np.array([foot[0], foot[1], 0.035]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05
        fa = np.array([foot[0], foot[1] + hb - 0.008, 0.04])
        fb = np.array([tip[0], tip[1] - 0.018, 0.026])
        u_foot = limb_tube(f'{gid_f}_foot_{s[0]}', fa, fb, 0.014, foot_paint, n=18, rows=10, ease_end=0.014, rmax=0.09)
        for k in (0, -1):
            c = u_foot.P[k].mean(0)
            u_foot.P[k] = c + (u_foot.P[k] - c) * 0.28
        parts_f.append(u_foot)

    entry_f = assemble_garment(gid_f, 'Sky-Khan Bone-Splinted Riding Greaves & Turquoise Knee-Cops', 'feet', 'beast_riders', parts_f)
    return [entry_t, entry_h, entry_f]


# ===============================================================================================================
# BEAST RIDER ARMOR 2: Beast Riders — "Quetzal-Lancer / Iridescent Carapace Hauberk" (Medium Aerial Cavalry)
# ===============================================================================================================
def build_beast_lancer():
    # --- HEADPIECE: Aerodynamic bronze-and-turquoise sky-lancer casque, maroon silk aventail & emerald quetzal side-wings ---
    gid_h = 'beast_m_lancer_casque'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Maroon-and-saffron silk wind-aventail draping behind the neck & ears
    av_paint = P('maroon', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'saffron'),
        B('top', 0.0, 0.025, 'solid', 'turq'),
    ], fabric='cloth.silk')
    fs_av = np.linspace(-0.26, 0.42, 7)
    angs_av = np.linspace(-0.64 * math.pi, 0.64 * math.pi, 26)
    Av_grid = []
    for k_a, f in enumerate(fs_av):
        f_ray = max(f, 0.36)
        c_ray = a + (b - a) * f_ray
        c = a + (b - a) * f
        Av_grid.append([p + (c - c_ray) + bk * (0.018 * (1.0 - k_a / 6.0))
                        for p in ring_points(c_ray, bk, left, angs_av, 0.022 + 0.020 * (1.0 - k_a / 6.0), rmin=0.05, rmax=0.20)])
    parts_h.append(Part(gid_h + '_aventail', np.array(Av_grid), False, ['body'] * len(fs_av), av_paint, rigid_joint='Head'))

    # 2. Streamlined conical turquoise-and-bronze casque with quetzal-scale crown & bronze nasal bar
    casque_paint = P('turq', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'bronze'),
        B('bottom', 0.03, 0.055, 'zigzag', 'saffron', 'maroon', 0.045),
        B('top', 0.0, 0.04, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'quetzal_scale', 'mint', 'jungle', 0.12),
    ], fabric='metal.bronze')
    parts_h.append(tower_hat(gid_h + '_casque', 0.17, lambda s: 1.05 * (1.0 - 0.58 * (s ** 1.75)), casque_paint,
                             f=0.46, ease=0.024, rows=10, n=36))

    nasal_top = a + (b - a) * 0.48 - bk * 0.132
    nasal_bot = a + (b - a) * 0.20 - bk * 0.148
    parts_h.append(horn(gid_h + '_nasal', [nasal_top, nasal_bot], 0.016, 0.010,
                        P('bronze', 0.02, [B('top', 0.0, 0.01, 'solid', 'turq')]), n=8, rows=4, rigid_joint='Head'))

    # 3. Swept-back aerodynamic emerald-and-mint quetzal feather wings on left and right temples
    wing_paint = P('quetzal', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'saffron'),
        B('bottom', 0.0, 0.03, 'rays', 'mint', 'turq', 0.025),
    ])
    for sd, tag in ((-1, 'R'), (1, 'L')):
        w0 = a + (b - a) * 0.56 + left * (sd * 0.095) - bk * 0.02
        w1 = a + (b - a) * 0.72 + left * (sd * 0.195) + bk * 0.10
        w2 = a + (b - a) * 0.88 + left * (sd * 0.245) + bk * 0.24
        parts_h.append(horn(f'{gid_h}_wing_{tag}', [w0, w1, w2], 0.032, 0.006, wing_paint, n=10, rows=7, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Quetzal-Lancer Turquoise Sky-Casque & Emerald Feather-Wings', 'head', 'beast_riders', parts_h,
                               covers_hair=True, covers_face=False)

    # --- TORSO: Iridescent emerald quetzal-scale hauberk, saffron riding shirt, saddle-harness & feathered back mantle ---
    gid_t = 'beast_m_lancer_hauberk'
    parts_t = []

    # 1. Saffron-and-maroon Apache/Mongol riding shirt skirt under the scale hauberk
    shirt_paint = P('saffron', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'maroon'),
        B('bottom', 0.025, 0.075, 'chevron', 'turq', 'maroon', 0.055),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_shirt', WAIST + 0.02, CROTCH - 0.09, 0.022, shirt_paint,
                              n=44, rows=9, hang_from=WAIST, flare=0.07, group_below=CROTCH + 0.02, hull_from=WAIST))

    # 2. Iridescent green, turquoise & mint quetzal-scale hauberk
    haub_paint = P('jungle', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'saffron'),
        B('bottom', 0.0, 0.035, 'solid', 'maroon'),
    ], [
        PN(0.0, 1.0, 'quetzal_scale', 'mint', 'jungle', 0.16),
    ])
    parts_t.append(torso_tube(gid_t + '_hauberk', TOP + 0.005, CROTCH + 0.04, 0.027, haub_paint,
                              n=48, rows=14, hang_from=WAIST - 0.02, flare=0.07, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # 3. Crossed rawhide aerial saddle-harness straps + rigid bronze-and-turquoise Wind-Compass chest buckle!
    strap_paint = P('saddle', 0.05, [
        B('top', 0.0, 0.01, 'solid', 'saffron'),
        B('bottom', 0.0, 0.01, 'solid', 'saffron'),
    ], fabric='leather.polished')
    parts_t.append(band(gid_t + '_strap1', WAIST, SHOULDER + 0.02, 0.058, 0.036, strap_paint, high=math.pi * 0.44, rows=4))
    parts_t.append(band(gid_t + '_strap2', WAIST, SHOULDER + 0.02, 0.058, 0.038, strap_paint, high=-math.pi * 0.44, rows=4))

    comp_c = _front(CHEST - 0.01, 0.048)
    parts_t.append(blob(gid_t + '_compass_buckle', comp_c, (0.088, 0.022, 0.088),
                        P('bronze', 0.02, [B('top', 0.0, 0.02, 'solid', 'turq')], fabric='metal.bronze'),
                        n=14, rows=5, out=FRONT, rigid_joint='Spine2'))

    # 4. Asymmetrical Right Carved-Bone Lance-Guard Pauldron & Left Quetzal-Scale Spaulder + rigid archer's bracers
    bone_sh = P('bone', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'maroon')], [PN(0.0, 1.0, 'bone_lamellar', 'bone', 'maroon', 0.10)])
    parts_t.append(pauldron(gid_t + '_lance_sh_R', R, bone_sh, reach=0.54, ease=0.042, flare_end=1.20, span=1.80))
    parts_t.append(pauldron(gid_t + '_scale_sh_L', L, haub_paint, reach=0.44, ease=0.034, flare_end=1.05))

    parts_t += sleeves(gid_t, 'wrist', 0.016, P('saffron', 0.05, [B('bottom', 0.0, 0.10, 'quetzal_scale', 'mint', 'jungle', 0.08)]),
                       ease_end=0.022, rows=9)
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        vb = limb_tube(f'{gid_t}_bracer_{s[0]}', e_j + (h_j - e_j) * 0.14, e_j + (h_j - e_j) * 0.86,
                       0.018, P('saddle', 0.04, [B('top', 0.0, 0.02, 'solid', 'turq'), B('bottom', 0.0, 0.02, 'solid', 'bone')]),
                       n=16, rows=6, bvh=BVH_A, rmax=0.10)
        vb.rigid_joint = s + 'ForeArm'
        parts_t.append(vb)

    # 5. Sweeping turquoise-and-emerald feathered riding mantle cape down the back
    cape_paint = P('turq', 0.04, [
        B('bottom', 0.0, 0.05, 'rays', 'mint', 'jungle', 0.045),
        B('bottom', 0.05, 0.07, 'solid', 'saffron'),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_cape', TOP - 0.01, KNEE + 0.04, 0.040, cape_paint,
                              n=30, arc=(-0.36 * math.pi, 0.36 * math.pi), hang_from=SHOULDER - 0.02,
                              flare=0.14, group_below=CROTCH + 0.02, over_arms=False))

    entry_t = assemble_garment(gid_t, 'Quetzal-Lancer Iridescent Scale Hauberk & Saddle-Harness', 'torso', 'beast_riders', parts_t)

    # --- LEGS: Heavy buckskin-and-bone lamellar riding chaps over dark-fur steppe trousers ---
    gid_l = 'beast_m_lancer_chaps'
    parts_l = []
    seat_paint = P('darkfur', 0.06, [
        B('top', 0.0, 0.04, 'tiger_pelt', 'soot', 'saffron', 0.08),
    ], fabric='leather.buckskin')
    chap_paint = P('buck', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'darkfur'),
        B('top', 0.0, 0.04, 'solid', 'maroon'),
    ], [
        # Outer thigh bone-lamellar armor panels + turquoise beadwork stripe
        PN(0.15, 0.85, 'bone_lamellar', 'bone', 'maroon', 0.14, down=0.42),
        PN(0.10, 0.15, 'solid', 'turq', 'buck', 0.10),
        PN(0.85, 0.90, 'solid', 'turq', 'buck', 0.10),
    ], fabric='leather.buckskin')

    parts_l.append(torso_tube(gid_l + '_seat', WAIST + 0.01, CROTCH - 0.01, 0.014, seat_paint, n=40, rows=7))
    for s in (L, R):
        u_leg, k_leg, f_leg = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        parts_l.append(limb_tube(f'{gid_l}_thigh_{s[0]}', u_leg + np.array([0, 0, 0.02]), k_leg, 0.016,
                                 chap_paint, n=20, rows=8, ease_end=0.014, bvh=BVH, rmax=0.16))
        parts_l.append(limb_tube(f'{gid_l}_shin_{s[0]}', k_leg, f_leg + np.array([0, 0, 0.04]), 0.014,
                                 chap_paint, n=18, rows=8, ease_end=0.012, bvh=BVH, rmax=0.13))

    entry_l = assemble_garment(gid_l, 'Quetzal-Lancer Bone-Lamellar & Buckskin Riding Chaps', 'legs', 'beast_riders', parts_l,
                               legged=True)
    return [entry_t, entry_h, entry_l]


# ===============================================================================================================
# BEAST RIDER ARMOR 3: Beast Riders — "Jungle Stalker / Trophy-Bone & Fang Harness" (Light Outrider & Beast-Tamer)
# ===============================================================================================================
def build_beast_stalker():
    # --- HEADPIECE: Open-faced turquoise-beaded war-headband, saurian-jaw brow crest & 7 emerald/saffron sun-feathers ---
    gid_h = 'beast_m_stalker_crest'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Apache-style turquoise-and-rose beaded buckskin war-headband sitting cleanly on the brow above the eyes
    hb_paint = P('maroon', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'saffron'),
        B('bottom', 0.0, 0.012, 'solid', 'bone'),
        B('top', 0.012, 0.048, 'diamonds', 'turq', 'maroon', 0.04),
    ], fabric='leather.buckskin')
    parts_h.append(head_rings(gid_h + '_headband', 0.50, 0.74, 0.022, hb_paint, n=36, rows=5, apex=False))

    # 2. Fan of 7 tall emerald-green, turquoise & saffron quetzal sun-feathers rising from the brow!
    feather_paint = P('quetzal', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'saffron'),
        B('top', 0.0, 0.05, 'rays', 'turq', 'mint', 0.025),
    ])
    c_fan = a + (b - a) * 0.72 - bk * 0.02
    for k in range(7):
        ang = (-54.0 + 108.0 * (k / 6.0)) * math.pi / 180.0
        dir_f = left * math.sin(ang) + up * math.cos(ang) + bk * 0.18
        dir_f /= np.linalg.norm(dir_f)
        parts_h.append(horn(f'{gid_h}_feather_{k}', [c_fan + dir_f * 0.05, c_fan + dir_f * 0.25],
                            0.020, 0.005, feather_paint, n=8, rows=5, rigid_joint='Head'))

    # 3. Dangling bone-and-turquoise bead temple strands framing the face
    for sd, tag in ((-1, 'R'), (1, 'L')):
        t_top = a + (b - a) * 0.46 + left * (sd * 0.095) - bk * 0.03
        for k_b in range(4):
            b_p = t_top - up * (0.032 * k_b)
            parts_h.append(blob(f'{gid_h}_bead_{tag}_{k_b}', b_p, (0.018, 0.018, 0.022),
                                P('turq' if k_b % 2 == 0 else 'bone', 0.02), n=8, rows=4, out=-bk, rigid_joint='Head'))

    entry_h = assemble_garment(gid_h, 'Jungle Stalker Beaded War-Band & Quetzal Feather-Crest', 'head', 'beast_riders', parts_h,
                               covers_hair=False, covers_face=False)

    # --- TORSO: Open-chested beast-tamer harness, carved Saurian-Fang & Turquoise Gorget, fur pauldron & bone wrist-guards ---
    gid_t = 'beast_m_stalker_harness'
    parts_t = []

    # 1. Crossed buckskin-and-teeth trophy bandoliers + tiger-pelt waist cinch
    band_paint = P('buck', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'maroon'),
        B('bottom', 0.0, 0.012, 'solid', 'turq'),
        B('top', 0.012, 0.048, 'teeth', 'bone', 'darkfur', 0.038),
    ], fabric='leather.buckskin')
    parts_t.append(band(gid_t + '_band1', WAIST + 0.01, SHOULDER + 0.02, 0.065, 0.018, band_paint, high=math.pi * 0.44, rows=4))
    parts_t.append(band(gid_t + '_band2', WAIST + 0.01, SHOULDER + 0.02, 0.065, 0.022, band_paint, high=-math.pi * 0.44, rows=4))
    parts_t.append(torso_tube(gid_t + '_cinch', WAIST + 0.04, WAIST - 0.03, 0.020,
                              P('saffron', 0.05, [], [PN(0.0, 1.0, 'tiger_pelt', 'soot', 'saffron', 0.08)], fabric='fur.short'),
                              n=40, rows=4))

    # 2. Rigid 3D carved Saurian-Bone & Turquoise Gorget Pectoral + 5 downward-pointing ivory fangs on the chest!
    gorget_c = _front(CHEST + 0.01, 0.028)
    parts_t.append(blob(gid_t + '_gorget', gorget_c, (0.165, 0.024, 0.135),
                        P('bone', 0.03, [B('top', 0.0, 0.025, 'solid', 'turq'), B('bottom', 0.0, 0.025, 'solid', 'maroon')]),
                        n=16, rows=6, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_gorget_gem', gorget_c + np.array([0.0, -0.008, 0.0]), (0.062, 0.020, 0.062),
                        P('turq', 0.02), n=12, rows=5, out=FRONT, rigid_joint='Spine2'))
    for k_f in range(5):
        fx = (-0.064 + 0.032 * k_f)
        f_top = gorget_c + np.array([fx, -0.008, -0.045])
        f_bot = f_top + np.array([0.0, -0.006, -0.055 - 0.018 * (1.0 - abs(k_f - 2) / 2.0)])
        parts_t.append(horn(f'{gid_t}_fang_{k_f}', [f_top, f_bot], 0.012, 0.003,
                            P('bone', 0.02, [B('top', 0.0, 0.015, 'solid', 'maroon')]), n=8, rows=4, rigid_joint='Spine2'))

    # 3. Asymmetrical dark-fur & bone-spike left shoulder mantle + rigid bone-lamellar wrist bracers
    parts_t.append(pauldron(gid_t + '_fur_sh_L', L,
                            P('darkfur', 0.08, [B('bottom', 0.0, 0.03, 'solid', 'saffron')], fabric='fur.short'),
                            reach=0.52, ease=0.038, flare_end=1.18))
    for k_sp in range(3):
        sp_a = J(L + 'Arm') + np.array([0.02 + 0.03 * k_sp, -0.01, 0.03 - 0.015 * k_sp])
        sp_b = sp_a + np.array([0.055, 0.0, 0.075])
        parts_t.append(horn(f'{gid_t}_sh_spike_{k_sp}', [sp_a, sp_b], 0.014, 0.003, P('bone', 0.02), n=8, rows=4, rigid_joint='LeftArm'))

    wrist_paint = P('bone', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'turq'),
        B('bottom', 0.0, 0.02, 'solid', 'maroon'),
    ], [PN(0.0, 1.0, 'bone_lamellar', 'bone', 'maroon', 0.08)])
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        vb = limb_tube(f'{gid_t}_wrist_{s[0]}', e_j + (h_j - e_j) * 0.16, e_j + (h_j - e_j) * 0.88,
                       0.016, wrist_paint, n=16, rows=6, bvh=BVH_A, rmax=0.10)
        vb.rigid_joint = s + 'ForeArm'
        parts_t.append(vb)

    entry_t = assemble_garment(gid_t, 'Jungle Stalker Saurian-Fang Gorget Harness & Fur Pauldron', 'torso', 'beast_riders', parts_t,
                               open_torso=True)

    # --- LEGS: Layered buckskin, Apache beadwork & bone-lamellar war-kilt with tiger-pelt belt ---
    gid_l = 'beast_m_stalker_kilt'
    parts_l = []
    kilt_paint = P('buck', 0.05, [
        B('top', 0.0, 0.045, 'tiger_pelt', 'soot', 'saffron', 0.08),
        B('bottom', 0.0, 0.035, 'rays', 'maroon', 'saffron', 0.03),
        B('bottom', 0.035, 0.080, 'chevron', 'turq', 'maroon', 0.05),
    ], [
        # Bone-lamellar hip tassets on left and right sides
        PN(0.08, 0.38, 'bone_lamellar', 'bone', 'maroon', 0.12, down=0.28),
        PN(0.62, 0.92, 'bone_lamellar', 'bone', 'maroon', 0.12, down=0.28),
        # Central Mongol-blue & turquoise Apache geometric breechclout apron
        PN(0.40, 0.60, 'quetzal_scale', 'turq', 'mongolblue', 0.10),
    ], fabric='leather.buckskin')
    parts_l.append(torso_tube(gid_l + '_kilt', WAIST + 0.01, KNEE + 0.05, 0.024, kilt_paint,
                              n=48, rows=12, hang_from=WAIST, flare=0.12, group_below=CROTCH + 0.02, hull_from=WAIST))

    entry_l = assemble_garment(gid_l, 'Jungle Stalker Bone-Tasset & Turquoise Beadwork War-Kilt', 'legs', 'beast_riders', parts_l)
    return [entry_t, entry_h, entry_l]


BUILDERS = [
    # Batch 1 (6 outfits, 12 pieces)
    build_nomad_patriarch,
    build_nomad_walker,
    build_nomad_oracle,
    build_rep_magistrate,
    build_abyssal_dredger,
    build_painted_warden,
    # Batch 2 (6 outfits, 14 pieces)
    build_jimjam_sibyl,
    build_hykk_hierophant,
    build_hykk_heliarch,
    build_order_cartographer,
    build_island_shaman,
    build_yuni_sentinel,
    # Batch 3 (5 outfits, 11 pieces)
    build_iziz_aedile,
    build_voth_confessor,
    build_dalab_heliophant,
    build_xan_magnate,
    build_rustic_envoy,
    # Izani Armors (3 armor sets, 9 pieces)
    build_iziz_praetorian,
    build_iziz_watch,
    build_iziz_skirmisher,
    # Beast Rider Armors (3 armor sets, 9 pieces)
    build_beast_cataphract,
    build_beast_lancer,
    build_beast_stalker,
]


def _run_builder(fn):
    return fn()


def main():
    t0 = time.perf_counter()
    args = sys.argv[1:]
    only = None
    workers = min(12, os.cpu_count() or 8)
    if '--only' in args:
        idx = args.index('--only')
        only = args[idx + 1]
    if '--workers' in args:
        idx = args.index('--workers')
        workers = int(args[idx + 1])

    selected = [fn for fn in BUILDERS if not only or only in fn.__name__]
    new_entries = []
    if workers <= 1 or len(selected) <= 1:
        for fn in selected:
            new_entries += fn()
    else:
        with concurrent.futures.ProcessPoolExecutor(max_workers=min(workers, len(selected))) as ex:
            for entries in ex.map(_run_builder, selected):
                new_entries += entries

    register_entries(new_entries)
    dt = time.perf_counter() - t0
    print(f'Finished in {dt:.2f}s using {min(workers, max(1, len(selected)))} workers.')


if __name__ == '__main__':
    main()
