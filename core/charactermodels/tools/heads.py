"""Therian heads: a body mod that replaces the MakeHuman head with an animal's (the Coyote Men's, biomes/outlands/PLAN.md
section 6; and the cat, lion, rat, monkey and bird heads of tools/therian.py), made without Blender from the body's own
base piece.

The head is a signed distance field (smooth unions of a cranium, a muzzle, a jaw, cheeks, ears, a nose pad, and a plug
down into the neck, the eye sockets cut out), meshed by surface nets on a 4 mm grid and each vertex projected onto the
surface along the field's gradient. Each part is placed from the base's own head at rest (its height, depth and width,
its eyes and ears, the neck's ring where the head is cut off), so the man's and the woman's heads sit on their necks.
Every vertex carries:
- a colour (COLOR_0): the coat's pattern in shades that the kit's 'coat' tint (the hair colour, its gain) multiplies:
  a darker saddle on the crown and the back of the ears, pale cheeks, jaw and throat, a dark nose, lips and eye rims;
- a UV (TEXCOORD_0) wrapped round the muzzle's axis (the seam under the jaw), for the fur's strands;
- the fur's cover and the metres one unit of that UV spans there (TEXCOORD_1: the figure's fur shells read it, so the
  nose, the lips and the eye rims stay bare);
- the base vertex whose morph deltas it takes (_VIDX: the nearest of the skull's, not the face's, so the face
  sliders do not bend the muzzle) and its weights: the Head joint, blending into the Neck at the cut.
The eyes are their own primitive (amber, a round pupil). The kit item (slot 'mods', group 'head') hides the head's skin
(every base triangle the Head joint carries), the brows, lashes, eyes, lips and ears (hide_parts), the hair and beard
(replaces_head), and is 'furred': a coat does not fade out at the neck because of it. Its morph file is the base skin's
own entry under the head's material names, cut to the skull vertices the head takes (_VIDX), so those indices move it
as the skull moves.

A species is a dict (COYOTE below; the others in tools/therian.py): its geometry's numbers ('geo': where each part
sits and how big, of the base head's measures), its paint ('paint': the pattern's colours and the fur's lengths, and a
hook for what the pattern has besides), its eyes ('eye': the iris colours, a round or a slit pupil), its nose pad
('nose': the pad's colours, or None for no pad), extra fields in the head ('extras': a lion's mane), cuts ('cuts': a
monkey's nostrils), extra primitives ('prims': a bird's beak, whiskers), a bare face ('face': its vertices go to a
second material in the skin's colour) and the fur kind its item wears ('fur', data/fur.json).

    python3 tools/heads.py <body> <base.glb or published base .txt> [coyote cat lion rat monkey bird | all]
writes pieces/<body>/mod_head_<species>.glb, .morph.bin (when the base carries morphs) and an empty .gshapes.bin (the
Godot twin's shapes and its skin regions come from make_mpfb.py's next run), and the kit item into data/<body>/kit.json
(the coyote alone when no species is named).
"""
import base64, gzip, io, json, os, struct, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import fur as G                                     # the GLB reader (fur.glb, fur.accessor)

ID = 'mod_head_coyote'
CELL = 0.004
MAT, EYE_MAT, NOSE_MAT = 'Mod.coyote_head', 'Mod.coyote_eyes', 'Mod.coyote_nose'
EAR_MAT, LID_MAT = 'Mod.coyote_ears', 'Mod.coyote_lids'
EAR_CELL = 0.0018                                   # the ears' own grid (on the head's their hollows stepped)
NOSE_CELL = 0.0012                                  # the nose pad's own grid (the nostrils are a few mm)
HIDE_PARTS = ['Human.eyebrow001', 'Human.eyebrow002', 'Human.eyelashes01', 'Human.eyelashes02', 'Human.low-poly',
              'Human.lips', 'Human.ears']
SHADE = 0.7       # the head's base shade: the kit's 'coat' gain is the hair's over it, so the head matches the coat


# ---------------------------------------------------------------------------------------------------------------
# the coyote, the first therian head (the owner's photographs, 2026-10-26): every number of its field and its paint,
# which the other species (tools/therian.py) vary. Lengths in metres on the man's head (times the base's scale s),
# widths of the base head's half width (xw), depths of its length (zf - zb)
COYOTE = {
    'id': 'coyote', 'name': 'Coyote head', 'fur': 'brush',
    'geo': {
        'cr_y': 0.033, 'cr_z': 0.0, 'cr_r': (0.93, 0.063, 0.38),            # the cranium: centre above the eyes, radii
        'mz_root': (-0.012, -0.055), 'mz_tip': (-0.044, 0.10), 'mz_r': (0.044, 0.0125),   # the muzzle: (y, z) ends, radii
        'jaw_root': (0.0, -0.034, -0.025), 'jaw_tip': (0.0, -0.024, -0.022), 'jaw_r': (0.036, 0.010),   # off the muzzle's
        'cheek': (0.72, -0.018, -0.072), 'cheek_r': (0.038, 0.03, 0.042),
        'zygoma': ((0.62, -0.006, -0.045), (0.86, 0.004, -0.105), 0.011, 0.014),      # the ridge under the eye: ends, radii
        'nose_off': (0.0, 0.004, 0.006), 'nose_r': 0.012,                   # the blob under the pad, off the muzzle's tip
        'pad_r': (0.0108, 0.0082, 0.0092), 'pad_front': 0.0062, 'nostril': (0.0052, -0.0016, 0.0058),
        'philtrum': ((0.0, -0.003, 0.0062), (0.0, -0.0105, 0.0035)),
        'ears': {'base': (0.55, 0.066, -0.008), 'tip': (0.04, 0.105, -0.012), 'w': 0.036, 'd': 0.012, 'form': 'point', 'facing': None},
        'eye_r': 0.0138, 'eye': (0.42, 0.006, -0.036), 'gaze': (0.34, 0.05, 0.94), 'tilt': 0.22, 'eye_back': 0.6, 'eye_open': 0.15,
        'lids': (1.22, 0.56, 1.2),                  # the almond's half-length, half-height and depth, of the eye's radius
        'k': {'muzzle': 0.03, 'jaw': 0.02, 'cheek': 0.025, 'zygoma': 0.018, 'pad': 0.003, 'plug': 0.03, 'nape': 0.04,
              'ear': 0.01, 'rim': 0.004, 'socket': 0.0025},                 # the unions' blends
    },
    'paint': {
        'ln': 0.45, 'ln_front': 0.28, 'ln_muzzle': 0.18, 'ln_ruff': 1.0,    # the fur's length, of the kind's pile
        'crown': (0.66, 0.64, 0.63), 'crown_amt': 0.6, 'streak': 0.18,
        'muzzle_top': (0.8, 0.58, 0.4), 'muzzle_top_amt': 0.7,
        'cream': (1.0, 0.97, 0.92), 'cream_amt': 1.0,
        'ear_back': (0.82, 0.58, 0.4), 'ear_back_amt': 0.75, 'ear_inner': (1.0, 0.98, 0.95), 'ear_dark': 0.6,
        'nose_dark': 0.85, 'lip': 0.15, 'liner': 0.88, 'tear': 0.45,
    },
    'eye': {'gold': (0.98, 0.76, 0.2), 'amber': (0.78, 0.46, 0.08), 'ring': (0.2, 0.11, 0.03), 'sclera': (0.16, 0.1, 0.06),
            'pupil': ('round', 0.945, 0.955)},
    'nose': {'color': (0.07, 0.055, 0.05), 'top': (0.06, 0.04, 0.025)},
}


