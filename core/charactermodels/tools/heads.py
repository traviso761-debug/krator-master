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
MAT, EYE_MAT = 'Mod.coyote_head', 'Mod.coyote_eyes'
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


def ear(P, base, tip, width, depth, side):
    """a flattened cone: wide across (width), thin front to back (depth); its front cupped"""
    ax = tip - base
    L = np.linalg.norm(ax)
    u = ax / L
    f = np.array([0.0, 0.0, 1.0]); f -= u * (f @ u); f /= np.linalg.norm(f)
    s = np.cross(u, f)
    q = P - base
    t = q @ u
    x = q @ s
    z = q @ f
    rr = np.maximum(width * np.clip(1.0 - t / L, 0.0, 1.0) ** 0.9, 0.0035 * width / depth)
    d = np.sqrt((x / np.maximum(rr, 1e-4)) ** 2 + (z / np.maximum(rr * depth / width, 1e-4)) ** 2) - 1.0
    d = d * np.minimum(rr, rr * depth / width).clip(1e-3)
    d = np.maximum(d, np.maximum(-t, t - L))
    # the cup: the front face hollowed
    cup = np.sqrt((x / np.maximum(rr * 0.7, 1e-4)) ** 2 + ((z - rr * depth / width * 0.9) / np.maximum(rr * depth / width * 0.8, 1e-4)) ** 2) - 1.0
    cup = np.maximum(cup * rr.clip(1e-3) * 0.6, np.maximum(-t + 0.008, t - L + 0.012))
    return smax(d, -cup, 0.003)


class Head:
    """the head's field, placed from the base's measures (m)"""

    def __init__(self, m):
        self.m = m
        s = m['scale']
        y0, ye, zf, zb, xw = m['chin'], m['eye_y'], m['front'], m['back'], m['half_width']
        self.s = s
        cz = zb + 0.5 * (zf - zb)
        self.cranium = (np.array([0.0, ye + 0.033 * s, cz]), np.array([xw * 0.86, 0.063 * s, (zf - zb) * 0.38]))
        root = np.array([0.0, ye - 0.012 * s, zf - 0.055 * s])
        tip = np.array([0.0, ye - 0.044 * s, zf + 0.10 * s])
        self.muzzle = (root, tip, 0.044 * s, 0.015 * s)
        self.jaw = (root + np.array([0.0, -0.034 * s, -0.025 * s]), tip + np.array([0.0, -0.024 * s, -0.022 * s]), 0.036 * s, 0.010 * s)
        self.cheeks = [(np.array([sd * xw * 0.62, ye - 0.022 * s, zf - 0.075 * s]), np.array([0.032, 0.03, 0.04]) * s) for sd in (-1, 1)]
        self.nose = (tip + np.array([0.0, 0.006 * s, 0.006 * s]), 0.0135 * s)
        nr = m['neck_r']
        self.plug = (np.array([0.0, m['cut'] + 0.06 * s, m['neck_z']]), np.array([0.0, m['cut'] - 0.035, m['neck_z']]), nr * 1.02, nr * 0.97)
        self.ears = []
        for sd in (-1, 1):
            base = np.array([sd * xw * 0.5, ye + 0.07 * s, cz - 0.012 * s])
            tip_ = base + np.array([sd * 0.04, 0.085, -0.02]) * s
            self.ears.append((base, tip_, 0.032 * s, 0.02 * s, sd))
        self.eyes = [np.array([sd * xw * 0.42, ye + 0.004 * s, zf - 0.034 * s]) for sd in (-1, 1)]
        self.eye_r = 0.0135 * s
        self.floor = m['cut'] - 0.03                 # below it nothing: the plug stands inside the neck

    def sdf(self, P):
        d = ellipsoid(P, *self.cranium)
        d = smin(d, round_cone(P, *self.muzzle), 0.03 * self.s)
        d = smin(d, round_cone(P, *self.jaw), 0.02 * self.s)
        for c, r in self.cheeks:
            d = smin(d, ellipsoid(P, c, r), 0.025 * self.s)
        d = smin(d, np.linalg.norm(P - self.nose[0], axis=1) - self.nose[1], 0.008 * self.s)
        d = smin(d, round_cone(P, *self.plug), 0.03 * self.s)
        for base, tip, w, dp, sd in self.ears:
            d = smin(d, ear(P, base, tip, w, dp, sd), 0.012 * self.s)
        for e in self.eyes:                          # the sockets the eyes sit in
            d = smax(d, -(np.linalg.norm(P - e, axis=1) - self.eye_r * 1.12), 0.004 * self.s)
        return np.maximum(d, self.floor - P[:, 1])

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
    """each vertex's shade (the tint multiplies it) and fur cover"""
    s, m = h.s, h.m
    ye, zf = m['eye_y'], m['front']
    y, z, x = V[:, 1], V[:, 2], V[:, 0]
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    col = np.full((len(V), 3), SHADE)
    cover = np.ones(len(V))
    zb = m['back']
    # the saddle: the crown and the back of the head a little darker
    top = sm(ye, ye + 0.06 * s, y) * (1 - sm(zf - 0.08 * s, zf - 0.02 * s, z))
    col *= (1.0 - 0.12 * top)[:, None]
    # the pale underside: the cheeks below the eyes, the jaw and the throat, toward the front
    under = (1 - sm(ye - 0.06 * s, ye - 0.012 * s, y)) * sm(zb + 0.35 * (zf - zb), zb + 0.65 * (zf - zb), z)
    col = col * (1 - under[:, None]) + np.array([0.93, 0.9, 0.84]) * under[:, None]
    # the ears' backs darker
    for base, tip, w, dp, sd in h.ears:
        u = (tip - base) / np.linalg.norm(tip - base)
        t = (V - base) @ u
        on = (t > 0.005) & (np.linalg.norm((V - base) - t[:, None] * u, axis=1) < w * 1.2)
        back = on & (N[:, 2] < 0)
        col[back] *= 0.55
        cover[on & (N[:, 2] > 0.2)] = 0.45              # the inner ear: sparse
    # the nose pad, the lips (the line between muzzle and jaw), the eye rims: dark and bare
    nose = np.linalg.norm(V - h.nose[0], axis=1) < h.nose[1] * 1.3
    col[nose] = 0.12
    cover[nose] = 0.0
    a, b = h.muzzle[0], h.muzzle[1]
    tm = np.clip((z - a[2]) / (b[2] - a[2]), 0, 1)
    ym = a[1] + (b[1] - a[1]) * tm - (0.028 - 0.016 * tm) * s
    lip = (z > zf - 0.025 * s) & (np.abs(y - ym) < 0.0035 * s) & (np.abs(x) > 0.004 * s) & (np.abs(N[:, 0]) > 0.3)
    col[lip] = 0.18
    cover[lip] = 0.0
    for e in h.eyes:
        r = np.linalg.norm(V - e, axis=1)
        rim = r < h.eye_r * 1.45
        col[rim] = np.minimum(col[rim], 0.2)
        cover = np.minimum(cover, sm(h.eye_r * 1.3, h.eye_r * 1.9, r))      # no fur hanging over the eye
    return np.clip(col, 0, 1), cover


