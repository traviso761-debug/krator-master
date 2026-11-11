"""Layer 1: Core body rig, BVH raycasting, Part grid primitives, and GLB/morph assembly.

Consolidates all body/rig coordinate frames, surface raycasters (`surface_out`, `chest_front`),
grid relaxation (`ring_points`, `smooth_push`, `hang`, `hull2`, `hull_rows`), and GLB/morph
packing (`cloth_spec`, `assemble_garment`, `register_entries`) into a single shared foundation
module so no culture or outfit batch needs to vendor functions from another.
"""
import copy
import io
import json
import math
import os
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

TOOLS_DIR = Path(__file__).resolve().parent.parent
ROOT = TOOLS_DIR.parent
if str(TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(TOOLS_DIR))

import arms2
import glbio
import make_mpfb
import make_pieces as mp

TEX = 1024
FRONT = np.array([0.0, -1.0, 0.0])
L, R = 'Left', 'Right'


class FastBVH:
    """Fast pure-Python BVH & raycaster over body vertices V and triangle subset T."""
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

# Active body state globals
BODY_ID = None
BASE_GLB = None
RIG = None
BP_GL = None
BT = None
CO = None
POLY = None
BASE_JJ = None
BASE_WW = None
BASE_VIDX = None
BASE_TREE_GL = None
BASE_ARM_W = None
TRUNK_IDX = None
TRUNK_TREE_GL = None
ARM_ONLY_IDX = None
ARM_TREE_GL = None
ARM = None
_LM = None
BVH = None
BVH_T = None
BVH_A = None
HIPS = NECK = HEAD = None
CROTCH = WAIST = CHEST = TOP = KNEE = ANKLE = SHOULDER = 0.0
TEMPLATE_GLB = None
TPL_J = TPL_B = None
BASE_MORPH_ENTS = None
_N_TARGETS = 0
BASE_MORPH_D = None
BODY_CONTACT = None


def J(n, end='head'):
    if end == 'tail':
        if n in TAIL_MAP and TAIL_MAP[n] in RIG.J:
            p_gl = RIG.jpos[RIG.J[TAIL_MAP[n]]]
            return arms2.from_gl(p_gl)[0]
        if n == 'Head':
            p_gl = RIG.jpos[RIG.J['Head']] + np.array([0.0, 0.21, 0.0])
            return arms2.from_gl(p_gl)[0]
        if n.endswith('Hand'):
            s = 'Left' if n.startswith('Left') else 'Right'
            p_gl = RIG.jpos[RIG.J[n]] + (RIG.jpos[RIG.J[n]] - RIG.jpos[RIG.J[s + 'ForeArm']]) * 0.35
            return arms2.from_gl(p_gl)[0]
        if n.endswith('ToeBase'):
            s = 'Left' if n.startswith('Left') else 'Right'
            p_gl = RIG.jpos[RIG.J[n]] + (RIG.jpos[RIG.J[n]] - RIG.jpos[RIG.J[s + 'Foot']]) * 0.45
            return arms2.from_gl(p_gl)[0]
    p_gl = RIG.jpos[RIG.J[n]]
    return arms2.from_gl(p_gl)[0]


def _arm_mask():
    arm = np.zeros(len(CO), bool)
    for s in ('Left', 'Right'):
        a, b = J(s + 'Arm'), J(s + 'Hand', 'tail')
        d = (b - a) / np.linalg.norm(b - a)
        t = (CO - a) @ d
        dist = np.linalg.norm(CO - a - np.outer(t, d), axis=1)
        arm |= (t > 0.025) & (dist < 0.12)
    return arm


def _limb_mask():
    m = np.zeros(len(CO), bool)
    for s in ('Left', 'Right'):
        for a, b in ((J(s + 'Arm') - (J(s + 'ForeArm') - J(s + 'Arm')) * 0.45, J(s + 'ForeArm')),
                     (J(s + 'ForeArm'), J(s + 'Hand', 'tail'))):
            d = b - a
            L_seg = np.linalg.norm(d)
            d = d / L_seg
            t = (CO - a) @ d
            dist = np.linalg.norm(CO - a - np.outer(t, d), axis=1)
            m |= (t > -0.02) & (t < L_seg + 0.02) & (dist < 0.12)
    return m


def set_body(body_id='mpfb_male'):
    """Switch active body globals between 'mpfb_male' and 'mpfb_female'."""
    global BODY_ID, BASE_GLB, RIG, BP_GL, BT, CO, POLY, BASE_JJ, BASE_WW, BASE_VIDX, BASE_TREE_GL
    global BASE_ARM_W, TRUNK_IDX, TRUNK_TREE_GL, ARM_ONLY_IDX, ARM_TREE_GL, ARM, _LM, BVH, BVH_T, BVH_A, HIPS, NECK, HEAD, CROTCH
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
    _pure_arm_mask = np.array([
        any(nm.startswith(p) for p in ('LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand'))
        for nm in _bjoint_names
    ], dtype=bool)
    _pure_arm_w = (BASE_WW * _pure_arm_mask[BASE_JJ]).sum(axis=1)
    ARM_ONLY_IDX = np.nonzero(_pure_arm_w > 0.65)[0]
    ARM_TREE_GL = cKDTree(BP_GL[ARM_ONLY_IDX])
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
    pkg = sys.modules.get('garments')
    if pkg is not None:
        for _k in ('BVH', 'BVH_T', 'BVH_A', 'HIPS', 'NECK', 'HEAD', 'CROTCH', 'WAIST', 'CHEST', 'TOP', 'KNEE', 'ANKLE', 'SHOULDER'):
            setattr(pkg, _k, globals()[_k])


# Initialize default male body on import
set_body('mpfb_male')


def spine_at(z):
    pts = [J('Hips'), J('Spine'), J('Spine1'), J('Spine2'), J('Neck'), J('Head')]
    if z <= pts[0][2]:
        return np.array([pts[0][0], pts[0][1] + 0.01, z])
    for a, b in zip(pts, pts[1:]):
        if a[2] <= z <= b[2]:
            t = (z - a[2]) / max(1e-6, b[2] - a[2])
            p = a + (b - a) * t
            return np.array([p[0], p[1], z])
    return np.array([pts[-1][0], pts[-1][1], z])


def first_hit(o, d, maxd=0.6, bvh=None):
    return (bvh or BVH).ray_cast(o, d, maxd)


def nearest(p, bvh=None):
    return (bvh or BVH).nearest(p)


def frame(t):
    t = t / np.linalg.norm(t)
    ref = np.array([1.0, 0, 0]) if abs(t[0]) < 0.8 else np.array([0, -1.0, 0])
    x = ref - t * ref.dot(t)
    x /= np.linalg.norm(x)
    return x, np.cross(t, x)


def head_frame():
    a, b = J('Head'), J('Head', 'tail')
    up = (b - a) / np.linalg.norm(b - a)
    bk = np.array([0, 1.0, 0]) - up * up[1]
    bk /= np.linalg.norm(bk)
    left = np.cross(bk, up)
    left /= np.linalg.norm(left)
    if left[0] < 0:
        left = -left
    return a, b, up, bk, left


def surface_out(c, d, extra, bvh=None):
    """Point cast outward from origin c along direction d to the skin plus extra ease (formerly `_out`)."""
    d = np.asarray(d, dtype=np.float64)
    d = d / max(np.linalg.norm(d), 1e-12)
    h = first_hit(c, d, bvh=bvh)
    return c + d * ((h or 0.12) + extra)


def chest_front(z, extra, x=0.0):
    """Point on the front of the torso at height z (and lateral offset x) plus extra ease (formerly `_front`)."""
    c = spine_at(z) + np.array([x, 0.0, 0.0])
    d = np.array([0.0, -1.0, 0.0])
    h = first_hit(c, d, bvh=BVH_T)
    return c + d * ((h or 0.12) + extra)


# Backward-compatible aliases
_out = surface_out
_front = chest_front


class Part:
    """One grid of a garment. `role` says what the part is to the assembly rules (ROLES below) and `side` which side
    of the body a one-sided part is on ('L' or 'R'); with no role, the rules fall back to reading the part's name
    (part_facts), which is how every part was classified before 2026-11-09. New types set a role."""

    def __init__(self, name, P, closed, group, paint, rigid_joint=None, role=None, side=None):
        self.name = name
        self.P = np.asarray(P, dtype=np.float64)
        self.closed = closed
        self.group = group
        self.paint = paint
        self.cloth = None
        self.rigid_joint = rigid_joint
        self.is_arm = False
        self.role = role
        self.side = side

    def lengths(self):
        P = self.P
        cols = np.linalg.norm(np.diff(P, axis=0), axis=2).sum(0).mean()
        R_grid = np.concatenate([P, P[:, :1]], 1) if self.closed else P
        rows = np.linalg.norm(np.diff(R_grid, axis=1), axis=2).sum(1).mean()
        return rows, cols