# ---------------------------------------------------------------------------------------------------------------
# the field's pieces (numpy over points P, shape (n, 3))
def ellipsoid(P, c, r):
    q = (P - c) / r
    k0 = np.linalg.norm(q, axis=1)
    k1 = np.linalg.norm(q / r, axis=1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def round_cone(P, a, b, ra, rb):
    """a capsule from a (radius ra) to b (radius rb), the radius running linearly along it"""
    ab = b - a
    t = np.clip(((P - a) @ ab) / (ab @ ab), 0.0, 1.0)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1) - (ra + (rb - ra) * t)


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b + (a - b) * h - k * h * (1.0 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def ear_frame(base, tip, side, facing=None):
    """an ear's axes: u up it, f the way its opening faces (forward and out, or the species' facing), s across it"""
    u = (tip - base) / np.linalg.norm(tip - base)
    f = np.array([side * 0.45, 0.0, 0.9]) if facing is None else np.array([side * facing[0], facing[1], facing[2]])
    f -= u * (f @ u); f /= np.linalg.norm(f)
    return u, f, np.cross(u, f)


def ear_shape(t, L, width, depth, form='point'):
    """the ear's half-width and half-depth at t along it: narrowing to a point ('point'), or full to a third of the way
    and then a half ellipse to a rounded tip ('round'); never thinner than 6 mm (at 4.5 the 4 mm grid frayed its edges)"""
    k = np.clip(1.0 - t / L, 0.0, 1.0)
    if form == 'round':
        rw = width * np.sqrt(np.clip(1.0 - ((t - 0.35 * L) / (0.65 * L)) ** 2, 0.0, 1.0))
        rw = np.where(t < 0.35 * L, width, rw)
        return np.maximum(rw, 1e-4), np.maximum(depth * (0.5 + 0.5 * k), 0.006)
    return np.maximum(width * k ** 0.85, 1e-4), np.maximum(depth * k, 0.006)


def ear(P, base, tip, width, depth, side, form='point', facing=None):
    """a flattened cone tapering to its tip, its opening cupped (a hollow in the front, the back wall left standing)"""
    L = np.linalg.norm(tip - base)
    u, f, s = ear_frame(base, tip, side, facing)
    q = P - base
    t, x, z = q @ u, q @ s, q @ f
    rw, rd = ear_shape(t, L, width, depth, form)
    d = (np.sqrt((x / rw) ** 2 + (z / rd) ** 2) - 1.0) * np.minimum(rw, rd)
    d = np.maximum(d, -t)
    cw, cd = rw * 0.72 + 1e-4, rd * 0.6
    cup = (np.sqrt((x / cw) ** 2 + ((z - rd * 0.65) / cd) ** 2) - 1.0) * np.minimum(cw, cd)
    cup = np.maximum(cup, np.maximum(0.006 - t, t - 0.85 * L))
    return smax(d, -cup, 0.002)


def frame(g, side, tilt):
    """an eye's axes: g its gaze, h along the lid opening (the outer corner raised by tilt), v up across it"""
    h = np.cross(np.array([0.0, 1.0, 0.0]), g); h /= np.linalg.norm(h)
    v = np.cross(g, h)
    c, sn = np.cos(side * tilt), np.sin(side * tilt)
    return g, h * c + v * sn, v * c - h * sn


def socket(P, c, axes, radii):
    """the almond the lids leave open: an ellipsoid in the eye's frame"""
    g, h, v = axes
    q = P - c
    return ellipsoid(np.stack([q @ h, q @ v, q @ g], 1), np.zeros(3), np.array([radii[0], radii[1], radii[2]]))


class Head:
    """the head's field, placed from the base's measures (m) by the species' numbers (sp['geo'])"""

    def __init__(self, m, sp=COYOTE):
        self.m, self.sp = m, sp
        g = sp['geo']
        s = m['scale']
        y0, ye, zf, zb, xw = m['chin'], m['eye_y'], m['front'], m['back'], m['half_width']
        self.s = s
        self.k = g['k']
        cz = zb + 0.5 * (zf - zb)
        # (the sides of the skull and the cheekbones a little wider than a first guess, after the owner's photographs: a
        # coyote's head is broad across the cheeks and narrows sharply into the muzzle)
        self.cranium = (np.array([0.0, ye + g['cr_y'] * s, cz + g['cr_z'] * s]), np.array([xw * g['cr_r'][0], g['cr_r'][1] * s, (zf - zb) * g['cr_r'][2]]))
        root = np.array([0.0, ye + g['mz_root'][0] * s, zf + g['mz_root'][1] * s])
        tip = np.array([0.0, ye + g['mz_tip'][0] * s, zf + g['mz_tip'][1] * s])
        self.muzzle = (root, tip, g['mz_r'][0] * s, g['mz_r'][1] * s)
        self.jaw = (root + np.array(g['jaw_root']) * s, tip + np.array(g['jaw_tip']) * s, g['jaw_r'][0] * s, g['jaw_r'][1] * s)
        ck, cr = g['cheek'], g['cheek_r']
        self.cheeks = [(np.array([sd * xw * ck[0], ye + ck[1] * s, zf + ck[2] * s]), np.array(cr) * s) for sd in (-1, 1)]
        # the cheekbones: a ridge under each eye running back toward the ear
        self.zygoma = []
        if g.get('zygoma'):
            za, zb_, ra, rb = g['zygoma']
            self.zygoma = [(np.array([sd * xw * za[0], ye + za[1] * s, zf + za[2] * s]), np.array([sd * xw * zb_[0], ye + zb_[1] * s, zf + zb_[2] * s]),
                            ra * s, rb * s) for sd in (-1, 1)]
        self.nose = (tip + np.array(g['nose_off']) * s, g['nose_r'] * s)
        # the nose pad (the rhinarium): wider than tall, its front flat, two comma nostrils on the front turning out and
        # back, a groove (the philtrum) from between them down to the lip. Its own primitive on a finer grid (nose_sdf);
        # the head carries a smaller blob under it
        c = self.nose[0]
        self.pad = None
        if g.get('pad_r'):
            self.pad = (c, np.array(g['pad_r']) * s)
            self.pad_front = c[2] + g['pad_front'] * s
            self.pad_scale = g.get('pad_scale', 1.0)
            nq = g['nostril']
            self.nostrils = [(c + np.array([sd * nq[0], nq[1], nq[2]]) * s, sd) for sd in (-1, 1)]
            self.philtrum = (c + np.array(g['philtrum'][0]) * s, c + np.array(g['philtrum'][1]) * s)
        nr = m['neck_r']
        self.plug = (np.array([0.0, m['cut'] + 0.06 * s, m['neck_z']]), np.array([0.0, m['cut'] - 0.035, m['neck_z']]), nr * 1.02, nr * 0.97)
        self.ears = []
        if g.get('ears'):
            E = g['ears']
            for sd in (-1, 1):
                base = np.array([sd * xw * E['base'][0], ye + E['base'][1] * s, cz + E['base'][2] * s])
                tip_ = base + np.array([sd * E['tip'][0], E['tip'][1], E['tip'][2]]) * s
                self.ears.append((base, tip_, E['w'] * s, E['d'] * s, sd, E.get('form', 'point'), E.get('facing')))
        # the nape: the back of the skull carried down into the neck (a ball on a stalk without it)
        self.nape = (np.array([0.0, ye + 0.005 * s, cz - 0.045 * s]), np.array([0.0, m['cut'] + 0.025, m['neck_z'] - 0.008]),
                     0.05 * s, nr * 1.04)
        # the eyes: set into the front of the skull, each turned out a third of a right angle (a coyote's look ahead
        # and to the side), the eyeball behind lids that leave an almond, its outer corner raised
        self.eye_r = g['eye_r'] * s
        self.eyes = []
        ep, gz = g['eye'], g['gaze']
        for sd in (-1, 1):
            e = np.array([sd * xw * ep[0], ye + ep[1] * s, zf + ep[2] * s])
            gv = np.array([sd * gz[0], gz[1], gz[2]]); gv /= np.linalg.norm(gv)
            axes = frame(gv, sd, g['tilt'])
            self.eyes.append({'c': e - gv * self.eye_r * g['eye_back'], 'open': e + gv * self.eye_r * g['eye_open'], 'axes': axes, 'side': sd})
        self.lids = tuple(g['lids'])
        self.floor = m['cut'] - 0.03                 # below it nothing: the plug stands inside the neck
        # the species' own fields (a mane), unioned in, and its cuts (nostrils in a bare muzzle): [(field, blend)]
        self.extras = sp['extras'](self) if sp.get('extras') else []
        self.cuts = sp['cuts'](self) if sp.get('cuts') else []

    def sdf(self, P):
        k = self.k
        d = ellipsoid(P, *self.cranium)
        d = smin(d, round_cone(P, *self.muzzle), k['muzzle'] * self.s)
        d = smin(d, round_cone(P, *self.jaw), k['jaw'] * self.s)
        for c, r in self.cheeks:
            d = smin(d, ellipsoid(P, c, r), k['cheek'] * self.s)
        for a, b, ra, rb in self.zygoma:
            d = smin(d, round_cone(P, a, b, ra, rb), k['zygoma'] * self.s)
        if self.pad:
            d = smin(d, ellipsoid(P, self.pad[0], self.pad[1] - 0.0045 * self.s), k['pad'] * self.s)   # under the pad (nose_sdf)
        d = smin(d, round_cone(P, *self.plug), k['plug'] * self.s)
        d = smin(d, round_cone(P, *self.nape), k['nape'] * self.s)
        for f, kk in self.extras:
            d = smin(d, f(P), kk * self.s)
        for f, kk in self.cuts:
            d = smax(d, -f(P), kk * self.s)
        for base, tip, w, dp, sd, form, facing in self.ears:   # a stub under each (the ear is its own piece)
            d = smin(d, ear(P, base, base + (tip - base) * 0.3, w * 0.8, dp, sd, form, facing), k['ear'] * self.s)
        for e in self.eyes:                          # the lids: a soft rim round the almond, the opening, the eyeball behind it
            rim = socket(P, e['open'], e['axes'], np.array(self.lids) * self.eye_r * np.array([1.18, 1.45, 0.75]))
            d = smin(d, rim, k['rim'] * self.s)
            d = smax(d, -socket(P, e['open'], e['axes'], np.array(self.lids) * self.eye_r), k['socket'] * self.s)
        return np.maximum(d, self.floor - P[:, 1])

    def nose_sdf(self, P):
        s, ps = self.s, self.pad_scale
        d = ellipsoid(P, *self.pad)
        d = smax(d, P[:, 2] - self.pad_front, 0.0025 * s)                     # the flat front
        for c, sd in self.nostrils:                                          # each a comma: a round hole sweeping out and back
            q = P - c
            ang = sd * 0.6
            x = q[:, 0] * np.cos(ang) - q[:, 2] * np.sin(ang)
            z = q[:, 0] * np.sin(ang) + q[:, 2] * np.cos(ang)
            hole = np.sqrt((x / (0.0034 * s * ps)) ** 2 + (q[:, 1] / (0.0022 * s * ps)) ** 2 + (z / (0.004 * s * ps)) ** 2) - 1.0
            d = smax(d, -hole * 0.0022 * s * ps, 0.0008 * s)
        a, b = self.philtrum
        d = smax(d, -(round_cone(P, a, b, 0.0011 * s * ps, 0.0009 * s * ps)), 0.0006 * s)
        return d

    def grad(self, P, h=1e-4):
        g = np.stack([self.sdf(P + np.array(o)) - self.sdf(P - np.array(o)) for o in ((h, 0, 0), (0, h, 0), (0, 0, h))], 1)
        return g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12)