def build(body, src):
    M = measure(src)
    h = Head(M['m'])
    m = M['m']
    lo = np.array([-m['half_width'] * 2.2, h.floor - 0.01, m['back'] - 0.02])
    hi = np.array([m['half_width'] * 2.2, m['top'] + 0.14 * h.s, h.nose[0][2] + 0.03])
    V, T = surface_nets(h.sdf, lo, hi, CELL)
    for _ in range(3):                                   # onto the surface
        V = V - h.sdf(V)[:, None] * h.grad(V)
    # each triangle wound to face out (the field's gradient at its centre)
    fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]])
    flip = (fn * h.grad(V[T].mean(1))).sum(1) < 0
    T[flip] = T[flip][:, ::-1]
    N = h.grad(V)
    # a smooth pass over the positions (the nets' faceting), then back onto the surface
    nb = [[] for _ in range(len(V))]
    for a, b, c in T:
        nb[a] += [b, c]; nb[b] += [a, c]; nb[c] += [a, b]
    for _ in range(2):
        V = np.array([V[n].mean(0) if n else v for v, n in zip(V, nb)]) * 0.5 + V * 0.5
        V = V - h.sdf(V)[:, None] * h.grad(V)
    N = h.grad(V)
    col, cover = paint(h, V, N)
    # the UV round the muzzle's axis, its seam under the jaw (triangles across it get their own copies)
    a = h.muzzle[0]
    phi = np.arctan2(V[:, 0], V[:, 1] - a[1])
    U = np.stack([(phi + np.pi) / (2 * np.pi), (V[:, 2] - lo[2]) / (hi[2] - lo[2])], 1)
    extra = []
    T = T.copy()
    for k in range(len(T)):
        u = U[T[k], 0]
        if u.max() - u.min() > 0.5:
            for c in range(3):
                if u[c] < 0.5:
                    extra.append(T[k, c]); T[k, c] = len(V) + len(extra) - 1
    if extra:
        ex = np.array(extra)
        V = np.concatenate([V, V[ex]]); N = np.concatenate([N, N[ex]]); col = np.concatenate([col, col[ex]])
        cover = np.concatenate([cover, cover[ex]]); U = np.concatenate([U, U[ex] + [1.0, 0.0]])
    # the metres one unit of UV spans at each vertex
    mm, mc = np.zeros(len(V)), np.zeros(len(V))
    for k in range(3):
        p, q = T[:, k], T[:, (k + 1) % 3]
        l3 = np.linalg.norm(V[p] - V[q], axis=1); l2 = np.linalg.norm(U[p] - U[q], axis=1)
        ok = l2 > 1e-9
        np.add.at(mm, p[ok], l3[ok] / l2[ok]); np.add.at(mc, p[ok], 1)
    mm = np.where(mc > 0, mm / np.maximum(mc, 1), 1.0)
    # weights: the Head, blending into the Neck at the cut
    wn = np.clip((m['cut'] + 0.02 - V[:, 1]) / 0.05, 0, 1)
    # the base vertex each takes its morph from: the nearest of the skull's
    S = np.nonzero(M['skull'])[0]
    vid = np.zeros(len(V), np.float32)
    if M['VI'] is not None:
        SP = M['P'][S]
        for k in range(0, len(V), 2048):
            d = ((V[k:k + 2048, None, :] - SP[None]) ** 2).sum(2)
            vid[k:k + 2048] = M['VI'][S[d.argmin(1)]]
    # the eyes: spheres in the sockets
    eV, eN, eC, eT = [], [], [], []
    for e in h.eyes:
        th, ph = np.meshgrid(np.linspace(0, np.pi, 12), np.linspace(0, 2 * np.pi, 17), indexing='ij')
        d = np.stack([np.sin(th) * np.sin(ph), np.cos(th), np.sin(th) * np.cos(ph)], -1).reshape(-1, 3)
        base = sum(len(x) for x in eV)
        eV.append(e + d * h.eye_r); eN.append(d)
        c = np.tile([0.85, 0.55, 0.1], (len(d), 1))
        c[d[:, 2] > 0.93] = 0.02                         # the pupil
        eC.append(c)
        for i in range(11):
            for j in range(16):
                a0, b0 = base + i * 17 + j, base + (i + 1) * 17 + j
                eT += [[a0, b0, b0 + 1], [a0, b0 + 1, a0 + 1]]
    eV, eN, eC, eT = np.concatenate(eV), np.concatenate(eN), np.concatenate(eC), np.array(eT)
    eVid = np.zeros(len(eV), np.float32)
    if M['VI'] is not None:
        SP = M['P'][S]
        eVid = M['VI'][S[((eV[:, None, :] - SP[None]) ** 2).sum(2).argmin(1)]].astype(np.float32)
    prims = [(V, N, col, U, np.stack([cover, mm], 1), T, wn, vid, MAT),
             (eV, eN, eC, np.full((len(eV), 2), [0.5, 2.0]), np.zeros((len(eV), 2)), eT, np.zeros(len(eV)), eVid, EYE_MAT)]
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
    for V, N, C, U, U2, T, wn, vid, name in prims:
        n = len(V)
        J = np.zeros((n, 4), np.uint16); J[:, 1] = 1                     # joints: 0 Head, 1 Neck
        W = np.zeros((n, 4), np.float32); W[:, 0] = 1 - wn; W[:, 1] = wn
        attrs = {'POSITION': add(V.astype(np.float32), 5126, 'VEC3', 34962, True), 'NORMAL': add(N.astype(np.float32), 5126, 'VEC3', 34962),
                 'TEXCOORD_0': add(U.astype(np.float32), 5126, 'VEC2', 34962), 'TEXCOORD_1': add(U2.astype(np.float32), 5126, 'VEC2', 34962),
                 'COLOR_0': add(C.astype(np.float32), 5126, 'VEC3', 34962), 'JOINTS_0': add(J, 5123, 'VEC4', 34962),
                 'WEIGHTS_0': add(W, 5126, 'VEC4', 34962), '_VIDX': add(vid.astype(np.float32).reshape(-1, 1), 5126, 'SCALAR', 34962)}
        idx = add(T.astype(np.uint32).ravel(), 5125, 'SCALAR', 34963)
        mats.append({'name': name, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0,
                     'roughnessFactor': 0.9 if name == MAT else 0.25}})
        meshes.append({'name': name, 'primitives': [{'attributes': attrs, 'indices': idx, 'material': len(mats) - 1}]})
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


SHADE = 0.8       # the head's base shade: the kit's 'coat' gain is the hair's over it, so the head matches the coat


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
             'fur': [[0.0, 1.0, 'brush', 0, 0]]}
    print(body, ID, '%d + %d vertices, %d + %d triangles, hides %d skin triangles' % (
        len(prims[0][0]), len(prims[1][0]), len(prims[0][5]), len(prims[1][5]), len(tris)))
    return entry, {MAT: 'coat'}


def main():
    body, src = sys.argv[1], sys.argv[2]
    out = os.path.join(HERE, '..', 'pieces', body)
    kpath = os.path.join(HERE, '..', 'data', body, 'kit.json')
    kit = json.load(open(kpath, encoding='utf-8'))
    entry, roles = make(src, out, body, kit['base_tris'])
    # the morphs: the base skin's own entry under the head's materials (make_mpfb.py packs them from the export)
    mb = morph_entry(src, [MAT, EYE_MAT])
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