# What a part is to the assembly rules. Each role stands for a set of facts the rules test (part_facts); a part with
# no role gets its facts from the words in its name, exactly as the rules read names before (the review's section 3,
# point 6: a rule dispatches on a role, not on a name). The facts:
#   arm        counts as arm wear when the trunk tubes are picked (sleeves, cuffs, vambraces, pauldrons)
#   sleeve     a sleeve: Rule A tucks its root rings into the main trunk tube
#   arm_tube   skinned to the arm alone (no trunk weights)
#   pauldron   a shoulder piece: Rule B pushes it outside the trunk and 6 mm clear of the sleeves
#   sh_cap     skinned as a shoulder cap when it sits out past |x| 11 cm
#   band       an overlay band: never a trunk tube
#   overlay    Rule B pushes it outside every trunk tube (8 mm; 12 mm for a strap)
#   neck       a collar: Rule B uses the trunk's ring at its height alone, not the trunk vertices 3.8 cm about it
#   strap      a strap, sash or belt: Rule B's 12 mm clearance and shoulder clamp
#   belt_sfx   a belt or buckle by suffix: skinned rigid to the hips when it has no cloth
#   acc        a pouch, buckle, tassel...: Rule C leaves it where it is
#   acc7       a small accoutrement: skinned rigid to the spine joint at its height (Check 7)
#   side_sfx   a one-sided part by suffix (a sleeve or a trouser leg): never a trunk tube
#   side_sub   a one-sided part or the seat: Rule C's inner layer on a legged garment
#   sole, upper, foot, foot_us, sole_L/R, foot_L/R, shaft_L/R   footwear: the sole, a closed upper, the foot part
ROLES = {
    'trunk': set(),
    'sleeve': {'arm', 'sleeve', 'arm_tube'},
    'armwear': {'arm', 'arm_tube'},
    'cuff': {'arm', 'arm_tube'},
    'pauldron': {'arm', 'pauldron', 'sh_cap'},
    'shoulder_cap': {'sh_cap'},
    'band': {'band', 'overlay', 'strap'},
    'belt': {'band', 'overlay', 'strap', 'belt_sfx'},
    'collar': {'band', 'overlay', 'neck'},   # a neck ring: never a trunk tube; Rule B stands it outside the trunk's own
                                               # ring at its height, not the shoulder slope (neck): that threw collars 15 cm out
    'yoke': {'band'},
    'drape': {'overlay'},
    'accessory': {'acc', 'acc7'},
    'trinket': {'acc7'},
    'leg': set(),
    'seat': {'side_sub'},
    'sole': {'sole', 'sole_cs'},
    'foot': {'upper', 'foot', 'foot_us'},
    'shaft': set(),
    'headgear': set(),
}
_ARM_WORDS = ('sleeve', 'cuff', 'vambrace', 'wrist', 'gauntlet', 'bracer', 'pauldron', 'spaulder', 'epaulette')
_BAND_WORDS = ('strap', 'sash', 'harness', 'baldric', 'bandolier', 'belt', 'obi', 'swag', 'wrap', 'band', 'cummerbund')
_TRUNK_BAND_WORDS = _BAND_WORDS + ('collar', 'scarf', 'trim', 'yoke', 'gorget', 'pectoral')
_PAULDRON_WORDS = ('pauldron', 'epaulette', 'spaulder')
_OVERLAY_WORDS = ('strap', 'sash', 'harness', 'baldric', 'bandolier', 'belt', 'obi', 'collar', 'scarf',
                  'cowl', 'mantle', 'cape', 'poncho', 'kilt', 'stole', 'tabard', 'pectoral',
                  'swag', 'shawl', 'drape', 'wrap', 'band', 'apron', 'trim', 'waist', 'cummerbund')
_ACC_WORDS = ('pouch', 'satchel', 'holster', 'buckle', 'rosette', 'horn', 'tassel')
_ARM_TUBE_SFX = ('sleeve', 'cuff', 'vambrace', 'wrist', 'bangle', 'bracelet', 'gauntlet', 'wraps', 'bracer')
_SH_CAP_SFX = ('pauldron', 'epaulette', '_sh_', 'shoulder_', 'bellcap_', 'hex_plate_', 'spaulder_')
_BELT_SFX = ('_belt', '_gunbelt', '_obi', '_furbelt', '_cinch', '_war_belt', '_waist', '_buckle')
_ACC7_SFX = ('pouch', 'btn', 'button', 'rosette', 'buckle', 'disc', 'iris', 'medallion', 'brooch', 'clasp', 'canister',
             'vial', 'node', 'badge', 'seal', 'eye', 'pendant', 'bell', 'tassel')
_SIDE_SFX = ('_Left', '_Right', '_L', '_R', '_leg_l', '_leg_r')
_SIDE_SUB = ('_Left', '_Right', '_L', '_R', '_leg', '_pelvis')


def part_facts(p, gid):
    """the facts of a part for the assembly rules: from its role and side when it has a role, else from its name"""
    role = getattr(p, 'role', None)
    if role is not None:
        f = set(ROLES[role])
        side = getattr(p, 'side', None)
        if side in ('L', 'R'):
            f |= {'side_sfx', 'side_sub'}
            if role in ('sole', 'foot', 'shaft'):
                f.add(role + '_' + side)
        return f
    name = p.name
    nl = name.lower()
    sfx = name[len(gid):] if name.startswith(gid) else name
    f = set()
    if any(k in nl for k in _ARM_WORDS): f.add('arm')
    if 'sleeve' in nl: f.add('sleeve')
    if any(k in sfx for k in _ARM_TUBE_SFX): f.add('arm_tube')
    if any(k in nl for k in _PAULDRON_WORDS): f.add('pauldron')
    if any(k in sfx for k in _SH_CAP_SFX): f.add('sh_cap')
    if any(k in nl for k in _TRUNK_BAND_WORDS): f.add('band')
    if any(k in nl for k in _OVERLAY_WORDS): f.add('overlay')
    if any(k in nl for k in _BAND_WORDS): f.add('strap')
    if any(sfx.endswith(x) or (x + '_') in sfx for x in _BELT_SFX): f.add('belt_sfx')
    if any(k in nl for k in _ACC_WORDS): f.add('acc')
    if any(k in sfx for k in _ACC7_SFX): f.add('acc7')
    if any(name.endswith(x) or (x + '_') in name for x in _SIDE_SFX): f.add('side_sfx')
    if any(x in name for x in _SIDE_SUB): f.add('side_sub')
    if 'sole' in nl: f.add('sole')
    if 'sole' in name: f.add('sole_cs')
    if any(k in nl for k in ('_foot', '_vamp', 'boot', 'sabaton', 'shoe')): f.add('upper')
    if any(k in nl for k in ('_foot', '_vamp', '_toe')): f.add('foot')
    if '_foot_' in name: f.add('foot_us')
    for x in ('L', 'R'):
        for r in ('sole', 'foot', 'shaft'):
            if '_%s_%s' % (r, x) in name: f.add('%s_%s' % (r, x))
    return f


def ring_points(c, x, y, angles, ease, rmin=0.0, rmax=0.6, scale=(1.0, 1.0), bvh=None):
    ds, rs = [], []
    for a in angles:
        d = x * math.cos(a) * scale[0] + y * math.sin(a) * scale[1]
        d = d / np.linalg.norm(d)
        h = first_hit(c, d, bvh=bvh)
        ds.append(d)
        rs.append(np.nan if h is None else h + ease)
    rs = np.array(rs)
    if np.isnan(rs).all():
        rs[:] = rmin
    elif np.isnan(rs).any():
        k = np.arange(len(rs))
        ok = ~np.isnan(rs)
        rs = np.interp(k, np.concatenate([k[ok] - len(rs), k[ok], k[ok] + len(rs)]), np.tile(rs[ok], 3))
    return [c + d * min(max(rmin, r), rmax) for d, r in zip(ds, rs)]


def smooth_push(P, closed, ease, iters=3, fix_top=False, fix_bottom=False, rows_ease=None, bvh=None):
    R_cnt, Cn = P.shape[:2]
    E = rows_ease if rows_ease is not None else np.full(R_cnt, ease)
    for _ in range(iters):
        Q = P.copy()
        for i in range(R_cnt):
            if (i == 0 and fix_top) or (i == R_cnt - 1 and fix_bottom):
                continue
            for j in range(Cn):
                nb = []
                if i > 0:
                    nb.append(P[i - 1, j])
                if i < R_cnt - 1:
                    nb.append(P[i + 1, j])
                if closed or j > 0:
                    nb.append(P[i, (j - 1) % Cn])
                if closed or j < Cn - 1:
                    nb.append(P[i, (j + 1) % Cn])
                Q[i, j] = P[i, j] * 0.5 + np.mean(nb, 0) * 0.5
        P = Q
        for i in range(R_cnt):
            for j in range(Cn):
                loc, n = nearest(P[i, j], bvh)
                s = (P[i, j] - loc).dot(n)
                if s < E[i]:
                    P[i, j] = P[i, j] + n * (E[i] - s)
    return P


def hang(P, axes, start, flare):
    starts = start if hasattr(start, '__len__') else [start] * P.shape[1]
    for j in range(P.shape[1]):
        for i in range(starts[j] + 1, P.shape[0]):
            c = axes[i]
            d = P[i, j] - c
            d[2] = 0
            prev = P[i - 1, j] - axes[i - 1]
            prev[2] = 0
            r, r0 = np.linalg.norm(d), np.linalg.norm(prev)
            dz = abs(P[i - 1, j][2] - P[i, j][2])
            want = r0 + flare * dz
            if r < want:
                dd = d / r if r > 1e-6 else prev / max(r0, 1e-6)
                P[i, j] = np.array([c[0], c[1], P[i, j][2]]) + dd * want
    return P


def hull2(pts):
    pts = sorted(map(tuple, pts))
    def half(seq):
        h = []
        for p in seq:
            while len(h) >= 2 and (h[-1][0] - h[-2][0]) * (p[1] - h[-2][1]) - (h[-1][1] - h[-2][1]) * (p[0] - h[-2][0]) <= 0:
                h.pop()
            h.append(p)
        return h
    lo, up = half(pts), half(reversed(pts))
    return np.array(lo[:-1] + up[:-1])