# ---------------------------------------------------------------------------------------------------------------
def surface_nets(f, lo, hi, cell):
    """the zero set of f on a grid: a vertex per cell the surface crosses (the mean of its edges' crossings), a quad per
    grid edge it crosses (unwound)"""
    n = np.ceil((hi - lo) / cell).astype(int) + 1
    ax = [lo[k] + cell * np.arange(n[k]) for k in range(3)]
    X, Y, Z = np.meshgrid(*ax, indexing='ij')
    V = f(np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)).reshape(n)
    inside = V < 0
    nc = n - 1
    corners = [(i, j, k) for i in (0, 1) for j in (0, 1) for k in (0, 1)]
    edges = [(a, b) for a in range(8) for b in range(a + 1, 8) if sum(abs(corners[a][q] - corners[b][q]) for q in range(3)) == 1]
    acc = np.zeros(tuple(nc) + (3,))
    cnt = np.zeros(tuple(nc))
    sl = lambda c: (slice(c[0], c[0] + nc[0]), slice(c[1], c[1] + nc[1]), slice(c[2], c[2] + nc[2]))
    I, J, K = np.meshgrid(*[np.arange(nc[k]) for k in range(3)], indexing='ij')
    for a, b in edges:
        va, vb = V[sl(corners[a])], V[sl(corners[b])]
        x = (va < 0) != (vb < 0)
        t = np.where(x, va / np.where(va - vb == 0, 1e-12, va - vb), 0.0)
        ca, cb = np.array(corners[a]), np.array(corners[b])
        for q in range(3):
            acc[..., q] += np.where(x, ca[q] + t * (cb[q] - ca[q]), 0.0)
        cnt += x
    has = cnt > 0
    idx = -np.ones(tuple(nc), np.int64)
    idx[has] = np.arange(has.sum())
    base = np.stack([I, J, K], -1)[has]
    verts = lo + cell * (base + acc[has] / cnt[has][:, None])
    quads = []
    for q in range(3):
        o1, o2 = [(1, 2), (0, 2), (0, 1)][q]
        e = np.zeros(3, int); e[q] = 1
        s0 = inside[:n[0] - e[0], :n[1] - e[1], :n[2] - e[2]]
        s1 = inside[e[0]:, e[1]:, e[2]:]
        cross = s0 != s1
        P = np.argwhere(cross)
        P = P[(P[:, o1] >= 1) & (P[:, o2] >= 1) & (P[:, o1] < nc[o1] + 0) & (P[:, o2] < nc[o2] + 0)]
        P = P[(P[:, q] < nc[q])]
        def cellat(d1, d2):
            c = P.copy(); c[:, o1] -= d1; c[:, o2] -= d2
            return idx[c[:, 0], c[:, 1], c[:, 2]]
        a, b, c, d = cellat(1, 1), cellat(0, 1), cellat(0, 0), cellat(1, 0)
        ok = (a >= 0) & (b >= 0) & (c >= 0) & (d >= 0)
        quads.append(np.stack([a, b, c, d], 1)[ok])          # wound afterwards (build: by the field's gradient)
    Q = np.concatenate(quads)
    tris = np.concatenate([Q[:, [0, 1, 2]], Q[:, [0, 2, 3]]])
    return verts, tris


