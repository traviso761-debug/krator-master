"""Therian heads: a body mod that replaces the MakeHuman head with an animal's (the Coyote Men's, biomes/outlands/PLAN.md
section 6), made without Blender from the body's own base piece.

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
(covers_hair), and is 'furred': a coat does not fade out at the neck because of it. Its morph file is the base skin's
own entry under the head's material names, so its _VIDX indices move it as the skull moves.

    python3 tools/heads.py <body> <base.glb or published base .txt>      # mpfb_male, mpfb_female
writes pieces/<body>/mod_head_coyote.glb, .morph.bin (when the base carries morphs) and an empty .gshapes.bin (the
Godot twin's shapes and its skin regions come from make_mpfb.py's next run), and the kit item into data/<body>/kit.json.
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


def ear_frame(base, tip, side):
    """an ear's axes: u up it, f the way its opening faces (forward and out), s across it"""
    u = (tip - base) / np.linalg.norm(tip - base)
    f = np.array([side * 0.45, 0.0, 0.9]); f -= u * (f @ u); f /= np.linalg.norm(f)
    return u, f, np.cross(u, f)


def ear_shape(t, L, width, depth):
    """the ear's half-width and half-depth at t along it: narrowing to a point, never thinner than 6 mm (at 4.5 the
    4 mm grid frayed its edges)"""
    k = np.clip(1.0 - t / L, 0.0, 1.0)
    return np.maximum(width * k ** 0.85, 1e-4), np.maximum(depth * k, 0.006)