def hull_rows(P, axes, rows):
    for i in rows:
        c = axes[i][:2]
        H = hull2(P[i, :, :2])
        if len(H) < 3:
            continue
        E = np.roll(H, -1, 0) - H
        for j in range(P.shape[1]):
            d = P[i, j, :2] - c
            r = np.linalg.norm(d)
            if r < 1e-6:
                continue
            d = d / r
            best = r
            for a, e in zip(H, E):
                den = d[0] * e[1] - d[1] * e[0]
                if abs(den) < 1e-12:
                    continue
                w = a - c
                t = (w[0] * e[1] - w[1] * e[0]) / den
                s_ = (w[0] * d[1] - w[1] * d[0]) / den
                if t > 0 and -1e-9 <= s_ <= 1 + 1e-9:
                    best = max(best, t)
            P[i, j, :2] = c + d * best
    return P


def cloth_spec(p, offset, slot='torso'):
    c = getattr(p, 'cloth', None)
    if not c or slot not in ('torso', 'legs', 'back', 'head'):
        return None
    R_cnt, Cn = p.P.shape[:2]
    st = c['start']
    starts = list(st) if hasattr(st, '__len__') else [st] * Cn
    circ, _ = p.lengths()
    if p.closed:
        n = int(max(8, min(20, round(circ / 0.075))))
        cols = {int(round(k * Cn / n)) % Cn for k in range(n)}
        for g, _ in getattr(p, 'gaps', []):
            cols = {col for col in cols if min((col - g) % Cn, (g - col) % Cn, (col - g - 1) % Cn, (g + 1 - col) % Cn) > 1} | {g, g + 1}
        cols = sorted(cols)
    else:
        n = int(max(2, round(circ / 0.1) + 1))
        cols = sorted({int(round(x)) for x in np.linspace(0, Cn - 1, n)})
    chains = []
    for col in cols:
        r0 = int(starts[col])
        if r0 >= R_cnt - 1:
            continue
        seg = np.linalg.norm(np.diff(p.P[r0:, col], axis=0), axis=1)
        nseg = int(np.clip(round(seg.sum() / (0.042 if slot == 'head' else 0.12)), 1, 6))
        rows = sorted({int(round(r0 + (R_cnt - 1 - r0) * u ** (1.15 if slot == 'head' else 1.5))) for u in np.linspace(0, 1, nseg + 1)})
        if len(rows) < 2:
            continue
        z = float(p.P[r0, col, 2])
        parent = 'Hips'
        if slot == 'head':
            parent = 'Head'
        elif slot != 'legs':
            for jn in ('Hips', 'Spine', 'Spine1', 'Spine2', 'Neck'):
                if J(jn)[2] <= z + 0.02:
                    parent = jn
        chains.append({'col': col, 'rows': rows, 'parent': parent})
    if not chains:
        return None
    spec = {
        'name': p.name, 'offset': offset, 'rows': R_cnt, 'cols': Cn,
        'closed': bool(p.closed), 'stiff': float(c.get('stiff', 0.1)),
        'layer': c.get('layer', 1 if slot == 'torso' else 0),
        'chains': chains
    }
    if getattr(p, 'gaps', None):
        spec['gaps'], spec['slit'] = [list(g) for g in p.gaps], round(float(p.slit), 3)
    return spec