# ---------------------------------------------------------------------------------------------------------------
def measure(path):
    js, b = G.glb(path)
    sk = js['skins'][0]
    names = [js['nodes'][j]['name'] for j in sk['joints']]
    prims = {}
    for me in js['meshes']:
        for pr in me['primitives']:
            prims[js['materials'][pr['material']]['name']] = pr
    body = prims['Human.body']
    P = G.accessor(js, b, body['attributes']['POSITION']).astype(float)
    Jn = G.accessor(js, b, body['attributes']['JOINTS_0'])
    W = G.accessor(js, b, body['attributes']['WEIGHTS_0']).astype(float)
    T = G.accessor(js, b, body['indices']).reshape(-1, 3)
    VI = G.accessor(js, b, body['attributes']['_VIDX'])[:, 0] if '_VIDX' in body['attributes'] else None
    hj, nj = names.index('mixamorig:Head'), names.index('mixamorig:Neck')
    hw = ((Jn == hj) * W).sum(1)
    H = P[hw > 0.5]
    eyes = G.accessor(js, b, prims['Human.low-poly']['attributes']['POSITION']).astype(float)
    # the cut: the lowest ring the head carries; the neck's radius and centre just under it
    cut = H[:, 1].min()
    ring = P[(np.abs(P[:, 1] - (cut - 0.01)) < 0.006) & (np.abs(P[:, 0]) < 0.1) & (hw < 0.5)]
    nz = float(ring[:, 2].mean()) if len(ring) else float(H[:, 2].mean())
    nr = float(np.median(np.hypot(ring[:, 0], ring[:, 2] - nz))) if len(ring) else 0.05
    m = {'chin': float(H[:, 1].min()), 'top': float(H[:, 1].max()), 'front': float(H[:, 2].max()), 'back': float(H[:, 2].min()),
         'half_width': float(np.abs(H[:, 0]).max()), 'eye_y': float(eyes[:, 1].mean()), 'cut': float(cut),
         'neck_r': nr, 'neck_z': nz, 'scale': float((H[:, 1].max() - H[:, 1].min()) / 0.25)}
    ibm = G.accessor(js, b, sk['inverseBindMatrices']).reshape(-1, 4, 4)
    skull = (hw > 0.5) & ((P[:, 2] < m['back'] + 0.5 * (m['front'] - m['back'])) | (P[:, 1] > m['eye_y'] + 0.03))
    return {'m': m, 'ibm': {'Head': ibm[hj], 'Neck': ibm[nj]}, 'P': P, 'T': T, 'hw': hw, 'VI': VI, 'skull': skull, 'js': js}


def morph_entry(path, mats, used=None):
    """the base skin's morph entry (KMR1, make_mpfb.py pack_morphs) re-labelled with the head's materials, cut to the
    base vertices the head takes (used: its _VIDX values; the whole skin's entry was 1.5 MB a head)"""
    if not path.endswith('.txt'):
        mp = path[:-4] + '.morph.bin'
        if not os.path.exists(mp):
            return None
        buf = open(mp, 'rb').read()
    else:
        lines = open(path, 'rb').read().split(b'\n')
        if len(lines) < 2 or not lines[1].strip():
            return None
        buf = gzip.decompress(base64.b64decode(lines[1]))
    # (the format: make_mpfb.py pack_morphs. The deltas stay the int16 they are; only the vertices not in used go)
    o, n = 4, struct.unpack_from('<H', buf, 4)[0]
    o += 2
    for e in range(n):
        nl = struct.unpack_from('<H', buf, o)[0]; o += 2
        names = buf[o:o + nl].decode('utf-8').split('\n'); o += nl
        nu = struct.unpack_from('<I', buf, o)[0]; o += 4
        used0 = np.frombuffer(buf, np.uint32, nu, o); o += 4 * nu
        nt = struct.unpack_from('<H', buf, o)[0]; o += 2
        tg = []
        for k in range(nt):
            t, c = struct.unpack_from('<HI', buf, o); o += 6
            if c & 0x80000000:
                idx, c = used0, nu
            else:
                idx = np.frombuffer(buf, np.uint32, c, o); o += 4 * c
            tg.append((t, idx, np.frombuffer(buf, np.int16, 3 * c, o).reshape(-1, 3))); o += 6 * c
        if 'Human.body' not in names:
            continue
        keep = used0 if used is None else np.array(sorted(set(int(i) for i in used) & set(used0.tolist())), np.uint32)
        if not len(keep):
            return None
        inkeep = np.zeros(int(max(used0.max(), keep.max())) + 1, bool); inkeep[keep] = True
        blocks = []
        for t, idx, d in tg:
            sel = inkeep[idx]
            if not sel.any():
                continue
            if sel.sum() == len(keep) and sel.mean() > 0.6:
                order = np.argsort(idx[sel])                      # dense: every kept vertex, in keep's order
                blocks.append(struct.pack('<HI', t, 0x80000000) + np.ascontiguousarray(d[sel][order]).tobytes())
            else:
                blocks.append(struct.pack('<HI', t, int(sel.sum())) + np.ascontiguousarray(idx[sel]).astype(np.uint32).tobytes()
                              + np.ascontiguousarray(d[sel]).tobytes())
        mb = '\n'.join(mats).encode('utf-8')
        body = struct.pack('<H', len(mb)) + mb + struct.pack('<I', len(keep)) + keep.astype(np.uint32).tobytes() \
            + struct.pack('<H', len(blocks)) + b''.join(blocks)
        return buf[:4] + struct.pack('<H', 1) + body
    return None