def ear(P, base, tip, width, depth, side):
    """a flattened cone tapering to its tip, its opening cupped (a hollow in the front, the back wall left standing)"""
    L = np.linalg.norm(tip - base)
    u, f, s = ear_frame(base, tip, side)
    q = P - base
    t, x, z = q @ u, q @ s, q @ f
    rw, rd = ear_shape(t, L, width, depth)
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
    """the head's field, placed from the base's measures (m)"""

    def __init__(self, m):
        self.m = m
        s = m['scale']
        y0, ye, zf, zb, xw = m['chin'], m['eye_y'], m['front'], m['back'], m['half_width']
        self.s = s
        cz = zb + 0.5 * (zf - zb)
        # (the sides of the skull and the cheekbones a little wider than a first guess, after the owner's photographs: a
        # coyote's head is broad across the cheeks and narrows sharply into the muzzle)
        self.cranium = (np.array([0.0, ye + 0.033 * s, cz]), np.array([xw * 0.93, 0.063 * s, (zf - zb) * 0.38]))
        root = np.array([0.0, ye - 0.012 * s, zf - 0.055 * s])
        tip = np.array([0.0, ye - 0.044 * s, zf + 0.10 * s])
        self.muzzle = (root, tip, 0.044 * s, 0.0125 * s)
        self.jaw = (root + np.array([0.0, -0.034 * s, -0.025 * s]), tip + np.array([0.0, -0.024 * s, -0.022 * s]), 0.036 * s, 0.010 * s)
        self.cheeks = [(np.array([sd * xw * 0.72, ye - 0.018 * s, zf - 0.072 * s]), np.array([0.038, 0.03, 0.042]) * s) for sd in (-1, 1)]
        # the cheekbones: a ridge under each eye running back toward the ear
        self.zygoma = [(np.array([sd * xw * 0.62, ye - 0.006 * s, zf - 0.045 * s]), np.array([sd * xw * 0.86, ye + 0.004 * s, zf - 0.105 * s]),
                        0.011 * s, 0.014 * s) for sd in (-1, 1)]
        self.nose = (tip + np.array([0.0, 0.004 * s, 0.006 * s]), 0.012 * s)
        # the nose pad (the rhinarium): wider than tall, its front flat, two comma nostrils on the front turning out and
        # back, a groove (the philtrum) from between them down to the lip. Its own primitive on a finer grid (nose_sdf);
        # the head carries a smaller blob under it
        c = self.nose[0]
        self.pad = (c, np.array([0.0108, 0.0082, 0.0092]) * s)
        self.pad_front = c[2] + 0.0062 * s
        self.nostrils = [(c + np.array([sd * 0.0052, -0.0016, 0.0058]) * s, sd) for sd in (-1, 1)]
        self.philtrum = (c + np.array([0.0, -0.003, 0.0062]) * s, c + np.array([0.0, -0.0105, 0.0035]) * s)
        nr = m['neck_r']
        self.plug = (np.array([0.0, m['cut'] + 0.06 * s, m['neck_z']]), np.array([0.0, m['cut'] - 0.035, m['neck_z']]), nr * 1.02, nr * 0.97)
        self.ears = []
        for sd in (-1, 1):
            base = np.array([sd * xw * 0.55, ye + 0.066 * s, cz - 0.008 * s])
            tip_ = base + np.array([sd * 0.04, 0.105, -0.012]) * s
            self.ears.append((base, tip_, 0.036 * s, 0.012 * s, sd))
        # the nape: the back of the skull carried down into the neck (a ball on a stalk without it)
        self.nape = (np.array([0.0, ye + 0.005 * s, cz - 0.045 * s]), np.array([0.0, m['cut'] + 0.025, m['neck_z'] - 0.008]),
                     0.05 * s, nr * 1.04)
        # the eyes: set into the front of the skull, each turned out a third of a right angle (a coyote's look ahead
        # and to the side), the eyeball behind lids that leave an almond, its outer corner raised
        self.eye_r = 0.0138 * s
        self.eyes = []
        for sd in (-1, 1):
            e = np.array([sd * xw * 0.42, ye + 0.006 * s, zf - 0.036 * s])
            g = np.array([sd * 0.34, 0.05, 0.94]); g /= np.linalg.norm(g)
            axes = frame(g, sd, 0.22)
            self.eyes.append({'c': e - g * self.eye_r * 0.6, 'open': e + g * self.eye_r * 0.15, 'axes': axes, 'side': sd})
        self.lids = (1.22, 0.56, 1.2)                   # the almond's half-length, half-height and depth, of the eye's radius
        self.floor = m['cut'] - 0.03                 # below it nothing: the plug stands inside the neck

    def sdf(self, P):
        d = ellipsoid(P, *self.cranium)
        d = smin(d, round_cone(P, *self.muzzle), 0.03 * self.s)
        d = smin(d, round_cone(P, *self.jaw), 0.02 * self.s)
        for c, r in self.cheeks:
            d = smin(d, ellipsoid(P, c, r), 0.025 * self.s)
        for a, b, ra, rb in self.zygoma:
            d = smin(d, round_cone(P, a, b, ra, rb), 0.018 * self.s)
        d = smin(d, ellipsoid(P, self.pad[0], self.pad[1] - 0.0045 * self.s), 0.003 * self.s)   # under the pad (nose_sdf)
        d = smin(d, round_cone(P, *self.plug), 0.03 * self.s)
        d = smin(d, round_cone(P, *self.nape), 0.04 * self.s)
        for base, tip, w, dp, sd in self.ears:                # a stub under each (the ear is its own piece)
            d = smin(d, ear(P, base, base + (tip - base) * 0.3, w * 0.8, dp, sd), 0.01 * self.s)
        for e in self.eyes:                          # the lids: a soft rim round the almond, the opening, the eyeball behind it
            rim = socket(P, e['open'], e['axes'], np.array(self.lids) * self.eye_r * np.array([1.18, 1.45, 0.75]))
            d = smin(d, rim, 0.004 * self.s)
            d = smax(d, -socket(P, e['open'], e['axes'], np.array(self.lids) * self.eye_r), 0.0025 * self.s)
        return np.maximum(d, self.floor - P[:, 1])

    def nose_sdf(self, P):
        s = self.s
        d = ellipsoid(P, *self.pad)
        d = smax(d, P[:, 2] - self.pad_front, 0.0025 * s)                     # the flat front
        for c, sd in self.nostrils:                                          # each a comma: a round hole sweeping out and back
            q = P - c
            ang = sd * 0.6
            x = q[:, 0] * np.cos(ang) - q[:, 2] * np.sin(ang)
            z = q[:, 0] * np.sin(ang) + q[:, 2] * np.cos(ang)
            hole = np.sqrt((x / (0.0034 * s)) ** 2 + (q[:, 1] / (0.0022 * s)) ** 2 + (z / (0.004 * s)) ** 2) - 1.0
            d = smax(d, -hole * 0.0022 * s, 0.0008 * s)
        a, b = self.philtrum
        d = smax(d, -(round_cone(P, a, b, 0.0011 * s, 0.0009 * s)), 0.0006 * s)
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


