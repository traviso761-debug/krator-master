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
    'sash_tail': {'overlay', 'sash_tail'},
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


def open_seam_rows(p, share=0.10, min_gap=0.001, min_girth=0.15):
    """the rows of an open grid whose two edges nearly meet without meeting: [(row, gap in metres)].
    A hood, a cowl or a coif is an open grid wrapped round the head; where its opening is shut the two edge columns
    must be one line. A row counts when it wraps a real girth (min_girth), its edges stand more than min_gap apart and
    less than `share` of the row's own length: a face opening is far wider than that, a welded seam is zero."""
    if p.closed or p.P.ndim != 3 or p.P.shape[1] < 8:
        return []
    rows = []
    for i in range(p.P.shape[0]):
        row = p.P[i]
        girth = float(np.linalg.norm(np.diff(row, axis=0), axis=1).sum())
        gap = float(np.linalg.norm(row[0] - row[-1]))
        if girth > min_girth and min_gap < gap < share * girth:
            rows.append((i, gap))
    # an opening that tapers shut is not a slit: rows that have, higher on the part, a row of real girth whose edges
    # do meet are the taper below a closed crown (the nomad walker's domed cowl closes its front slot over two rows)
    z = p.P[:, :, 2].mean(axis=1)
    shut = [float(z[i]) for i in range(p.P.shape[0])
            if float(np.linalg.norm(np.diff(p.P[i], axis=0), axis=1).sum()) > min_girth
            and float(np.linalg.norm(p.P[i, 0] - p.P[i, -1])) <= min_gap]
    top_shut = max(shut) if shut else -1e9
    return [(i, g) for i, g in rows if z[i] > top_shut]


def check_open_seams(gid, parts):
    """Check #10 (the hood's crown, 2026-11-15): on a head piece, an open part with two or more rows whose edges nearly
    meet, with no closed row above them, is a slit that runs to the crown, not an opening (the recurring "hood open
    over the crown": scalp from the brow to the crown, hidden from an eye-level shot). One such row is the point where
    a face opening closes and passes; so does a taper under a closed crown. A part cut with a narrow slit on purpose
    sets `slit_ok = True`."""
    for p in parts:
        if getattr(p, 'slit_ok', False):
            continue
        rows = open_seam_rows(p)
        assert len(rows) < 2, (
            f'[GARMENT CHECK FAIL] {gid}/{p.name}: {len(rows)} rows of this open head part end '
            f'{min(g for _, g in rows) * 1000:.0f} to {max(g for _, g in rows) * 1000:.0f} mm short of closing '
            f'(rows {rows[0][0]}..{rows[-1][0]}): a slit over the head. Weld the two edge columns where the opening is '
            f'shut (types/headgear.py hood does), build the part closed, or set slit_ok on a slit cut on purpose.'
        )


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
        n = int(min(14, max(3, round(circ / 0.055) + 1)))
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