def paint(h, V, N, sp=COYOTE):
    """each vertex's shade (the kit's coat tint multiplies it), its fur's density (1 full, under 1 fewer strands), its
    fur's length (of the kind's pile) and, for a species with a bare face, how far it is on the face (0 or 1 elsewhere).
    The coyote's (after the owner's photographs, 2026-10-26): the lips, chin, throat and cheeks cream; the top of the
    muzzle and the backs of the ears reddish; the forehead and crown a grizzled buff-grey with a darker streak down the
    middle; the fur short and sleek on the muzzle and face, long in a ruff on the cheeks and the neck; the ears' hollows
    white fluff at the base, bare above, their rims and tips dark. Another species gives its own colours and lengths
    (sp['paint']) and a hook for what else its pattern has"""
    pp = sp['paint']
    s, m = h.s, h.m
    ye, zf, zb = m['eye_y'], m['front'], m['back']
    y, z, x = V[:, 1], V[:, 2], V[:, 0]
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    mix = lambda c, k, to: c * (1 - k[:, None]) + np.asarray(to, float) * k[:, None]
    col = np.full((len(V), 3), SHADE)
    dens = np.ones(len(V))
    ln = np.full(len(V), pp['ln'])
    cz = h.cranium[0][2]
    # the lip line (between the muzzle and the jaw), for what lies below it
    a, b = h.muzzle[0], h.muzzle[1]
    tm = np.clip((z - a[2]) / (b[2] - a[2]), 0, 1)
    ym = a[1] + (b[1] - a[1]) * tm - (0.028 - 0.016 * tm) * s
    front = sm(cz, zf - 0.02 * s, z)                                  # 0 at the back of the skull, 1 on the face
    muzzle = sm(zf - 0.05 * s, zf - 0.01 * s, z)
    # the crown and forehead: grizzled buff-grey, a darker streak down the middle
    crown = sm(ye - 0.005 * s, ye + 0.03 * s, y)
    col = mix(col, crown * pp['crown_amt'], np.array(pp['crown']))
    streak = crown * (1 - sm(0.006 * s, 0.014 * s, np.abs(x))) * front * (1 - muzzle)
    col = col * (1 - pp['streak'] * streak)[:, None]
    # the top of the muzzle reddish
    top_m = muzzle * sm(0.0, 0.5, N[:, 1]) * sm(ym + 0.004 * s, ym + 0.012 * s, y)
    col = mix(col, top_m * pp['muzzle_top_amt'], np.array(pp['muzzle_top']))
    # the cream: the lips and chin (below the lip line), the throat, the cheeks below the eyes, the muzzle's lower sides
    below = 1 - sm(ym - 0.001 * s, ym + 0.006 * s, y)
    cheek = (1 - sm(ye - 0.03 * s, ye - 0.008 * s, y)) * sm(zb + 0.4 * (zf - zb), zb + 0.65 * (zf - zb), z) * sm(0.012 * s, 0.03 * s, np.abs(x))
    side_m = muzzle * (1 - sm(-0.1, 0.4, N[:, 1])) * sm(0.006 * s, 0.014 * s, np.abs(x))
    throat = (1 - sm(ye - 0.07 * s, ye - 0.04 * s, y)) * sm(cz - 0.02 * s, zf - 0.04 * s, z) * sm(-0.2, 0.2, -N[:, 1] + N[:, 2])
    cream = np.clip(np.maximum.reduce([below * front, cheek, side_m, throat]), 0, 1)
    col = mix(col, cream * pp['cream_amt'], np.array(pp['cream']))
    # the fur's length: sleek on the muzzle and the face, a ruff on the cheeks and the neck (the crown's at 0.6 bristled)
    ln = ln * (1 - front) + pp['ln_front'] * front
    ln = ln * (1 - muzzle) + pp['ln_muzzle'] * muzzle
    ruff = np.maximum(cheek * (1 - muzzle), (1 - sm(ye - 0.05 * s, ye - 0.02 * s, y)) * (1 - front * 0.6))
    ln = ln * (1 - ruff) + pp['ln_ruff'] * ruff
    # the ears
    ears_on = np.zeros(len(V))
    for base, tip, w, dp, sd, form, facing in h.ears:
        L = np.linalg.norm(tip - base)
        u, f, sa = ear_frame(base, tip, sd, facing)
        q = V - base
        t, xs, zs = q @ u, q @ sa, q @ f
        rw, rd = ear_shape(t, L, w, dp, form)
        on = sm(0.004, 0.012, t) * (1 - sm(1.25, 1.6, np.sqrt((xs / (rw + 0.004)) ** 2 + (zs / (rd + 0.004)) ** 2)))
        nf = N @ f
        inner = on * sm(0.15, 0.55, nf) * (1 - sm(0.75, 0.95, np.abs(xs) / rw))
        back = on * sm(0.1, 0.5, -nf)
        rim = on * sm(0.72, 0.95, np.abs(xs) / rw) * (1 - inner)
        tipd = on * sm(0.62, 0.92, t / L)
        col = mix(col, back * pp['ear_back_amt'], np.array(pp['ear_back']))
        col = mix(col, inner, np.array(pp['ear_inner']))
        col = col * (1 - pp['ear_dark'] * np.maximum(rim, tipd))[:, None]
        # the hollow: white fluff at its base (dense, long), bare above
        fluff = inner * (1 - sm(0.3 * L, 0.55 * L, t))
        dens = np.minimum(dens, 1 - inner + fluff)
        # no shells above the ear's lower third: on a thin ear their layers stepped along the rim and the cup seen
        # edge-on; the velvet there is its shading
        dens = np.minimum(dens, 1 - on * sm(0.28 * L, 0.42 * L, t) * (1 - fluff))
        # (short on the ear: the shells' layers stepped where its cup and rim are seen edge-on)
        ln = ln * (1 - on) + on * (0.12 * (1 - fluff) + 0.6 * fluff)
        ears_on = np.maximum(ears_on, on)
    # the nose: the head under the pad dark and bare
    if h.pad:
        nd = h.nose_sdf(V)
        col = col * (1 - pp['nose_dark'] * (1 - sm(0.0, 0.004 * s, nd)))[:, None]
        dens = np.minimum(dens, sm(0.002 * s, 0.006 * s, nd))
    lip = (z > zf - 0.025 * s) & (np.abs(y - ym) < 0.0035 * s) & (np.abs(x) > 0.004 * s) & (np.abs(N[:, 0]) > 0.3)
    if pp['lip'] is None:
        lip[:] = False
    col[lip] = pp['lip'] if pp['lip'] is not None else SHADE
    dens[lip] = 0.0
    for e in h.eyes:
        # the lids: a dark rim round the almond, bare, the fur coming in beyond it short; and the dark line from the
        # inner corner down the side of the muzzle
        rad = np.array(h.lids) * h.eye_r
        g, hh, v = e['axes']
        q = V - e['open']
        qn = np.sqrt(((q @ hh) / rad[0]) ** 2 + ((q @ v) / rad[1]) ** 2 + ((q @ g) / rad[2]) ** 2)
        liner = 1 - sm(1.08, 1.35, qn)
        col = col * (1 - pp['liner'] * liner)[:, None]
        dens = np.minimum(dens, sm(1.12, 1.6, qn))
        ln = np.minimum(ln, 0.12 + 0.3 * sm(1.1, 2.2, qn))
        ends = [e['open'] + hh * rad[0], e['open'] - hh * rad[0]]
        inner_corner = min(ends, key=lambda p: abs(p[0]))                # the end nearer the nose
        a0 = inner_corner + np.array([0.0, -0.002, 0.002]) * s
        a1 = a0 + np.array([e['side'] * 0.004, -0.018, 0.016]) * s
        ab = a1 - a0
        tt = np.clip(((V - a0) @ ab) / (ab @ ab), 0, 1)
        dl = np.linalg.norm(V - (a0 + tt[:, None] * ab), axis=1)
        tear = (1 - sm(0.0018 * s, 0.0035 * s, dl)) * (1 - tt * 0.6)
        col = col * (1 - pp['tear'] * tear)[:, None]
    face = np.zeros(len(V))
    if pp.get('hook'):
        ctx = {'sm': sm, 'mix': mix, 'front': front, 'muzzle': muzzle, 'crown': crown, 'cheek': cheek, 'throat': throat,
               'ym': ym, 'cz': cz, 'ears': ears_on, 'lip': lip}
        col, dens, ln, face = pp['hook'](h, V, N, col, dens, ln, face, ctx)
    return np.clip(col, 0, 1), dens, np.clip(ln, 0.05, 1.2), np.clip(face, 0, 1)


def largest(V, T, keep=0.02):
    """the mesh without its stray islands (the grid leaves a few specks off thin parts): every connected piece with
    fewer than keep of the triangles goes, and the vertices only they used"""
    parent = np.arange(len(V))
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]; i = parent[i]
        return i
    for a, b, c in T:
        ra, rb, rc = find(a), find(b), find(c)
        parent[rb] = ra; parent[find(rc)] = ra
    root = np.array([find(i) for i in range(len(V))])
    lab = root[T[:, 0]]
    u, cnt = np.unique(lab, return_counts=True)
    big = set(u[cnt >= keep * len(T)])
    T = T[np.array([l in big for l in lab])]
    used = np.unique(T)
    remap = -np.ones(len(V), np.int64); remap[used] = np.arange(len(used))
    return V[used], remap[T]


def ngrad(h, P, e=2e-5):
    g = np.stack([h.nose_sdf(P + np.array(o)) - h.nose_sdf(P - np.array(o)) for o in ((e, 0, 0), (0, e, 0), (0, 0, e))], 1)
    return g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12)