def morph_entry(path, mats):
    """the base skin's morph entry (KMR1, make_mpfb.py pack_morphs) re-labelled with the head's materials"""
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
    o, n = 4, struct.unpack_from('<H', buf, 4)[0]
    o += 2
    for e in range(n):
        s = o
        nl = struct.unpack_from('<H', buf, o)[0]; o += 2
        names = buf[o:o + nl].decode('utf-8').split('\n'); o += nl
        nu = struct.unpack_from('<I', buf, o)[0]; o += 4 + 4 * nu
        nt = struct.unpack_from('<H', buf, o)[0]; o += 2
        for k in range(nt):
            t, c = struct.unpack_from('<HI', buf, o); o += 6
            if c & 0x80000000:
                c = nu
            else:
                o += 4 * c
            o += 6 * c
        if 'Human.body' in names:
            mb = '\n'.join(mats).encode('utf-8')
            body = struct.pack('<H', len(mb)) + mb + buf[s + 2 + nl:o]
            return buf[:4] + struct.pack('<H', 1) + body
    return None


def paint(h, V, N):
    """each vertex's shade (the kit's coat tint multiplies it), its fur's density (1 full, under 1 fewer strands) and its
    fur's length (of the kind's pile). After the owner's coyote photographs (2026-10-26): the lips, chin, throat and
    cheeks cream; the top of the muzzle and the backs of the ears reddish; the forehead and crown a grizzled buff-grey
    with a darker streak down the middle; the fur short and sleek on the muzzle and face, long in a ruff on the cheeks
    and the neck; the ears' hollows white fluff at the base, bare above, their rims and tips dark"""
    s, m = h.s, h.m
    ye, zf, zb = m['eye_y'], m['front'], m['back']
    y, z, x = V[:, 1], V[:, 2], V[:, 0]
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    mix = lambda c, k, to: c * (1 - k[:, None]) + np.asarray(to, float) * k[:, None]
    col = np.full((len(V), 3), SHADE)
    dens = np.ones(len(V))
    ln = np.full(len(V), 0.45)
    cz = h.cranium[0][2]
    # the lip line (between the muzzle and the jaw), for what lies below it
    a, b = h.muzzle[0], h.muzzle[1]
    tm = np.clip((z - a[2]) / (b[2] - a[2]), 0, 1)
    ym = a[1] + (b[1] - a[1]) * tm - (0.028 - 0.016 * tm) * s
    front = sm(cz, zf - 0.02 * s, z)                                  # 0 at the back of the skull, 1 on the face
    muzzle = sm(zf - 0.05 * s, zf - 0.01 * s, z)
    # the crown and forehead: grizzled buff-grey, a darker streak down the middle
    crown = sm(ye - 0.005 * s, ye + 0.03 * s, y)
    col = mix(col, crown * 0.6, np.array([0.66, 0.64, 0.63]))
    streak = crown * (1 - sm(0.006 * s, 0.014 * s, np.abs(x))) * front * (1 - muzzle)
    col = col * (1 - 0.18 * streak)[:, None]
    # the top of the muzzle reddish
    top_m = muzzle * sm(0.0, 0.5, N[:, 1]) * sm(ym + 0.004 * s, ym + 0.012 * s, y)
    col = mix(col, top_m * 0.7, np.array([0.8, 0.58, 0.4]))
    # the cream: the lips and chin (below the lip line), the throat, the cheeks below the eyes, the muzzle's lower sides
    below = 1 - sm(ym - 0.001 * s, ym + 0.006 * s, y)
    cheek = (1 - sm(ye - 0.03 * s, ye - 0.008 * s, y)) * sm(zb + 0.4 * (zf - zb), zb + 0.65 * (zf - zb), z) * sm(0.012 * s, 0.03 * s, np.abs(x))
    side_m = muzzle * (1 - sm(-0.1, 0.4, N[:, 1])) * sm(0.006 * s, 0.014 * s, np.abs(x))
    throat = (1 - sm(ye - 0.07 * s, ye - 0.04 * s, y)) * sm(cz - 0.02 * s, zf - 0.04 * s, z) * sm(-0.2, 0.2, -N[:, 1] + N[:, 2])
    cream = np.clip(np.maximum.reduce([below * front, cheek, side_m, throat]), 0, 1)
    col = mix(col, cream, np.array([1.0, 0.97, 0.92]))
    # the fur's length: sleek on the muzzle and the face, a ruff on the cheeks and the neck (the crown's at 0.6 bristled)
    ln = ln * (1 - front) + 0.28 * front
    ln = ln * (1 - muzzle) + 0.18 * muzzle
    ruff = np.maximum(cheek * (1 - muzzle), (1 - sm(ye - 0.05 * s, ye - 0.02 * s, y)) * (1 - front * 0.6))
    ln = ln * (1 - ruff) + 1.0 * ruff
    # the ears
    for base, tip, w, dp, sd in h.ears:
        L = np.linalg.norm(tip - base)
        u, f, sa = ear_frame(base, tip, sd)
        q = V - base
        t, xs, zs = q @ u, q @ sa, q @ f
        rw, rd = ear_shape(t, L, w, dp)
        on = sm(0.004, 0.012, t) * (1 - sm(1.25, 1.6, np.sqrt((xs / (rw + 0.004)) ** 2 + (zs / (rd + 0.004)) ** 2)))
        nf = N @ f
        inner = on * sm(0.15, 0.55, nf) * (1 - sm(0.75, 0.95, np.abs(xs) / rw))
        back = on * sm(0.1, 0.5, -nf)
        rim = on * sm(0.72, 0.95, np.abs(xs) / rw) * (1 - inner)
        tipd = on * sm(0.62, 0.92, t / L)
        col = mix(col, back * 0.75, np.array([0.82, 0.58, 0.4]))
        col = mix(col, inner, np.array([1.0, 0.98, 0.95]))
        col = col * (1 - 0.6 * np.maximum(rim, tipd))[:, None]
        # the hollow: white fluff at its base (dense, long), bare above
        fluff = inner * (1 - sm(0.3 * L, 0.55 * L, t))
        dens = np.minimum(dens, 1 - inner + fluff)
        # no shells above the ear's lower third: on a thin ear their layers stepped along the rim and the cup seen
        # edge-on; the velvet there is its shading
        dens = np.minimum(dens, 1 - on * sm(0.28 * L, 0.42 * L, t) * (1 - fluff))
        # (short on the ear: the shells' layers stepped where its cup and rim are seen edge-on)
        ln = ln * (1 - on) + on * (0.12 * (1 - fluff) + 0.6 * fluff)
    # the nose: the head under the pad dark and bare
    nd = h.nose_sdf(V)
    col = col * (1 - 0.85 * (1 - sm(0.0, 0.004 * s, nd)))[:, None]
    dens = np.minimum(dens, sm(0.002 * s, 0.006 * s, nd))
    lip = (z > zf - 0.025 * s) & (np.abs(y - ym) < 0.0035 * s) & (np.abs(x) > 0.004 * s) & (np.abs(N[:, 0]) > 0.3)
    col[lip] = 0.15
    dens[lip] = 0.0
    for e in h.eyes:
        # the lids: a dark rim round the almond, bare, the fur coming in beyond it short; and the dark line from the
        # inner corner down the side of the muzzle
        rad = np.array(h.lids) * h.eye_r
        g, hh, v = e['axes']
        q = V - e['open']
        qn = np.sqrt(((q @ hh) / rad[0]) ** 2 + ((q @ v) / rad[1]) ** 2 + ((q @ g) / rad[2]) ** 2)
        liner = 1 - sm(1.08, 1.35, qn)
        col = col * (1 - 0.88 * liner)[:, None]
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
        col = col * (1 - 0.45 * tear)[:, None]
    return np.clip(col, 0, 1), dens, np.clip(ln, 0.05, 1.2)


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