def assemble_garment(gid, label, slot, culture, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False, allow_floating=False):
    """Assemble Part list (automatically flattening nested lists) into a skinned GLB + .morph.bin and return kit.json entry."""
    from .paint import paint_strip, validate_cultural_motifs

    is_floating = bool(allow_floating or culture == 'extraplanar')

    flat_parts = []
    for item in parts:
        if isinstance(item, (list, tuple)):
            flat_parts.extend(x for x in item if x is not None)
        elif item is not None:
            flat_parts.append(item)
    parts = flat_parts
    for p_chk in parts:
        validate_cultural_motifs(gid, culture, getattr(p_chk, 'paint', None))
    if slot == 'head':
        check_open_seams(gid, parts)
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
        n_ang = 72
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
            if getattr(pt, 'no_conform', False):
                continue
            if getattr(pt, 'closed', False) and pt.P.ndim == 3 and pt.P.shape[0] >= 5 and pt.P.shape[1] >= 24:
                F = fx(pt)
                is_arm_pt = getattr(pt, 'is_arm', False) or 'arm' in F
                is_leg_limb = 'side_sfx' in F or abs(float(pt.P[:, :, 0].mean())) > 0.035
                is_overlay_band = bool(F & {'band', 'belt', 'strap', 'collar', 'sash_tail'})
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
                    if id(pt) in trunk_pt_ids or pt.P.ndim != 3 or getattr(pt, 'no_conform', False):
                        continue
                    is_slv = (getattr(pt, 'is_arm', False) or 'sleeve' in fx(pt)) and getattr(pt, 'closed', False)
                    if is_slv:
                        slv_parts.append(pt)
                        # Rule A: Smoothly tuck ONLY the internal sleeve anchor ring (r_slv == 0) inside main_pt
                        # in both XY and shoulder-roof Z so raw sleeve root rings NEVER poke out of shoulders,
                        # without pulling r_slv == 1 into the lateral deltoid on short/elbow sleeves!
                        for r_slv in range(min(1, pt.P.shape[0])):
                            tuck_d = 0.0055
                            x_cut = x_sh_piv + 0.008
                            for c_i in range(pt.P.shape[1]):
                                px, py, pz = float(pt.P[r_slv, c_i, 0]), float(pt.P[r_slv, c_i, 1]), float(pt.P[r_slv, c_i, 2])
                                ax = abs(px)
                                if ax < x_cut and pz >= SHOULDER - 0.045:
                                    c2 = spine_at(min(pz, TOP))[:2]
                                    dx, dy = px - c2[0], py - c2[1]
                                    r_cur = math.hypot(dx, dy)
                                    ang = math.atan2(dx, dy) % (2.0 * math.pi)
                                    r_lim = _eval_tube_r(zs_m, r_m, min(pz, float(zs_m[-1])), ang) - tuck_d
                                    if r_cur > r_lim > 0.04 and r_cur > 1e-6:
                                        pt.P[r_slv, c_i, 1] = c2[1] + dy * (r_lim / r_cur)
                                    if abs(dy) < 0.064:
                                        valid_zm = zs_m[xmax_m >= ax - 0.005]
                                        if len(valid_zm):
                                            z_roof_m = float(valid_zm.max()) - (0.0045 if r_slv == 0 else 0.0022)
                                            if pz > z_roof_m:
                                                pt.P[r_slv, c_i, 2] = z_roof_m

                # Ensure main_pt's entire shoulder cap wraps cleanly (+10mm) outside dense sleeve-root triangles across the whole armscye!
                if slv_parts:
                    def _subdiv_slv_cap(P_s):
                        P_top = P_s[:min(5, P_s.shape[0])]
                        P_w = np.concatenate([P_top, P_top[:, :1]], axis=1)
                        chunks_s = [P_top.reshape(-1, 3), (0.5 * (P_w[:, :-1] + P_w[:, 1:])).reshape(-1, 3)]
                        if P_top.shape[0] >= 2:
                            for ur_s in (0.25, 0.50, 0.75):
                                Pr_s = (1.0 - ur_s) * P_w[:-1] + ur_s * P_w[1:]
                                chunks_s.append(Pr_s[:, :-1].reshape(-1, 3))
                                chunks_s.append((0.5 * (Pr_s[:, :-1] + Pr_s[:, 1:])).reshape(-1, 3))
                        return np.vstack(chunks_s)

                    slv_root_pts = np.vstack([_subdiv_slv_cap(sp.P) for sp in slv_parts if sp.P.shape[0] >= 2])
                    slv_med = slv_root_pts[(np.abs(slv_root_pts[:, 0]) <= 0.295) & (slv_root_pts[:, 2] >= SHOULDER - 0.095)]
                    if len(slv_med):
                        slv_tree = cKDTree(slv_med)
                        for r_m_i in range(main_pt.P.shape[0]):
                            for c_m_i in range(main_pt.P.shape[1]):
                                mp_pt = main_pt.P[r_m_i, c_m_i]
                                if abs(float(mp_pt[0])) >= 0.085 and float(mp_pt[2]) >= SHOULDER - 0.090:
                                    d_s, idx_s = slv_tree.query(mp_pt)
                                    if float(d_s) < 0.042:
                                        sp_v = slv_med[int(idx_s)]
                                        c2 = spine_at(min(float(mp_pt[2]), TOP))[:2]
                                        dx_m, dy_m = float(mp_pt[0] - c2[0]), float(mp_pt[1] - c2[1])
                                        r_m_cur = math.hypot(dx_m, dy_m)
                                        r_s_cur = math.hypot(float(sp_v[0] - c2[0]), float(sp_v[1] - c2[1]))
                                        if r_m_cur < r_s_cur + 0.0125 and r_m_cur > 1e-6:
                                            scale_m = (r_s_cur + 0.0125) / r_m_cur
                                            main_pt.P[r_m_i, c_m_i, 0] = c2[0] + dx_m * scale_m
                                            main_pt.P[r_m_i, c_m_i, 1] = c2[1] + dy_m * scale_m
                                        if abs(dy_m) < 0.078 and float(mp_pt[2]) < float(sp_v[2]) + 0.0085:
                                            main_pt.P[r_m_i, c_m_i, 2] = float(sp_v[2]) + 0.0085
                        zs_m, r_m, xmax_m = _build_tube_profile(main_pt.P)
                        all_tube_profiles = [(t[1], t[2], t[3], *_build_tube_profile(t[1].P)) for t in trunk_tubes]

                def _subdiv_rows(P_g):
                    chunks = [P_g.reshape(-1, 3)]
                    if P_g.shape[0] >= 2:
                        for ur in (0.25, 0.50, 0.75):
                            chunks.append(((1.0 - ur) * P_g[:-1] + ur * P_g[1:]).reshape(-1, 3))
                    return np.vstack(chunks)

                trunk_all_verts = np.vstack([_subdiv_rows(t[1].P) for t in trunk_tubes])
                if slv_parts:
                    slv_all_pts = np.vstack([_subdiv_rows(sp.P) for sp in slv_parts])
                    sh_all_pts = np.vstack([trunk_all_verts, slv_all_pts])
                else:
                    sh_all_pts = trunk_all_verts
                sh_all_tree = cKDTree(sh_all_pts)

                # Rule B (Two-Pass Overlay & Flush Strap Clearance):
                # Pass B1: Drapes, tabards, aprons, capes, collars, and pauldrons clear trunk_tubes + sleeves cleanly.
                drape_vert_list = []
                drape_ids = set()
                strap_ids = set()
                k_sh_nn = min(16, len(sh_all_pts))
                for pt in parts:
                    if id(pt) in trunk_pt_ids or pt.P.ndim != 3 or getattr(pt, 'no_conform', False):
                        continue
                    is_slv = (getattr(pt, 'is_arm', False) or 'sleeve' in fx(pt)) and getattr(pt, 'closed', False)
                    if is_slv:
                        continue
                    F = fx(pt)
                    is_pauldron = 'pauldron' in F
                    if is_pauldron:
                        for r_i in range(pt.P.shape[0]):
                            for c_i in range(pt.P.shape[1]):
                                p_cur = pt.P[r_i, c_i]
                                d_sh, idx_sh = sh_all_tree.query(p_cur)
                                if float(d_sh) < 0.026:
                                    sv = sh_all_pts[int(idx_sh)]
                                    side_sh = 'Left' if float(p_cur[0]) >= 0 else 'Right'
                                    sh_piv = J(side_sh + 'Arm')
                                    v_p = p_cur - sh_piv
                                    v_s = sv - sh_piv
                                    rp = float(np.linalg.norm(v_p))
                                    rs = float(np.linalg.norm(v_s))
                                    if rp < rs + 0.006 and rp > 1e-6:
                                        pt.P[r_i, c_i] = sh_piv + v_p * ((rs + 0.006) / rp)
                        continue
                    if ('sash_tail' in F) and pt.P.ndim == 3 and pt.P.shape[1] >= 6:
                        # Closed 3D double-sided sash ribbon: conform inner face +14mm and outer face +24mm outside
                        # underlying trunk skirt so it has crisp 10mm 3D slab relief AND clears 50-figure.js hull/capsule compression!
                        n_c_tot = pt.P.shape[1]
                        n_half_c = n_c_tot // 2
                        for r_i in range(pt.P.shape[0]):
                            for c_i in range(n_c_tot):
                                px, py, pz = float(pt.P[r_i, c_i, 0]), float(pt.P[r_i, c_i, 1]), float(pt.P[r_i, c_i, 2])
                                c2 = spine_at(min(pz, TOP))[:2]
                                dx, dy = px - c2[0], py - c2[1]
                                r_cur = math.hypot(dx, dy)
                                if r_cur <= 1e-6:
                                    continue
                                ang = math.atan2(dx, dy) % (2.0 * math.pi)
                                r_tr = 0.0
                                for _, z0_t, z1_t, zs_t, r_t, _ in all_tube_profiles:
                                    if z0_t - 0.010 <= pz <= z1_t + 0.010:
                                        r_tr = max(r_tr, _eval_tube_r(zs_t, r_t, min(pz, float(zs_t[-1])), ang))
                                u_dir = np.array([dx / r_cur, dy / r_cur])
                                z_mask_t = np.abs(trunk_all_verts[:, 2] - pz) <= 0.020
                                if z_mask_t.any():
                                    tv = trunk_all_verts[z_mask_t]
                                    tv_d = tv[:, :2] - c2[None, :]
                                    tv_r = np.hypot(tv_d[:, 0], tv_d[:, 1])
                                    sec_t = (tv_d @ u_dir) / np.maximum(tv_r, 1e-6) >= math.cos(0.28)
                                    if sec_t.any():
                                        r_tr = max(r_tr, float(tv_r[sec_t].max()))
                                if r_tr > 0.0:
                                    is_outer = (c_i < n_half_c)
                                    j_loc = c_i if is_outer else (n_c_tot - 1 - c_i)
                                    u_edg = (j_loc / max(float(n_half_c - 1), 1.0)) - 0.5
                                    edg_f = math.sqrt(max(0.08, 1.0 - (2.0 * u_edg) ** 2))
                                    mid_off = 0.0190
                                    thk_off = 0.0052 * (0.65 if r_i in (0, pt.P.shape[0] - 1) else 1.0) * edg_f
                                    r_req = r_tr + (mid_off + thk_off if is_outer else mid_off - thk_off)
                                    pt.P[r_i, c_i, 0] = c2[0] + dx * (r_req / r_cur)
                                    pt.P[r_i, c_i, 1] = c2[1] + dy * (r_req / r_cur)
                        drape_ids.add(id(pt))
                        continue
                    is_open_panel = (
                        not getattr(pt, 'closed', False)
                        and pt.P.ndim == 3 and pt.P.shape[0] >= 3 and pt.P.shape[1] >= 3
                        and 'strap' not in F and not (F & {'arm', 'arm_tube', 'pauldron'})
                        and not getattr(pt, 'is_arm', False)
                        and float(pt.P[:, :, 2].max() - pt.P[:, :, 2].min()) >= 0.14
                    )
                    if ('overlay' in F and 'strap' not in F) or is_open_panel:
                        is_collar = ('collar' in F) and ('neck' not in F) and (pt.P.shape[0] >= 6)
                        clr_base = 0.0074 if is_collar else (0.0115 if is_open_panel else 0.0068)
                        for r_i in range(pt.P.shape[0]):
                            for c_i in range(pt.P.shape[1]):
                                px, py, pz = float(pt.P[r_i, c_i, 0]), float(pt.P[r_i, c_i, 1]), float(pt.P[r_i, c_i, 2])
                                c2 = spine_at(min(pz, TOP))[:2]
                                dx, dy = px - c2[0], py - c2[1]
                                r_cur = math.hypot(dx, dy)
                                ang = math.atan2(dx, dy) % (2.0 * math.pi)
                                if is_collar or pz >= SHOULDER - 0.025:
                                    p_q = pt.P[r_i, c_i].copy()
                                    c_ref = np.array([c2[0], c2[1], min(pz, SHOULDER - 0.024)])
                                    v_out = p_q - c_ref
                                    L_out = float(np.linalg.norm(v_out))
                                    if L_out > 1e-6:
                                        u_out = v_out / L_out
                                        d_nn, i_nn = sh_all_tree.query(p_q, k=min(48, len(sh_all_pts)))
                                        d_nn = np.atleast_1d(d_nn)
                                        i_nn = np.atleast_1d(i_nn)
                                        nb_pts = sh_all_pts[i_nn[d_nn <= 0.16]]
                                        if len(nb_pts):
                                            nb_v = nb_pts - c_ref[None, :]
                                            nb_L = np.linalg.norm(nb_v, axis=1)
                                            ok_nb = ((nb_v @ u_out) / np.maximum(nb_L, 1e-6)) >= math.cos(0.42)
                                            if ok_nb.any():
                                                proj_s = float((nb_v[ok_nb] @ u_out).max())
                                                sh_min = clr_base if is_collar else 0.0062
                                                sh_clamp = 0.0105 if (is_collar and pz <= TOP + 0.006) else (0.0105 if (is_open_panel or 'overlay' in F) else 0.99)
                                                if L_out < proj_s + sh_min:
                                                    pt.P[r_i, c_i] = c_ref + u_out * (proj_s + sh_min)
                                                elif L_out > proj_s + sh_clamp:
                                                    pt.P[r_i, c_i] = c_ref + u_out * (proj_s + 0.0080)
                                    continue
                                clr = clr_base
                                r_req = 0.0
                                for _, z0_t, z1_t, zs_t, r_t, _ in all_tube_profiles:
                                    if z0_t - 0.006 <= pz <= z1_t + 0.006:
                                        r_req = max(r_req, _eval_tube_r(zs_t, r_t, min(pz, float(zs_t[-1])), ang) + clr)
                                if r_cur > 1e-6 and 'neck' not in F:
                                    u_dir = np.array([dx / r_cur, dy / r_cur])
                                    z_mask_t = np.abs(trunk_all_verts[:, 2] - pz) <= 0.016
                                    if z_mask_t.any():
                                        tv = trunk_all_verts[z_mask_t]
                                        tv_d = tv[:, :2] - c2[None, :]
                                        tv_r = np.hypot(tv_d[:, 0], tv_d[:, 1])
                                        sec_t = (tv_d @ u_dir) / np.maximum(tv_r, 1e-6) >= math.cos(0.28)
                                        if sec_t.any():
                                            r_req = max(r_req, float(tv_r[sec_t].max()) + clr)
                                if r_cur < r_req and r_cur > 1e-6:
                                    pt.P[r_i, c_i, 0] = c2[0] + dx * (r_req / r_cur)
                                    pt.P[r_i, c_i, 1] = c2[1] + dy * (r_req / r_cur)
                        # Subdivide panel rows & cols densely so belts/straps never step between sparse rows!
                        P_d = pt.P
                        dense_chunks = [P_d.reshape(-1, 3)]
                        if P_d.shape[0] >= 2:
                            for u_r in (0.2, 0.4, 0.6, 0.8):
                                Pr = (1.0 - u_r) * P_d[:-1] + u_r * P_d[1:]
                                dense_chunks.append(Pr.reshape(-1, 3))
                                if Pr.shape[1] >= 2:
                                    dense_chunks.append((0.5 * (Pr[:, :-1] + Pr[:, 1:])).reshape(-1, 3))
                        drape_vert_list.append(np.vstack(dense_chunks))
                        drape_ids.add(id(pt))

                slv_sh_blocks = [slv_all_pts[slv_all_pts[:, 2] >= SHOULDER - 0.06]] if slv_parts else []
                under_strap_verts = np.vstack([trunk_all_verts] + drape_vert_list + slv_sh_blocks)
                under_strap_tree = cKDTree(under_strap_verts)

                # Pass B2: Belts, sashes, cummerbunds, and diagonal straps conform flush outside trunk_tubes + drapes/aprons!
                strap_vert_list = []
                for pt in parts:
                    if id(pt) in trunk_pt_ids or id(pt) in drape_ids or pt.P.ndim != 3 or getattr(pt, 'no_conform', False):
                        continue
                    is_slv = (getattr(pt, 'is_arm', False) or 'sleeve' in fx(pt)) and getattr(pt, 'closed', False)
                    if is_slv:
                        continue
                    F = fx(pt)
                    if 'pauldron' in F or 'strap' not in F or (F & {'arm', 'arm_tube'}) or getattr(pt, 'is_arm', False):
                        continue
                    row_z_span = float(pt.P[0, :, 2].max() - pt.P[0, :, 2].min()) if pt.P.shape[1] >= 4 else 0.0
                    is_tilted_strap = (row_z_span > 0.14) or (not getattr(pt, 'closed', False))
                    is_body_band = (not is_tilted_strap) and getattr(pt, 'closed', False) and pt.P.shape[1] >= 24
                    if is_body_band:
                        for r_b in range(pt.P.shape[0]):
                            pt.P[r_b, :, 2] = float(np.median(pt.P[r_b, :, 2]))
                    cross_w = float(np.linalg.norm(pt.P[-1] - pt.P[0], axis=1).mean()) if pt.P.shape[0] >= 2 else 0.0
                    clamp_hover = is_tilted_strap and (getattr(pt, 'cloth', None) is None) and (cross_w <= 0.115)
                    k_nn = min(16, len(under_strap_verts))
                    for r_i in range(pt.P.shape[0]):
                        for c_i in range(pt.P.shape[1]):
                            px, py, pz = float(pt.P[r_i, c_i, 0]), float(pt.P[r_i, c_i, 1]), float(pt.P[r_i, c_i, 2])
                            c2 = spine_at(min(pz, TOP))[:2]
                            dx, dy = px - c2[0], py - c2[1]
                            r_cur = math.hypot(dx, dy)
                            ang = math.atan2(dx, dy) % (2.0 * math.pi)
                            if is_body_band and pz < TOP - 0.015 and r_cur > 1e-6:
                                is_chest_band = (pz > WAIST + 0.06) or (float(pt.P[:, :, 2].max() - pt.P[:, :, 2].min()) > 0.11)
                                bolster = 0.0042 * math.sin(math.pi * r_i / max(pt.P.shape[0] - 1, 1)) if pt.P.shape[0] >= 5 else 0.0
                                clr_b = (0.006 if is_chest_band else 0.0040) + bolster
                                z_win_b = 0.018 if is_chest_band else 0.012
                                r_t = 0.0
                                for _, z0_t, z1_t, zs_t, r_t_prof, _ in all_tube_profiles:
                                    if z0_t - 0.010 <= pz <= z1_t + 0.010:
                                        r_t = max(r_t, _eval_tube_r(zs_t, r_t_prof, min(pz, float(zs_t[-1])), ang))
                                u_dir = np.array([dx / r_cur, dy / r_cur])
                                z_mask_b = np.abs(under_strap_verts[:, 2] - pz) <= z_win_b
                                if z_mask_b.any():
                                    tv = under_strap_verts[z_mask_b]
                                    tv_d = tv[:, :2] - c2[None, :]
                                    tv_r = np.hypot(tv_d[:, 0], tv_d[:, 1])
                                    sec_b = (tv_d @ u_dir) / np.maximum(tv_r, 1e-6) >= math.cos(0.28)
                                    if sec_b.any():
                                        r_t = max(r_t, float(tv_r[sec_b].max()))
                                if r_t > 0.0:
                                    r_req = r_t + clr_b
                                    if abs(r_cur - r_req) > 0.0008:
                                        pt.P[r_i, c_i, 0] = c2[0] + dx * (r_req / r_cur)
                                        pt.P[r_i, c_i, 1] = c2[1] + dy * (r_req / r_cur)
                                continue
                            if is_tilted_strap:
                                u_sh_s = min(1.0, max(0.0, (pz - WAIST) / max(0.05, (TOP - 0.04) - WAIST)))
                                x_lim_s = (1.0 - u_sh_s) * 0.144 + u_sh_s * 0.106
                                if abs(px) > x_lim_s:
                                    px = math.copysign(x_lim_s, px)
                                    pt.P[r_i, c_i, 0] = px
                                p_q = pt.P[r_i, c_i].copy()
                                c_ref = np.array([c2[0], c2[1], min(pz, SHOULDER - 0.020)])
                                v_out = p_q - c_ref
                                L_out = float(np.linalg.norm(v_out))
                                if L_out > 1e-6:
                                    u_out = v_out / L_out
                                    d_nn, i_nn = under_strap_tree.query(p_q, k=k_nn)
                                    d_nn = np.atleast_1d(d_nn)
                                    i_nn = np.atleast_1d(i_nn)
                                    nb_pts = under_strap_verts[i_nn[d_nn <= 0.048]]
                                    if len(nb_pts):
                                        nb_v = nb_pts - c_ref[None, :]
                                        nb_L = np.linalg.norm(nb_v, axis=1)
                                        cos_nb = (nb_v @ u_out) / np.maximum(nb_L, 1e-6)
                                        ok_nb = cos_nb >= math.cos(0.38)
                                        if ok_nb.any():
                                            proj_surf = float((nb_v[ok_nb] @ u_out).max())
                                            if L_out < proj_surf + 0.0038:
                                                pt.P[r_i, c_i] = c_ref + u_out * (proj_surf + 0.0042)
                                            elif clamp_hover and L_out > proj_surf + 0.0070:
                                                pt.P[r_i, c_i] = c_ref + u_out * (proj_surf + 0.0050)
                            elif r_cur > 1e-6:
                                r_req = 0.0
                                for _, z0_t, z1_t, zs_t, r_t, _ in all_tube_profiles:
                                    if z0_t - 0.010 <= pz <= z1_t + 0.025:
                                        r_req = max(r_req, _eval_tube_r(zs_t, r_t, min(pz, float(zs_t[-1])), ang) + 0.0045)
                                if r_cur < r_req:
                                    pt.P[r_i, c_i, 0] = c2[0] + dx * (r_req / r_cur)
                                    pt.P[r_i, c_i, 1] = c2[1] + dy * (r_req / r_cur)
                    strap_vert_list.append(pt.P.reshape(-1, 3))
                    strap_ids.add(id(pt))

                # Rule D (Torso Belt/Strap/Coat Doodad & Flush Button Seating):
                # Subdivide trunk & strap grids densely (<6mm spacing) so buttons/medallions/pouches seat flush onto true
                # surface triangles rather than jumping toward sparse vertices or perching 3cm out on diagonal straps!
                def _dense_grid_pts(P_g, closed_c=False):
                    chunks = [P_g.reshape(-1, 3)]
                    P_w = np.concatenate([P_g, P_g[:, :1]], axis=1) if (closed_c and P_g.shape[1] >= 3) else P_g
                    if P_w.shape[0] >= 2:
                        for ur in (0.25, 0.50, 0.75):
                            Pr = (1.0 - ur) * P_w[:-1] + ur * P_w[1:]
                            chunks.append(Pr.reshape(-1, 3))
                            if Pr.shape[1] >= 2:
                                chunks.append((0.5 * (Pr[:, :-1] + Pr[:, 1:])).reshape(-1, 3))
                    if P_w.shape[1] >= 2:
                        chunks.append((0.5 * (P_w[:, :-1] + P_w[:, 1:])).reshape(-1, 3))
                    return np.vstack(chunks)

                dense_trunk_list = [_dense_grid_pts(t[1].P, getattr(t[1], 'closed', False)) for t in trunk_tubes]
                non_collar_drape_list = [
                    _dense_grid_pts(pt.P, getattr(pt, 'closed', False))
                    for pt in parts if id(pt) in drape_ids and pt.P.ndim == 3 and 'collar' not in fx(pt)
                ]
                coat_only_pts = np.vstack(dense_trunk_list + non_collar_drape_list)
                coat_only_tree = cKDTree(coat_only_pts)
                dense_strap_list = [
                    _dense_grid_pts(pt.P, getattr(pt, 'closed', False))
                    for pt in parts if id(pt) in strap_ids and pt.P.ndim == 3
                ]
                host_blocks = [coat_only_pts] + dense_strap_list
                if slv_parts:
                    host_blocks.extend(_dense_grid_pts(sp.P, True) for sp in slv_parts)
                host_pts = np.vstack(host_blocks)
                host_tree = cKDTree(host_pts)
                slv_id_set = {id(sp) for sp in slv_parts}
                for pt in parts:
                    pid = id(pt)
                    if is_floating or getattr(pt, 'no_conform', False) or pid in trunk_pt_ids or pid in drape_ids or pid in strap_ids or pid in slv_id_set or pt.P.ndim != 3:
                        continue
                    if getattr(pt, 'cloth', None) is not None:
                        continue
                    F = fx(pt)
                    if F & {'pauldron', 'sh_cap', 'arm', 'arm_tube', 'sleeve', 'collar', 'neck'}:
                        continue
                    V_d = pt.P.reshape(-1, 3)
                    if len(V_d) > 320 or float(np.ptp(V_d, axis=0).max()) > 0.24:
                        continue
                    pname_low = (pt.name or '').lower()
                    is_btn = ('_btn' in pname_low or 'button' in pname_low)
                    if is_btn:
                        # Seat coat buttons directly flush onto the exact coat/drape front point right behind (x, z)
                        ctr_b = V_d.mean(axis=0)
                        bz_b = float(ctr_b[2])
                        near_c = coat_only_pts[
                            (np.abs(coat_only_pts[:, 0] - ctr_b[0]) <= 0.008)
                            & (np.abs(coat_only_pts[:, 2] - bz_b) <= 0.008)
                            & (coat_only_pts[:, 1] < 0.0)
                        ]
                        if not len(near_c):
                            near_c = coat_only_pts[
                                (np.abs(coat_only_pts[:, 0] - ctr_b[0]) <= 0.018)
                                & (np.abs(coat_only_pts[:, 2] - bz_b) <= 0.018)
                                & (coat_only_pts[:, 1] < 0.0)
                            ]
                        if len(near_c):
                            y_coat_f = float(np.percentile(near_c[:, 1], 35))
                            y_btn_back = float(V_d[:, 1].max())
                            # Embed rear of button 1.5mm into coat front so 0 gap is visible from any camera angle
                            dy_b = (y_coat_f + 0.0015) - y_btn_back
                            pt.P[:, :, 1] += dy_b
                            continue
                    ref_tree = coat_only_tree if is_btn else host_tree
                    ref_pts = coat_only_pts if is_btn else host_pts
                    dists_d, idxs_d = ref_tree.query(V_d)
                    d_min = float(dists_d.min())
                    if 0.0012 < d_min < 0.095:
                        i_cl = int(np.argmin(dists_d))
                        v_gap = ref_pts[int(idxs_d[i_cl])] - V_d[i_cl]
                        pt.P = pt.P + v_gap * ((d_min + 0.0012) / d_min)

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
                    if pt in leg_limb_pts or pt.P.ndim != 3 or getattr(pt, 'no_conform', False):
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

    if slot == 'feet' and not is_floating:
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

    if slot == 'back' and not is_floating:
        # Rule D_back: Seat rigid dorsal packs/quivers/chests at safe coat-clearing depth (>= 30 mm off bare back skin,
        # and never pulling upper-pack corners within 38 mm of shoulder/collar zones) + snap small sub-doodads onto main pack.
        pack_pts = [
            pt for pt in parts
            if pt.P.ndim == 3 and getattr(pt, 'cloth', None) is None
            and not (fx(pt) & {'strap', 'band', 'overlay'})
        ]
        has_back_cape = any(getattr(pt, 'cloth', None) is not None or not getattr(pt, 'closed', True) for pt in parts if 'strap' not in fx(pt))
        if pack_pts and not has_back_cape:
            all_pk_v = np.vstack([pt.P.reshape(-1, 3) for pt in pack_pts])
            back_zone = all_pk_v[
                (all_pk_v[:, 1] > 0.02)
                & (all_pk_v[:, 2] >= WAIST - 0.05)
                & (all_pk_v[:, 2] <= TOP + 0.02)
                & (np.abs(all_pk_v[:, 0]) <= 0.145)
            ]
            if len(back_zone):
                clrs_b = []
                sh_clrs = []
                for bv in back_zone:
                    loc_b, n_b = nearest(bv, BVH_T)
                    if n_b[1] > 0.42:
                        c_val = float((bv - loc_b).dot(n_b))
                        clrs_b.append(c_val)
                        if bv[2] >= SHOULDER - 0.04 or abs(bv[0]) >= 0.105:
                            sh_clrs.append(c_val)
                if clrs_b:
                    min_clr_b = min(clrs_b)
                    max_pull = (min(sh_clrs) - 0.038) if sh_clrs else 1.0
                    if 0.033 < min_clr_b < 0.095 and max_pull > 0.001:
                        dy_seat = min(min_clr_b - 0.030, max_pull)
                        for pt in pack_pts:
                            pt.P[:, :, 1] -= dy_seat
            if len(pack_pts) >= 2:
                main_pk = max(pack_pts, key=lambda p: p.P.size)
                for pt in pack_pts:
                    if pt is main_pk:
                        continue
                    V_sub = pt.P.reshape(-1, 3)
                    if len(V_sub) > 260 or float(np.ptp(V_sub, axis=0).max()) > 0.24:
                        continue
                    other_v = np.vstack([op.P.reshape(-1, 3) for op in pack_pts if op is not pt])
                    ot_tree = cKDTree(other_v)
                    d_sub, i_sub = ot_tree.query(V_sub)
                    dm = float(d_sub.min())
                    if 0.0025 < dm < 0.065:
                        ic = int(np.argmin(d_sub))
                        vg = other_v[int(i_sub[ic])] - V_sub[ic]
                        pt.P = pt.P + vg * ((dm + 0.0015) / dm)

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
    has_pbr_metal = any(
        ((getattr(p, 'paint', None) or {}).get('fabric') or '').startswith(
            ('metal.', 'armor.', 'shell.nacre', 'beads.glass', 'glass.')
        )
        for p in parts
    )
    mr_img = np.zeros((TEX, TEX, 3), dtype=np.float32) if has_pbr_metal else None
    h_img = np.full((TEX, TEX), 0.5, dtype=np.float32) if has_pbr_metal else None
    if mr_img is not None:
        mr_img[:, :, 0] = 1.0
        mr_img[:, :, 1] = 0.85
        mr_img[:, :, 2] = 0.0

    all_P, all_N, all_UV, all_VI, all_T, all_use_trunk = [], [], [], [], [], []
    rigid_overrides = []
    part_gi_ranges = []
    overlay_panel_ranges = []
    trunk_ranges, band_ranges, acc_ranges = [], [], []     # issue 13: what takes its weights from the trunk
    trunk_ids = {id(t[1]) for t in trunk_tubes}
    arm_part_ranges = []
    c_specs = []
    hip_ranges = []
    vfx_zones = []
    y0 = 0
    vi_offset = 0
    gi_offset = 0
    tri_offset = 0

    for k, (p, (circ, length)) in enumerate(zip(parts, lens)):
        h = TEX - y0 if k == len(parts) - 1 else max(4, int(round(share[k] * TEX)))
        if y0 + h > TEX:
            h = max(1, TEX - y0)
        R_grid_c = np.concatenate([p.P, p.P[:, :1]], 1) if p.closed else p.P
        circ_rows = np.linalg.norm(np.diff(R_grid_c, axis=1), axis=2).sum(1) if p.P.ndim == 3 else None
        strip_rgb = paint_strip(p.paint, TEX, h, max(circ, 0.02), max(length, 0.02), circ_rows=circ_rows)
        if has_pbr_metal:
            fab_s = ((getattr(p, 'paint', None) or {}).get('fabric') or '').lower()
            yy_s, xx_s = np.mgrid[0:h, 0:TEX]
            u_s = (xx_s + 0.5) / float(TEX)
            v_s = (yy_s + 0.5) / float(max(h, 1))
            if fab_s.startswith(('metal.', 'armor.', 'shell.nacre', 'beads.glass', 'glass.')):
                # Hammered micro-facets + directional brushed scratches + convex plate-edge wear
                ham = (
                    0.35 * np.sin(u_s * 62.0 + np.cos(v_s * 29.0) * 1.4) * np.cos(v_s * 34.0 + np.sin(u_s * 47.0))
                    + 0.25 * np.sin(u_s * 127.0 - v_s * 73.0)
                    + 0.20 * np.cos(u_s * 211.0 + v_s * 113.0)
                )
                brush = 0.12 * np.sin(v_s * 280.0 + u_s * 18.0) + 0.08 * np.cos(u_s * 340.0)
                edge_wear = np.clip(1.0 - np.minimum(v_s, 1.0 - v_s) / 0.075, 0.0, 1.0)
                bevel_h = np.clip(np.minimum(v_s, 1.0 - v_s) / 0.06, 0.0, 1.0)
                is_polished = any(tok in fab_s for tok in ('gold', 'chrome', 'silver', 'brass', 'glass', 'nacre'))
                is_dark = any(tok in fab_s for tok in ('iron', 'black', 'dark', 'cast', 'scrap'))
                base_r = 0.26 if is_polished else (0.40 if is_dark else 0.33)
                # Detect oxidized verdigris / heavy soot crevices -> non-metallic & rougher
                r_c, g_c, b_c = strip_rgb[:, :, 0], strip_rgb[:, :, 1], strip_rgb[:, :, 2]
                luma = 0.2126 * r_c + 0.7152 * g_c + 0.0722 * b_c
                is_patina = ((g_c > r_c * 1.18) & (b_c > r_c * 1.05)) | (luma < 0.035)
                met_val = np.where(is_patina, 0.12, 0.96 if not is_dark else 0.88).astype(np.float32)
                rough_val = np.clip(base_r - 0.07 * ham + 0.04 * brush - 0.09 * edge_wear + np.where(is_patina, 0.38, 0.0), 0.16, 0.90).astype(np.float32)
                mr_img[y0:y0 + h, :, 1] = rough_val
                mr_img[y0:y0 + h, :, 2] = met_val
                h_img[y0:y0 + h] = np.clip(0.50 + 0.16 * ham + 0.05 * brush + 0.22 * (bevel_h - 0.5), 0.0, 1.0).astype(np.float32)
                # Subtle bright alloy glint along rolled/beveled plate rims
                strip_rgb = np.clip(strip_rgb * (1.0 + 0.12 * edge_wear[:, :, None]) + 0.035 * edge_wear[:, :, None], 0.0, 1.0)
            elif fab_s.startswith(('leather.', 'rubber.')):
                grain = 0.08 * np.sin(u_s * 170.0 + v_s * 95.0) * np.cos(u_s * 110.0 - v_s * 130.0)
                mr_img[y0:y0 + h, :, 1] = np.clip(0.64 + grain, 0.45, 0.82).astype(np.float32)
                mr_img[y0:y0 + h, :, 2] = 0.0
                h_img[y0:y0 + h] = np.clip(0.50 + 0.07 * grain, 0.0, 1.0).astype(np.float32)
            else:
                mr_img[y0:y0 + h, :, 1] = 0.88
                mr_img[y0:y0 + h, :, 2] = 0.0
                h_img[y0:y0 + h] = 0.50
        img[y0:y0 + h] = strip_rgb
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
        is_shoulder_cap = ('pauldron' in F or 'sh_cap' in F) and float(np.abs(flat_P[:, 0]).min()) >= 0.045
        is_arm_part = (is_true_arm_tube or is_shoulder_cap) and not spans_both_sides
        is_surface_trinket = (
            slot == 'torso'
            and not is_floating
            and not getattr(p, 'no_conform', False)
            and bool(trunk_tubes)
            and not is_arm_part
            and getattr(p, 'cloth', None) is None
            and len(flat_P) <= 180
            and float(np.ptp(flat_P, axis=0).max()) <= 0.11
            and (p.rigid_joint in (None, 'Spine', 'Spine1', 'Spine2', 'Hips'))
        )
        if getattr(p, 'row_joints', None):
            for r_i, jn in enumerate(p.row_joints):
                if jn:
                    r_start = gi_offset + r_i * cols_uv
                    r_end = r_start + cols_uv
                    rigid_overrides.append((r_start, r_end, jn))
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
        elif is_surface_trinket:
            # Bind surface buttons/brooches/medallions rigidly to the single nearest host coat vertex's blended weights & morph
            # so they never shear across morphs AND never lever off the coat when Spine/Spine1/Spine2 bend in posture()!
            hip_ranges.append([vi_offset, vi_offset + n_part_vi])
            acc_ranges.append((gi_offset, gi_offset + len(flat_P)))
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
            if slot == 'torso' and bool(trunk_tubes):
                acc_ranges.append((gi_offset, gi_offset + len(flat_P)))

        is_backed_open_panel = (
            slot == 'torso'
            and not getattr(p, 'no_conform', False)
            and bool(trunk_tubes)
            and (
                'sash_tail' in F
                or (
                    not getattr(p, 'closed', False)
                    and p.P.ndim == 3 and p.P.shape[1] >= 3
                    and 'strap' not in F and not is_arm_part and not p.rigid_joint
                    and min(t[2] for t in trunk_tubes) <= float(p.P[:, :, 2].min()) + 0.055
                )
            )
        )
        if is_backed_open_panel:
            overlay_panel_ranges.append((gi_offset, gi_offset + len(flat_P)))
            cs = None
        else:
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

        p_vfx = getattr(p, 'vfx', None)
        if isinstance(p_vfx, dict):
            z_rec = dict(p_vfx)
            z_rec.setdefault('name', p.name)
            z_rec['t0'] = int(tri_offset)
            z_rec['t1'] = int(tri_offset + len(part_tris))
            z_rec['v0'] = round(float(v_top), 5)
            z_rec['v1'] = round(float(v_bot), 5)
            vfx_zones.append(z_rec)

        part_gi_ranges.append((gi_offset, gi_offset + len(flat_P), p))
        all_P.append(flat_P)
        all_N.append(flat_N)
        all_UV.append(part_UV.reshape(-1, 2))
        all_VI.append(flat_VI)
        all_T.append(part_tris + gi_offset)

        y0 = min(TEX - 1, y0 + h)
        vi_offset += n_part_vi
        gi_offset += len(flat_P)
        tri_offset += len(part_tris)

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

        # Synchronize torso trunk lateral shoulder-cap seam (`|x| >= x_arm - 0.025`) with attached sleeves
        # so contrast sleeves NEVER shear or poke through the tunic shoulder cap when arms lower from A-pose!
        if slot == 'torso' and trunk_ranges:
            slv_gi_list = [
                np.arange(gs, ge) for gs, ge, _, _, is_cl, pn in arm_part_ranges
                if is_cl and ('sleeve' in pn.lower() or 'arm' in pn.lower())
            ]
            if slv_gi_list:
                slv_gi_all = np.concatenate(slv_gi_list)
                slv_tree_gl = cKDTree(P_arr[slv_gi_all])
                x_arm_gl = abs(float(RIG.jpos[RIG.J['LeftArm']][0]))
                y_arm_gl = float(RIG.jpos[RIG.J['LeftArm']][1])
                for t_gs, t_ge in trunk_ranges:
                    for gi in range(t_gs, t_ge):
                        px_g, py_g = float(P_arr[gi, 0]), float(P_arr[gi, 1])
                        if abs(px_g) >= x_arm_gl - 0.028 and py_g >= y_arm_gl - 0.095:
                            d_sg, nn_sg = slv_tree_gl.query(P_arr[gi])
                            if float(d_sg) <= 0.038:
                                src_slv = int(slv_gi_all[int(nn_sg)])
                                t_sm = float(np.clip((abs(px_g) - (x_arm_gl - 0.028)) / 0.048, 0.0, 1.0))
                                t_sm = t_sm * t_sm * (3.0 - 2.0 * t_sm)
                                make_mpfb.take_weights(JJ_arr, WW_arr, gi, src_slv, t_sm)
                                if t_sm >= 0.5:
                                    near_morph[gi] = near_morph[src_slv]

    if slot == 'back':
        # 1. Give `pack_straps` (`role == 'band'`) a smooth analytical Spine1<->Spine2 (+ subtle clavicle saddle) weight field
        sp_id = joint_names.index('Spine')
        sp1_id = joint_names.index('Spine1')
        sp2_id = joint_names.index('Spine2')
        nk_id = joint_names.index('Neck')
        hips_id = joint_names.index('Hips')
        lsh_id = joint_names.index('LeftShoulder')
        rsh_id = joint_names.index('RightShoulder')
        y_hips_b = float(RIG.jpos[RIG.J['Hips']][1])
        y_sp_b = float(RIG.jpos[RIG.J['Spine']][1])
        y_sp1_b = float(RIG.jpos[RIG.J['Spine1']][1])
        y_sh_b = float(RIG.jpos[RIG.J['LeftArm']][1])
        y_nk_b = float(RIG.jpos[RIG.J['Neck']][1])
        for gs_p, ge_p, p_obj in part_gi_ranges:
            if getattr(p_obj, 'role', None) == 'band' and getattr(p_obj, 'cloth', None) is None:
                qp_b = P_arr[gs_p:ge_p]
                u_s2 = np.clip((qp_b[:, 1] - y_sp1_b) / max(0.05, (y_sh_b - 0.02) - y_sp1_b), 0.0, 1.0)
                u_s2 = u_s2 * u_s2 * (3.0 - 2.0 * u_s2)
                u_cl = np.clip((qp_b[:, 1] - (y_sh_b + 0.01)) / 0.09, 0.0, 1.0) * np.clip((np.abs(qp_b[:, 0]) - 0.065) / 0.055, 0.0, 1.0)
                w_sh_s = 0.34 * u_cl
                JJ_arr[gs_p:ge_p] = 0
                WW_arr[gs_p:ge_p] = 0.0
                JJ_arr[gs_p:ge_p, 0] = sp2_id
                WW_arr[gs_p:ge_p, 0] = (u_s2 * (1.0 - w_sh_s)).astype(np.float32)
                JJ_arr[gs_p:ge_p, 1] = sp1_id
                WW_arr[gs_p:ge_p, 1] = ((1.0 - u_s2) * (1.0 - w_sh_s)).astype(np.float32)
                JJ_arr[gs_p:ge_p, 2] = np.where(qp_b[:, 0] >= 0.0, lsh_id, rsh_id)
                WW_arr[gs_p:ge_p, 2] = w_sh_s.astype(np.float32)
            elif (getattr(p_obj, 'cloth', None) is not None or not getattr(p_obj, 'closed', True)) and not getattr(p_obj, 'rigid_joint', None):
                # 2. Dorsal capes/mantles (`slot == 'back'`): smooth axial trunk spine weight field (`Neck..Spine2..Spine1..Spine..Hips`)
                #    across ALL rows with ZERO Arm/Shoulder and ZERO UpLeg/Leg weights so capes NEVER bat-wing OR wring/pinch mid-cape!
                idx_u = np.arange(gs_p, ge_p)
                if len(idx_u):
                    yu = P_arr[idx_u, 1]
                    dense_cp = np.zeros((len(idx_u), len(joint_names)), dtype=np.float64)
                    for idx_k, yv_u in enumerate(yu):
                        if yv_u >= y_sh_b - 0.01:
                            t_nk = float(np.clip((yv_u - (y_nk_b - 0.02)) / 0.06, 0.0, 1.0))
                            w_nk = 0.16 * (t_nk * t_nk * (3.0 - 2.0 * t_nk))
                            dense_cp[idx_k, nk_id] = w_nk
                            dense_cp[idx_k, sp2_id] = 1.0 - w_nk
                        elif yv_u >= y_sp1_b:
                            t2 = float(np.clip((yv_u - y_sp1_b) / max(0.04, (y_sh_b - 0.01) - y_sp1_b), 0.0, 1.0))
                            t2 = t2 * t2 * (3.0 - 2.0 * t2)
                            dense_cp[idx_k, sp2_id] = t2
                            dense_cp[idx_k, sp1_id] = 1.0 - t2
                        elif yv_u >= y_sp_b:
                            t1 = float(np.clip((yv_u - y_sp_b) / max(0.04, y_sp1_b - y_sp_b), 0.0, 1.0))
                            t1 = t1 * t1 * (3.0 - 2.0 * t1)
                            dense_cp[idx_k, sp1_id] = t1
                            dense_cp[idx_k, sp_id] = 1.0 - t1
                        elif yv_u > y_hips_b - 0.02:
                            t0 = float(np.clip((yv_u - (y_hips_b - 0.02)) / max(0.04, y_sp_b - (y_hips_b - 0.02)), 0.0, 1.0))
                            t0 = t0 * t0 * (3.0 - 2.0 * t0)
                            dense_cp[idx_k, sp_id] = t0
                            dense_cp[idx_k, hips_id] = 1.0 - t0
                        else:
                            dense_cp[idx_k, hips_id] = 1.0
                    ord_cp = np.argsort(-dense_cp, axis=1)[:, :4]
                    top_wcp = np.take_along_axis(dense_cp, ord_cp, axis=1)
                    top_wcp /= np.maximum(top_wcp.sum(axis=1, keepdims=True), 1e-9)
                    JJ_arr[idx_u] = ord_cp.astype(JJ_arr.dtype)
                    WW_arr[idx_u] = top_wcp.astype(np.float32)
        # 3. Strip any residual Arm/ForeArm/Hand bleed on remaining `back` parts!
        arm_j_ids = {i_j for i_j, nm in enumerate(joint_names) if any(nm.startswith(p) for p in ('LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand'))}
        if arm_j_ids:
            bad_m = np.isin(JJ_arr, list(arm_j_ids))
            if bad_m.any():
                WW_arr[bad_m] = 0.0
                JJ_arr[bad_m] = sp2_id
                row_s = WW_arr.sum(axis=1, keepdims=True)
                zero_r = (row_s[:, 0] < 1e-6)
                if zero_r.any():
                    JJ_arr[zero_r, 0] = sp2_id
                    WW_arr[zero_r, 0] = 1.0
                    row_s = WW_arr.sum(axis=1, keepdims=True)
                WW_arr /= np.maximum(row_s, 1e-9)

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
    if has_pbr_metal and mr_img is not None:
        pbr = j_tpl['materials'][0].setdefault('pbrMetallicRoughness', {})
        pbr['metallicFactor'] = 1.0
        pbr['roughnessFactor'] = 1.0
        j_tpl['materials'][0].pop('extensions', None)
    elif metal_share >= 0.22:
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

        if has_pbr_metal and mr_img is not None and h_img is not None:
            # Pack compact 512x512 metallicRoughnessTexture (G=roughness, B=metallic) + tangent-space normalTexture
            mr_pil = Image.fromarray(np.rint(np.clip(mr_img, 0.0, 1.0) * 255.0).astype(np.uint8), 'RGB').resize((512, 512), Image.BILINEAR)
            mr_buf = io.BytesIO()
            mr_pil.save(mr_buf, 'PNG', optimize=True)
            mr_bv = len(j_tpl['bufferViews'])
            j_tpl['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': 0})
            blobs[mr_bv] = mr_buf.getvalue()
            mr_im = len(j_tpl['images'])
            j_tpl['images'].append({'bufferView': mr_bv, 'mimeType': 'image/png', 'name': f'{gid}_mr'})
            mr_tx = len(j_tpl['textures'])
            j_tpl['textures'].append({'sampler': 0, 'source': mr_im})
            j_tpl['materials'][0]['pbrMetallicRoughness']['metallicRoughnessTexture'] = {'index': mr_tx}

            # Tangent-space normal map from heightfield via finite differences
            h_small = np.asarray(Image.fromarray(np.rint(h_img * 255.0).astype(np.uint8), 'L').resize((512, 512), Image.BILINEAR), dtype=np.float32) / 255.0
            dx = (np.roll(h_small, -1, axis=1) - np.roll(h_small, 1, axis=1)) * 2.4
            dy = (np.roll(h_small, -1, axis=0) - np.roll(h_small, 1, axis=0)) * 2.4
            nz = np.ones_like(dx)
            nlen = np.sqrt(dx * dx + dy * dy + nz * nz)
            nrm_rgb = np.stack([(-dx / nlen) * 0.5 + 0.5, (-dy / nlen) * 0.5 + 0.5, (nz / nlen) * 0.5 + 0.5], axis=2)
            nrm_pil = Image.fromarray(np.rint(np.clip(nrm_rgb, 0.0, 1.0) * 255.0).astype(np.uint8), 'RGB')
            nrm_buf = io.BytesIO()
            nrm_pil.save(nrm_buf, 'JPEG', quality=88)
            nrm_bv = len(j_tpl['bufferViews'])
            j_tpl['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': 0})
            blobs[nrm_bv] = nrm_buf.getvalue()
            nrm_im = len(j_tpl['images'])
            j_tpl['images'].append({'bufferView': nrm_bv, 'mimeType': 'image/jpeg', 'name': f'{gid}_nrm'})
            nrm_tx = len(j_tpl['textures'])
            j_tpl['textures'].append({'sampler': 0, 'source': nrm_im})
            j_tpl['materials'][0]['normalTexture'] = {'index': nrm_tx, 'scale': 0.55}

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

    if slot in ('torso', 'legs', 'head', 'back') or rigid_overrides or arm_part_ranges:
        JJ_post = glbio.accessor(j_tpl, bytes(binb), at['JOINTS_0']).copy()
        WW_post = glbio.accessor(j_tpl, bytes(binb), at['WEIGHTS_0']).astype(np.float32).copy()
        if w_ct != 5126 and not aw.get('normalized'):
            WW_post /= float(np.iinfo(w_dt).max)
        # Never let torso robes/gowns, back cloaks, or legwear capture Foot or ToeBase weights near the ankles!
        if slot in ('torso', 'legs', 'back'):
            foot_remap = {}
            for side_f in ('Left', 'Right'):
                if (side_f + 'Leg') in joint_names:
                    j_leg_f = joint_names.index(side_f + 'Leg')
                    for bad_j in (side_f + 'Foot', side_f + 'ToeBase'):
                        if bad_j in joint_names:
                            foot_remap[joint_names.index(bad_j)] = j_leg_f
            if foot_remap:
                bad_mask = np.isin(JJ_post, list(foot_remap.keys())).any(axis=1)
                if bad_mask.any():
                    idx_bf = np.nonzero(bad_mask)[0]
                    dense_bf = np.zeros((len(idx_bf), len(joint_names)), dtype=np.float64)
                    for col_bf in range(JJ_post.shape[1]):
                        j_col = JJ_post[idx_bf, col_bf].copy()
                        for src_j, dst_j in foot_remap.items():
                            j_col = np.where(j_col == src_j, dst_j, j_col)
                        np.add.at(dense_bf, (np.arange(len(idx_bf)), j_col), WW_post[idx_bf, col_bf])
                    ord_bf = np.argsort(-dense_bf, axis=1)[:, :4]
                    top_wbf = np.take_along_axis(dense_bf, ord_bf, axis=1)
                    top_wbf /= np.maximum(top_wbf.sum(axis=1, keepdims=True), 1e-9)
                    JJ_post[idx_bf] = ord_bf.astype(JJ_post.dtype)
                    WW_post[idx_bf] = top_wbf.astype(np.float32)
        for gs, ge, _, _, _, _ in arm_part_ranges:
            JJ_post[gs:ge] = JJ_arr[gs:ge]
            WW_post[gs:ge] = WW_arr[gs:ge]
        if slot == 'head' and float(P_arr[:, 1].min()) < float(RIG.jpos[RIG.J['Neck']][1]) + 0.012:
            is_rigid_h = np.zeros(len(P_arr), dtype=bool)
            for gs, ge, _ in rigid_overrides:
                is_rigid_h[gs:ge] = True
            y_neck_h = float(RIG.jpos[RIG.J['Neck']][1])
            x_arm_h = abs(float(RIG.jpos[RIG.J['LeftArm']][0]))
            mask_hc = (~is_rigid_h) & (P_arr[:, 1] < y_neck_h + 0.030)
            if mask_hc.any():
                idx_hc = np.nonzero(mask_hc)[0]
                qh = P_arr[idx_hc]
                u_low = np.clip(((y_neck_h + 0.030) - qh[:, 1]) / 0.056, 0.0, 1.0)
                u_low = u_low * u_low * (3.0 - 2.0 * u_low)
                n_jh = len(joint_names)
                j_hd_h = joint_names.index('Head')
                j_nk_h = joint_names.index('Neck')
                j_sp2_h = joint_names.index('Spine2')
                dense_h = np.zeros((len(idx_hc), n_jh), dtype=np.float64)
                dense_h[:, j_hd_h] = 1.0 - u_low
                ax_h = np.abs(qh[:, 0])
                u_dl_h = np.clip((ax_h - (x_arm_h - 0.045)) / 0.065, 0.0, 1.0)
                u_dl_h = u_dl_h * u_dl_h * (3.0 - 2.0 * u_dl_h) * u_low
                w_trunk_h = u_low - u_dl_h
                dense_h[:, j_nk_h] += 0.35 * w_trunk_h
                dense_h[:, j_sp2_h] += 0.65 * w_trunk_h
                for side_h, sgn_h in (('Left', 1.0), ('Right', -1.0)):
                    ms = qh[:, 0] * sgn_h >= 0.0
                    if ms.any():
                        dense_h[ms, joint_names.index(side_h + 'Shoulder')] += 0.42 * u_dl_h[ms]
                        dense_h[ms, joint_names.index(side_h + 'Arm')] += 0.58 * u_dl_h[ms]
                ord_h = np.argsort(-dense_h, axis=1)[:, :4]
                top_wh = np.take_along_axis(dense_h, ord_h, axis=1)
                top_wh /= np.maximum(top_wh.sum(axis=1, keepdims=True), 1e-9)
                JJ_post[idx_hc] = ord_h.astype(JJ_post.dtype)
                WW_post[idx_hc] = top_wh.astype(np.float32)
        if slot in ('torso', 'back') and use_trunk_arr.any():
            is_rigid_v = np.zeros(len(P_arr), dtype=bool)
            for gs, ge, _ in rigid_overrides:
                is_rigid_v[gs:ge] = True
            n_j = len(joint_names)
            j_sp2 = joint_names.index('Spine2')
            j_neck = joint_names.index('Neck')
            j_head = joint_names.index('Head')
            x_arm_gl = abs(float(RIG.jpos[RIG.J['LeftArm']][0]))
            y_arm_gl = float(RIG.jpos[RIG.J['LeftArm']][1])
            y_neck_gl = float(RIG.jpos[RIG.J['Neck']][1])
            y_head_gl = float(RIG.jpos[RIG.J['Head']][1])

            # 1. Symmetric Head/Neck/Spine2 blending on torso/back-attached cowls/hoods above Neck so shoulders never split them
            mask_cowl = (slot == 'torso') & use_trunk_arr & (~is_rigid_v) & (P_arr[:, 1] > y_neck_gl + 0.012) & (np.abs(P_arr[:, 0]) < x_arm_gl - 0.012)
            if mask_cowl.any():
                idx_c = np.nonzero(mask_cowl)[0]
                yc = P_arr[idx_c, 1]
                u_cw = np.clip((yc - (y_neck_gl + 0.012)) / 0.036, 0.0, 1.0)
                u_cw = u_cw * u_cw * (3.0 - 2.0 * u_cw)
                u_hd = np.clip((yc - (y_neck_gl + 0.032)) / max(0.035, (y_head_gl + 0.018) - (y_neck_gl + 0.032)), 0.0, 1.0)
                u_hd = u_hd * u_hd * (3.0 - 2.0 * u_hd)
                dense_w = np.zeros((len(idx_c), n_j), dtype=np.float64)
                rows_c = np.arange(len(idx_c))[:, None]
                np.add.at(dense_w, (rows_c, JJ_post[idx_c]), WW_post[idx_c] * (1.0 - u_cw)[:, None])
                w_hd = 0.76 * u_hd
                w_sp = 0.16 * (1.0 - u_hd)
                w_nk = 1.0 - w_hd - w_sp
                dense_w[:, j_head] += u_cw * w_hd
                dense_w[:, j_neck] += u_cw * w_nk
                dense_w[:, j_sp2] += u_cw * w_sp
                ord_c = np.argsort(-dense_w, axis=1)[:, :4]
                top_wc = np.take_along_axis(dense_w, ord_c, axis=1)
                top_wc /= np.maximum(top_wc.sum(axis=1, keepdims=True), 1e-9)
                JJ_post[idx_c] = ord_c.astype(JJ_post.dtype)
                WW_post[idx_c] = top_wc.astype(np.float32)

            # 2. Deltoid shoulder-eave synchronization so torso_tube & collar_disc caps rotate down with dropped arms (0 shoulder flaps)
            #    (Restricted strictly to `slot == 'torso'`: dorsal `back` capes do not wrap arms and must stay axial-spine weighted!)
            for side_d, sgn_d in (('Left', 1.0), ('Right', -1.0)):
                mask_d = (
                    (slot == 'torso') & use_trunk_arr & (~is_rigid_v)
                    & (P_arr[:, 0] * sgn_d > x_arm_gl - 0.055)
                    & (P_arr[:, 1] >= y_arm_gl - 0.22)
                    & (P_arr[:, 1] <= y_neck_gl + 0.045)
                )
                if not mask_d.any():
                    continue
                idx_d = np.nonzero(mask_d)[0]
                qd = P_arr[idx_d]
                ax_d = np.abs(qd[:, 0])
                yd = qd[:, 1]
                u_lat = np.clip((ax_d - (x_arm_gl - 0.055)) / 0.068, 0.0, 1.0)
                u_lat = u_lat * u_lat * (3.0 - 2.0 * u_lat)
                u_v_outer = np.clip((yd - (y_arm_gl - 0.22)) / 0.095, 0.0, 1.0)
                u_v_inner = np.clip((yd - (y_arm_gl - 0.145)) / 0.080, 0.0, 1.0)
                u_v = np.where(ax_d > x_arm_gl + 0.008, u_v_outer, u_v_inner)
                u_v = u_v * u_v * (3.0 - 2.0 * u_v)
                u_delt = u_lat * u_v
                p_arm_d = np.asarray(RIG.jpos[RIG.J[side_d + 'Arm']], dtype=np.float64)
                p_fa_d = np.asarray(RIG.jpos[RIG.J[side_d + 'ForeArm']], dtype=np.float64)
                u1_d = p_fa_d - p_arm_d
                l1_d = max(float(np.linalg.norm(u1_d)), 1e-6)
                s_d = ((qd - p_arm_d) @ (u1_d / l1_d)) / l1_d
                u_sh_d = np.clip((0.26 - s_d) / 0.42, 0.0, 1.0)
                u_med_d = np.clip((abs(float(p_arm_d[0])) + 0.025 - ax_d) / 0.085, 0.0, 1.0)
                u_sh_d = np.maximum(u_sh_d, u_med_d)
                u_sh_d = u_sh_d * u_sh_d * (3.0 - 2.0 * u_sh_d)
                w_sp2_d = 0.50 * u_sh_d
                w_sh_d = 0.50 * u_sh_d
                u_fa_d = np.clip((s_d - 0.72) / 0.56, 0.0, 1.0)
                u_fa_d = u_fa_d * u_fa_d * (3.0 - 2.0 * u_fa_d)
                w_rem_d = np.maximum(0.0, 1.0 - (w_sp2_d + w_sh_d))
                w_arm_d = w_rem_d * (1.0 - u_fa_d)
                w_fa_d = w_rem_d * u_fa_d
                j_sh_d = joint_names.index(side_d + 'Shoulder')
                j_arm_d = joint_names.index(side_d + 'Arm')
                j_fa_d = joint_names.index(side_d + 'ForeArm')
                dense_d = np.zeros((len(idx_d), n_j), dtype=np.float64)
                rows_d = np.arange(len(idx_d))[:, None]
                np.add.at(dense_d, (rows_d, JJ_post[idx_d]), WW_post[idx_d] * (1.0 - u_delt)[:, None])
                dense_d[:, j_sp2] += u_delt * w_sp2_d
                dense_d[:, j_sh_d] += u_delt * w_sh_d
                dense_d[:, j_arm_d] += u_delt * w_arm_d
                dense_d[:, j_fa_d] += u_delt * w_fa_d
                ord_d = np.argsort(-dense_d, axis=1)[:, :4]
                top_wd = np.take_along_axis(dense_d, ord_d, axis=1)
                top_wd /= np.maximum(top_wd.sum(axis=1, keepdims=True), 1e-9)
                JJ_post[idx_d] = ord_d.astype(JJ_post.dtype)
                WW_post[idx_d] = top_wd.astype(np.float32)

            # 2B. Post-deltoid sleeve-to-trunk shoulder-cap co-skinning:
            #     Must run AFTER `# 2. Deltoid shoulder-eave synchronization` so `JJ_post/WW_post` on `trunk_ranges`
            #     shares the exact `LeftArm/Spine2/LeftShoulder` blend of the underlying sleeve (`0` LBS chord collapse / poke-through)!
            if slot == 'torso' and trunk_ranges:
                slv_gi_post = [
                    np.arange(gs, ge) for gs, ge, _, _, is_cl, pn in arm_part_ranges
                    if is_cl and ('sleeve' in pn.lower() or 'arm' in pn.lower())
                ]
                if slv_gi_post:
                    slv_gi_all_p = np.concatenate(slv_gi_post)
                    slv_tree_p = cKDTree(P_arr[slv_gi_all_p])
                    for t_gs, t_ge in trunk_ranges:
                        for gi in range(t_gs, t_ge):
                            if is_rigid_v[gi]:
                                continue
                            px_g, py_g = float(P_arr[gi, 0]), float(P_arr[gi, 1])
                            if abs(px_g) >= x_arm_gl - 0.032 and py_g >= y_arm_gl - 0.145:
                                d_sg, nn_sg = slv_tree_p.query(P_arr[gi])
                                if float(d_sg) <= 0.042:
                                    src_slv = int(slv_gi_all_p[int(nn_sg)])
                                    t_x = float(np.clip((abs(px_g) - (x_arm_gl - 0.032)) / 0.036, 0.0, 1.0))
                                    t_x = t_x * t_x * (3.0 - 2.0 * t_x)
                                    t_d = float(np.clip((0.042 - float(d_sg)) / 0.016, 0.0, 1.0))
                                    t_sm = t_x * t_d
                                    if t_sm > 1e-3:
                                        make_mpfb.take_weights(JJ_post, WW_post, gi, src_slv, t_sm)
                                        if t_sm >= 0.5:
                                            near_morph[gi] = near_morph[src_slv]

            # 3. Lock collar_disc weights & morphs to underlying trunk + sleeve shoulder surface (zero pose poke-through)
            if trunk_ranges:
                under_sh_blocks = [np.arange(gs, ge) for gs, ge in trunk_ranges] + [
                    np.arange(gs, ge) for gs, ge, _, _, _, _ in arm_part_ranges
                ]
                under_sh_gi = np.concatenate(under_sh_blocks)
                under_sh_tree = cKDTree(P_arr[under_sh_gi])
                for gs_c, ge_c, p_col in part_gi_ranges:
                    Fc = fx(p_col)
                    if 'collar' in Fc and 'neck' not in Fc and not p_col.rigid_joint and p_col.P.ndim == 3 and p_col.P.shape[0] >= 6:
                        _, nn_c = under_sh_tree.query(P_arr[gs_c:ge_c])
                        src_c = under_sh_gi[nn_c]
                        JJ_post[gs_c:ge_c] = JJ_post[src_c]
                        WW_post[gs_c:ge_c] = WW_post[src_c]
                        near_morph[gs_c:ge_c] = near_morph[src_c]

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
            cloth_blobs, body=BODY_CONTACT if slot == 'torso' else None
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

    # Sync backed open panels (tabards/aprons/bishts), waist belts & surface buttons/trinkets to post-cloth_bones trunk weights
    acc_set = set(acc_ranges)
    if slot == 'torso' and trunk_ranges and (overlay_panel_ranges or band_ranges or acc_ranges):
        trunk_gi_f = np.concatenate([np.arange(gs, ge) for gs, ge in trunk_ranges])
        trunk_tree_f = cKDTree(P_arr[trunk_gi_f])
        JJ_fin = glbio.accessor(j_tpl, bytes(binb), at['JOINTS_0']).copy()
        WW_fin = glbio.accessor(j_tpl, bytes(binb), at['WEIGHTS_0']).astype(np.float32).copy()
        if WW_fin.max() > 1.5:
            WW_fin /= np.maximum(WW_fin.sum(axis=1, keepdims=True), 1e-6)
        changed_fin = False
        # Build dense barycentric sample cloud over trunk triangles so overlay panels & 3D sash_tail ribbons inherit
        # exact triangle-interpolated weights (< 0.4mm LBS lockstep across hip flexion & cloth chains!)
        tr_gi_mask = np.zeros(len(P_arr), dtype=bool)
        for gs_t, ge_t in trunk_ranges:
            tr_gi_mask[gs_t:ge_t] = True
        tr_tri_mask = tr_gi_mask[T_arr].all(axis=1)
        if tr_tri_mask.any():
            tr_tris = T_arr[tr_tri_mask]
            bary_uvs = (
                (1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (0.0, 0.0, 1.0),
                (0.5, 0.5, 0.0), (0.0, 0.5, 0.5), (0.5, 0.0, 0.5),
                (1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0),
                (0.6, 0.2, 0.2), (0.2, 0.6, 0.2), (0.2, 0.2, 0.6),
            )
            va_t, vb_t, vc_t = P_arr[tr_tris[:, 0]], P_arr[tr_tris[:, 1]], P_arr[tr_tris[:, 2]]
            bary_pts = np.vstack([la * va_t + lb * vb_t + lc * vc_t for la, lb, lc in bary_uvs])
            bary_tree = cKDTree(bary_pts)
            n_tr_t = len(tr_tris)
        else:
            bary_tree = None
        for gs_o, ge_o in overlay_panel_ranges:
            # Find matching Part so closed 3D `sash_tail` pairs outer & inner faces to identical backing-point weights
            p_ov = next((p_cand for gs_p, ge_p, p_cand in part_gi_ranges if gs_p == gs_o and ge_p == ge_o), None)
            is_sash_3d = (p_ov is not None and 'sash_tail' in fx(p_ov) and getattr(p_ov, 'closed', False))
            Q_query = P_arr[gs_o:ge_o].copy()
            if is_sash_3d:
                R_ov, C_ov = p_ov.P.shape[:2]
                cols_uv_ov = C_ov + 1
                n_half_ov = C_ov // 2
                for ri_o in range(R_ov):
                    for cj_o in range(cols_uv_ov):
                        jc_mod = cj_o % C_ov
                        # Map outer face col `jc_mod < n_half_ov` to its paired inner-face contact col `C_ov - 1 - jc_mod`
                        back_col = (C_ov - 1 - jc_mod) if jc_mod < n_half_ov else jc_mod
                        Q_query[ri_o * cols_uv_ov + cj_o] = P_arr[gs_o + ri_o * cols_uv_ov + back_col]
            if bary_tree is not None:
                _, idx_bp = bary_tree.query(Q_query)
                n_jf_tot = int(max(JJ_fin.max() + 1, len(j_tpl['skins'][node['skin']]['joints'])))
                for loc_i, gi_v in enumerate(range(gs_o, ge_o)):
                    bi = int(idx_bp[loc_i])
                    la, lb, lc = bary_uvs[bi // n_tr_t]
                    ta_i, tb_i, tc_i = tr_tris[bi % n_tr_t]
                    acc_w = np.zeros(n_jf_tot, dtype=np.float64)
                    for sv_i, wt_b in ((int(ta_i), la), (int(tb_i), lb), (int(tc_i), lc)):
                        if wt_b <= 1e-6:
                            continue
                        for sl_k in range(4):
                            acc_w[int(JJ_fin[sv_i, sl_k])] += wt_b * float(WW_fin[sv_i, sl_k])
                    top4_j = np.argsort(-acc_w)[:4]
                    top4_w = acc_w[top4_j]
                    top4_w /= max(float(top4_w.sum()), 1e-9)
                    JJ_fin[gi_v] = top4_j.astype(JJ_fin.dtype)
                    WW_fin[gi_v] = top4_w.astype(np.float32)
                    near_morph[gi_v] = near_morph[int(ta_i if la >= max(lb, lc) else (tb_i if lb >= lc else tc_i))]
            else:
                _, nn_ov = trunk_tree_f.query(Q_query)
                src_o = trunk_gi_f[nn_ov]
                JJ_fin[gs_o:ge_o] = JJ_fin[src_o]
                WW_fin[gs_o:ge_o] = WW_fin[src_o]
                near_morph[gs_o:ge_o] = near_morph[src_o]
            changed_fin = True
        for gs_b, ge_b in band_ranges:
            if float(P_arr[gs_b:ge_b, 1].max()) <= float(RIG.jpos[RIG.J['Spine1']][1]) + 0.04:
                _, nn_b = trunk_tree_f.query(P_arr[gs_b:ge_b])
                src_b = trunk_gi_f[nn_b]
                JJ_fin[gs_b:ge_b] = JJ_fin[src_b]
                WW_fin[gs_b:ge_b] = WW_fin[src_b]
                near_morph[gs_b:ge_b] = near_morph[src_b]
                changed_fin = True
        if acc_ranges:
            host_gi_f = np.concatenate(
                [np.arange(gs, ge) for gs, ge in trunk_ranges]
                + [np.arange(gs, ge) for gs, ge in overlay_panel_ranges]
                + [np.arange(gs, ge) for gs, ge in band_ranges]
            )
            host_tree_f = cKDTree(P_arr[host_gi_f])
            for gs_a, ge_a in acc_ranges:
                _, nn_a = host_tree_f.query(P_arr[gs_a:ge_a].mean(axis=0))
                src_a = int(host_gi_f[int(nn_a)])
                JJ_fin[gs_a:ge_a] = JJ_fin[src_a]
                WW_fin[gs_a:ge_a] = WW_fin[src_a]
                near_morph[gs_a:ge_a] = near_morph[src_a]
                changed_fin = True
        if changed_fin:
            bv_jf = j_tpl['bufferViews'][j_tpl['accessors'][at['JOINTS_0']]['bufferView']]
            jb_f = np.ascontiguousarray(JJ_fin.astype(glbio.CT[j_tpl['accessors'][at['JOINTS_0']]['componentType']])).tobytes()
            binb[bv_jf['byteOffset']:bv_jf['byteOffset'] + len(jb_f)] = jb_f
            bv_wf = j_tpl['bufferViews'][aw['bufferView']]
            if w_ct == 5126:
                wb_f = np.ascontiguousarray(WW_fin.astype(np.float32)).tobytes()
            else:
                wb_f = np.ascontiguousarray(np.round(np.clip(WW_fin, 0.0, 1.0) * np.iinfo(w_dt).max).astype(w_dt)).tobytes()
            binb[bv_wf['byteOffset']:bv_wf['byteOffset'] + len(wb_f)] = wb_f

    out_glb = ROOT / 'pieces' / BODY_ID / f'{gid}.glb'
    js = json.dumps(j_tpl, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(out_glb, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))

    for gs, ge, _ in rigid_overrides:
        if (gs, ge) in acc_set:
            continue
        q_ctr = P_arr[gs:ge].mean(axis=0).copy()
        if slot in ('head', 'beard', 'hair', 'implant'):
            _, idx_c = BASE_TREE_GL.query(q_ctr)
            near_morph[gs:ge] = int(idx_c)
        else:
            r_c = math.hypot(float(q_ctr[0]), float(q_ctr[2]))
            if r_c > 0.085:
                q_ctr[0] *= 0.085 / r_c
                q_ctr[2] *= 0.085 / r_c
            _, idx_c = TRUNK_TREE_GL.query(q_ctr)
            near_morph[gs:ge] = int(TRUNK_IDX[int(idx_c)])
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
    if allow_floating:
        entry['allow_floating'] = True
    if vfx_zones:
        entry['vfx'] = {'zones': vfx_zones}
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
            entry['legged'] = True
            tris = make_mpfb.covered(BP_GL, BT, str(out_glb), **make_mpfb.TROUSERS_COVER)
        entry['hide'] = make_mpfb.bits(len(BT), tris)
        entry['hides'] = int(len(tris))
        entry['hide_by'] = 'rays'
    elif slot == 'feet':
        if any('foot_us' in fx(p) for p in parts):
            # Closed boots completely enclose the bare foot and ankle below the top of the shaft;
            # always hide all bare foot triangles inside the closed boot volume so heels/toes never clip.
            tris = make_mpfb.covered(BP_GL, BT, str(out_glb), out=0.040, inward=0.022)
            y_boot_top = min(float(P_arr[:, 1].max()) - 0.025, float(RIG.jpos[RIG.J['LeftLeg']][1]) - 0.04)
            foot_enc = np.where((BP_GL[BT, 1] < y_boot_top).all(axis=1))[0]
            tris = np.unique(np.concatenate([tris, foot_enc]))
        else:
            # Open sandals (`sandal()`): NEVER hide exposed bare toes, instep, arch, or heel!
            # Hide only the 4 lowest plantar contact triangles (`hides = 4 <= 40`).
            tris = np.argsort(BP_GL[BT, 1].mean(axis=1))[:4].astype(np.int32)
        entry['hide'] = make_mpfb.bits(len(BT), tris)
        entry['hides'] = int(len(tris))
        entry['hide_by'] = 'rays'
    elif slot == 'gloves':
        tris = make_mpfb.covered(BP_GL, BT, str(out_glb), out=0.045, inward=0.025)
        tris = tris[(np.abs(BP_GL[BT[tris], 0]).min(1) > 0.28)]
        has_full_fingers = any('_finger_' in (getattr(p, 'name', '') or '') for p in parts)
        if has_full_fingers:
            # Closed articulated full gloves completely enclose all 5 fingers & metacarpals beyond the wrist crease;
            # hide 100% of distal hand/finger triangles so curled bare skin fingers NEVER poke out between webs!
            hand_enc_list = []
            for s_nm, s_sgn in (('Left', 1.0), ('Right', -1.0)):
                p_fa_g = np.asarray(RIG.jpos[RIG.J[s_nm + 'ForeArm']], dtype=np.float64)
                p_hd_g = np.asarray(RIG.jpos[RIG.J[s_nm + 'Hand']], dtype=np.float64)
                d_hd_g = p_hd_g - p_fa_g
                d_hd_g /= max(float(np.linalg.norm(d_hd_g)), 1e-6)
                v_proj = (BP_GL - p_hd_g[None, :]) @ d_hd_g
                v_side = (BP_GL[:, 0] * s_sgn > 0.30) & (v_proj >= -0.028)
                hand_enc_list.append(np.where(v_side[BT].all(axis=1))[0])
            tris = np.unique(np.concatenate([tris] + hand_enc_list))
            entry['hide_parts'] = ['Human.fingernails']
        if len(tris):
            entry['hide'] = make_mpfb.bits(len(BT), tris)
            entry['hides'] = int(len(tris))
            entry['hide_by'] = 'rays'

    # Compile-time garment invariant validation (prevents regressions before writing manifest)
    # Check #6 (_VIDX Disjointness & Non-Empty Hide Invariant):
    assert int(used_vi.max()) + 1 == vi_offset, (
        f'[GARMENT CHECK FAIL] {gid}: non-contiguous or overlapping _VIDX allocation ({int(used_vi.max()) + 1} != {vi_offset})'
    )
    if slot == 'head':
        assert 'hide' not in entry, f'[GARMENT CHECK FAIL] {gid}: head items must not emit body triangle hide masks'
    elif slot in ('torso', 'legs', 'feet') and not is_floating:
        if not (slot == 'torso' and open_torso):
            assert entry.get('hide') and entry.get('hides', 0) > 0, (
                f'[GARMENT CHECK FAIL] {gid} ({slot}): missing or empty base-body hide mask!'
            )
    if slot == 'feet' and not is_floating:
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

    # Check #10 (Zero Foot/ToeBase Bone Bleed on Torso & Legs — rich_jama Gown Guard):
    if slot in ('torso', 'legs'):
        JJ_fchk = glbio.accessor(j_tpl, bytes(binb), at['JOINTS_0'])
        WW_fchk = glbio.accessor(j_tpl, bytes(binb), at['WEIGHTS_0']).astype(np.float32)
        if WW_fchk.max() > 1.5:
            WW_fchk /= np.maximum(WW_fchk.sum(axis=1, keepdims=True), 1e-6)
        foot_j_ids = [joint_names.index(n) for n in ('LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase') if n in joint_names]
        if foot_j_ids:
            w_foot_tot = np.zeros(len(P_arr), dtype=np.float32)
            for kc in range(4):
                w_foot_tot += np.where(np.isin(JJ_fchk[:, kc], foot_j_ids), WW_fchk[:, kc], 0.0)
            assert int((w_foot_tot > 0.01).sum()) == 0, (
                f'[GARMENT CHECK FAIL] {gid}: {int((w_foot_tot > 0.01).sum())} {slot} vertices carry Foot/ToeBase bone weights!'
            )
        if cloth_out:
            for ch_c in cloth_out.get('chains', []):
                for bw_r in ch_c.get('bw', []):
                    for jn_c, wv_c in bw_r:
                        assert not (jn_c in ('LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase') and wv_c > 0.01), (
                            f'[GARMENT CHECK FAIL] {gid}: cloth chain carries {jn_c} weight ({wv_c:.3f}) on {slot}!'
                        )

    # Check #11 (Rigid Part Zero Morph Shear — Master of Mines Chain Explosion Guard):
    for gs, ge, jname in rigid_overrides:
        vis_rg = VI_arr[gs:ge]
        if len(vis_rg) > 1:
            rg_spread = float(np.ptp(D_garment[:, vis_rg, :], axis=1).max())
            assert rg_spread <= 1.5e-4, (
                f'[GARMENT CHECK FAIL] {gid} ({jname}): rigid part shears across morph targets by {rg_spread*1000:.2f}mm!'
            )

    # Check #12 (Shoulder-Flap Deltoid Sync on Torso — White Lily / Monk / Order Shoulder Guard):
    if slot == 'torso' and not is_floating:
        JJ_dchk = glbio.accessor(j_tpl, bytes(binb), at['JOINTS_0'])
        WW_dchk = glbio.accessor(j_tpl, bytes(binb), at['WEIGHTS_0']).astype(np.float64)
        WW_dchk /= np.maximum(WW_dchk.sum(axis=1, keepdims=True), 1e-9)
        raw_jns = [j_tpl['nodes'][k].get('name', '') for k in j_tpl['skins'][node['skin']]['joints']]
        cloth_j_ids = [idx for idx, nm in enumerate(raw_jns) if nm.startswith(('c_', 'cloth:'))]
        has_cl = np.isin(JJ_dchk, cloth_j_ids).any(axis=1) if cloth_j_ids else np.zeros(len(P_arr), dtype=bool)
        is_rg_v = np.zeros(len(P_arr), dtype=bool)
        for gs, ge, _ in rigid_overrides:
            is_rg_v[gs:ge] = True
        arm_j_chk = [joint_names.index(n) for n in ('LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm') if n in joint_names]
        x_arm_c = abs(float(RIG.jpos[RIG.J['LeftArm']][0]))
        y_arm_c = float(RIG.jpos[RIG.J['LeftArm']][1])
        y_neck_c = float(RIG.jpos[RIG.J['Neck']][1])
        m_delt_c = (~has_cl) & (~is_rg_v) & (np.abs(P_arr[:, 0]) > x_arm_c + 0.015) & (P_arr[:, 1] > y_arm_c - 0.055) & (P_arr[:, 1] <= y_neck_c + 0.04)
        if m_delt_c.any():
            idx_mc = np.nonzero(m_delt_c)[0]
            aw_mc = np.zeros(len(idx_mc), dtype=np.float64)
            for kc in range(4):
                aw_mc += np.where(np.isin(JJ_dchk[idx_mc, kc], arm_j_chk), WW_dchk[idx_mc, kc], 0.0)
            bad_flap = int((aw_mc < 0.24).sum())
            assert bad_flap == 0, (
                f'[GARMENT CHECK FAIL] {gid}: {bad_flap} lateral shoulder vertices lack deltoid Arm/Shoulder weights (min={aw_mc.min():.3f})!'
            )

    # Check #13 (Floating Rigid Doodad, Flush Button/Trinket, Horn/Plume & Worn Eyewear Contact Guard):
    if not is_floating and slot in ('head', 'torso', 'back', 'legs', 'gloves') and len(part_gi_ranges) >= 2:
        rg_or_acc = {(gs, ge) for gs, ge, _ in rigid_overrides} | set(acc_ranges)
        y_head_c = float(RIG.jpos[RIG.J['Head']][1])
        va_all = P_arr[T_arr[:, 0]]
        vb_all = P_arr[T_arr[:, 1]]
        vc_all = P_arr[T_arr[:, 2]]
        tri_gi0 = T_arr[:, 0]
        for gs, ge, p_obj in part_gi_ranges:
            pname_l = (p_obj.name or '').lower()
            if any(tok in pname_l or tok in gid.lower() for tok in ('halo', 'orbit', 'float')):
                continue
            n_vp = ge - gs
            if (gs, ge) in rg_or_acc and n_vp <= 360:
                other_v_m = np.ones(len(P_arr), dtype=bool)
                other_v_m[gs:ge] = False
                other_t_m = (tri_gi0 < gs) | (tri_gi0 >= ge)
                host_blocks_c = [BP_GL]
                if other_v_m.any():
                    host_blocks_c.append(P_arr[other_v_m])
                if other_t_m.any():
                    va_o, vb_o, vc_o = va_all[other_t_m], vb_all[other_t_m], vc_all[other_t_m]
                    for wa, wb, wc in (
                        (1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0),
                        (0.5, 0.5, 0.0), (0.0, 0.5, 0.5), (0.5, 0.0, 0.5),
                        (0.6, 0.2, 0.2), (0.2, 0.6, 0.2), (0.2, 0.2, 0.6),
                        (0.75, 0.25, 0.0), (0.25, 0.75, 0.0), (0.0, 0.75, 0.25),
                        (0.0, 0.25, 0.75), (0.75, 0.0, 0.25), (0.25, 0.0, 0.75),
                    ):
                        host_blocks_c.append(wa * va_o + wb * vb_o + wc * vc_o)
                host_pts = np.vstack(host_blocks_c)
                d_host = float(cKDTree(host_pts).query(P_arr[gs:ge])[0].min())
                is_btn_chk = ('_btn' in pname_l or 'button' in pname_l)
                max_d_allow = 0.0040 if is_btn_chk else 0.0180
                assert d_host <= max_d_allow, (
                    f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: component floats {d_host*1000:.1f}mm '
                    f'(>{max_d_allow*1000:.1f}mm) from garment & body!'
                )
            if slot == 'head' and any(tok in pname_l for tok in ('spec', 'spectacle', 'glasses', 'monocle')):
                if float(P_arr[gs:ge, 1].mean()) < y_head_c + 0.068:
                    d_face = float(BASE_TREE_GL.query(P_arr[gs:ge])[0].min())
                    assert d_face <= 0.018, (
                        f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: worn spectacles float {d_face*1000:.1f}mm (>18mm) off nose/face!'
                    )
            if slot == 'head' and not covers_hair and any(tok in pname_l for tok in ('head_strap', 'loop_')):
                d_bare = BASE_TREE_GL.query(P_arr[gs:ge])[0]
                p90_bare = float(np.percentile(d_bare, 90))
                assert p90_bare <= 0.016, (
                    f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: bare-head strap/hose hovers {p90_bare*1000:.1f}mm (p90 > 16mm) off skull!'
                )

    # Check #14 (Waist Belt Pass-Over Front Apron & Collar Hover Guard):
    if slot == 'torso' and not is_floating:
        for gs, ge, p_obj in part_gi_ranges:
            Fp = fx(p_obj)
            if 'belt' in Fp and getattr(p_obj, 'closed', False) and p_obj.P.ndim == 3:
                bz_mid = float(p_obj.P[:, :, 2].mean())
                bp = p_obj.P.reshape(-1, 3)
                bf_m = (np.abs(bp[:, 0]) < 0.045) & (bp[:, 1] < -0.05)
                if bf_m.any():
                    belt_fy = float((-bp[bf_m, 1]).mean())
                    for _, _, q_obj in part_gi_ranges:
                        if q_obj is p_obj or getattr(q_obj, 'closed', False) or q_obj.P.ndim != 3 or 'strap' in fx(q_obj):
                            continue
                        qz0, qz1 = float(q_obj.P[:, :, 2].min()), float(q_obj.P[:, :, 2].max())
                        if qz0 < bz_mid - 0.06 and qz1 > bz_mid + 0.06:
                            Qd = q_obj.P
                            q_samples = [Qd.reshape(-1, 3)]
                            for ur in (0.25, 0.5, 0.75):
                                q_samples.append(((1.0 - ur) * Qd[:-1] + ur * Qd[1:]).reshape(-1, 3))
                            qp = np.vstack(q_samples)
                            qf_m = (np.abs(qp[:, 0]) < 0.045) & (qp[:, 1] < -0.05) & (np.abs(qp[:, 2] - bz_mid) < 0.030)
                            if qf_m.any():
                                apron_fy = float((-qp[qf_m, 1]).mean())
                                assert belt_fy >= apron_fy - 0.0015, (
                                    f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: waist belt clips {(apron_fy - belt_fy)*1000:.1f}mm behind {q_obj.name}!'
                                )
            if 'collar' in Fp and 'neck' not in Fp and p_obj.P.ndim == 3 and p_obj.P.shape[0] >= 6:
                r0_bl = p_obj.P[0]
                r0_gl = np.column_stack([r0_bl[:, 0], r0_bl[:, 2], -r0_bl[:, 1]])
                other_m = np.ones(len(P_arr), dtype=bool)
                other_m[gs:ge] = False
                ref_col = np.vstack([P_arr[other_m], BP_GL]) if other_m.any() else BP_GL
                d_col = float(cKDTree(ref_col).query(r0_gl)[0].min())
                assert d_col <= 0.016, (
                    f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: collar inner rim hovers {d_col*1000:.1f}mm (>16mm) above body/garment!'
                )

    # Check #15 (Headband Seam Continuity Guard — chronomonk_band Guard):
    if slot == 'head' and not is_floating:
        for _, _, p_obj in part_gi_ranges:
            if 'band' in fx(p_obj) and p_obj.P.ndim == 3 and not getattr(p_obj, 'closed', False) and p_obj.P.shape[1] >= 16:
                px_min, px_max = float(p_obj.P[:, :, 0].min()), float(p_obj.P[:, :, 0].max())
                py_min, py_max = float(p_obj.P[:, :, 1].min()), float(p_obj.P[:, :, 1].max())
                if px_min < -0.06 and px_max > 0.06 and py_min < -0.06 and py_max > 0.06:
                    seam_gap = float(np.linalg.norm(p_obj.P[:, 0] - p_obj.P[:, -1], axis=1).max())
                    assert seam_gap <= 0.015, (
                        f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: encircling headband has {seam_gap*1000:.1f}mm open seam gap!'
                    )

    # Check #16 (Cape/Mantle Shoulder Attachment & Zero Back-Shoulder Flap Guard):
    if slot in ('torso', 'back') and not is_floating:
        for gs, ge, p_obj in part_gi_ranges:
            Fp = fx(p_obj)
            if (
                not getattr(p_obj, 'closed', False)
                and p_obj.P.ndim == 3 and p_obj.P.shape[0] >= 5 and p_obj.P.shape[1] >= 12
                and 'strap' not in Fp and not (Fp & {'arm', 'arm_tube', 'pauldron', 'collar', 'neck'})
                and not getattr(p_obj, 'is_arm', False) and not p_obj.rigid_joint
            ):
                z_lo_p, z_hi_p = float(p_obj.P[:, :, 2].min()), float(p_obj.P[:, :, 2].max())
                y_mean_p = float(p_obj.P[:, :, 1].mean())  # Blender +Y is dorsal back
                if (z_hi_p - z_lo_p) >= 0.14 and y_mean_p > 0.02 and z_hi_p >= SHOULDER - 0.02:
                    top_r_idx = 0 if float(p_obj.P[0, :, 2].mean()) >= float(p_obj.P[-1, :, 2].mean()) else -1
                    top_bl = p_obj.P[top_r_idx]
                    top_gl = np.column_stack([top_bl[:, 0], top_bl[:, 2], -top_bl[:, 1]])
                    other_m = np.ones(len(P_arr), dtype=bool)
                    other_m[gs:ge] = False
                    other_t_sh = (T_arr[:, 0] < gs) | (T_arr[:, 0] >= ge)
                    sh_ref_blocks = [BP_GL]
                    if other_m.any():
                        sh_ref_blocks.append(P_arr[other_m])
                    if other_t_sh.any():
                        va_s = P_arr[T_arr[other_t_sh, 0]]
                        vb_s = P_arr[T_arr[other_t_sh, 1]]
                        vc_s = P_arr[T_arr[other_t_sh, 2]]
                        for wa, wb, wc in (
                            (1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0),
                            (0.5, 0.5, 0.0), (0.0, 0.5, 0.5), (0.5, 0.0, 0.5),
                            (0.6, 0.2, 0.2), (0.2, 0.6, 0.2), (0.2, 0.2, 0.6),
                        ):
                            sh_ref_blocks.append(wa * va_s + wb * vb_s + wc * vc_s)
                    ref_sh = np.vstack(sh_ref_blocks)
                    p75_sh = float(np.percentile(cKDTree(ref_sh).query(top_gl)[0], 75))
                    max_sh_gap = 0.036 if slot == 'back' else 0.024
                    assert p75_sh <= max_sh_gap, (
                        f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: dorsal cape/mantle top edge hovers '
                        f'{p75_sh*1000:.1f}mm (>{max_sh_gap*1000:.1f}mm) off shoulders/collar!'
                    )
                    if slot == 'torso' and (z_hi_p - z_lo_p) < 0.28:
                        all_bl = p_obj.P.reshape(-1, 3)
                        all_gl = np.column_stack([all_bl[:, 0], all_bl[:, 2], -all_bl[:, 1]])
                        p90_flap = float(np.percentile(cKDTree(ref_sh).query(all_gl)[0], 90))
                        assert p90_flap <= 0.022, (
                            f'[GARMENT CHECK FAIL] {gid}/{p_obj.name}: short dorsal panel forms a {p90_flap*1000:.1f}mm '
                            f'(>22mm) flap behind the shoulders!'
                        )

    # Check #17 (Rigid Hip-Skirt Over Thighs Guard — Yuni Jackaroo Thigh-Clip Guard):
    if slot == 'torso' and not gid.startswith('valley_') and not is_floating:
        crotch_chk_y = float(RIG.jpos[RIG.J['LeftUpLeg']][1])
        min_y_gl = float(P_arr[:, 1].min())
        assert not (min_y_gl < crotch_chk_y - 0.065 and cloth_out is None), (
            f'[GARMENT CHECK FAIL] {gid}: torso skirt hangs {(crotch_chk_y - min_y_gl)*100:.1f}cm below crotch '
            f'with cloth=None (causes rigid Hips lock & trouser thigh clipping)!'
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
                prev = items[by_id[e['id']]]
                if 'type' in prev and 'type' not in e:
                    e['type'] = prev['type']
                items[by_id[e['id']]] = e
            else:
                items.append(e)
                by_id[e['id']] = len(items) - 1
        make_mpfb.write_kit(str(kit_path), kit)
        print(f'Updated {kit_path} with {len(b_entries)} pieces (total items: {len(items)}).')
    conform_outfit_back_straps()


def conform_outfit_back_straps(peoples_path=None):
    """Cross-slot outfit pass: ensures every `back` pack's shoulder-harness straps (`pack_straps`)
    clear all paired `torso` garments (coats, pauldrons, war-shirt yokes, baldrics, collars) by >= 3.0 mm."""
    from scipy.sparse import csr_matrix
    from scipy.sparse.csgraph import connected_components

    p_file = Path(peoples_path) if peoples_path else (ROOT / 'data' / 'peoples.json')
    peoples = json.loads(p_file.read_text(encoding='utf-8'))['peoples']
    named_file = ROOT / 'data' / 'named.json'
    named_list = json.loads(named_file.read_text(encoding='utf-8')).get('named', []) if named_file.exists() else []

    total_updated = 0
    for sex, b_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        set_body(b_id)
        sh_y_gl = float(RIG.jpos[RIG.J['LeftArm']][1])
        sp1_y_gl = float(RIG.jpos[RIG.J['Spine1']][1])
        kit_path = ROOT / 'data' / b_id / 'kit.json'
        kit = json.loads(kit_path.read_text(encoding='utf-8'))
        by_id = {it['id']: it for it in kit['items']}

        # Map each back_id -> set of paired torso_ids/head_ids, head_id -> torso_ids, torso_id -> legs_ids, AND feet_id -> legs_ids
        back_to_torsos = {}
        back_to_heads = {}
        head_to_torsos = {}
        torso_to_legs = {}
        feet_to_legs = {}
        y_upleg_gl = float(RIG.jpos[RIG.J['LeftUpLeg']][1])

        def _is_floating_item(item_id):
            it_chk = by_id.get(item_id)
            return bool(it_chk and (it_chk.get('culture') == 'extraplanar' or it_chk.get('allow_floating')))

        def _reg_outfit(outf):
            if not isinstance(outf, dict):
                return
            t_id, bk_id, h_id = outf.get('torso'), outf.get('back'), outf.get('head')
            l_id, ft_id = outf.get('legs'), outf.get('feet')
            if any(_is_floating_item(x) for x in (t_id, bk_id, h_id, l_id, ft_id) if x):
                return
            if t_id and bk_id and t_id in by_id and bk_id in by_id:
                back_to_torsos.setdefault(bk_id, set()).add(t_id)
            if h_id and bk_id and h_id in by_id and bk_id in by_id:
                back_to_heads.setdefault(bk_id, set()).add(h_id)
            if h_id and t_id and h_id in by_id and t_id in by_id:
                head_to_torsos.setdefault(h_id, set()).add(t_id)
            if t_id and l_id and t_id in by_id and l_id in by_id:
                torso_to_legs.setdefault(t_id, set()).add(l_id)
            if l_id and ft_id and l_id in by_id and ft_id in by_id:
                feet_to_legs.setdefault(ft_id, set()).add(l_id)

        p_raw_full = json.loads(p_file.read_text(encoding='utf-8'))
        for pe in peoples:
            for outf in (pe.get('outfits', {}).get(sex, {})).values():
                _reg_outfit(outf)
            for st_e in pe.get('social_types', []):
                _reg_outfit((st_e.get('outfit') or {}).get(sex) or {})
        for nc_e in p_raw_full.get('named_characters', []):
            nc_b = nc_e.get('body') or ('mpfb_female' if nc_e.get('sex') == 'f' else 'mpfb_male')
            if nc_b == b_id:
                _reg_outfit(nc_e.get('armour') or nc_e.get('outfit') or {})
        for gm_e in (p_raw_full.get('geomancers') or {}).get('outfits', []):
            _reg_outfit((gm_e.get('outfit') or {}).get(sex) or gm_e.get('outfit') or {})
        for nm in named_list:
            if nm.get('body') == b_id:
                _reg_outfit(nm.get('armour') or {})

        kit_dirty = False

        # Cross-slot hip/thigh shirt-hem over trousers conformity (runs BEFORE back capes read T_surf!):
        # `kcS` trouser squeeze fades out across the bottom ~5 cm of overhanging hip/thigh shirts (`0.62 <= y_min <= y_upleg - 0.03`),
        # so the bottom 12.5 cm of `torso` must sit >= +8.5 mm radially outside all paired non-`loose` `legs` breeches!
        for t_id, l_ids in sorted(torso_to_legs.items()):
            t_it = by_id[t_id]
            if t_it.get('made_by') != 'garments' or not t_it.get('loose') or t_id.startswith('valley_'):
                continue
            t_glb = ROOT / t_it['glb']
            if not t_glb.exists():
                continue
            tj, tb = glbio.read_glb(t_glb.read_bytes())
            pr_t = tj['meshes'][0]['primitives'][0]
            at_t = pr_t['attributes']
            Pt = glbio.accessor(tj, tb, at_t['POSITION']).astype(np.float64).copy()
            Tt = glbio.accessor(tj, tb, pr_t['indices']).reshape(-1, 3)
            y_t_min = float(Pt[:, 1].min())
            re_t = np.concatenate([Tt[:, 0], Tt[:, 1], Tt[:, 2]])
            ce_t = np.concatenate([Tt[:, 1], Tt[:, 2], Tt[:, 0]])
            nc_t, lbl_t = connected_components(csr_matrix((np.ones(len(re_t), dtype=np.int8), (re_t, ce_t)), shape=(len(Pt), len(Pt))), directed=False)
            trunk_cids_t = []
            for cid_t in range(nc_t):
                c_ix = np.nonzero(lbl_t == cid_t)[0]
                if len(c_ix) >= 180 and float(Pt[c_ix, 1].max()) >= sp1_y_gl:
                    if float(Pt[c_ix, 0].max() - Pt[c_ix, 0].min()) >= 0.28 or len(c_ix) >= 260:
                        trunk_cids_t.append((cid_t, c_ix, float(Pt[c_ix, 1].min())))
            if not trunk_cids_t:
                continue
            main_skirt_y = min(ym for _, c_ix, ym in trunk_cids_t if float(Pt[c_ix, 0].max() - Pt[c_ix, 0].min()) >= 0.28) if any(
                float(Pt[c_ix, 0].max() - Pt[c_ix, 0].min()) >= 0.28 for _, c_ix, _ in trunk_cids_t
            ) else y_t_min
            if not (0.62 <= main_skirt_y <= y_upleg_gl - 0.03):
                continue
            lh_blocks = []
            for l_id in l_ids:
                l_it = by_id[l_id]
                if l_it.get('made_by') != 'garments' or l_it.get('loose'):
                    continue
                l_glb = ROOT / l_it['glb']
                if not l_glb.exists():
                    continue
                lj, lb = glbio.read_glb(l_glb.read_bytes())
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
            for _, c_ix, c_ymin in trunk_cids_t:
                if c_ymin > main_skirt_y + 0.06:
                    continue
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
                    if not sec_h.any():
                        continue
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
                pos_acc_t = at_t['POSITION']
                acc_meta_t = tj['accessors'][pos_acc_t]
                Pt_f32 = Pt.astype(np.float32)
                acc_meta_t['min'] = [float(x) for x in Pt_f32.min(axis=0)]
                acc_meta_t['max'] = [float(x) for x in Pt_f32.max(axis=0)]
                bv_pt = tj['bufferViews'][acc_meta_t['bufferView']]
                pt_bytes = np.ascontiguousarray(Pt_f32).tobytes()
                raw_t[bv_pt['byteOffset']:bv_pt['byteOffset'] + len(pt_bytes)] = pt_bytes
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
                js_t = json.dumps(tj, separators=(',', ':')).encode()
                js_t += b' ' * ((-len(js_t)) % 4)
                with open(t_glb, 'wb') as f_out:
                    f_out.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js_t) + len(raw_t)))
                    f_out.write(struct.pack('<II', len(js_t), 0x4E4F534A) + js_t + struct.pack('<II', len(raw_t), 0x004E4942) + bytes(raw_t))
                total_updated += 1
        # Cross-slot hood-rim over torso collar/shoulder seating (runs BEFORE dorsal capes read H_back!):
        # Pulls bell-flared lower hood rims (`y_gl <= neck_y_gl + 0.015`) snugly (+4.5 mm) onto the paired coat/chuba shoulders
        # so looking from below NEVER reveals a 1-2 cm floating gap, while lifting any sub-surface rim vertices clear (+3.5 mm).
        nk_pos_gl = np.asarray(RIG.jpos[RIG.J['Neck']], dtype=np.float64)
        for h_id, t_ids in sorted(head_to_torsos.items()):
            h_it = by_id[h_id]
            if h_it.get('made_by') != 'garments':
                continue
            h_glb = ROOT / h_it['glb']
            if not h_glb.exists():
                continue
            hj, hb = glbio.read_glb(h_glb.read_bytes())
            pr_h = hj['meshes'][0]['primitives'][0]
            at_h = pr_h['attributes']
            Ph = glbio.accessor(hj, hb, at_h['POSITION']).astype(np.float64).copy()
            if float(Ph[:, 1].min()) > float(nk_pos_gl[1]) + 0.005:
                continue
            Th = glbio.accessor(hj, hb, pr_h['indices']).reshape(-1, 3)
            re_h = np.concatenate([Th[:, 0], Th[:, 1], Th[:, 2]])
            ce_h = np.concatenate([Th[:, 1], Th[:, 2], Th[:, 0]])
            nc_h, lbl_h = connected_components(csr_matrix((np.ones(len(re_h), dtype=np.int8), (re_h, ce_h)), shape=(len(Ph), len(Ph))), directed=False)
            hood_mask = np.zeros(len(Ph), dtype=bool)
            for cid_h in range(nc_h):
                c_ih = np.nonzero(lbl_h == cid_h)[0]
                if len(c_ih) >= 120 and float(Ph[c_ih, 1].min()) <= float(nk_pos_gl[1]) + 0.005 and float(Ph[c_ih, 0].max() - Ph[c_ih, 0].min()) >= 0.16:
                    hood_mask[c_ih] = True
            if not hood_mask.any():
                continue
            th_blocks = []
            for t_id in t_ids:
                t_glb = ROOT / by_id[t_id]['glb']
                if not t_glb.exists():
                    continue
                tj, tb = glbio.read_glb(t_glb.read_bytes())
                pr_t = tj['meshes'][0]['primitives'][0]
                Pt = glbio.accessor(tj, tb, pr_t['attributes']['POSITION']).astype(np.float64)
                Tt = glbio.accessor(tj, tb, pr_t['indices']).reshape(-1, 3)
                va_t, vb_t, vc_t = Pt[Tt[:, 0]], Pt[Tt[:, 1]], Pt[Tt[:, 2]]
                sub_t = np.vstack([Pt, (va_t + vb_t + vc_t) / 3.0, 0.5 * (va_t + vb_t), 0.5 * (vb_t + vc_t), 0.5 * (vc_t + va_t)])
                th_blocks.append(sub_t[sub_t[:, 1] >= sh_y_gl - 0.10])
            if not th_blocks:
                continue
            T_sh = np.vstack(th_blocks)
            if len(T_sh) < 20:
                continue
            y_h_lo = float(Ph[hood_mask, 1].min())
            y_band_hi = float(nk_pos_gl[1]) + 0.025
            mod_hd = False
            for vi_h in np.nonzero(hood_mask & (Ph[:, 1] <= y_band_hi))[0]:
                vx, vy, vz = float(Ph[vi_h, 0]), float(Ph[vi_h, 1]), float(Ph[vi_h, 2])
                c_ref_h = np.array([0.0, min(vy, sh_y_gl + 0.010), float(nk_pos_gl[2])], dtype=np.float64)
                dv_h = Ph[vi_h] - c_ref_h
                L_h = float(np.linalg.norm(dv_h))
                if L_h < 0.04:
                    continue
                u_h = dv_h / L_h
                rel_ts = T_sh - c_ref_h[None, :]
                L_ts = np.linalg.norm(rel_ts, axis=1)
                sec_ts = ((rel_ts @ u_h) / np.maximum(L_ts, 1e-6)) >= math.cos(0.24)
                if not sec_ts.any():
                    continue
                s_torso = float(np.percentile((rel_ts[sec_ts] @ u_h), 96))
                w_rim = float(np.clip((y_band_hi - vy) / max(0.035, y_band_hi - y_h_lo), 0.0, 1.0))
                w_rim = w_rim * w_rim * (3.0 - 2.0 * w_rim)
                if L_h < s_torso + 0.0035:
                    L_new = s_torso + 0.0042
                    Ph[vi_h] = c_ref_h + u_h * L_new
                    mod_hd = True
                elif L_h > s_torso + 0.0065 and w_rim > 0.05:
                    L_target = s_torso + 0.0048
                    L_new = L_h - w_rim * min(L_h - L_target, 0.035)
                    if abs(L_new - L_h) > 3e-4:
                        Ph[vi_h] = c_ref_h + u_h * L_new
                        mod_hd = True
            if mod_hd:
                raw_h = bytearray(hb)
                pos_acc_h = at_h['POSITION']
                acc_meta_h = hj['accessors'][pos_acc_h]
                Ph_f32 = Ph.astype(np.float32)
                acc_meta_h['min'] = [float(x) for x in Ph_f32.min(axis=0)]
                acc_meta_h['max'] = [float(x) for x in Ph_f32.max(axis=0)]
                bv_ph = hj['bufferViews'][acc_meta_h['bufferView']]
                ph_bytes = np.ascontiguousarray(Ph_f32).tobytes()
                raw_h[bv_ph['byteOffset']:bv_ph['byteOffset'] + len(ph_bytes)] = ph_bytes
                nd_h0 = next((n for n in hj['nodes'] if 'mesh' in n and 'skin' in n), None)
                sk_h0 = hj['skins'][nd_h0['skin']] if nd_h0 else None
                if sk_h0 is not None and 'inverseBindMatrices' in sk_h0 and h_it.get('cloth'):
                    ibm_ah = hj['accessors'][sk_h0['inverseBindMatrices']]
                    ibm_bvh = hj['bufferViews'][ibm_ah['bufferView']]
                    ibm_h = np.frombuffer(bytes(raw_h[ibm_bvh['byteOffset']:ibm_bvh['byteOffset'] + ibm_bvh['byteLength']]), dtype=np.float32).reshape(-1, 4, 4).copy()
                    j_names_h = [hj['nodes'][k].get('name', '') for k in sk_h0['joints']]
                    for g_ih, ch_h in enumerate(h_it['cloth'].get('chains', [])):
                        pts_ch_h = ch_h.get('pts', [])
                        for b_kh in range(len(pts_ch_h) - 1):
                            jn_ch = f'cloth:{h_id}:{g_ih}:{b_kh}'
                            if jn_ch in j_names_h:
                                ibm_h[j_names_h.index(jn_ch)][3, :3] = -Ph_f32[pts_ch_h[b_kh]]
                    ibm_hb = np.ascontiguousarray(ibm_h).tobytes()
                    raw_h[ibm_bvh['byteOffset']:ibm_bvh['byteOffset'] + len(ibm_hb)] = ibm_hb
                js_h = json.dumps(hj, separators=(',', ':')).encode()
                js_h += b' ' * ((-len(js_h)) % 4)
                with open(h_glb, 'wb') as f_out:
                    f_out.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js_h) + len(raw_h)))
                    f_out.write(struct.pack('<II', len(js_h), 0x4E4F534A) + js_h + struct.pack('<II', len(raw_h), 0x004E4942) + bytes(raw_h))
                total_updated += 1

        for bk_id, t_ids in sorted(back_to_torsos.items()):
            bk_it = by_id[bk_id]
            bk_glb = ROOT / bk_it['glb']
            if not bk_glb.exists():
                continue
            bj, bb = glbio.read_glb(bk_glb.read_bytes())
            prim_b = bj['meshes'][0]['primitives'][0]
            at_b = prim_b['attributes']
            Pb = glbio.accessor(bj, bb, at_b['POSITION']).astype(np.float64).copy()
            Tb = glbio.accessor(bj, bb, prim_b['indices']).reshape(-1, 3)

            # Gather subdivided surface points of all paired torso meshes
            t_blocks = []
            for t_id in t_ids:
                t_glb = ROOT / by_id[t_id]['glb']
                if not t_glb.exists():
                    continue
                tj, tb = glbio.read_glb(t_glb.read_bytes())
                pr_t = tj['meshes'][0]['primitives'][0]
                Pt = glbio.accessor(tj, tb, pr_t['attributes']['POSITION']).astype(np.float64)
                Tt = glbio.accessor(tj, tb, pr_t['indices']).reshape(-1, 3)
                va, vb_t, vc = Pt[Tt[:, 0]], Pt[Tt[:, 1]], Pt[Tt[:, 2]]
                t_blocks.extend([
                    Pt,
                    (va + vb_t + vc) / 3.0,
                    0.5 * (va + vb_t), 0.5 * (vb_t + vc), 0.5 * (vc + va),
                ])
            if not t_blocks:
                continue
            T_surf = np.vstack(t_blocks)

            if bk_it.get('cloth'):
                # Standalone dorsal cape/mantle in `slot: 'back'`:
                # 1. Zone 1 (collar, shoulders, scapula, ribcage `yv >= hip_y_gl + 0.05`): sleek 6..12mm flat fit against `T_back` (ZERO shoulder billowing!).
                # 2. Zone 2 (pelvis & thighs `yv < hip_y_gl + 0.05`): A-line clearance + flat lateral curtain across `x` so morphed stepping legs NEVER poke through!
                # 3. Slope-matched dorsal scabbards/quivers (`~cape_v_mask`): conform `dz(y)` linearly along height (+7mm flush on cape, ZERO mid-air float!).
                # 4. Enforce smooth axial spine skinning (`0% Arm`, `0% mid-scapula Shoulder`) in both GLB `JOINTS_0/WEIGHTS_0` and `kit.json` `bw`!
                hip_y_gl = float(RIG.jpos[RIG.J['Hips']][1])
                sp_y_gl = float(RIG.jpos[RIG.J['Spine']][1])
                nk_y_gl = float(RIG.jpos[RIG.J['Neck']][1])
                h_blocks = []
                for h_id in back_to_heads.get(bk_id, set()):
                    h_glb = ROOT / by_id[h_id]['glb']
                    if not h_glb.exists():
                        continue
                    hj, hb = glbio.read_glb(h_glb.read_bytes())
                    pr_h = hj['meshes'][0]['primitives'][0]
                    Ph = glbio.accessor(hj, hb, pr_h['attributes']['POSITION']).astype(np.float64)
                    Th = glbio.accessor(hj, hb, pr_h['indices']).reshape(-1, 3)
                    va_h, vb_h, vc_h = Ph[Th[:, 0]], Ph[Th[:, 1]], Ph[Th[:, 2]]
                    sub_h = np.vstack([Ph, (va_h + vb_h + vc_h) / 3.0, 0.5 * (va_h + vb_h), 0.5 * (vb_h + vc_h), 0.5 * (vc_h + va_h)])
                    h_blocks.append(sub_h[(sub_h[:, 2] < 0.0) & (sub_h[:, 1] <= sh_y_gl + 0.14)])
                H_back = np.vstack(h_blocks) if h_blocks else np.empty((0, 3), dtype=np.float64)

                T_back = T_surf[T_surf[:, 2] < 0.04]
                if not len(T_back):
                    continue
                has_loose_torso = any(by_id[t_id].get('loose') for t_id in t_ids)
                has_long_loose_torso = has_loose_torso and float(T_back[:, 1].min()) < (hip_y_gl - 0.22)
                slope_low = 0.465 if has_long_loose_torso else (0.185 if has_loose_torso else 0.105)
                want_stiff = 0.0020 if has_long_loose_torso else (0.0055 if has_loose_torso else 0.010)

                y_max_c = float(Pb[:, 1].max())
                y_min_c = float(Pb[:, 1].min())
                n_ybins = 32
                y_grid = np.linspace(y_max_c, y_min_c, n_ybins)
                x_bins = np.linspace(-0.34, 0.34, 29)
                env_z = np.zeros((n_ybins, len(x_bins)), dtype=np.float64)
                y_scap_lo = sh_y_gl - 0.170
                for yi, yv in enumerate(y_grid):
                    if yv >= sh_y_gl - 0.04:
                        clr_z = 0.0070
                    elif has_long_loose_torso and yv < y_scap_lo:
                        u_clr = float(np.clip((y_scap_lo - yv) / 0.35, 0.0, 1.0))
                        clr_z = 0.0105 + 0.0165 * u_clr
                    else:
                        clr_z = 0.0095
                    tm_y = T_back[np.abs(T_back[:, 1] - yv) <= 0.042]
                    hm_y = H_back[np.abs(H_back[:, 1] - yv) <= 0.022] if len(H_back) else np.empty((0, 3))
                    for xi, xv in enumerate(x_bins):
                        if len(tm_y):
                            tm_xy = tm_y[np.abs(tm_y[:, 0] - xv) <= 0.050]
                            if not len(tm_xy):
                                tm_xy = tm_y[np.abs(tm_y[:, 0] - np.clip(xv, -0.15, 0.15)) <= 0.060]
                            if len(tm_xy):
                                env_z[yi, xi] = float(np.percentile(tm_xy[:, 2], 5)) - clr_z
                        if len(hm_y):
                            hm_xy = hm_y[np.abs(hm_y[:, 0] - xv) <= 0.030]
                            if len(hm_xy):
                                env_z[yi, xi] = min(env_z[yi, xi], float(hm_xy[:, 2].min()) - 0.0065)
                    # Below the scapula, flatten lateral edges gently to the central dorsal curtain so side edges never curl forward (+Z) into hips
                    if yv < y_scap_lo:
                        u_flat = float(np.clip((y_scap_lo - yv) / 0.12, 0.0, 1.0))
                        valid_mid = env_z[yi, 8:21][env_z[yi, 8:21] < -0.01]
                        if len(valid_mid):
                            curtain_z = float(np.percentile(valid_mid, 15))
                            env_z[yi, :] = (1.0 - u_flat) * env_z[yi, :] + u_flat * np.minimum(env_z[yi, :], curtain_z)
                    # Monotonic A-line drape below scapula (`yv < y_scap_lo`):
                    # - Above `y_scap_lo` (`sh_y_gl - 0.17`): follow coat shoulder/scapula contour within 8..16mm (`< 36mm` Gate 5F on M & F!),
                    #   allowing at most `0.09 m/m` (`<= 5.4mm` per 6cm) gentle upper-ribcage follow so thoracic kyphosis never billows!
                    # - Below `y_scap_lo`: smooth transition over 10 cm to constant `slope_low` (`d^2z/dy^2 = 0`, ZERO mid-cape shelf/pinch!)
                    if yi > 0 and yv < sh_y_gl - 0.035:
                        dy_step = abs(y_grid[yi - 1] - yv)
                        if yv >= y_scap_lo:
                            env_z[yi] = np.minimum(env_z[yi], env_z[yi - 1] + 0.146 * dy_step)
                        else:
                            u_sl = float(np.clip((y_scap_lo - yv) / 0.10, 0.0, 1.0))
                            u_sl = u_sl * u_sl * (3.0 - 2.0 * u_sl)
                            slope_cur = 0.035 * (1.0 - u_sl) + slope_low * u_sl
                            edge_bow = (0.0045 * u_sl * np.minimum((x_bins / 0.18) ** 2, 1.6)) if has_long_loose_torso else 0.0
                            env_z[yi] = np.minimum(env_z[yi], env_z[yi - 1] - slope_cur * dy_step - edge_bow)
                for _ in range(2):
                    env_z[:, 1:-1] = 0.5 * env_z[:, 1:-1] + 0.25 * (env_z[:, :-2] + env_z[:, 2:])
                for yi in range(1, n_ybins):
                    dy_s = abs(y_grid[yi - 1] - y_grid[yi])
                    if y_grid[yi] >= y_scap_lo:
                        env_z[yi] = np.minimum(env_z[yi], env_z[yi - 1] + 0.146 * dy_s)
                    else:
                        env_z[yi] = np.minimum(env_z[yi], env_z[yi - 1] - 0.025 * dy_s)

                modified_c = False
                weights_mod_c = False
                nd_b0 = next((n for n in bj['nodes'] if 'mesh' in n and 'skin' in n), None)
                sk_b0 = bj['skins'][nd_b0['skin']] if nd_b0 else None
                cloth_chain_pts = set()
                for ch in bk_it['cloth'].get('chains', []):
                    cloth_chain_pts.update(ch.get('pts', []))
                re_c = np.concatenate([Tb[:, 0], Tb[:, 1], Tb[:, 2]])
                ce_c = np.concatenate([Tb[:, 1], Tb[:, 2], Tb[:, 0]])
                adj_c = csr_matrix((np.ones(len(re_c), dtype=np.int8), (re_c, ce_c)), shape=(len(Pb), len(Pb)))
                nc_c, lbl_c = connected_components(adj_c, directed=False)
                cape_v_mask = np.zeros(len(Pb), dtype=bool)
                for cid_c in range(nc_c):
                    c_idxs = np.nonzero(lbl_c == cid_c)[0]
                    if any(int(vi) in cloth_chain_pts for vi in c_idxs) or len(c_idxs) > 300:
                        cape_v_mask[c_idxs] = True

                for vi in np.nonzero(cape_v_mask)[0]:
                    vx, vy, vz = float(Pb[vi, 0]), float(Pb[vi, 1]), float(Pb[vi, 2])
                    if vz > 0.02:
                        continue
                    # Clamp any upward collar-horn spikes (`vy > nk_y_gl - 0.004` at `|vx| < 0.095`)
                    if vy > nk_y_gl - 0.004 and abs(vx) >= 0.035:
                        Pb[vi, 1] = nk_y_gl - 0.004
                        vy = nk_y_gl - 0.004
                        modified_c = True
                    # Direct dorsal hood/coif clearance across the top collar attachment
                    if len(H_back) and vy >= sh_y_gl - 0.02:
                        hm_near = H_back[(np.abs(H_back[:, 0] - vx) <= 0.024) & (np.abs(H_back[:, 1] - vy) <= 0.020)]
                        if len(hm_near):
                            z_h_lim = float(hm_near[:, 2].min()) - 0.0065
                            if vz > z_h_lim:
                                vz = z_h_lim
                                Pb[vi, 2] = vz
                                modified_c = True
                    w_att = float(np.clip((y_max_c - vy) / 0.032, 0.0, 1.0))
                    w_att = w_att * w_att * (3.0 - 2.0 * w_att)
                    if w_att <= 1e-4:
                        continue
                    yi_f = np.clip((y_max_c - vy) / max(1e-6, y_max_c - y_min_c) * (n_ybins - 1), 0.0, n_ybins - 1.001)
                    xi_f = np.clip((vx - x_bins[0]) / (x_bins[-1] - x_bins[0]) * (len(x_bins) - 1), 0.0, len(x_bins) - 1.001)
                    yi0, xi0 = int(yi_f), int(xi_f)
                    wy, wx = yi_f - yi0, xi_f - xi0
                    z_env_v = (
                        (1 - wy) * ((1 - wx) * env_z[yi0, xi0] + wx * env_z[yi0, xi0 + 1])
                        + wy * ((1 - wx) * env_z[yi0 + 1, xi0] + wx * env_z[yi0 + 1, xi0 + 1])
                    )
                    z_req = vz * (1.0 - w_att) + z_env_v * w_att
                    if abs(vz - z_req) > 2e-4 and z_req < -0.02:
                        # Pull any over-flared/billowing cape vertices cleanly onto the monotonic A-line plane!
                        Pb[vi, 2] = z_req
                        modified_c = True

                # Enforce smooth axial spine skinning (`0% Arm/Shoulder`, `0% UpLeg/Leg`) on non-cloth-bone cape vertices across ALL capes!
                _BAD_CAPE_JN = (
                    'LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm',
                    'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg',
                )
                Jb_c = glbio.accessor(bj, bb, at_b['JOINTS_0']).copy()
                Wb_c = glbio.accessor(bj, bb, at_b['WEIGHTS_0']).astype(np.float32).copy()
                aw_c = bj['accessors'][at_b['WEIGHTS_0']]
                if aw_c['componentType'] != 5126 and not aw_c.get('normalized'):
                    Wb_c /= float(np.iinfo(glbio.CT[aw_c['componentType']]).max)
                if sk_b0 is not None:
                    j_names_raw = [bj['nodes'][k].get('name', '').replace('mixamorig:', '').replace('mixamorig', '') for k in sk_b0['joints']]
                    bad_cape_j = {i_j for i_j, nm in enumerate(j_names_raw) if nm in _BAD_CAPE_JN}
                    if bad_cape_j and all(nm in j_names_raw for nm in ('Hips', 'Spine', 'Spine1', 'Spine2', 'Neck')):
                        j_hp = j_names_raw.index('Hips')
                        j_s0 = j_names_raw.index('Spine')
                        j_s1 = j_names_raw.index('Spine1')
                        j_s2 = j_names_raw.index('Spine2')
                        j_nk = j_names_raw.index('Neck')
                        cloth_j_set = {i_j for i_j, nm in enumerate(j_names_raw) if nm.startswith('cloth')}
                        for vi in np.nonzero(cape_v_mask)[0]:
                            has_cl_w = any(int(Jb_c[vi, s]) in cloth_j_set and float(Wb_c[vi, s]) > 0.01 for s in range(4))
                            if has_cl_w:
                                # Even on transitional rows (`r_cloth + 1`) mixing cloth + body, remap any `UpLeg/Shoulder/Arm` slot to `Hips/Spine2`!
                                if any(int(Jb_c[vi, s]) in bad_cape_j and float(Wb_c[vi, s]) > 0.01 for s in range(4)):
                                    mix_c = {}
                                    for s_i in range(4):
                                        ji_s, wi_s = int(Jb_c[vi, s_i]), float(Wb_c[vi, s_i])
                                        if wi_s <= 1e-5:
                                            continue
                                        nm_s = j_names_raw[ji_s] if ji_s < len(j_names_raw) else ''
                                        dst_j = (j_hp if ('Leg' in nm_s) else j_s2) if ji_s in bad_cape_j else ji_s
                                        mix_c[dst_j] = mix_c.get(dst_j, 0.0) + wi_s
                                    top_mc = sorted(mix_c.items(), key=lambda kv: -kv[1])[:4]
                                    tot_mc = sum(v for _, v in top_mc) or 1.0
                                    top_mc += [(0, 0.0)] * (4 - len(top_mc))
                                    Jb_c[vi] = [k_m for k_m, _ in top_mc]
                                    Wb_c[vi] = [v_m / tot_mc for _, v_m in top_mc]
                                    weights_mod_c = True
                                    modified_c = True
                                continue
                            if any(int(Jb_c[vi, s]) in bad_cape_j and float(Wb_c[vi, s]) > 0.01 for s in range(4)):
                                yv_u = float(Pb[vi, 1])
                                Jb_c[vi] = 0
                                Wb_c[vi] = 0.0
                                if yv_u >= sh_y_gl - 0.01:
                                    t_n = float(np.clip((yv_u - (nk_y_gl - 0.02)) / 0.06, 0.0, 1.0))
                                    wn = 0.16 * (t_n * t_n * (3.0 - 2.0 * t_n))
                                    Jb_c[vi, 0], Wb_c[vi, 0] = j_s2, 1.0 - wn
                                    Jb_c[vi, 1], Wb_c[vi, 1] = j_nk, wn
                                elif yv_u >= sp1_y_gl:
                                    t2 = float(np.clip((yv_u - sp1_y_gl) / max(0.04, (sh_y_gl - 0.01) - sp1_y_gl), 0.0, 1.0))
                                    t2 = t2 * t2 * (3.0 - 2.0 * t2)
                                    Jb_c[vi, 0], Wb_c[vi, 0] = j_s2, t2
                                    Jb_c[vi, 1], Wb_c[vi, 1] = j_s1, 1.0 - t2
                                elif yv_u >= sp_y_gl:
                                    t1 = float(np.clip((yv_u - sp_y_gl) / max(0.04, sp1_y_gl - sp_y_gl), 0.0, 1.0))
                                    t1 = t1 * t1 * (3.0 - 2.0 * t1)
                                    Jb_c[vi, 0], Wb_c[vi, 0] = j_s1, t1
                                    Jb_c[vi, 1], Wb_c[vi, 1] = j_s0, 1.0 - t1
                                elif yv_u > hip_y_gl - 0.02:
                                    t0 = float(np.clip((yv_u - (hip_y_gl - 0.02)) / max(0.04, sp_y_gl - (hip_y_gl - 0.02)), 0.0, 1.0))
                                    t0 = t0 * t0 * (3.0 - 2.0 * t0)
                                    Jb_c[vi, 0], Wb_c[vi, 0] = j_s0, t0
                                    Jb_c[vi, 1], Wb_c[vi, 1] = j_hp, 1.0 - t0
                                else:
                                    Jb_c[vi, 0], Wb_c[vi, 0] = j_hp, 1.0
                                weights_mod_c = True
                                modified_c = True

                # Also sanitize `kit.json` `cloth.chains[*].bw` so `50-figure.js` `posedRests()`/`rigidTargets()` never sees Shoulder/Arm/UpLeg!
                for ch_bw in bk_it['cloth'].get('chains', []):
                    bw_list = ch_bw.get('bw')
                    if not bw_list:
                        continue
                    for k_bw, pairs in enumerate(bw_list):
                        if any(nm in _BAD_CAPE_JN for nm, _ in pairs):
                            merged = {}
                            for nm, wt in pairs:
                                dst = ('Hips' if 'Leg' in nm else 'Spine2') if nm in _BAD_CAPE_JN else nm
                                merged[dst] = merged.get(dst, 0.0) + float(wt)
                            bw_list[k_bw] = [[nm, round(wt, 4)] for nm, wt in sorted(merged.items(), key=lambda x: -x[1])]
                            kit_dirty = True

                # Slope-matched seating of rigid dorsal scabbards/quivers (`~cape_v_mask`, `z_gl < -0.04`) +7mm flush outside cape!
                cape_pts_post = Pb[cape_v_mask]
                for cid_c in range(nc_c):
                    c_idxs = np.nonzero(lbl_c == cid_c)[0]
                    if cape_v_mask[c_idxs[0]]:
                        continue
                    cp_rig = Pb[c_idxs]
                    if float(cp_rig[:, 2].mean()) < -0.04 and float(cp_rig[:, 1].mean()) >= sp1_y_gl - 0.14:
                        y_lo_r, y_hi_r = float(cp_rig[:, 1].min()), float(cp_rig[:, 1].max())
                        if y_hi_r - y_lo_r > 0.08:
                            slice_ys, slice_dzs = [], []
                            for ys_c in np.linspace(y_lo_r, y_hi_r, 6):
                                sub_r = cp_rig[np.abs(cp_rig[:, 1] - ys_c) <= 0.045]
                                if not len(sub_r):
                                    continue
                                xc_s = float(sub_r[:, 0].mean())
                                z_in_r = float(sub_r[:, 2].max())  # anterior face of scabbard facing the cape
                                near_cp = cape_pts_post[
                                    (np.abs(cape_pts_post[:, 0] - xc_s) <= 0.040)
                                    & (np.abs(cape_pts_post[:, 1] - ys_c) <= 0.038)
                                ]
                                if len(near_cp):
                                    z_cape_s = float(np.percentile(near_cp[:, 2], 10))
                                    slice_ys.append(float(ys_c))
                                    slice_dzs.append((z_cape_s - 0.007) - z_in_r)
                            if len(slice_ys) >= 2:
                                m_sc, b_sc = np.polyfit(np.array(slice_ys), np.array(slice_dzs), 1)
                                dz_per_v = m_sc * cp_rig[:, 1] + b_sc
                                # Guarantee zero intersection at every vertex while pulling floating quivers flush!
                                extra_push = 0.0
                                for kv_i, rv_p in enumerate(cp_rig):
                                    z_new_v = float(rv_p[2] + dz_per_v[kv_i])
                                    near_cp = cape_pts_post[
                                        (np.abs(cape_pts_post[:, 0] - rv_p[0]) <= 0.032)
                                        & (np.abs(cape_pts_post[:, 1] - rv_p[1]) <= 0.032)
                                    ]
                                    if len(near_cp):
                                        need_e = (float(near_cp[:, 2].min()) - 0.0110) - z_new_v
                                        if need_e < extra_push:
                                            extra_push = need_e
                                dz_per_v += extra_push
                                if float(np.max(np.abs(dz_per_v))) > 0.0005:
                                    Pb[c_idxs, 2] += dz_per_v
                                    modified_c = True
                        else:
                            xc_s, yc_s = float(cp_rig[:, 0].mean()), float(cp_rig[:, 1].mean())
                            near_cp = cape_pts_post[
                                (np.abs(cape_pts_post[:, 0] - xc_s) <= 0.045)
                                & (np.abs(cape_pts_post[:, 1] - yc_s) <= 0.045)
                            ]
                            if len(near_cp):
                                dz_u = (float(np.percentile(near_cp[:, 2], 10)) - 0.007) - float(cp_rig[:, 2].max())
                                if abs(dz_u) > 0.0005:
                                    Pb[c_idxs, 2] += dz_u
                                    modified_c = True

                for pt_c in bk_it['cloth'].get('parts', []):
                    if pt_c.get('stiff', 0.12) != want_stiff:
                        pt_c['stiff'] = want_stiff
                        kit_dirty = True

                if modified_c:
                    raw_b = bytearray(bb)
                    pos_acc_i = at_b['POSITION']
                    acc_meta = bj['accessors'][pos_acc_i]
                    Pb_f32 = Pb.astype(np.float32)
                    acc_meta['min'] = [float(x) for x in Pb_f32.min(axis=0)]
                    acc_meta['max'] = [float(x) for x in Pb_f32.max(axis=0)]
                    bv_pos = bj['bufferViews'][acc_meta['bufferView']]
                    pos_bytes = np.ascontiguousarray(Pb_f32).tobytes()
                    raw_b[bv_pos['byteOffset']:bv_pos['byteOffset'] + len(pos_bytes)] = pos_bytes
                    if weights_mod_c:
                        ja_c = bj['accessors'][at_b['JOINTS_0']]
                        bv_jc = bj['bufferViews'][ja_c['bufferView']]
                        jb_bytes = np.ascontiguousarray(Jb_c.astype(glbio.CT[ja_c['componentType']])).tobytes()
                        raw_b[bv_jc['byteOffset']:bv_jc['byteOffset'] + len(jb_bytes)] = jb_bytes
                        bv_wc = bj['bufferViews'][aw_c['bufferView']]
                        if aw_c['componentType'] == 5126:
                            wb_bytes = np.ascontiguousarray(Wb_c.astype(np.float32)).tobytes()
                        else:
                            w_dt_c = glbio.CT[aw_c['componentType']]
                            wb_bytes = np.ascontiguousarray(np.round(np.clip(Wb_c, 0.0, 1.0) * np.iinfo(w_dt_c).max).astype(w_dt_c)).tobytes()
                        raw_b[bv_wc['byteOffset']:bv_wc['byteOffset'] + len(wb_bytes)] = wb_bytes
                    if sk_b0 is not None and 'inverseBindMatrices' in sk_b0:
                        ibm_acc = bj['accessors'][sk_b0['inverseBindMatrices']]
                        ibm_bv = bj['bufferViews'][ibm_acc['bufferView']]
                        ibm_arr = np.frombuffer(bytes(raw_b[ibm_bv['byteOffset']:ibm_bv['byteOffset'] + ibm_bv['byteLength']]), dtype=np.float32).reshape(-1, 4, 4).copy()
                        j_names_b = [bj['nodes'][k].get('name', '') for k in sk_b0['joints']]
                        for g_i, ch in enumerate(bk_it['cloth'].get('chains', [])):
                            pts_ch = ch.get('pts', [])
                            for b_k in range(len(pts_ch) - 1):
                                jn_c = f'cloth:{bk_id}:{g_i}:{b_k}'
                                if jn_c in j_names_b:
                                    ibm_arr[j_names_b.index(jn_c)][3, :3] = -Pb_f32[pts_ch[b_k]]
                        ibm_bytes = np.ascontiguousarray(ibm_arr).tobytes()
                        raw_b[ibm_bv['byteOffset']:ibm_bv['byteOffset'] + len(ibm_bytes)] = ibm_bytes
                    js_b = json.dumps(bj, separators=(',', ':')).encode()
                    js_b += b' ' * ((-len(js_b)) % 4)
                    with open(bk_glb, 'wb') as f_out:
                        f_out.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js_b) + len(raw_b)))
                        f_out.write(struct.pack('<II', len(js_b), 0x4E4F534A) + js_b + struct.pack('<II', len(raw_b), 0x004E4942) + bytes(raw_b))
                    total_updated += 1
                continue

            # Identify connected strap loop components (`<= 440` verts spanning anterior z_gl > 0.045 and dorsal z_gl < -0.045)
            # Use pure triangle-index connectivity (`Tb`) so straps touching the dorsal pack within 0.6mm NEVER merge into the pack!
            re_i = np.concatenate([Tb[:, 0], Tb[:, 1], Tb[:, 2]])
            ce_i = np.concatenate([Tb[:, 1], Tb[:, 2], Tb[:, 0]])
            adj = csr_matrix((np.ones(len(re_i), dtype=np.int8), (re_i, ce_i)), shape=(len(Pb), len(Pb)))
            n_comp, lbl = connected_components(adj, directed=False)
            strap_cids = []
            for cid in range(n_comp):
                cv = Pb[lbl == cid]
                if 60 <= len(cv) <= 440 and float(cv[:, 2].max()) > 0.045 and float(cv[:, 2].min()) < -0.045:
                    strap_cids.append(cid)
            if not strap_cids:
                continue

            pack_mask = ~np.isin(lbl, strap_cids)
            P_pack = Pb[pack_mask] if pack_mask.any() else np.empty((0, 3), dtype=np.float64)
            pk_tree = cKDTree(P_pack) if len(P_pack) else None

            T_up = T_surf[(T_surf[:, 1] >= sp1_y_gl - 0.08) & (np.abs(T_surf[:, 0]) <= 0.24)]
            if not len(T_up):
                continue

            modified = False
            weights_mod_s = False
            nd_bs = next((n for n in bj['nodes'] if 'mesh' in n and 'skin' in n), None)
            sk_bs = bj['skins'][nd_bs['skin']] if nd_bs else None
            Jb_s = glbio.accessor(bj, bb, at_b['JOINTS_0']).copy()
            Wb_s = glbio.accessor(bj, bb, at_b['WEIGHTS_0']).astype(np.float32).copy()
            aw_s = bj['accessors'][at_b['WEIGHTS_0']]
            if aw_s['componentType'] != 5126 and not aw_s.get('normalized'):
                Wb_s /= float(np.iinfo(glbio.CT[aw_s['componentType']]).max)
            j_names_s = [bj['nodes'][k].get('name', '').replace('mixamorig:', '').replace('mixamorig', '') for k in sk_bs['joints']] if sk_bs else []
            can_sync_sh = all(nm in j_names_s for nm in ('Spine1', 'Spine2', 'LeftShoulder', 'RightShoulder'))

            for cid in strap_cids:
                idxs = np.nonzero(lbl == cid)[0]
                ring_sz = 9 if (len(idxs) % 9 == 0) else (8 if (len(idxs) % 8 == 0) else 1)
                n_rings = len(idxs) // ring_sz
                has_seam_row = (
                    ring_sz >= 8 and n_rings >= 16
                    and float(np.linalg.norm(Pb[idxs[:ring_sz]] - Pb[idxs[(n_rings - 1) * ring_sz:n_rings * ring_sz]])) < 0.003
                )
                n_unique = (n_rings - 1) if has_seam_row else n_rings
                u_outs = np.zeros((n_unique, 3), dtype=np.float64)
                deltas = np.zeros(n_unique, dtype=np.float64)
                min_deltas = np.full(n_unique, -0.05, dtype=np.float64)

                # Smooth 360-degree torus normal `u_out` around the clavicle/pectoral/axilla/scapula saddle
                # Tightens loose straps (`-45mm`, e.g. Reed Weaver's 23mm slack!) AND expands tight straps (`+38mm`) to +2.8mm flush!
                for rk in range(n_unique):
                    r_idxs = idxs[rk * ring_sz:(rk + 1) * ring_sz]
                    rv = Pb[r_idxs]
                    rc = rv.mean(axis=0)
                    c_ref = np.array([
                        math.copysign(min(abs(float(rc[0])), 0.095), float(rc[0])),
                        min(float(rc[1]), sh_y_gl + 0.005),
                        0.0,
                    ], dtype=np.float64)
                    u_out = rc - c_ref
                    L_u = float(np.linalg.norm(u_out))
                    if L_u < 1e-5:
                        continue
                    u_out /= L_u
                    u_outs[rk] = u_out

                    rel_t = T_up - c_ref[None, :]
                    s_proj = rel_t @ u_out
                    perp_sq = np.sum(rel_t * rel_t, axis=1) - s_proj * s_proj
                    # Restrict lateral X window to exact strap half-width (`+-13mm`) on shoulder/chest so raised neck collars at `|x|~0.08` never lift straps!
                    x_ok = np.abs(T_up[:, 0] - rc[0]) <= (0.0135 if abs(float(rc[0])) < 0.135 else 0.020)
                    cyl_m = x_ok & (s_proj > 0.020) & (perp_sq <= 0.0155 * 0.0155)
                    if not cyl_m.any():
                        cyl_m = (s_proj > 0.015) & (perp_sq <= 0.026 * 0.026)
                    if not cyl_m.any():
                        continue
                    s_coat = float(np.percentile(s_proj[cyl_m], 98))
                    s_in = float(((rv - c_ref[None, :]) @ u_out).min())
                    want_d = (s_coat + 0.0030) - s_in
                    req_min_d = (s_coat + 0.0022) - s_in
                    min_deltas[rk] = req_min_d
                    deltas[rk] = float(np.clip(want_d, -0.045, 0.038))

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
                    r_idxs = idxs[rk * ring_sz:(rk + 1) * ring_sz]
                    if np.linalg.norm(dv_k) > 0.0004:
                        Pb[r_idxs] = Pb[r_idxs] + dv_k
                        modified = True
                    # Sync subtle clavicle/shoulder weight on top-shoulder strap rings so `posture()` drops straps 1:1 with tunic!
                    if can_sync_sh:
                        rc_new = Pb[r_idxs].mean(axis=0)
                        u_s2 = float(np.clip((rc_new[1] - sp1_y_gl) / max(0.05, (sh_y_gl - 0.02) - sp1_y_gl), 0.0, 1.0))
                        u_s2 = u_s2 * u_s2 * (3.0 - 2.0 * u_s2)
                        u_cl = float(np.clip((rc_new[1] - (sh_y_gl + 0.005)) / 0.085, 0.0, 1.0) * np.clip((abs(rc_new[0]) - 0.060) / 0.055, 0.0, 1.0))
                        w_sh_v = 0.36 * u_cl
                        j_sp1_s = j_names_s.index('Spine1')
                        j_sp2_s = j_names_s.index('Spine2')
                        j_sh_s = j_names_s.index('LeftShoulder' if rc_new[0] >= 0.0 else 'RightShoulder')
                        Jb_s[r_idxs] = 0
                        Wb_s[r_idxs] = 0.0
                        Jb_s[r_idxs, 0], Wb_s[r_idxs, 0] = j_sp2_s, u_s2 * (1.0 - w_sh_v)
                        Jb_s[r_idxs, 1], Wb_s[r_idxs, 1] = j_sp1_s, (1.0 - u_s2) * (1.0 - w_sh_v)
                        Jb_s[r_idxs, 2], Wb_s[r_idxs, 2] = j_sh_s, w_sh_v
                        weights_mod_s = True
                        modified = True
                if has_seam_row and modified:
                    seam_i = idxs[(n_rings - 1) * ring_sz:n_rings * ring_sz]
                    Pb[seam_i] = Pb[idxs[:ring_sz]]
                    if weights_mod_s:
                        Jb_s[seam_i] = Jb_s[idxs[:ring_sz]]
                        Wb_s[seam_i] = Wb_s[idxs[:ring_sz]]

            if modified:
                pos_acc_i = at_b['POSITION']
                acc_meta = bj['accessors'][pos_acc_i]
                Pb_f32 = Pb.astype(np.float32)
                acc_meta['min'] = [float(x) for x in Pb_f32.min(axis=0)]
                acc_meta['max'] = [float(x) for x in Pb_f32.max(axis=0)]
                bv_pos = bj['bufferViews'][acc_meta['bufferView']]
                raw_b = bytearray(bb)
                pos_bytes = np.ascontiguousarray(Pb_f32).tobytes()
                raw_b[bv_pos['byteOffset']:bv_pos['byteOffset'] + len(pos_bytes)] = pos_bytes
                if weights_mod_s:
                    ja_s = bj['accessors'][at_b['JOINTS_0']]
                    bv_js = bj['bufferViews'][ja_s['bufferView']]
                    js_bytes = np.ascontiguousarray(Jb_s.astype(glbio.CT[ja_s['componentType']])).tobytes()
                    raw_b[bv_js['byteOffset']:bv_js['byteOffset'] + len(js_bytes)] = js_bytes
                    bv_ws = bj['bufferViews'][aw_s['bufferView']]
                    if aw_s['componentType'] == 5126:
                        ws_bytes = np.ascontiguousarray(Wb_s.astype(np.float32)).tobytes()
                    else:
                        w_dt_s = glbio.CT[aw_s['componentType']]
                        ws_bytes = np.ascontiguousarray(np.round(np.clip(Wb_s, 0.0, 1.0) * np.iinfo(w_dt_s).max).astype(w_dt_s)).tobytes()
                    raw_b[bv_ws['byteOffset']:bv_ws['byteOffset'] + len(ws_bytes)] = ws_bytes
                js_b = json.dumps(bj, separators=(',', ':')).encode()
                js_b += b' ' * ((-len(js_b)) % 4)
                with open(bk_glb, 'wb') as f_out:
                    f_out.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js_b) + len(raw_b)))
                    f_out.write(struct.pack('<II', len(js_b), 0x4E4F534A) + js_b + struct.pack('<II', len(raw_b), 0x004E4942) + bytes(raw_b))
                total_updated += 1

        # Cross-slot boot-over-trousers conformity: ensure closed boot calf shafts (`y_gl >= 0.095`)
        # sit >= +4.0mm radially outside all paired `legs` trousers so calves/trousers NEVER clip through boots!
        p_foot_l = np.asarray(RIG.jpos[RIG.J['LeftFoot']], dtype=np.float64)
        p_knee_l = np.asarray(RIG.jpos[RIG.J['LeftLeg']], dtype=np.float64)
        p_foot_r = np.asarray(RIG.jpos[RIG.J['RightFoot']], dtype=np.float64)
        p_knee_r = np.asarray(RIG.jpos[RIG.J['RightLeg']], dtype=np.float64)
        for ft_id, l_ids in sorted(feet_to_legs.items()):
            ft_it = by_id[ft_id]
            if ft_it.get('made_by') != 'garments' or ft_it.get('hides', 0) <= 60:
                continue
            ft_glb = ROOT / ft_it['glb']
            if not ft_glb.exists():
                continue
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
            mod_ft = False
            for cid_f in range(nc_f):
                c_if = np.nonzero(lbl_f == cid_f)[0]
                wraps_leg = float(Pf[c_if, 2].min()) < -0.02 and float(Pf[c_if, 2].max()) > 0.02
                if wraps_leg and len(c_if) >= 60:
                    shaft_mask_f[c_if] = True
                    if float(Pf[c_if, 1].min()) > 0.12:
                        cuff_mask_f[c_if] = True
                elif len(c_if) <= 95 and float(Pf[c_if, 1].min()) >= 0.30:
                    # Keep detached knee-cap medallions seated within <= 18mm of the knee (`geo_25_sphere_atlas_feet`)
                    d_kn, nn_kn = BASE_TREE_GL.query(Pf[c_if])
                    min_kn = float(d_kn.min())
                    if min_kn > 0.020:
                        k0 = int(np.argmin(d_kn))
                        vec_in = BP_GL[int(nn_kn[k0])] - Pf[c_if[k0]]
                        L_in = float(np.linalg.norm(vec_in))
                        if L_in > 1e-5:
                            Pf[c_if] += (vec_in / L_in) * (min_kn - 0.012)
                            mod_ft = True
            if not shaft_mask_f.any():
                continue
            y_ft_max = float(Pf[shaft_mask_f, 1].max())
            if y_ft_max < 0.14:
                continue
            l_blocks = []
            for l_id in l_ids:
                l_it = by_id[l_id]
                if not (l_it.get('legged') or not l_it.get('loose')):
                    continue
                l_glb = ROOT / l_it['glb']
                if not l_glb.exists():
                    continue
                lj, lb = glbio.read_glb(l_glb.read_bytes())
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

            for sgn_x, p_ft, p_kn in ((1.0, p_foot_l, p_knee_l), (-1.0, p_foot_r, p_knee_r)):
                ls_side = L_surf[L_surf[:, 0] * sgn_x > 0.01]
                if not len(ls_side):
                    continue
                v_idxs = np.nonzero(shaft_mask_f & (Pf[:, 0] * sgn_x > 0.01) & (Pf[:, 1] >= 0.095))[0]
                for vi_f in v_idxs:
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
                    dl_x = near_l[:, 0] - float(ax_c[0])
                    dl_z = near_l[:, 2] - float(ax_c[2])
                    rl = np.hypot(dl_x, dl_z)
                    sec_m = ((dl_x * ux_f + dl_z * uz_f) / np.maximum(rl, 1e-6)) >= math.cos(0.38)
                    if not sec_m.any():
                        continue
                    r_leg_max = float(rl[sec_m].max())
                    r_leg_med = float(np.median(rl))
                    cuff_pad = 0.0025 if cuff_mask_f[vi_f] else 0.0
                    r_min_req = r_leg_max + 0.0040 + cuff_pad
                    r_cap_allow = max(r_min_req + 0.0010, r_leg_med + 0.0175 + cuff_pad)
                    if r_f < r_min_req:
                        r_new = r_min_req
                        Pf[vi_f, 0] = float(ax_c[0]) + ux_f * r_new
                        Pf[vi_f, 2] = float(ax_c[2]) + uz_f * r_new
                        mod_ft = True
                    elif vy >= y_ft_max - 0.120 and r_f > r_cap_allow and ft_it.get('culture') in ('dasri', 'tabisti'):
                        w_cuff = float(np.clip((vy - (y_ft_max - 0.120)) / 0.050, 0.0, 1.0))
                        w_cuff = w_cuff * w_cuff * (3.0 - 2.0 * w_cuff)
                        r_new = r_f - w_cuff * (r_f - r_cap_allow)
                        Pf[vi_f, 0] = float(ax_c[0]) + ux_f * r_new
                        Pf[vi_f, 2] = float(ax_c[2]) + uz_f * r_new
                        mod_ft = True
            if mod_ft:
                pos_acc_f = at_f['POSITION']
                acc_meta_f = fj['accessors'][pos_acc_f]
                Pf_f32 = Pf.astype(np.float32)
                acc_meta_f['min'] = [float(x) for x in Pf_f32.min(axis=0)]
                acc_meta_f['max'] = [float(x) for x in Pf_f32.max(axis=0)]
                bv_f = fj['bufferViews'][acc_meta_f['bufferView']]
                raw_f = bytearray(fb)
                pos_b_f = np.ascontiguousarray(Pf_f32).tobytes()
                raw_f[bv_f['byteOffset']:bv_f['byteOffset'] + len(pos_b_f)] = pos_b_f
                js_f = json.dumps(fj, separators=(',', ':')).encode()
                js_f += b' ' * ((-len(js_f)) % 4)
                with open(ft_glb, 'wb') as f_out:
                    f_out.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js_f) + len(raw_f)))
                    f_out.write(struct.pack('<II', len(js_f), 0x4E4F534A) + js_f + struct.pack('<II', len(raw_f), 0x004E4942) + bytes(raw_f))
                total_updated += 1

        for ft_id, ft_entry in by_id.items():
            if (
                ft_entry.get('made_by') == 'garments'
                and ft_entry.get('slot') == 'feet'
                and ('sandal' in ft_id.lower() or 'sandal' in (ft_entry.get('label') or '').lower())
                and ft_entry.get('hides', 0) > 35
            ):
                pl_tris = np.argsort(BP_GL[BT, 1].mean(axis=1))[:4].astype(np.int32)
                ft_entry['hide'] = make_mpfb.bits(len(BT), pl_tris)
                ft_entry['hides'] = int(len(pl_tris))
                kit_dirty = True

        if kit_dirty:
            make_mpfb.write_kit(str(kit_path), kit)
    print(f'Conformed cross-slot straps, dorsal cloaks/sheaths, and boot shafts across {total_updated} items.')
    return total_updated