def nose_paint(h, V, N, nc=COYOTE['nose']):
    """the pad's colours (not tinted): near black (or a species' pink), a little browner on top where it meets the fur,
    the nostrils and the philtrum dark, and a fine leathery mottle"""
    s = h.s
    c = np.full((len(V), 3), list(nc['color']))
    top = np.clip((V[:, 1] - h.pad[0][1]) / (h.pad[1][1]), 0, 1) * np.clip(N[:, 1], 0, 1)
    c += top[:, None] * np.array(nc['top'])
    q = np.floor(V / (0.0012 * s)).astype(np.int64)
    mott = ((q[:, 0] * 73856093) ^ (q[:, 1] * 19349663) ^ (q[:, 2] * 83492791)) % 1000 / 1000.0
    c *= (0.85 + 0.3 * mott)[:, None]
    for ncr, sd in h.nostrils:
        dn = np.linalg.norm(V - ncr, axis=1)
        c[dn < 0.0042 * s * h.pad_scale] = 0.012
    a, b = h.philtrum
    ab = b - a
    t = np.clip(((V - a) @ ab) / (ab @ ab), 0, 1)
    c[np.linalg.norm(V - (a + t[:, None] * ab), axis=1) < 0.0016 * s * h.pad_scale] *= 0.4
    return np.clip(c, 0, 1)


def mesh_field(f, grad, lo, hi, cell, smooth=2):
    """a field's zero set as a clean mesh: surface nets, projected onto the surface, wound out, stray islands dropped,
    smoothed (and back onto the surface); its vertices, triangles, normals and each vertex's neighbours"""
    V, T = surface_nets(f, lo, hi, cell)
    for _ in range(3):
        V = V - f(V)[:, None] * grad(V)
    fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]])
    flip = (fn * grad(V[T].mean(1))).sum(1) < 0
    T[flip] = T[flip][:, ::-1]
    V, T = largest(V, T)
    nb = [[] for _ in range(len(V))]
    for a, b, c in T:
        nb[a] += [b, c]; nb[b] += [a, c]; nb[c] += [a, b]
    for _ in range(smooth):
        V = np.array([V[n].mean(0) if n else v for v, n in zip(V, nb)]) * 0.5 + V * 0.5
        V = V - f(V)[:, None] * grad(V)
    return V, T, grad(V), nb


def soften(nb, *arrays, times=2):
    """each array averaged half with its vertex's neighbours, times over (a hard paint edge stepped vertex to vertex)"""
    out = []
    for x in arrays:
        for _ in range(times):
            x = np.array([x[n].mean(0) if n else c for c, n in zip(x, nb)]) * 0.5 + x * 0.5
        out.append(x)
    return out


def box_uv(V, T, *attrs):
    """the strands' UV: each triangle projected onto the plane its face turns to most (x: zy, y: xz, z: xy), in metres,
    each of the six charts offset from the others; a vertex shared by triangles of two charts is split. (Wrapped round
    the muzzle's axis the UV had its pole at the back of the skull, and the strands fanned out of a whorl there)"""
    fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]])
    ax_ = np.abs(fn).argmax(1)
    chart = ax_ * 2 + (fn[np.arange(len(T)), ax_] < 0)
    uk, inv = np.unique((T * 6 + chart[:, None]).ravel(), return_inverse=True)
    sv, sc = uk // 6, uk % 6
    T = inv.reshape(-1, 3)
    V = V[sv]
    U = np.zeros((len(V), 2))
    for c in range(6):
        k = sc == c
        a0, a1 = {0: (2, 1), 1: (0, 2), 2: (0, 1)}[c // 2]
        U[k, 0] = V[k, a0] + 10.0 * c
        U[k, 1] = V[k, a1]
    return (V, T, U) + tuple(x[sv] for x in attrs)


def split_by(T, mask, *attrs):
    """the triangles with their corners' mask at least half, and the others, each as (T, attrs...) over its own vertices"""
    on = mask[T].mean(1) >= 0.5
    out = []
    for sel in (~on, on):
        Ts = T[sel]
        used = np.unique(Ts)
        remap = -np.ones(len(mask), np.int64); remap[used] = np.arange(len(used))
        out.append((remap[Ts],) + tuple(x[used] for x in attrs))
    return out


def lids(h, shade=None):
    """the upper lids: for each eye a band of a sphere a little larger than the eyeball, round its horizontal axis from
    the almond's upper edge up into the head (hidden there, open); the 'blink' morph turns it down over the eye to just
    down to the lower lid. The outside a shade darker than the coat, the edge dark"""
    V, N, C, T, dV, dN = [], [], [], [], [], []
    rl = h.eye_r * 1.1
    open_, shut = np.radians(35.0), np.radians(-38.0)
    A = np.radians(np.linspace(-82.0, 82.0, 25))
    F = np.radians(np.linspace(0.0, 70.0, 9))
    for e in h.eyes:
        g, hh, v = e['axes']
        base = sum(len(x) for x in V)
        aa, ff = np.meshgrid(A, F, indexing='ij')

        def at(phi):
            d = np.cos(aa)[..., None] * (np.cos(phi)[..., None] * g + np.sin(phi)[..., None] * v) + np.sin(aa)[..., None] * hh
            return d.reshape(-1, 3)
        d0, d1 = at(open_ + ff), at(shut + ff)
        V.append(e['c'] + d0 * rl); N.append(d0)
        dV.append((d1 - d0) * rl); dN.append(d1 - d0)
        edge = (ff.ravel() < np.radians(9.0))
        c = np.tile([SHADE * 0.75 if shade is None else shade] * 3, (len(d0), 1))
        c[edge] = 0.1
        C.append(c)
        na, nf = len(A), len(F)
        for i in range(na - 1):
            for j in range(nf - 1):
                p0, p1 = base + i * nf + j, base + (i + 1) * nf + j
                T += [[p0, p1, p1 + 1], [p0, p1 + 1, p0 + 1]]
    V, N, C, dV, dN = (np.concatenate(x) for x in (V, N, C, dV, dN))
    T = np.array(T)
    fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]])
    flip = (fn * N[T].mean(1)).sum(1) < 0
    T[flip] = T[flip][:, ::-1]
    return V, N, C, T, dV, dN


def prim(V, N, C, U, U2, T, wn, vid, mat, targets=None, rough=0.9, double=False):
    """one primitive of the piece: its arrays, its material and how it is drawn"""
    return {'V': V, 'N': N, 'C': C, 'U': U, 'U2': U2, 'T': T, 'wn': wn, 'vid': vid, 'mat': mat, 'targets': targets,
            'rough': rough, 'double': double}


def mats_of(sp):
    """the piece's material names: Mod.<species>_<part>"""
    p = 'Mod.%s_' % sp['id']
    return {'head': p + 'head', 'ears': p + 'ears', 'eyes': p + 'eyes', 'nose': p + 'nose', 'lids': p + 'lids', 'face': p + 'face'}