def nose_paint(h, V, N):
    """the pad's colours (not tinted): near black, a little browner on top where it meets the fur, the nostrils and the
    philtrum black, and a fine leathery mottle"""
    s = h.s
    c = np.full((len(V), 3), [0.07, 0.055, 0.05])
    top = np.clip((V[:, 1] - h.pad[0][1]) / (h.pad[1][1]), 0, 1) * np.clip(N[:, 1], 0, 1)
    c += top[:, None] * np.array([0.06, 0.04, 0.025])
    q = np.floor(V / (0.0012 * s)).astype(np.int64)
    mott = ((q[:, 0] * 73856093) ^ (q[:, 1] * 19349663) ^ (q[:, 2] * 83492791)) % 1000 / 1000.0
    c *= (0.85 + 0.3 * mott)[:, None]
    for nc, sd in h.nostrils:
        dn = np.linalg.norm(V - nc, axis=1)
        c[dn < 0.0042 * s] = 0.012
    a, b = h.philtrum
    ab = b - a
    t = np.clip(((V - a) @ ab) / (ab @ ab), 0, 1)
    c[np.linalg.norm(V - (a + t[:, None] * ab), axis=1) < 0.0016 * s] *= 0.4
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


def lids(h):
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
        c = np.tile([SHADE * 0.75] * 3, (len(d0), 1))
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