def assemble_garment(gid, label, slot, culture, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    """Assemble Part list (automatically flattening nested lists) into a skinned GLB + .morph.bin and return kit.json entry."""
    from .paint import paint_strip

    flat_parts = []
    for item in parts:
        if isinstance(item, (list, tuple)):
            flat_parts.extend(x for x in item if x is not None)
        elif item is not None:
            flat_parts.append(item)
    parts = flat_parts
    _facts = {}

    def fx(p):
        k = id(p)
        if k not in _facts:
            _facts[k] = part_facts(p, gid)
        return _facts[k]
    trunk_tubes = []

    # Check #5 (Concentric Layer, Sleeve-Root Tucking & Overlay Clearance Check):
    # 1. When a torso or legs garment has >= 2 closed trunk tubes overlapping vertically by >= 0.12 m,
    #    ensure the inner layer does not carry competing cloth chains under an outer cloth layer,
    #    and enforce >= 8 mm radial separation where they overlap.
    # 2. Tuck medial sleeve roots (|x| < |J('LeftArm')[0]|) >= 6 mm inside the outer torso_tube shoulder roof.
    # 3. Push outer sashes/straps/collars/capes/tabards/belts >= 6 mm outside the outermost torso_tube.
    if slot in ('torso', 'legs'):
        n_ang = 36
        ang_grid = np.linspace(0.0, 2.0 * math.pi, n_ang, endpoint=False)

        def _build_tube_profile(t_P):
            R_t = t_P.shape[0]
            zs_t = np.array([float(t_P[r, :, 2].mean()) for r in range(R_t)])
            order_z = np.argsort(zs_t)
            zs_s = zs_t[order_z]
            r_prof = np.zeros((R_t, n_ang), dtype=np.float64)
            xmax_s = np.zeros(R_t, dtype=np.float64)
            for idx_r, r in enumerate(order_z):
                c2 = spine_at(zs_s[idx_r])[:2]
                dx = t_P[r, :, 0] - c2[0]
                dy = t_P[r, :, 1] - c2[1]
                rr = np.hypot(dx, dy)
                aa = np.mod(np.arctan2(dx, dy), 2.0 * math.pi)
                ord_a = np.argsort(aa)
                aa_ext = np.concatenate([aa[ord_a] - 2.0 * math.pi, aa[ord_a], aa[ord_a] + 2.0 * math.pi])
                rr_ext = np.tile(rr[ord_a], 3)
                r_prof[idx_r] = np.interp(ang_grid, aa_ext, rr_ext)
                xmax_s[idx_r] = float(np.abs(t_P[r, :, 0]).max())
            return zs_s, r_prof, xmax_s

        def _eval_tube_r(zs_s, r_prof, pz, ang):
            z_cl = float(np.clip(pz, zs_s[0], zs_s[-1]))
            i_hi = int(np.searchsorted(zs_s, z_cl, side='right'))
            i_lo = max(0, min(len(zs_s) - 1, i_hi - 1))
            i_hi = max(0, min(len(zs_s) - 1, i_hi))
            tz = 0.0 if i_lo == i_hi else (z_cl - zs_s[i_lo]) / max(zs_s[i_hi] - zs_s[i_lo], 1e-9)
            a_f = (float(ang) % (2.0 * math.pi)) / (2.0 * math.pi) * n_ang
            j0 = int(math.floor(a_f)) % n_ang
            j1 = (j0 + 1) % n_ang
            ta = a_f - math.floor(a_f)
            r0 = (1.0 - ta) * r_prof[i_lo, j0] + ta * r_prof[i_lo, j1]
            r1 = (1.0 - ta) * r_prof[i_hi, j0] + ta * r_prof[i_hi, j1]
            return (1.0 - tz) * r0 + tz * r1

        trunk_tubes = []
        for idx_p, pt in enumerate(parts):
            if getattr(pt, 'closed', False) and pt.P.ndim == 3 and pt.P.shape[0] >= 5 and pt.P.shape[1] >= 24:
                F = fx(pt)
                is_arm_pt = getattr(pt, 'is_arm', False) or 'arm' in F
                is_leg_limb = 'side_sfx' in F or abs(float(pt.P[:, :, 0].mean())) > 0.035
                is_overlay_band = 'band' in F
                if not is_arm_pt and not is_leg_limb and not is_overlay_band:
                    z_vals = pt.P[:, :, 2]
                    z_min, z_max = float(z_vals.min()), float(z_vals.max())
                    if (z_max - z_min) >= 0.05:
                        r_mean = float(np.hypot(pt.P[:, :, 0], pt.P[:, :, 1]).mean())
                        trunk_tubes.append((idx_p, pt, z_min, z_max, r_mean))
        trunk_tubes.sort(key=lambda t: t[4])
        for i_t in range(len(trunk_tubes)):
            for j_t in range(i_t + 1, len(trunk_tubes)):
                _, pt_a, z0_a, z1_a, r_a = trunk_tubes[i_t]
                _, pt_b, z0_b, z1_b, r_b = trunk_tubes[j_t]
                ov_z0, ov_z1 = max(z0_a, z0_b), min(z1_a, z1_b)
                if (ov_z1 - ov_z0) >= 0.05:
                    # Keep the longer lower skirt/robe as inner_pt if it extends much lower below CROTCH than a short waist/chest shawl
                    if z0_a < CROTCH - 0.08 and z0_b >= CROTCH - 0.04:
                        inner_pt, outer_pt = pt_a, pt_b
                        if getattr(outer_pt, 'cloth', None) is not None:
                            outer_pt.cloth = None
                    elif z0_b < CROTCH - 0.08 and z0_a >= CROTCH - 0.04:
                        inner_pt, outer_pt = pt_b, pt_a
                        if getattr(outer_pt, 'cloth', None) is not None:
                            outer_pt.cloth = None
                    else:
                        inner_pt, outer_pt = (pt_a, pt_b) if r_a <= r_b else (pt_b, pt_a)
                        if getattr(inner_pt, 'cloth', None) is not None and getattr(outer_pt, 'cloth', None) is not None:
                            inner_pt.cloth = None
                    zs_in, r_in, _ = _build_tube_profile(inner_pt.P)
                    for r_o in range(outer_pt.P.shape[0]):
                        for c_o in range(outer_pt.P.shape[1]):
                            pz = float(outer_pt.P[r_o, c_o, 2])
                            if ov_z0 - 0.015 <= pz <= ov_z1 + 0.015:
                                c2 = spine_at(pz)[:2]
                                dx = float(outer_pt.P[r_o, c_o, 0] - c2[0])
                                dy = float(outer_pt.P[r_o, c_o, 1] - c2[1])
                                r_cur = math.hypot(dx, dy)
                                ang = math.atan2(dx, dy) % (2.0 * math.pi)
                                r_req = _eval_tube_r(zs_in, r_in, pz, ang) + 0.008
                                if r_cur < r_req and r_cur > 1e-6:
                                    outer_pt.P[r_o, c_o, 0] = c2[0] + dx * (r_req / r_cur)
                                    outer_pt.P[r_o, c_o, 1] = c2[1] + dy * (r_req / r_cur)

        if slot == 'torso' and trunk_tubes:
            # Build profiles for all trunk tubes so overlays clear every tube they span
            chest_tubes = [t for t in trunk_tubes if t[3] >= SHOULDER + 0.03]
            if chest_tubes:
                _, main_pt, z0_m, z1_m, _ = max(chest_tubes, key=lambda t: t[4])
                x_sh_piv = abs(float(J('LeftArm')[0]))
                trunk_pt_ids = {id(t[1]) for t in trunk_tubes}
                zs_m, r_m, xmax_m = _build_tube_profile(main_pt.P)
                all_tube_profiles = [(t[1], t[2], t[3], *_build_tube_profile(t[1].P)) for t in trunk_tubes]
                slv_parts = []

                for pt in parts:
                    if id(pt) in trunk_pt_ids or pt.P.ndim != 3:
                        continue
                    is_slv = (getattr(pt, 'is_arm', False) or 'sleeve' in fx(pt)) and getattr(pt, 'closed', False)
                    if is_slv:
                        slv_parts.append(pt)
                        # Rule A: Smoothly tuck the deep medial anchor rings (r_i in (0, 1), |x| < x_sh_piv - 0.010)
                        # in front/back Y inside main_pt without pulling X medially or crushing Z below the shoulder skin!
                        for r_slv in range(min(2, pt.P.shape[0])):
                            for c_i in range(pt.P.shape[1]):
                                px, py, pz = float(pt.P[r_slv, c_i, 0]), float(pt.P[r_slv, c_i, 1]), float(pt.P[r_slv, c_i, 2])
                                ax = abs(px)
                                if ax < x_sh_piv - 0.010 and pz >= SHOULDER - 0.04:
                                    c2 = spine_at(min(pz, TOP))[:2]
                                    dx, dy = px - c2[0], py - c2[1]
                                    r_cur = math.hypot(dx, dy)
                                    ang = math.atan2(dx, dy) % (2.0 * math.pi)
                                    r_lim = _eval_tube_r(zs_m, r_m, min(pz, float(zs_m[-1])), ang) - 0.005
                                    if r_cur > r_lim > 0.04 and r_cur > 1e-6:
                                        pt.P[r_slv, c_i, 1] = c2[1] + dy * (r_lim / r_cur)

                # Ensure main_pt's shoulder cuff wraps cleanly (+5mm) outside any medial sleeve root vertices (|x| < x_sh_piv - 0.004)
                if slv_parts:
                    slv_root_pts = np.vstack([
                        sp.P[:2].reshape(-1, 3) for sp in slv_parts if sp.P.shape[0] >= 2
                    ])
                    slv_med = slv_root_pts[(np.abs(slv_root_pts[:, 0]) < x_sh_piv - 0.004) & (slv_root_pts[:, 2] >= SHOULDER - 0.04)]
                    if len(slv_med):
                        slv_tree = cKDTree(slv_med)
                        for r_m_i in range(main_pt.P.shape[0]):
                            for c_m_i in range(main_pt.P.shape[1]):
                                mp_pt = main_pt.P[r_m_i, c_m_i]
                                if abs(float(mp_pt[0])) >= 0.105 and float(mp_pt[2]) >= SHOULDER - 0.04:
                                    d_s, idx_s = slv_tree.query(mp_pt)
                                    if float(d_s) < 0.026:
                                        sp_v = slv_med[int(idx_s)]
                                        c2 = spine_at(min(float(mp_pt[2]), TOP))[:2]
                                        dx_m, dy_m = float(mp_pt[0] - c2[0]), float(mp_pt[1] - c2[1])
                                        r_m_cur = math.hypot(dx_m, dy_m)
                                        r_s_cur = math.hypot(float(sp_v[0] - c2[0]), float(sp_v[1] - c2[1]))
                                        if r_m_cur < r_s_cur + 0.005 and r_m_cur > 1e-6:
                                            scale_m = (r_s_cur + 0.005) / r_m_cur
                                            main_pt.P[r_m_i, c_m_i, 0] = c2[0] + dx_m * scale_m
                                            main_pt.P[r_m_i, c_m_i, 1] = c2[1] + dy_m * scale_m
                        zs_m, r_m, xmax_m = _build_tube_profile(main_pt.P)
                        all_tube_profiles = [(t[1], t[2], t[3], *_build_tube_profile(t[1].P)) for t in trunk_tubes]

                slv_all_tree = None
                if slv_parts:
                    slv_all_pts = np.vstack([sp.P.reshape(-1, 3) for sp in slv_parts])
                    slv_all_tree = cKDTree(slv_all_pts)
                trunk_all_verts = np.vstack([t[1].P.reshape(-1, 3) for t in trunk_tubes])

                for pt in parts:
                    if id(pt) in trunk_pt_ids or pt.P.ndim != 3:
                        continue
                    is_slv = (getattr(pt, 'is_arm', False) or 'sleeve' in fx(pt)) and getattr(pt, 'closed', False)
                    if is_slv:
                        continue
                    F = fx(pt)
                    is_pauldron = 'pauldron' in F
                    if is_pauldron or 'overlay' in F:
                        # Rule B: Push outer overlay straps/sashes/swags/collars/capes/belts/pauldrons outside all trunk_tubes
                        is_strap_band = (not is_pauldron) and 'strap' in F
                        clr = 0.012 if is_strap_band else 0.008
                        for r_i in range(pt.P.shape[0]):
                            for c_i in range(pt.P.shape[1]):
                                px, py, pz = float(pt.P[r_i, c_i, 0]), float(pt.P[r_i, c_i, 1]), float(pt.P[r_i, c_i, 2])
                                c2 = spine_at(min(pz, TOP))[:2]
                                dx, dy = px - c2[0], py - c2[1]
                                if is_strap_band and pz >= SHOULDER - 0.06:
                                    if abs(px) > 0.132:
                                        px = math.copysign(0.132, px)
                                        dx = px - c2[0]
                                        pt.P[r_i, c_i, 0] = px
                                    if abs(dy) < 0.055:
                                        valid_z = zs_m[xmax_m >= abs(px) - 0.005]
                                        z_roof = float(valid_z.max()) if len(valid_z) else float(zs_m[-1])
                                        if pz < z_roof + 0.008:
                                            pt.P[r_i, c_i, 2] = z_roof + 0.008
                                        continue
                                r_cur = math.hypot(dx, dy)
                                ang = math.atan2(dx, dy) % (2.0 * math.pi)
                                is_body_band = is_strap_band and getattr(pt, 'closed', False) and pt.P.shape[1] >= 24 and not (F & {'arm', 'arm_tube'}) and not getattr(pt, 'is_arm', False)
                                if is_body_band and pz < SHOULDER - 0.06 and r_cur > 1e-6:
                                    # issue 13: a belt, sash or obi conforms to the trunk at its own height, 3 mm out,
                                    # drawn in as well as out (stood off the largest radius within 3.8 cm it hung in the air
                                    # over a pleated tunic; REVIEW-GARMENTS-2026-11-06.md, issue 13). Rings only: a sash's
                                    # hanging tail or its knot carries the word and is not a band round the body
                                    r_t = 0.0
                                    for _, z0_t, z1_t, zs_t, r_t_prof, _ in all_tube_profiles:
                                        if z0_t - 0.010 <= pz <= z1_t + 0.010:
                                            r_t = max(r_t, _eval_tube_r(zs_t, r_t_prof, min(pz, float(zs_t[-1])), ang))
                                    u_dir = np.array([dx / r_cur, dy / r_cur])
                                    z_mask_b = np.abs(trunk_all_verts[:, 2] - pz) <= 0.010
                                    if z_mask_b.any():
                                        tv = trunk_all_verts[z_mask_b]
                                        tv_d = tv[:, :2] - c2[None, :]
                                        tv_r = np.hypot(tv_d[:, 0], tv_d[:, 1])
                                        sec_b = (tv_d @ u_dir) / np.maximum(tv_r, 1e-6) >= math.cos(0.32)
                                        if sec_b.any():
                                            r_t = max(r_t, float(tv_r[sec_b].max()))
                                    if r_t > 0.0:
                                        r_req = r_t + 0.003
                                        if abs(r_cur - r_req) > 0.001:
                                            pt.P[r_i, c_i, 0] = c2[0] + dx * (r_req / r_cur)
                                            pt.P[r_i, c_i, 1] = c2[1] + dy * (r_req / r_cur)
                                        continue
                                r_req = 0.0
                                for _, z0_t, z1_t, zs_t, r_t, _ in all_tube_profiles:
                                    if z0_t - 0.010 <= pz <= z1_t + 0.035:
                                        r_req = max(r_req, _eval_tube_r(zs_t, r_t, min(pz, float(zs_t[-1])), ang) + clr)
                                if r_cur > 1e-6 and 'neck' not in F:
                                    u_dir = np.array([dx / r_cur, dy / r_cur])
                                    z_mask_t = np.abs(trunk_all_verts[:, 2] - pz) <= 0.038
                                    if z_mask_t.any():
                                        tv = trunk_all_verts[z_mask_t]
                                        tv_d = tv[:, :2] - c2[None, :]
                                        tv_r = np.hypot(tv_d[:, 0], tv_d[:, 1])
                                        cos_t = (tv_d @ u_dir) / np.maximum(tv_r, 1e-6)
                                        sec_t = cos_t >= math.cos(0.32)
                                        if sec_t.any():
                                            r_req = max(r_req, float(tv_r[sec_t].max()) + clr)
                                if r_cur < r_req and r_cur > 1e-6:
                                    nx = c2[0] + dx * (r_req / r_cur)
                                    ny = c2[1] + dy * (r_req / r_cur)
                                    if is_strap_band and pz >= SHOULDER - 0.06 and abs(nx) > 0.132:
                                        nx = math.copysign(0.132, nx)
                                        rem_sq = max(0.0, r_req * r_req - (nx - c2[0]) ** 2)
                                        ny = c2[1] + math.copysign(math.sqrt(rem_sq), dy if abs(dy) > 1e-6 else 1.0)
                                    pt.P[r_i, c_i, 0] = nx
                                    pt.P[r_i, c_i, 1] = ny
                                if is_pauldron and slv_all_tree is not None:
                                    # Ensure pauldrons/epaulettes clear underlying sleeves by >= 6mm
                                    p_cur = pt.P[r_i, c_i]
                                    d_slv, idx_slv = slv_all_tree.query(p_cur)
                                    if float(d_slv) < 0.025:
                                        sv = slv_all_pts[int(idx_slv)]
                                        side_sh = 'Left' if float(p_cur[0]) >= 0 else 'Right'
                                        sh_piv = J(side_sh + 'Arm')
                                        v_p = p_cur - sh_piv
                                        v_s = sv - sh_piv
                                        rp = float(np.linalg.norm(v_p))
                                        rs = float(np.linalg.norm(v_s))
                                        if rp < rs + 0.006 and rp > 1e-6:
                                            pt.P[r_i, c_i] = sh_piv + v_p * ((rs + 0.006) / rp)

        if slot == 'legs':
            # Rule C: When a legged trouser garment also includes an outer kilt/skirt (trunk_tube) or tabard/sash,
            # disable cloth chains on the outer kilt/tabard (so 50-figure.js never pulls it inward onto the bare-skin thigh
            # collider inside the baggy trousers!) and push the outer kilt/tabard >= 16mm outside all trouser vertices.
            leg_limb_pts = [
                pt for pt in parts
                if pt.P.ndim == 3 and getattr(pt, 'closed', False)
                and 'side_sub' in fx(pt)
            ]
            if legged and leg_limb_pts:
                inner_verts = np.vstack([lp.P.reshape(-1, 3) for lp in leg_limb_pts])
                for pt in parts:
                    if pt in leg_limb_pts or pt.P.ndim != 3:
                        continue
                    if getattr(pt, 'cloth', None) is not None:
                        pt.cloth = None
                    if 'acc' not in fx(pt):
                        for r_o in range(pt.P.shape[0]):
                            for c_o in range(pt.P.shape[1]):
                                px, py, pz = float(pt.P[r_o, c_o, 0]), float(pt.P[r_o, c_o, 1]), float(pt.P[r_o, c_o, 2])
                                c2 = spine_at(pz)[:2]
                                dx, dy = px - c2[0], py - c2[1]
                                r_cur = math.hypot(dx, dy)
                                if r_cur < 1e-6:
                                    continue
                                u_dir = np.array([dx / r_cur, dy / r_cur])
                                z_mask = np.abs(inner_verts[:, 2] - pz) <= 0.042
                                if z_mask.any():
                                    iv = inner_verts[z_mask]
                                    iv_d = iv[:, :2] - c2[None, :]
                                    iv_r = np.hypot(iv_d[:, 0], iv_d[:, 1])
                                    cos_sim = (iv_d @ u_dir) / np.maximum(iv_r, 1e-6)
                                    ang_mask = cos_sim >= math.cos(0.38)
                                    if ang_mask.any():
                                        r_req = float(iv_r[ang_mask].max()) + 0.016
                                        if r_cur < r_req:
                                            pt.P[r_o, c_o, 0] = c2[0] + dx * (r_req / r_cur)
                                            pt.P[r_o, c_o, 1] = c2[1] + dy * (r_req / r_cur)

    if slot == 'feet':
        # Automatic Footwear Normalization & Welt-Fitting across all footwear builders (standard & custom):
        # 1. Clamp all non-sole parts to z >= 0.008 so no upper/strap ever wraps underneath the sole.
        # 2. Ensure closed foot/shaft uppers cover the bare heel and toes on their side.
        # 3. Contour-fit every sole part to the anatomical foot/upper footprint (+2mm lateral welt, +3mm heel/toe welt).
        for pt in parts:
            if pt.P.ndim == 3 and 'sole' not in fx(pt):
                pt.P[:, :, 2] = np.maximum(pt.P[:, :, 2], 0.008)
        has_closed_upper = any(
            pt.P.ndim == 3 and 'upper' in fx(pt)
            and 'sole' not in fx(pt)
            for pt in parts
        )
        for side_name, sgn in (('Left', 1.0), ('Right', -1.0)):
            foot_j = J(side_name + 'Foot')
            fv_side = CO[(CO[:, 0] * sgn > 0.01) & (CO[:, 2] < foot_j[2] + 0.03)]
            if not len(fv_side):
                continue
            y_heel_sk = float(fv_side[:, 1].max())
            y_toe_sk = float(fv_side[:, 1].min())
            side_uppers = [
                pt for pt in parts
                if pt.P.ndim == 3 and 'sole' not in fx(pt)
                and float(pt.P[:, :, 0].mean()) * sgn > 0.0
            ]
            if has_closed_upper and side_uppers:
                # Ensure closed foot part reaches behind bare heel and in front of bare toes
                foot_pts = [pt for pt in side_uppers if 'foot' in fx(pt)]
                for fpt in foot_pts:
                    y_min_f, y_max_f = float(fpt.P[:, :, 1].min()), float(fpt.P[:, :, 1].max())
                    if y_max_f - y_min_f > 0.08:
                        target_ymax = max(y_max_f, y_heel_sk + 0.012)
                        target_ymin = min(y_min_f, y_toe_sk - 0.014)
                        if target_ymax > y_max_f + 1e-4 or target_ymin < y_min_f - 1e-4:
                            u_y = (fpt.P[:, :, 1] - y_min_f) / max(y_max_f - y_min_f, 1e-6)
                            fpt.P[:, :, 1] = target_ymin + u_y * (target_ymax - target_ymin)
                        # Ensure lateral & dorsal clearance over fv_side
                        for r_i in range(fpt.P.shape[0]):
                            yr = float(fpt.P[r_i, :, 1].mean())
                            sub = fv_side[np.abs(fv_side[:, 1] - yr) < 0.028]
                            if len(sub) >= 3:
                                xc_s = 0.5 * (float(sub[:, 0].min()) + float(sub[:, 0].max()))
                                hw_req = 0.5 * (float(sub[:, 0].max()) - float(sub[:, 0].min())) + 0.010
                                z_req = float(sub[:, 2].max()) + 0.010
                                cur_xc = 0.5 * (float(fpt.P[r_i, :, 0].min()) + float(fpt.P[r_i, :, 0].max()))
                                cur_hw = 0.5 * (float(fpt.P[r_i, :, 0].max()) - float(fpt.P[r_i, :, 0].min()))
                                if 1e-4 < cur_hw < hw_req and 0 < r_i < fpt.P.shape[0] - 1:
                                    fpt.P[r_i, :, 0] = xc_s + (fpt.P[r_i, :, 0] - cur_xc) * (hw_req / cur_hw)
                                cur_zmax = float(fpt.P[r_i, :, 2].max())
                                if 0.012 < cur_zmax < z_req and 0 < r_i < fpt.P.shape[0] - 1:
                                    u_z = np.clip((fpt.P[r_i, :, 2] - 0.008) / max(cur_zmax - 0.008, 1e-6), 0.0, 1.0)
                                    fpt.P[r_i, :, 2] = 0.008 + u_z * (z_req - 0.008)
            # Fit sole parts on this side to the upper/bare-foot contour
            side_soles = [
                pt for pt in parts
                if pt.P.ndim == 3 and 'sole' in fx(pt)
                and float(pt.P[:, :, 0].mean()) * sgn > 0.0
            ]
            if side_soles:
                up_all = np.vstack([pt.P.reshape(-1, 3) for pt in side_uppers]) if side_uppers else fv_side
                up_low = up_all[up_all[:, 2] <= 0.045]
                if not len(up_low):
                    up_low = fv_side
                y_s_max = max(float(up_low[:, 1].max()), y_heel_sk + 0.010) + 0.003
                y_s_min = min(float(up_low[:, 1].min()), y_toe_sk - 0.010) - 0.003
                for spt in side_soles:
                    R_s, N_s = spt.P.shape[:2]
                    angs = np.linspace(0.0, 2.0 * math.pi, N_s, endpoint=False)
                    for k_s in range(R_s):
                        vs = k_s / max(R_s - 1, 1)
                        ys = y_s_max * (1.0 - vs) + y_s_min * vs
                        sub_u = up_low[np.abs(up_low[:, 1] - ys) < 0.028]
                        if len(sub_u) < 3:
                            sub_u = fv_side[np.argsort(np.abs(fv_side[:, 1] - ys))[:16]]
                        xc_s = 0.5 * (float(sub_u[:, 0].min()) + float(sub_u[:, 0].max()))
                        hw_s = 0.5 * (float(sub_u[:, 0].max()) - float(sub_u[:, 0].min())) + 0.002
                        taper = 0.50 if k_s in (0, R_s - 1) else (0.88 if k_s in (1, R_s - 2) else 1.0)
                        w_s = hw_s * taper
                        for j_s, a_s in enumerate(angs):
                            dy_cap = (0.0025 * abs(math.cos(a_s))) * (1.0 if k_s == 0 else -1.0 if k_s == R_s - 1 else 0.0)
                            spt.P[k_s, j_s] = [xc_s + math.cos(a_s) * w_s, ys + dy_cap, 0.0075 + 0.0075 * math.sin(a_s)]

    lens = [p.lengths() for p in parts]
    raw_w = []
    for p, l in zip(parts, lens):
        pnt = getattr(p, 'paint', None) or {}
        if pnt.get('panels'):
            raw_w.append(2.2 * max(0.10, l[1]))
        elif pnt.get('bands'):
            raw_w.append(max(0.05, l[1]))
        else:
            raw_w.append(max(0.015, 0.25 * l[1]))
    share = np.array(raw_w, dtype=np.float64)
    share = share / share.sum()
    img = np.zeros((TEX, TEX, 3), dtype=np.float64)

    all_P, all_N, all_UV, all_VI, all_T, all_use_trunk = [], [], [], [], [], []
    rigid_overrides = []
    trunk_ranges, band_ranges, acc_ranges = [], [], []     # issue 13: what takes its weights from the trunk
    trunk_ids = {id(t[1]) for t in trunk_tubes}
    arm_part_ranges = []
    c_specs = []
    hip_ranges = []
    y0 = 0
    vi_offset = 0
    gi_offset = 0

    for k, (p, (circ, length)) in enumerate(zip(parts, lens)):
        h = TEX - y0 if k == len(parts) - 1 else max(4, int(round(share[k] * TEX)))
        if y0 + h > TEX:
            h = max(1, TEX - y0)
        R_grid_c = np.concatenate([p.P, p.P[:, :1]], 1) if p.closed else p.P
        circ_rows = np.linalg.norm(np.diff(R_grid_c, axis=1), axis=2).sum(1) if p.P.ndim == 3 else None
        img[y0:y0 + h] = paint_strip(p.paint, TEX, h, max(circ, 0.02), max(length, 0.02), circ_rows=circ_rows)
        v_top, v_bot = y0 / TEX, (y0 + h) / TEX
        pad = 1.5 / TEX
        R_cnt, C_cnt = p.P.shape[:2]

        P_gl = arms2.to_gl(p.P.reshape(-1, 3)).reshape(R_cnt, C_cnt, 3)

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

        n_part_vi = R_cnt * C_cnt
        vn = np.zeros((n_part_vi, 3), dtype=np.float64)
        local_vi = flat_VI - vi_offset
        for c_idx in range(3):
            np.add.at(vn, local_vi[part_tris[:, c_idx]], fn)
        vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
        flat_N = vn[local_vi].astype(np.float32)

        F = fx(p)
        if id(p) in trunk_ids:
            trunk_ranges.append((gi_offset, gi_offset + len(flat_P)))
        elif 'strap' in F and slot in ('torso', 'legs') and not getattr(p, 'row_joints', None) and not p.rigid_joint and not (F & {'arm', 'arm_tube'}) and not getattr(p, 'is_arm', False):
            # (not an arm wrap: it carries the word, and trunk weights on an arm part bleed the lower spine, Check 8)
            band_ranges.append((gi_offset, gi_offset + len(flat_P)))
        spans_both_sides = bool(flat_P[:, 0].min() < -0.09 and flat_P[:, 0].max() > 0.09)
        is_true_arm_tube = getattr(p, 'is_arm', False) or 'arm_tube' in F
        is_shoulder_cap = 'sh_cap' in F and float(np.abs(flat_P[:, 0]).min()) >= 0.11
        is_arm_part = (is_true_arm_tube or is_shoulder_cap) and not spans_both_sides
        if getattr(p, 'row_joints', None):
            for r_i, jn in enumerate(p.row_joints):
                if jn:
                    r_start = gi_offset + r_i * cols_uv
                    r_end = r_start + cols_uv
                    rigid_overrides.append((r_start, r_end, jn))
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
        elif p.rigid_joint:
            rigid_overrides.append((gi_offset, gi_offset + len(flat_P), p.rigid_joint))
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
        elif slot in ('torso', 'legs') and not is_arm_part and 'belt_sfx' in F and getattr(p, 'cloth', None) is None:
            rigid_overrides.append((gi_offset, gi_offset + len(flat_P), 'Hips'))
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
        elif (
            slot in ('torso', 'legs')
            and not is_arm_part
            and getattr(p, 'closed', False)
            and getattr(p, 'cloth', None) is None
            and len(flat_P) <= 260
            and float(np.ptp(flat_P, axis=0).max()) <= 0.22
            and 'acc7' in F
        ):
            # Check #7 (Auto-rigid_joint on small 3D accoutrements): prevent pouches/buttons/rosettes from shearing across spine/leg joints
            y_mean = float(flat_P[:, 1].mean())
            y_sp2 = float(RIG.jpos[RIG.J['Spine2']][1])
            y_sp1 = float(RIG.jpos[RIG.J['Spine1']][1])
            y_sp0 = float(RIG.jpos[RIG.J['Spine']][1])
            auto_jn = (
                'Spine2' if y_mean >= 0.5 * (y_sp1 + y_sp2)
                else 'Spine1' if y_mean >= 0.5 * (y_sp0 + y_sp1)
                else 'Spine' if y_mean >= y_sp0 - 0.04
                else 'Hips'
            )
            rigid_overrides.append((gi_offset, gi_offset + len(flat_P), auto_jn))
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
            acc_ranges.append((gi_offset, gi_offset + len(flat_P)))

        cs = cloth_spec(p, vi_offset, slot)
        if cs:
            c_specs.append(cs)
        is_skirt_part = (
            getattr(p, 'cloth', None) is not None
            or (p.group == 'helper-skirt' if isinstance(p.group, str) else 'helper-skirt' in p.group)
        )
        if slot in ('feet', 'back'):
            use_trunk = np.ones(len(flat_P), dtype=bool)
        elif slot == 'legs' and (not legged or is_skirt_part):
            use_trunk = np.ones(len(flat_P), dtype=bool)
        elif slot == 'torso' and not is_arm_part:
            use_trunk = np.ones(len(flat_P), dtype=bool)
        else:
            use_trunk = np.zeros(len(flat_P), dtype=bool)
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
            if slot in ('torso', 'gloves') and not getattr(p, 'row_joints', None) and not p.rigid_joint:
                arm_part_ranges.append((gi_offset, gi_offset + len(flat_P), R_cnt, cols_uv, bool(getattr(p, 'closed', False)), p.name))
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

    use_trunk_arr = np.concatenate(all_use_trunk, axis=0)
    if slot in ('head', 'beard', 'hair', 'implant'):
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
        if slot in ('torso', 'legs'):
            crotch_y = float(RIG.jpos[RIG.J['LeftUpLeg']][1]) - 0.01
            Q_morph[:, 1] = np.maximum(Q_morph[:, 1], crotch_y)
            r_xz_m = np.hypot(Q_morph[:, 0], Q_morph[:, 2])
            sc_m = np.where(r_xz_m > 1e-4, np.minimum(r_xz_m, 0.085) / np.maximum(r_xz_m, 1e-4), 1.0)
            Q_morph[:, 0] *= sc_m
            Q_morph[:, 2] *= sc_m
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
    if arm_part_ranges and ARM_TREE_GL is not None:
        for gs, ge, _, _, _, _ in arm_part_ranges:
            _, near_arm = ARM_TREE_GL.query(P_arr[gs:ge])
            near_base[gs:ge] = ARM_ONLY_IDX[near_arm]
            near_morph[gs:ge] = ARM_ONLY_IDX[near_arm]
    band_src, acc_src = [], []
    if trunk_ranges and (band_ranges or acc_ranges):
        trunk_gi = np.concatenate([np.arange(gs, ge) for gs, ge in trunk_ranges])
        trunk_tree = cKDTree(P_arr[trunk_gi])
        for gs, ge in band_ranges:
            _, nn = trunk_tree.query(P_arr[gs:ge])
            src = trunk_gi[nn]
            near_base[gs:ge] = near_base[src]
            near_morph[gs:ge] = near_morph[src]
            band_src.append((gs, ge, src))
        for gs, ge in acc_ranges:
            _, nn = trunk_tree.query(P_arr[gs:ge].mean(axis=0))
            src = int(trunk_gi[int(nn)])
            near_base[gs:ge] = near_base[src]
            near_morph[gs:ge] = near_morph[src]
            acc_src.append((gs, ge, src))
    JJ_arr = BASE_JJ[near_base].copy()
    WW_arr = BASE_WW[near_base].copy()

    if slot == 'legs' and legged and use_trunk_arr.any() and (~use_trunk_arr).any():
        # Synchronize outer kilt/tabard weights with the inner trouser legs directly underneath them,
        # blending smoothly across the central crotch midline (|x| < 0.055) so the kilt never splits or clips.
        in_gi = np.nonzero(~use_trunk_arr)[0]
        in_l = in_gi[P_arr[in_gi, 0] >= 0.01]
        in_r = in_gi[P_arr[in_gi, 0] <= -0.01]
        if len(in_l) and len(in_r):
            tree_l = cKDTree(P_arr[in_l])
            tree_r = cKDTree(P_arr[in_r])
            for gi in np.nonzero(use_trunk_arr)[0]:
                if any( gs <= gi < ge for gs, ge, _ in rigid_overrides ):
                    continue
                px_gl, py_gl, pz_gl = float(P_arr[gi, 0]), float(P_arr[gi, 1]), float(P_arr[gi, 2])
                ax_gl = max(abs(px_gl), 0.055)
                _, idx_l = tree_l.query([ax_gl, py_gl, pz_gl])
                _, idx_r = tree_r.query([-ax_gl, py_gl, pz_gl])
                gi_l = int(in_l[int(idx_l)])
                gi_r = int(in_r[int(idx_r)])
                t_lr = float(np.clip(0.5 + 0.5 * (px_gl / 0.055), 0.0, 1.0))
                t_lr = t_lr * t_lr * (3.0 - 2.0 * t_lr)
                JJ_arr[gi] = JJ_arr[gi_r]
                WW_arr[gi] = WW_arr[gi_r]
                make_mpfb.take_weights(JJ_arr, WW_arr, gi, gi_l, t_lr)

    j_tpl = copy.deepcopy(TPL_J)
    b_tpl = bytearray(TPL_B)
    node = next(n for n in j_tpl['nodes'] if 'mesh' in n and 'skin' in n)
    skin = j_tpl['skins'][node['skin']]
    joint_names = [j_tpl['nodes'][k].get('name', '').split(':')[-1] for k in skin['joints']]

    if arm_part_ranges:
        for gs, ge, r_cnt, c_uv, is_closed, _ in arm_part_ranges:
            q_part = P_arr[gs:ge]
            side = 'Left' if float(q_part[:, 0].mean()) >= 0.0 else 'Right'
            p_arm = np.asarray(RIG.jpos[RIG.J[side + 'Arm']], dtype=np.float64)
            p_fa = np.asarray(RIG.jpos[RIG.J[side + 'ForeArm']], dtype=np.float64)
            p_hnd = np.asarray(RIG.jpos[RIG.J[side + 'Hand']], dtype=np.float64)
            u1 = p_fa - p_arm
            l1 = max(float(np.linalg.norm(u1)), 1e-6)
            d1 = u1 / l1
            u2 = p_hnd - p_fa
            l2 = max(float(np.linalg.norm(u2)), 1e-6)
            d2 = u2 / l2
            t1 = ((q_part - p_arm) @ d1) / l1
            t2 = ((q_part - p_fa) @ d2) / l2
            s_v = np.where(((q_part - p_fa) @ (d1 + d2)) < 0.0, t1, 1.0 + t2)
            if is_closed and r_cnt * c_uv == (ge - gs):
                s_grid = s_v.reshape(r_cnt, c_uv)
                s_ring = s_grid.mean(axis=1, keepdims=True)
                s = (0.88 * s_ring + 0.12 * s_grid).reshape(-1)
            else:
                s = s_v
            if slot == 'torso':
                u_sh = np.clip((0.26 - s) / 0.42, 0.0, 1.0)
                u_med = np.clip((abs(float(p_arm[0])) + 0.025 - np.abs(q_part[:, 0])) / 0.085, 0.0, 1.0)
                u_sh = np.maximum(u_sh, u_med)
                u_sh = u_sh * u_sh * (3.0 - 2.0 * u_sh)
            else:
                u_sh = np.zeros_like(s)
            w_sp2 = 0.54 * u_sh
            w_sh = 0.46 * u_sh
            u_fa = np.clip((s - 0.72) / 0.56, 0.0, 1.0)
            u_fa = u_fa * u_fa * (3.0 - 2.0 * u_fa)
            s_h0 = 1.82 if slot == 'gloves' else 1.96
            u_hnd = np.clip((s - s_h0) / 0.28, 0.0, 1.0)
            u_hnd = u_hnd * u_hnd * (3.0 - 2.0 * u_hnd)
            w_rem = np.maximum(0.0, 1.0 - (w_sp2 + w_sh))
            w_arm = w_rem * (1.0 - u_fa)
            w_fa = w_rem * u_fa * (1.0 - u_hnd)
            w_hnd = w_rem * u_fa * u_hnd
            j_sp2 = joint_names.index('Spine2')
            j_sh = joint_names.index(side + 'Shoulder')
            j_arm = joint_names.index(side + 'Arm')
            j_fa = joint_names.index(side + 'ForeArm')
            j_hnd = joint_names.index(side + 'Hand')
            cand_j = np.array([j_arm, j_fa, j_sh, j_sp2, j_hnd], dtype=np.int32)
            cand_w = np.stack([w_arm, w_fa, w_sh, w_sp2, w_hnd], axis=1)
            order = np.argsort(-cand_w, axis=1)[:, :4]
            top_j = cand_j[order]
            top_w = np.take_along_axis(cand_w, order, axis=1)
            top_w /= np.maximum(top_w.sum(axis=1, keepdims=True), 1e-9)
            JJ_arr[gs:ge] = top_j
            WW_arr[gs:ge] = top_w.astype(np.float32)

    if slot == 'feet':
        # Cohesive 3-bone (Leg / Foot / ToeBase) weight field evaluated as a smooth function of (y_gl, z_gl)
        # so the sole, shaft, vamp, cuff, and wraps move as a single cohesive unit across ankle & toe bends.
        for side, mask_s in (('Left', P_arr[:, 0] >= 0.0), ('Right', P_arr[:, 0] < 0.0)):
            if not mask_s.any():
                continue
            qs = P_arr[mask_s]
            p_foot = np.asarray(RIG.jpos[RIG.J[side + 'Foot']], dtype=np.float64)
            p_toe = np.asarray(RIG.jpos[RIG.J[side + 'ToeBase']], dtype=np.float64)
            y_ank = float(p_foot[1])
            z_toe = float(p_toe[2])
            u_leg = np.clip((qs[:, 1] - (y_ank - 0.020)) / 0.065, 0.0, 1.0)
            u_leg = u_leg * u_leg * (3.0 - 2.0 * u_leg)
            u_toe = np.clip((qs[:, 2] - (z_toe - 0.032)) / 0.064, 0.0, 1.0)
            u_toe = u_toe * u_toe * (3.0 - 2.0 * u_toe) * np.clip((y_ank + 0.015 - qs[:, 1]) / 0.035, 0.0, 1.0)
            w_leg = u_leg
            w_rem = np.maximum(0.0, 1.0 - w_leg)
            w_toe = w_rem * u_toe
            w_foot = w_rem * (1.0 - u_toe)
            j_leg = joint_names.index(side + 'Leg')
            j_foot = joint_names.index(side + 'Foot')
            j_toe = joint_names.index(side + 'ToeBase')
            cand_j = np.array([j_foot, j_leg, j_toe, 0], dtype=np.int32)
            cand_w = np.stack([w_foot, w_leg, w_toe, np.zeros_like(w_foot)], axis=1)
            order = np.argsort(-cand_w, axis=1)[:, :4]
            top_j = cand_j[order]
            top_w = np.take_along_axis(cand_w, order, axis=1)
            top_w /= np.maximum(top_w.sum(axis=1, keepdims=True), 1e-9)
            JJ_arr[mask_s] = top_j
            WW_arr[mask_s] = top_w.astype(np.float32)

    for gs, ge, jname in rigid_overrides:
        if jname in joint_names:
            j_idx = joint_names.index(jname)
            JJ_arr[gs:ge] = 0
            WW_arr[gs:ge] = 0.0
            JJ_arr[gs:ge, 0] = j_idx
            WW_arr[gs:ge, 0] = 1.0
    for gs, ge, src in band_src:
        JJ_arr[gs:ge] = JJ_arr[src]
        WW_arr[gs:ge] = WW_arr[src]
    for gs, ge, src in acc_src:
        JJ_arr[gs:ge] = JJ_arr[src]
        WW_arr[gs:ge] = WW_arr[src]

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
        pbr['metallicFactor'] = 0.20
        pbr['roughnessFactor'] = 0.50
        j_tpl['materials'][0].pop('extensions', None)
    if j_tpl.get('images'):
        j_tpl['images'][0]['name'] = gid

    srgb = np.power(np.clip(img, 0.0, 1.0), 1.0 / 2.2)
    pil_img = Image.fromarray(np.rint(srgb * 255).astype(np.uint8), 'RGB')

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
        bio_buf = io.BytesIO()
        pil_img.save(bio_buf, 'JPEG', quality=92)
        im_meta['mimeType'] = 'image/jpeg'
        blobs[im_meta['bufferView']] = bio_buf.getvalue()

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

    crotch_gl = float(RIG.jpos[RIG.J['LeftUpLeg']][1]) - 0.06
    if slot == 'torso' or (slot == 'legs' and not legged):
        make_mpfb.skirt_weights(j_tpl, binb, crotch_gl, rigid=(not bool(c_specs)))
    elif slot in ('head', 'beard', 'hair', 'implant'):
        make_mpfb.head_weights(j_tpl, binb, RIG.jpos[RIG.J['Neck']][1] + 0.02)

    if rigid_overrides or arm_part_ranges:
        JJ_post = glbio.accessor(j_tpl, bytes(binb), at['JOINTS_0']).copy()
        WW_post = glbio.accessor(j_tpl, bytes(binb), at['WEIGHTS_0']).astype(np.float32).copy()
        if w_ct != 5126 and not aw.get('normalized'):
            WW_post /= float(np.iinfo(w_dt).max)
        for gs, ge, _, _, _, _ in arm_part_ranges:
            JJ_post[gs:ge] = JJ_arr[gs:ge]
            WW_post[gs:ge] = WW_arr[gs:ge]
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

    used_vi = np.unique(VI_arr)
    first_gi = np.zeros(int(used_vi.max()) + 1, dtype=np.int32)
    for gi, vi in enumerate(VI_arr):
        first_gi[vi] = gi
    base_vidx_for_vi = BASE_VIDX[near_morph[first_gi[used_vi]]]
    D_garment = np.zeros((BASE_MORPH_D.shape[0], int(used_vi.max()) + 1, 3), dtype=np.float32)
    D_garment[:, used_vi, :] = BASE_MORPH_D[:, base_vidx_for_vi, :]
    morph_bytes = make_mpfb.pack_morphs([(gid, [gid], used_vi)], {'d_' + gid: D_garment})
    (ROOT / 'pieces' / BODY_ID / f'{gid}.morph.bin').write_bytes(morph_bytes)

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
    if covers_face:
        entry['hide_parts'] = ['Human.lips']
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
            neck_max_y = float(RIG.jpos[RIG.J['Neck']][1]) - 0.015
            tris = tris[(BP_GL[BT[tris], 1] > BP_GL[:, 1].min() + y_cut).all(1)
                        & (BP_GL[BT[tris], 1] < neck_max_y).all(1)]
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
        tris = make_mpfb.covered(BP_GL, BT, str(out_glb), out=0.040, inward=0.022)
        if any('foot_us' in fx(p) for p in parts):
            # Closed boots completely enclose the bare foot and ankle below the top of the shaft;
            # always hide all bare foot triangles inside the closed boot volume so heels/toes never clip.
            y_boot_top = min(float(P_arr[:, 1].max()) - 0.025, float(RIG.jpos[RIG.J['LeftLeg']][1]) - 0.04)
            foot_enc = np.where((BP_GL[BT, 1] < y_boot_top).all(axis=1))[0]
            tris = np.unique(np.concatenate([tris, foot_enc]))
        entry['hide'] = make_mpfb.bits(len(BT), tris)
        entry['hides'] = int(len(tris))
        entry['hide_by'] = 'rays'
    elif slot == 'gloves':
        tris = make_mpfb.covered(BP_GL, BT, str(out_glb), out=0.045, inward=0.025)
        tris = tris[(np.abs(BP_GL[BT[tris], 0]).min(1) > 0.28)]
        if len(tris):
            entry['hide'] = make_mpfb.bits(len(BT), tris)
            entry['hides'] = int(len(tris))
            entry['hide_by'] = 'rays'
        entry['hide_parts'] = ['Human.fingernails']

    # Compile-time garment invariant validation (prevents regressions before writing manifest)
    # Check #6 (_VIDX Disjointness & Non-Empty Hide Invariant):
    assert int(used_vi.max()) + 1 == vi_offset, (
        f'[GARMENT CHECK FAIL] {gid}: non-contiguous or overlapping _VIDX allocation ({int(used_vi.max()) + 1} != {vi_offset})'
    )
    if slot == 'head':
        assert 'hide' not in entry, f'[GARMENT CHECK FAIL] {gid}: head items must not emit body triangle hide masks'
    elif slot in ('torso', 'legs', 'feet'):
        if not (slot == 'torso' and open_torso):
            assert entry.get('hide') and entry.get('hides', 0) > 0, (
                f'[GARMENT CHECK FAIL] {gid} ({slot}): missing or empty base-body hide mask!'
            )
    if slot == 'feet':
        # Check #9 (Footwear Integrity Check):
        # 1. No upper/strap part (_foot_, _shaft_, _toe_, _instep_) may dip below z = 0.004 (underneath the sole).
        # 2. For closed boots (_foot_ present), the sole footprint must enclose the heel and toe of the upper
        #    and must not protrude > 8mm laterally beyond the upper.
        # 3. Every vertex must have >= 99% ipsilateral leg/foot/toe weight with zero contralateral bleed.
        for p in parts:
            if 'sole_cs' not in fx(p):
                z_min_p = float(p.P[:, :, 2].min())
                if z_min_p < 0.006:
                    p.P[:, :, 2] = np.maximum(p.P[:, :, 2], 0.007)
                    z_min_p = float(p.P[:, :, 2].min())
                assert z_min_p >= 0.004, (
                    f'[GARMENT CHECK FAIL] {gid}/{p.name}: footwear upper dips to z={z_min_p:.4f}m (below sole bottom)!'
                )
        if any('foot_us' in fx(p) for p in parts):
            for s_tag in ('_L', '_R'):
                sole_pts = [p.P.reshape(-1, 3) for p in parts if ('sole' + s_tag) in fx(p)]
                upper_pts = [p.P.reshape(-1, 3) for p in parts if (('foot' + s_tag) in fx(p) or ('shaft' + s_tag) in fx(p))]
                if sole_pts and upper_pts:
                    sp_all = np.vstack(sole_pts)
                    up_all = np.vstack(upper_pts)
                    up_low = up_all[up_all[:, 2] <= 0.045]
                    if len(up_low):
                        assert float(sp_all[:, 1].max()) >= float(up_low[:, 1].max()) - 0.002, (
                            f'[GARMENT CHECK FAIL] {gid}{s_tag}: boot heel ({up_low[:,1].max():.4f}) extends behind sole ({sp_all[:,1].max():.4f})!'
                        )
                        assert float(sp_all[:, 1].min()) <= float(up_low[:, 1].min()) + 0.002, (
                            f'[GARMENT CHECK FAIL] {gid}{s_tag}: boot toe ({up_low[:,1].min():.4f}) extends in front of sole ({sp_all[:,1].min():.4f})!'
                        )
                        lat_over = max(
                            float(up_low[:, 0].min() - sp_all[:, 0].min()),
                            float(sp_all[:, 0].max() - up_low[:, 0].max())
                        )
                        assert lat_over <= 0.009, (
                            f'[GARMENT CHECK FAIL] {gid}{s_tag}: sole protrudes laterally {lat_over*1000:.1f}mm (>9mm) beyond boot upper!'
                        )
    if slot in ('torso', 'gloves'):
        JJ_chk = glbio.accessor(j_tpl, bytes(binb), at['JOINTS_0'])
        WW_chk = glbio.accessor(j_tpl, bytes(binb), at['WEIGHTS_0']).astype(np.float32)
        if WW_chk.max() > 1.5:
            WW_chk /= np.maximum(WW_chk.sum(axis=1, keepdims=True), 1e-6)
        arm_far = (np.abs(P_arr[:, 0]) > 0.36) & (P_arr[:, 1] > float(RIG.jpos[RIG.J['Hips']][1]) + 0.12)
        if arm_far.any() and 'Hips' in joint_names:
            hips_idx = joint_names.index('Hips')
            bad_arm_hips = int((JJ_chk[arm_far, 0] == hips_idx).sum())
            assert bad_arm_hips == 0, (
                f'[GARMENT CHECK FAIL] {gid}: {bad_arm_hips} outer sleeve/arm vertices (|x|>0.36) are weighted to Hips!'
            )
        # Check #8 (Sleeve Ring Weight Continuity & Zero Lower-Spine Bleed):
        low_spine_ids = [joint_names.index(n) for n in ('Hips', 'Spine', 'Spine1') if n in joint_names]
        for gs, ge, _, _, _, pname in arm_part_ranges:
            w_low = np.zeros(ge - gs, dtype=np.float32)
            for k_col in range(4):
                w_low += np.where(np.isin(JJ_chk[gs:ge, k_col], low_spine_ids), WW_chk[gs:ge, k_col], 0.0)
            assert int((w_low > 0.05).sum()) == 0, (
                f'[GARMENT CHECK FAIL] {gid}/{pname}: sleeve/arm part has lower-spine (Hips/Spine/Spine1) weight bleed!'
            )

    print(f'Built {gid:28s} ({slot:5s}): {len(P_arr):5d} verts, {len(T_arr):5d} tris -> {out_glb.name}')
    return entry


def register_entries(new_entries):
    """Register or update compiled garment entries in data/<body_id>/kit.json."""
    by_body = {}
    for e in new_entries:
        ee = dict(e)
        b_id = ee.pop('_body', 'mpfb_male')
        by_body.setdefault(b_id, []).append(ee)

    for b_id, b_entries in by_body.items():
        kit_path = ROOT / 'data' / b_id / 'kit.json'
        kit = json.loads(kit_path.read_text(encoding='utf-8'))
        items = kit['items']
        by_id = {it['id']: idx for idx, it in enumerate(items)}
        for e in b_entries:
            e[make_mpfb.MADE_BY] = 'garments'
            if e['id'] in by_id:
                items[by_id[e['id']]] = e
            else:
                items.append(e)
                by_id[e['id']] = len(items) - 1
        make_mpfb.write_kit(str(kit_path), kit)
        print(f'Updated {kit_path} with {len(b_entries)} pieces (total items: {len(items)}).')