def eyeballs(h, sp):
    """the eyes: spheres behind the lids, their poles on the gaze so the iris is drawn in rings round it: a black
    pupil (round, or a slit standing across the lid's line), the iris in the species' colours (golden by the pupil and
    deeper amber outward on the coyote), a dark limbal ring, and the little sclera the lids show dark (a coyote's is
    hardly ever seen white, and a lighter one caught the light at the corner)"""
    ey = sp['eye']
    eV, eN, eC, eT = [], [], [], []
    RI, RJ = 24, 33
    sm = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a) / (b - a), 0, 1))
    for e in h.eyes:
        g, hh, v = e['axes']
        th, ph = np.meshgrid(np.linspace(0, np.pi, RI), np.linspace(0, 2 * np.pi, RJ), indexing='ij')
        d = (np.cos(th)[..., None] * g + np.sin(th)[..., None] * (np.cos(ph)[..., None] * hh + np.sin(ph)[..., None] * v)).reshape(-1, 3)
        base = sum(len(x) for x in eV)
        eV.append(e['c'] + d * h.eye_r); eN.append(d)
        cg = d @ g
        gold, amber, ring, sclera = np.array(ey['gold']), np.array(ey['amber']), np.array(ey['ring']), np.array(ey['sclera'])
        c = gold[None] * sm(0.78, 0.92, cg)[:, None] + amber[None] * (1 - sm(0.78, 0.92, cg))[:, None]
        c = c * (1 - sm(0.7, 0.66, cg))[:, None] + ring[None] * sm(0.7, 0.66, cg)[:, None]
        c = c * (1 - sm(0.64, 0.6, cg))[:, None] + sclera[None] * sm(0.64, 0.6, cg)[:, None]
        pk = ey['pupil']
        if pk[0] == 'slit':                           # across the lid's line: narrow along it, the iris's height tall
            pm = (1 - sm(pk[1], pk[2], np.abs(d @ hh))) * sm(0.72, 0.78, cg)
        else:
            pm = sm(pk[1], pk[2], cg)
        c = c * (1 - pm)[:, None] + 0.015 * pm[:, None]
        eC.append(c)
        for i in range(RI - 1):
            for j in range(RJ - 1):
                a0, b0 = base + i * RJ + j, base + (i + 1) * RJ + j
                eT += [[a0, b0, b0 + 1], [a0, b0 + 1, a0 + 1]]
    return np.concatenate(eV), np.concatenate(eN), np.concatenate(eC), np.array(eT)


def build(body, src, sp=COYOTE):
    M = measure(src)
    h = Head(M['m'], sp)
    m = M['m']
    S = np.nonzero(M['skull'])[0]
    SP = M['P'][S]
    MT = mats_of(sp)

    def vids(P):
        """the base vertex each takes its morph from: the nearest of the skull's"""
        out = np.zeros(len(P), np.float32)
        if M['VI'] is not None:
            for k in range(0, len(P), 2048):
                out[k:k + 2048] = M['VI'][S[((P[k:k + 2048, None, :] - SP[None]) ** 2).sum(2).argmin(1)]]
        return out
    none = lambda P: np.full((len(P), 2), [0.5, 1e4])      # no fur: its triangles outside every fur row
    # the head (its ears but stubs: they are their own, finer, below)
    blo, bhi = sp['geo'].get('bounds', ((0.0, 0.0, 0.0), (0.0, 0.0, 0.0)))
    lo = np.array([-m['half_width'] * 2.4, h.floor - 0.01, m['back'] - 0.02]) + np.array(blo) * h.s
    hi = np.array([m['half_width'] * 2.4, m['top'] + 0.06 * h.s, h.nose[0][2] + 0.03]) + np.array(bhi) * h.s
    V, T, N, nb = mesh_field(h.sdf, h.grad, lo, hi, CELL)
    col, dens, ln, face = soften(nb, *paint(h, V, N, sp))
    V, T, U, N, col, dens, ln, face = box_uv(V, T, N, col, dens, ln, face)
    wn = np.clip((m['cut'] + 0.02 - V[:, 1]) / 0.05, 0, 1)            # the Head, into the Neck at the cut
    # (TEXCOORD_1: the fur's density and length; the strands' UV in metres)
    prims = []
    if sp.get('face'):
        # a bare face: its triangles on a second material in the skin's colour (role 'skin'), no fur on it
        for (Ts, Vs, Ns, Us, cs, ds, ls), mat, rough in zip(split_by(T, face, V, N, U, col, dens, ln), (MT['head'], MT['face']), (0.9, 0.7)):
            wns = np.clip((m['cut'] + 0.02 - Vs[:, 1]) / 0.05, 0, 1)
            prims.append(prim(Vs, Ns, cs, Us, np.stack([ds, ls], 1), Ts, wns, vids(Vs), mat, rough=rough))
    else:
        prims.append(prim(V, N, col, U, np.stack([dens, ln], 1), T, wn, vids(V), MT['head']))
    # the ears, on a finer grid (on the head's 4 mm grid their hollows stepped)
    for k, (base, tip, w, dp, sd, form, facing) in enumerate(h.ears):
        lo_ = np.minimum(base, tip) - w * 1.6
        hi_ = np.maximum(base, tip) + w * 1.6
        f = lambda P, a=(base, tip, w, dp, sd, form, facing): ear(P, *a)
        gr = lambda P, f=f, e=2e-5: (lambda g: g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12))(
            np.stack([f(P + np.array(o)) - f(P - np.array(o)) for o in ((e, 0, 0), (0, e, 0), (0, 0, e))], 1))
        aV, aT, aN, anb = mesh_field(f, gr, lo_, hi_, EAR_CELL)
        ac, ad, al, _ = soften(anb, *paint(h, aV, aN, sp))
        aV, aT, aU, aN, ac, ad, al = box_uv(aV, aT, aN, ac, ad, al)
        aU[:, 0] += 100.0 * (k + 1)                       # its strands not the head's
        prims.append(prim(aV, aN, ac, aU, np.stack([ad, al], 1), aT, np.zeros(len(aV)), vids(aV), MT['ears']))
    eV, eN, eC, eT = eyeballs(h, sp)
    # the lids, which blink
    lV, lN, lC, lT, ldV, ldN = lids(h, sp.get('lid_shade'))
    # the nose pad, on its own grid
    if h.pad:
        nc, nr_ = h.pad
        nV, nT, nN, _ = mesh_field(h.nose_sdf, lambda P: ngrad(h, P), nc - nr_ - 0.004, nc + nr_ + 0.004, NOSE_CELL, smooth=0)
        prims.append(prim(nV, nN, nose_paint(h, nV, nN, sp['nose']), none(nV), np.zeros((len(nV), 2)), nT, np.zeros(len(nV)), vids(nV), MT['nose'], rough=0.35))
    prims += [prim(eV, eN, eC, none(eV), np.zeros((len(eV), 2)), eT, np.zeros(len(eV)), vids(eV), MT['eyes'], rough=0.2),
              prim(lV, lN, lC, none(lV), np.zeros((len(lV), 2)), lT, np.zeros(len(lV)), vids(lV), MT['lids'], {'blink': (ldV, ldN)}, rough=0.8)]
    if sp.get('prims'):                                   # the species' own (a beak, whiskers)
        prims += sp['prims'](h, M, {'vids': vids, 'none': none, 'mesh_field': mesh_field, 'mats': MT, 'prim': prim})
    return M, h, prims