def build(body, src):
    M = measure(src)
    h = Head(M['m'])
    m = M['m']
    S = np.nonzero(M['skull'])[0]
    SP = M['P'][S]

    def vids(P):
        """the base vertex each takes its morph from: the nearest of the skull's"""
        out = np.zeros(len(P), np.float32)
        if M['VI'] is not None:
            for k in range(0, len(P), 2048):
                out[k:k + 2048] = M['VI'][S[((P[k:k + 2048, None, :] - SP[None]) ** 2).sum(2).argmin(1)]]
        return out
    none = lambda P: np.full((len(P), 2), [0.5, 1e4])      # no fur: its triangles outside every fur row
    # the head (its ears but stubs: they are their own, finer, below)
    lo = np.array([-m['half_width'] * 2.4, h.floor - 0.01, m['back'] - 0.02])
    hi = np.array([m['half_width'] * 2.4, m['top'] + 0.06 * h.s, h.nose[0][2] + 0.03])
    V, T, N, nb = mesh_field(h.sdf, h.grad, lo, hi, CELL)
    col, dens, ln = soften(nb, *paint(h, V, N))
    V, T, U, N, col, dens, ln = box_uv(V, T, N, col, dens, ln)
    wn = np.clip((m['cut'] + 0.02 - V[:, 1]) / 0.05, 0, 1)            # the Head, into the Neck at the cut
    # (TEXCOORD_1: the fur's density and length; the strands' UV in metres)
    prims = [(V, N, col, U, np.stack([dens, ln], 1), T, wn, vids(V), MAT, None)]
    # the ears, on a finer grid (on the head's 4 mm grid their hollows stepped)
    for k, (base, tip, w, dp, sd) in enumerate(h.ears):
        lo_ = np.minimum(base, tip) - w * 1.6
        hi_ = np.maximum(base, tip) + w * 1.6
        f = lambda P, a=(base, tip, w, dp, sd): ear(P, *a)
        gr = lambda P, f=f, e=2e-5: (lambda g: g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12))(
            np.stack([f(P + np.array(o)) - f(P - np.array(o)) for o in ((e, 0, 0), (0, e, 0), (0, 0, e))], 1))
        aV, aT, aN, anb = mesh_field(f, gr, lo_, hi_, EAR_CELL)
        ac, ad, al = soften(anb, *paint(h, aV, aN))
        aV, aT, aU, aN, ac, ad, al = box_uv(aV, aT, aN, ac, ad, al)
        aU[:, 0] += 100.0 * (k + 1)                       # its strands not the head's
        prims.append((aV, aN, ac, aU, np.stack([ad, al], 1), aT, np.zeros(len(aV)), vids(aV), EAR_MAT, None))
    # the eyes: spheres behind the lids, their poles on the gaze so the iris is drawn in rings round it: a round black
    # pupil, the iris golden by the pupil and deeper amber outward, a dark limbal ring, and the little sclera the lids
    # show dark (a coyote's is hardly ever seen white, and a lighter one caught the light at the corner)
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
        gold, amber, ring, sclera = np.array([0.98, 0.76, 0.2]), np.array([0.78, 0.46, 0.08]), np.array([0.2, 0.11, 0.03]), np.array([0.16, 0.1, 0.06])
        c = gold[None] * sm(0.78, 0.92, cg)[:, None] + amber[None] * (1 - sm(0.78, 0.92, cg))[:, None]
        c = c * (1 - sm(0.7, 0.66, cg))[:, None] + ring[None] * sm(0.7, 0.66, cg)[:, None]
        c = c * (1 - sm(0.64, 0.6, cg))[:, None] + sclera[None] * sm(0.64, 0.6, cg)[:, None]
        c = c * (1 - sm(0.945, 0.955, cg))[:, None] + 0.015 * sm(0.945, 0.955, cg)[:, None]
        eC.append(c)
        for i in range(RI - 1):
            for j in range(RJ - 1):
                a0, b0 = base + i * RJ + j, base + (i + 1) * RJ + j
                eT += [[a0, b0, b0 + 1], [a0, b0 + 1, a0 + 1]]
    eV, eN, eC, eT = np.concatenate(eV), np.concatenate(eN), np.concatenate(eC), np.array(eT)
    # the lids, which blink
    lV, lN, lC, lT, ldV, ldN = lids(h)
    # the nose pad, on its own grid
    nc, nr_ = h.pad
    nV, nT, nN, _ = mesh_field(h.nose_sdf, lambda P: ngrad(h, P), nc - nr_ - 0.004, nc + nr_ + 0.004, NOSE_CELL, smooth=0)
    prims += [(nV, nN, nose_paint(h, nV, nN), none(nV), np.zeros((len(nV), 2)), nT, np.zeros(len(nV)), vids(nV), NOSE_MAT, None),
              (eV, eN, eC, none(eV), np.zeros((len(eV), 2)), eT, np.zeros(len(eV)), vids(eV), EYE_MAT, None),
              (lV, lN, lC, none(lV), np.zeros((len(lV), 2)), lT, np.zeros(len(lV)), vids(lV), LID_MAT, {'blink': (ldV, ldN)})]
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
    for V, N, C, U, U2, T, wn, vid, name, targets in prims:
        n = len(V)
        J = np.zeros((n, 4), np.uint16); J[:, 1] = 1                     # joints: 0 Head, 1 Neck
        W = np.zeros((n, 4), np.float32); W[:, 0] = 1 - wn; W[:, 1] = wn
        attrs = {'POSITION': add(V.astype(np.float32), 5126, 'VEC3', 34962, True), 'NORMAL': add(N.astype(np.float32), 5126, 'VEC3', 34962),
                 'TEXCOORD_0': add(U.astype(np.float32), 5126, 'VEC2', 34962), 'TEXCOORD_1': add(U2.astype(np.float32), 5126, 'VEC2', 34962),
                 'COLOR_0': add(C.astype(np.float32), 5126, 'VEC3', 34962), 'JOINTS_0': add(J, 5123, 'VEC4', 34962),
                 'WEIGHTS_0': add(W, 5126, 'VEC4', 34962), '_VIDX': add(vid.astype(np.float32).reshape(-1, 1), 5126, 'SCALAR', 34962)}
        idx = add(T.astype(np.uint32).ravel(), 5125, 'SCALAR', 34963)
        mats.append({'name': name, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0,
                     'roughnessFactor': {MAT: 0.9, EAR_MAT: 0.9, LID_MAT: 0.8, NOSE_MAT: 0.35}.get(name, 0.2)}})
        prim = {'attributes': attrs, 'indices': idx, 'material': len(mats) - 1}
        me = {'name': name, 'primitives': [prim]}
        if targets:                                   # morph targets (the lids' blink): the figure drives their weights
            prim['targets'] = [{'POSITION': add(dv.astype(np.float32), 5126, 'VEC3', 34962, True), 'NORMAL': add(dn.astype(np.float32), 5126, 'VEC3', 34962)}
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


SHADE = 0.7       # the head's base shade: the kit's 'coat' gain is the hair's over it, so the head matches the coat


def make(src, out, body, base_tris):
    """the head's piece into the folder out (its GLB, and an empty .gshapes.bin unless make_mpfb.py writes the real
    one) and its kit item; make_mpfb.py calls it beside the other mods (its morphs and Godot shapes then come from the
    export, by _VIDX)"""
    M, h, prims = build(body, src)
    os.makedirs(out, exist_ok=True)
    write_glb(os.path.join(out, ID + '.glb'), M, prims)
    hdr = json.dumps({'meshes': {}}).encode('utf-8')
    open(os.path.join(out, ID + '.gshapes.bin'), 'wb').write(b'GSH1' + struct.pack('<I', len(hdr)) + hdr)
    # the head's skin hidden: every base triangle the Head joint carries
    T, hw = M['T'], M['hw']
    tris = np.nonzero(hw[T].mean(1) > 0.5)[0]
    have = set()
    for me in M['js']['meshes']:
        for pr in me['primitives']:
            have.add(M['js']['materials'][pr['material']]['name'])
    entry = {'id': ID, 'name': 'Coyote head', 'slot': 'mods', 'glb': 'pieces/%s/%s.glb' % (body, ID), 'group': 'head',
             'kind': 'therian', 'hide': bits(base_tris, tris), 'hides': int(len(tris)),
             'hide_parts': [p for p in HIDE_PARTS if p in have], 'covers_hair': True, 'furred': True,
             'fur': [[-1000.0, 1000.0, 'brush', 0, 0]]}
    print(body, ID, 'head, ears, nose, eyes, lids: %s vertices, %s triangles; hides %d skin triangles' % (
        ' + '.join(str(len(p[0])) for p in prims), ' + '.join(str(len(p[5])) for p in prims), len(tris)))
    return entry, {MAT: 'coat', EAR_MAT: 'coat', LID_MAT: 'coat'}


def main():
    body, src = sys.argv[1], sys.argv[2]
    out = os.path.join(HERE, '..', 'pieces', body)
    kpath = os.path.join(HERE, '..', 'data', body, 'kit.json')
    kit = json.load(open(kpath, encoding='utf-8'))
    entry, roles = make(src, out, body, kit['base_tris'])
    # the morphs: the base skin's own entry under the head's materials (make_mpfb.py packs them from the export)
    mb = morph_entry(src, [MAT, EAR_MAT, EYE_MAT, NOSE_MAT, LID_MAT])
    if mb:
        open(os.path.join(out, ID + '.morph.bin'), 'wb').write(mb)
    kit['items'] = [it for it in kit['items'] if it['id'] != ID] + [entry]
    kit['tint']['roles'].update(roles)
    kit['tint']['gain']['coat'] = round(kit['tint']['gain']['hair'] / SHADE, 4)
    with open(kpath, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(kit, fh, indent=1)
    print(body, 'morphs', 'yes' if mb else 'no')


if __name__ == '__main__':
    main()