def write_glb(path, M, prims):
    bin_, views, accs = bytearray(), [], []

    def add(arr, ctype, typ, target=None, minmax=False):
        arr = np.ascontiguousarray(arr)
        while len(bin_) % 4: bin_.append(0)
        views.append({'buffer': 0, 'byteOffset': len(bin_), 'byteLength': arr.nbytes, **({'target': target} if target else {})})
        bin_.extend(arr.tobytes())
        a = {'bufferView': len(views) - 1, 'componentType': ctype, 'count': len(arr), 'type': typ}
        if minmax:
            a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
        accs.append(a)
        return len(accs) - 1
    meshes, mats = [], []
    for p in prims:
        V, N, C, U, U2, T, wn, vid, name, targets = p['V'], p['N'], p['C'], p['U'], p['U2'], p['T'], p['wn'], p['vid'], p['mat'], p['targets']
        n = len(V)
        J = np.zeros((n, 4), np.uint16); J[:, 1] = 1                     # joints: 0 Head, 1 Neck
        W = np.zeros((n, 4), np.float32); W[:, 0] = 1 - wn; W[:, 1] = wn
        attrs = {'POSITION': add(V.astype(np.float32), 5126, 'VEC3', 34962, True), 'NORMAL': add(N.astype(np.float32), 5126, 'VEC3', 34962),
                 'TEXCOORD_0': add(U.astype(np.float32), 5126, 'VEC2', 34962), 'TEXCOORD_1': add(U2.astype(np.float32), 5126, 'VEC2', 34962),
                 'COLOR_0': add(C.astype(np.float32), 5126, 'VEC3', 34962), 'JOINTS_0': add(J, 5123, 'VEC4', 34962),
                 'WEIGHTS_0': add(W, 5126, 'VEC4', 34962), '_VIDX': add(vid.astype(np.float32).reshape(-1, 1), 5126, 'SCALAR', 34962)}
        idx = add(T.astype(np.uint32).ravel(), 5125, 'SCALAR', 34963)
        mats.append({'name': name, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0,
                     'roughnessFactor': p['rough']}, **({'doubleSided': True} if p['double'] else {})})
        pr = {'attributes': attrs, 'indices': idx, 'material': len(mats) - 1}
        me = {'name': name, 'primitives': [pr]}
        if targets:                                   # morph targets (the lids' blink): the figure drives their weights
            pr['targets'] = [{'POSITION': add(dv.astype(np.float32), 5126, 'VEC3', 34962, True), 'NORMAL': add(dn.astype(np.float32), 5126, 'VEC3', 34962)}
                             for dv, dn in targets.values()]
            me['weights'] = [0.0] * len(targets)
            me['extras'] = {'targetNames': list(targets)}
        meshes.append(me)
    ibm = add(np.stack([M['ibm']['Head'], M['ibm']['Neck']]).astype(np.float32), 5126, 'MAT4')
    nodes = [{'name': 'mixamorig:Neck', 'children': [1]}, {'name': 'mixamorig:Head', 'translation': [0, 0.1, 0]}]
    for k, me in enumerate(meshes):
        nodes.append({'name': me['name'], 'mesh': k, 'skin': 0})
    js = {'asset': {'version': '2.0', 'generator': 'krator core/charactermodels/tools/heads.py'}, 'scene': 0,
          'scenes': [{'nodes': [0] + list(range(2, len(nodes)))}], 'nodes': nodes, 'meshes': meshes, 'materials': mats,
          'skins': [{'joints': [1, 0], 'inverseBindMatrices': ibm}], 'accessors': accs, 'bufferViews': views,
          'buffers': [{'byteLength': len(bin_)}]}
    jb = json.dumps(js, separators=(',', ':')).encode('utf-8')
    jb += b' ' * ((4 - len(jb) % 4) % 4)
    while len(bin_) % 4: bin_.append(0)
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(bin_)) + struct.pack('<II', len(jb), 0x4E4F534A) + jb + \
        struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
    open(path, 'wb').write(out)


def bits(n, tris):
    b = np.zeros(n, np.uint8); b[tris] = 1
    return base64.b64encode(np.packbits(b, bitorder='little').tobytes()).decode()


def species(name):
    """a species dict by id: the coyote here, the others in tools/therian.py"""
    if name == 'coyote':
        return COYOTE
    import therian
    return therian.SPECIES[name]


def all_species():
    import therian
    return [COYOTE] + [therian.SPECIES[k] for k in therian.ORDER]


def make(src, out, body, base_tris, sp=COYOTE):
    """the head's piece into the folder out (its GLB, and an empty .gshapes.bin unless make_mpfb.py writes the real
    one) and its kit item; make_mpfb.py calls it beside the other mods (its morphs and Godot shapes then come from the
    export, by _VIDX). Returns the item and its materials' tint roles"""
    mid = 'mod_head_' + sp['id']
    M, h, prims = build(body, src, sp)
    os.makedirs(out, exist_ok=True)
    write_glb(os.path.join(out, mid + '.glb'), M, prims)
    hdr = json.dumps({'meshes': {}}).encode('utf-8')
    open(os.path.join(out, mid + '.gshapes.bin'), 'wb').write(b'GSH1' + struct.pack('<I', len(hdr)) + hdr)
    # the head's skin hidden: every base triangle the Head joint carries
    T, hw = M['T'], M['hw']
    tris = np.nonzero(hw[T].mean(1) > 0.5)[0]
    have = set()
    for me in M['js']['meshes']:
        for pr in me['primitives']:
            have.add(M['js']['materials'][pr['material']]['name'])
    entry = {'id': mid, 'name': sp['name'], 'slot': 'mods', 'glb': 'pieces/%s/%s.glb' % (body, mid), 'group': 'head',
             'kind': 'therian', 'hide': bits(base_tris, tris), 'hides': int(len(tris)),
             'hide_parts': [p for p in HIDE_PARTS if p in have], 'replaces_head': True, 'furred': True,
             'fur': [[-1000.0, 1000.0, sp['fur'], 0, 0]]}
    if sp.get('test'):
        entry['test'] = True
    print(body, mid, '%s: %s vertices, %s triangles; hides %d skin triangles' % (
        ', '.join(p['mat'].split('_', 1)[1] for p in prims), ' + '.join(str(len(p['V'])) for p in prims), ' + '.join(str(len(p['T'])) for p in prims), len(tris)))
    MT = mats_of(sp)
    roles = {MT['head']: 'coat', MT['ears']: 'coat', MT['lids']: 'coat'}
    roles.update(sp.get('roles', {}))
    present = [p['mat'] for p in prims]
    return entry, {k: v for k, v in roles.items() if v and k in present}


def main():
    body, src = sys.argv[1], sys.argv[2]
    names = sys.argv[3:] or ['coyote']
    if names == ['all']:
        names = [sp['id'] for sp in all_species()]
    out = os.path.join(HERE, '..', 'pieces', body)
    kpath = os.path.join(HERE, '..', 'data', body, 'kit.json')
    kit = json.load(open(kpath, encoding='utf-8'))
    for name in names:
        sp = species(name)
        mid = 'mod_head_' + sp['id']
        entry, roles = make(src, out, body, kit['base_tris'], sp)
        # the morphs: the base skin's own entry under the head's materials, cut to the skull vertices it takes
        # (make_mpfb.py packs them from the export)
        js, b = G.glb(os.path.join(out, mid + '.glb'))
        used = np.unique(np.concatenate([np.rint(G.accessor(js, b, pr['attributes']['_VIDX']).reshape(-1)).astype(int)
                                         for me in js['meshes'] for pr in me['primitives']]))
        mb = morph_entry(src, [js['materials'][pr['material']]['name'] for me in js['meshes'] for pr in me['primitives']], used)
        if mb:
            open(os.path.join(out, mid + '.morph.bin'), 'wb').write(mb)
        at = [i for i, it in enumerate(kit['items']) if it['id'] == mid]
        if at:
            kit['items'][at[0]] = entry
        else:
            kit['items'].append(entry)
        for k in [k for k in kit['tint']['roles'] if k.startswith('Mod.%s_' % sp['id'])]:
            del kit['tint']['roles'][k]
        kit['tint']['roles'].update(roles)
        print(body, mid, 'morphs', 'yes' if mb else 'no')
    kit['tint']['gain']['coat'] = round(kit['tint']['gain']['hair'] / SHADE, 4)
    with open(kpath, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(kit, fh, indent=1)


if __name__ == '__main__':
    main()
