#!/usr/bin/env python3
"""Hand-held props for the characters: weapons, tools and a few daily things, built from primitives.

  python3 tools/make_props.py        # -> pieces/props/<id>.glb, data/props.json

Every prop is modelled in the GRIP FRAME the figure attaches it in (make_mpfb.py writes one per hand into
skeleton.json 'hands'): origin where the closed hand holds it, +Y along the handle (out past the thumb and index
finger on the right hand), +Z the way the fingers point (a blade's edge, a barrel), +X out of the palm. Metres. Flat
shaded, one primitive per material. data/props.json lists them with the hand they go in; data/clips.json says which
clip holds what.
"""
import json, math, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glbio

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'pieces', 'props')
MAT = {'steel': ([0.70, 0.72, 0.75], 0.85, 0.32), 'iron': ([0.30, 0.30, 0.32], 0.8, 0.5),
       'wood': ([0.42, 0.27, 0.15], 0.0, 0.75), 'darkwood': ([0.24, 0.15, 0.09], 0.0, 0.7),
       'leather': ([0.22, 0.13, 0.08], 0.0, 0.8), 'brass': ([0.76, 0.58, 0.28], 0.9, 0.35),
       'string': ([0.85, 0.80, 0.68], 0.0, 0.9), 'paint': ([0.55, 0.12, 0.09], 0.0, 0.6),
       'flame': ([1.0, 0.55, 0.15], 0.0, 1.0), 'glass': ([0.95, 0.8, 0.45], 0.0, 0.2), 'clay': ([0.62, 0.38, 0.24], 0.0, 0.85),
       'bread': ([0.72, 0.47, 0.22], 0.0, 0.9), 'stew': ([0.45, 0.24, 0.10], 0.0, 0.5),
       'wicker': ([0.66, 0.50, 0.28], 0.0, 0.85), 'fruit': ([0.62, 0.10, 0.08], 0.0, 0.55),
       # the trades' props (2026-11-26): textured from the material library (TEX), the colour a tint on the texture
       'twood': ([1.0, 1.0, 1.0], 0.0, 0.75), 'burlap': ([0.80, 0.66, 0.46], 0.0, 0.95),
       'tleather': ([0.46, 0.27, 0.16], 0.0, 0.6), 'parchment': ([1.0, 1.0, 1.0], 0.0, 0.85),
       'straw': ([1.0, 1.0, 1.0], 0.0, 0.95), 'net': ([1.0, 1.0, 1.0], 0.0, 0.9), 'rope': ([1.0, 1.0, 1.0], 0.0, 0.95),
       'twicker': ([0.95, 0.85, 0.65], 0.0, 0.85), 'feather': ([0.92, 0.90, 0.85], 0.0, 0.8), 'ink': ([0.05, 0.05, 0.06], 0.0, 0.4), 'grain': ([0.80, 0.66, 0.32], 0.0, 0.9)}
# a material drawn with a library texture (core/materials/library/<set>, its albedo downsampled to TEX_PX and embedded,
# about 10-20 KB a prop): the set, how many metres one repeat of it covers (UVs projected per face onto its two widest
# axes) and whether its alpha cuts out (the net: a card)
TEX = {'twood': ('wood.beam', 0.6, False), 'burlap': ('cloth.weave.burlap', 0.25, False),
       'tleather': ('leather.polished', 0.3, False), 'parchment': ('paper.parchment', 0.3, False),
       'straw': ('straw.bedding', 0.2, False), 'net': ('fibre.net', 0.35, True), 'rope': ('fibre.rope', 0.12, False),
       'twicker': ('fibre.wicker', 0.15, False)}
TEX_PX = 192
LIBRARY = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'materials', 'library')


class Mesh:
    def __init__(self):
        self.parts = {}            # material -> list of triangles (3x3 points)

    def tri(self, mat, a, b, c):
        self.parts.setdefault(mat, []).append((np.asarray(a, float), np.asarray(b, float), np.asarray(c, float)))

    def quad(self, mat, a, b, c, d):
        self.tri(mat, a, b, c)
        self.tri(mat, a, c, d)

    def loft(self, mat, rings, cap0=True, cap1=True):
        """rings: list of equal-length point loops (counter-clockwise seen from the next ring); quads between them"""
        n = len(rings[0])
        for r0, r1 in zip(rings, rings[1:]):
            for k in range(n):
                self.quad(mat, r0[k], r0[(k + 1) % n], r1[(k + 1) % n], r1[k])
        if cap0:
            c = np.mean(rings[0], 0)
            for k in range(n):
                self.tri(mat, c, rings[0][(k + 1) % n], rings[0][k])
        if cap1:
            c = np.mean(rings[-1], 0)
            for k in range(n):
                self.tri(mat, c, rings[-1][k], rings[-1][(k + 1) % n])


def ring(c, axis, r, n=8, rx=None, phase=0.0):
    """a loop of n points round centre c, perpendicular to axis ('x', 'y' or 'z'); rx scales the first in-plane axis"""
    c = np.asarray(c, float)
    u, v = {'y': ((0, 0, 1), (1, 0, 0)), 'x': ((0, 1, 0), (0, 0, 1)), 'z': ((1, 0, 0), (0, 1, 0))}[axis]
    u, v = np.array(u, float), np.array(v, float)
    a = rx if rx is not None else r
    return [c + u * a * math.cos(phase + 2 * math.pi * k / n) + v * r * math.sin(phase + 2 * math.pi * k / n)
            for k in range(n)]


def rod(m, mat, axis, p0, p1, r0, r1=None, n=8, rx0=None, rx1=None):
    r1 = r0 if r1 is None else r1
    m.loft(mat, [ring(p0, axis, r0, n, rx0), ring(p1, axis, r1, n, rx1)])


def box(m, mat, c, s):
    c, s = np.asarray(c, float), np.asarray(s, float) / 2
    p = [c + s * np.array(v) for v in [(-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1),
                                       (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]]
    for f in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (2, 3, 7, 6), (1, 2, 6, 5), (0, 4, 7, 3)):
        m.quad(mat, *[p[i] for i in f])


def ball(m, mat, c, r, n=8):
    c = np.asarray(c, float)
    rings = [ring(c + np.array([0, r * math.cos(t), 0]), 'y', max(r * math.sin(t), 1e-4), n)
             for t in np.linspace(0.35, math.pi - 0.35, 4)]
    m.loft(mat, rings[::-1])


def blade(m, mat, y0, y1, w0, w1, t, tip, z=0.0, axis='y', sign=1):
    """a diamond-section blade along +Y (or another axis): width along Z, thickness along X, ending in a point"""
    def sec(y, w, th):
        return [np.array([0, y, z + w / 2]), np.array([th / 2, y, z]), np.array([0, y, z - w / 2]), np.array([-th / 2, y, z])]
    rings = [sec(y0, w0, t), sec(y1, w1, t * 0.8)]
    m.loft(mat, rings, cap1=False)
    tipp = np.array([0, y1 + tip, z])
    r = rings[-1]
    for k in range(4):
        m.tri(mat, r[k], r[(k + 1) % 4], tipp)


def arc(m, mat, pts, r, n=6):
    """a tube along a polyline (points), radius r"""
    pts = [np.asarray(p, float) for p in pts]
    rings = []
    for i, p in enumerate(pts):
        d = pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]
        d /= np.linalg.norm(d)
        a = np.cross(d, [1, 0, 0])
        if np.linalg.norm(a) < 1e-3:
            a = np.cross(d, [0, 0, 1])
        a /= np.linalg.norm(a)
        b = np.cross(d, a)
        rings.append([p + r * (a * math.cos(2 * math.pi * k / n) + b * math.sin(2 * math.pi * k / n)) for k in range(n)])
    m.loft(mat, rings)


# ---- the props ----
def sword(m):
    rod(m, 'leather', 'y', (0, -0.075, 0), (0, 0.075, 0), 0.016)
    ball(m, 'brass', (0, -0.095, 0), 0.026)
    box(m, 'steel', (0, 0.092, 0), (0.03, 0.024, 0.20))
    blade(m, 'steel', 0.104, 0.80, 0.052, 0.038, 0.009, 0.11)


def dagger(m):
    rod(m, 'leather', 'y', (0, -0.05, 0), (0, 0.05, 0), 0.014)
    ball(m, 'brass', (0, -0.064, 0), 0.018)
    box(m, 'steel', (0, 0.062, 0), (0.024, 0.018, 0.09))
    blade(m, 'steel', 0.071, 0.25, 0.036, 0.024, 0.008, 0.07)


def axe(m):
    rod(m, 'wood', 'y', (0, -0.14, 0), (0, 0.62, 0), 0.017, 0.019)
    # the head: a wedge out to +Z, a short poll behind
    t0, t1 = 0.024, 0.004
    back = [np.array([s * t0 / 2, y, 0.0]) for s, y in ((1, 0.50), (1, 0.61), (-1, 0.61), (-1, 0.50))]
    edge = [np.array([s * t1 / 2, y, 0.17]) for s, y in ((1, 0.42), (1, 0.68), (-1, 0.68), (-1, 0.42))]
    m.loft('steel', [back, edge])
    box(m, 'iron', (0, 0.555, -0.035), (0.03, 0.08, 0.05))


def mace(m):
    rod(m, 'wood', 'y', (0, -0.12, 0), (0, 0.48, 0), 0.018)
    rod(m, 'iron', 'y', (0, 0.42, 0), (0, 0.62, 0), 0.022)
    for k in range(6):                   # flanges
        a = 2 * math.pi * k / 6
        d = np.array([math.sin(a), 0, math.cos(a)])
        p = [np.array([0, 0.45, 0]) + d * 0.02, np.array([0, 0.47, 0]) + d * 0.065, np.array([0, 0.59, 0]) + d * 0.065,
             np.array([0, 0.62, 0]) + d * 0.02]
        side = np.cross(d, [0, 1, 0]) * 0.005
        m.loft('iron', [[q + side for q in p], [q - side for q in p]], cap0=True, cap1=True)
    ball(m, 'iron', (0, 0.63, 0), 0.025)


def warhammer(m):
    rod(m, 'wood', 'y', (0, -0.12, 0), (0, 0.62, 0), 0.017)
    box(m, 'iron', (0, 0.6, 0.02), (0.06, 0.07, 0.15))
    m.loft('iron', [ring((0, 0.6, -0.055), 'z', 0.03, 4, phase=math.pi / 4), ring((0, 0.6, -0.14), 'z', 0.004, 4, phase=math.pi / 4)])


def spear(m):
    rod(m, 'wood', 'y', (0, -0.75, 0), (0, 1.25, 0), 0.016, 0.014)
    rod(m, 'iron', 'y', (0, 1.22, 0), (0, 1.30, 0), 0.02, 0.017)
    blade(m, 'steel', 1.30, 1.40, 0.05, 0.06, 0.012, 0.16)


def shield(m):
    # a round shield, the hand on its centre grip and the board out past the back of the hand (-X): made on the palm
    # side and turned half round the handle, since a shield held with the board on the palm side faced its boss into
    # the body in every clip
    s = Mesh()
    _shield(s)
    for mat, tris in s.parts.items():
        for t in tris:
            m.tri(mat, *[p * [-1, 1, -1] for p in t])


def _shield(m):
    rod(m, 'leather', 'y', (0.01, -0.06, 0), (0.01, 0.06, 0), 0.014)
    c = 0.045
    m.loft('wood', [ring((c, 0, 0), 'x', 0.32, 16), ring((c + 0.02, 0, 0), 'x', 0.32, 16)])
    m.loft('iron', [ring((c + 0.019, 0, 0), 'x', 0.33, 16), ring((c + 0.024, 0, 0), 'x', 0.33, 16)])
    m.loft('iron', [ring((c + 0.02, 0, 0), 'x', 0.07, 10), ring((c + 0.055, 0, 0), 'x', 0.035, 10)])
    m.loft('paint', [ring((c + 0.0205, 0, 0), 'x', 0.30, 16), ring((c + 0.0215, 0, 0), 'x', 0.30, 16)], cap0=False)


def bow(m):
    # held in the left hand: the grip at the origin, limbs up and down the handle axis, bending toward -Z; the string
    # runs behind (toward the archer, -Z)
    rod(m, 'leather', 'y', (0, -0.07, 0), (0, 0.07, 0), 0.02)
    up = [(0, y, -0.09 * (y / 0.72) ** 2) for y in np.linspace(0.06, 0.72, 8)]
    arc(m, 'darkwood', up, 0.012)
    arc(m, 'darkwood', [(x, -y, z) for x, y, z in up], 0.012)
    # no string: the figure draws it live between STRING's two ends, through the drawing hand when there is one


def crossbow(m):
    rod(m, 'wood', 'y', (0, -0.05, 0), (0, 0.06, 0.02), 0.018)
    box(m, 'wood', (0, 0.075, 0.08), (0.04, 0.04, 0.62))
    box(m, 'wood', (0, 0.04, -0.2), (0.035, 0.09, 0.14))
    arc(m, 'darkwood', [(x, 0.09, 0.36 - 0.25 * x * x) for x in np.linspace(-0.32, 0.32, 9)], 0.012)
    arc(m, 'string', [(-0.32, 0.09, 0.335), (0, 0.095, 0.18), (0.32, 0.09, 0.335)], 0.002, 4)


def rifle(m):
    rod(m, 'darkwood', 'y', (0, -0.06, 0), (0, 0.05, 0.02), 0.017)
    box(m, 'darkwood', (0, 0.0, -0.22), (0.04, 0.12, 0.34))          # butt stock
    box(m, 'darkwood', (0, 0.06, 0.2), (0.04, 0.04, 0.5))            # fore stock
    rod(m, 'iron', 'z', (0, 0.085, -0.02), (0, 0.085, 0.78), 0.011)   # barrel
    box(m, 'iron', (0, 0.07, 0.02), (0.035, 0.03, 0.08))            # lock


def pistol(m):
    rod(m, 'darkwood', 'y', (0, -0.06, -0.01), (0, 0.04, 0.01), 0.016)
    ball(m, 'brass', (0, -0.07, -0.015), 0.02)
    box(m, 'darkwood', (0, 0.06, 0.06), (0.032, 0.035, 0.16))
    rod(m, 'iron', 'z', (0, 0.07, 0.02), (0, 0.07, 0.25), 0.009)
    box(m, 'iron', (0, 0.055, 0.0), (0.03, 0.025, 0.05))


def pickaxe(m):
    rod(m, 'wood', 'y', (0, -0.14, 0), (0, 0.62, 0), 0.017)
    for s in (1, -1):
        p0 = np.array([0, 0.6, 0.0])
        pts = [p0 + np.array([0, -0.0 - 0.06 * t * t, s * 0.26 * t]) for t in np.linspace(0, 1, 5)]
        rings = [ring(p, 'z', 0.022 * (1 - 0.85 * k / 4), 4, phase=math.pi / 4) for k, p in enumerate(pts)]
        m.loft('iron', rings if s > 0 else [r[::-1] for r in rings])


def hoe(m):
    rod(m, 'wood', 'y', (0, -0.45, 0), (0, 1.05, 0), 0.016)
    box(m, 'iron', (0, 1.05, 0.04), (0.03, 0.04, 0.09))
    box(m, 'iron', (0, 1.0, 0.12), (0.15, 0.13, 0.008))


def hammer(m):
    rod(m, 'wood', 'y', (0, -0.08, 0), (0, 0.30, 0), 0.014)
    box(m, 'iron', (0, 0.32, 0.01), (0.04, 0.045, 0.13))


def bucket(m):
    # carried by its bail: the bail along the handle axis, the pail hanging below the fingers (+Z)
    arc(m, 'iron', [(0, -0.12, 0.13), (0, -0.1, 0.03), (0, 0, 0), (0, 0.1, 0.03), (0, 0.12, 0.13)], 0.004, 4)
    m.loft('wood', [ring((0, 0, 0.13), 'z', 0.12, 12), ring((0, 0, 0.36), 'z', 0.10, 12)], cap0=False)
    m.loft('iron', [ring((0, 0, 0.17), 'z', 0.118, 12), ring((0, 0, 0.18), 'z', 0.118, 12)], cap0=False, cap1=False)


def cup(m):
    m.loft('clay', [ring((0.035, -0.05, 0), 'y', 0.035, 10), ring((0.035, 0.06, 0), 'y', 0.042, 10)], cap1=False)


def bowl(m):
    # a wooden bowl standing on the palm: its foot at the grip, opening out of the palm (+X); the figure turns the hand
    # palm up under it
    rings = [ring((x, 0, 0), 'x', r, 12) for x, r in ((0.0, 0.035), (0.012, 0.06), (0.035, 0.08), (0.06, 0.088))]
    m.loft('wood', rings, cap0=True, cap1=False)
    m.loft('stew', [ring((0.045, 0, 0), 'x', 0.082, 12), ring((0.046, 0, 0), 'x', 0.001, 12)], cap0=False, cap1=False)


def bread(m):
    # a round of flatbread held in the fingers, its middle out of the palm (+X) and toward the fingertips (+Z)
    m.loft('bread', [ring((0.02 + x, 0, 0.03), 'x', max(r, 1e-3), 10) for x, r in
                     ((0.0, 0.025), (0.008, 0.045), (0.02, 0.05), (0.032, 0.045), (0.04, 0.025))])


def basket(m):
    # a picker's basket carried by its handle (the owner, 2026-11-26: Pick into basket demoed with one): the handle an
    # arch along the grip's handle axis, the basket hanging below the fingers (+Z) like the bucket, a few fruit in it
    arc(m, 'wicker', [(0, -0.15 * math.sin(a), 0.2 - 0.2 * math.cos(a) * 1.0) for a in np.linspace(-math.pi / 2, math.pi / 2, 9)],
        0.008, 5)
    m.loft('wicker', [ring((0, 0, 0.2), 'z', 0.16, 14), ring((0, 0, 0.3), 'z', 0.15, 14), ring((0, 0, 0.4), 'z', 0.12, 14)],
           cap0=False)
    m.loft('wicker', [ring((0, 0, 0.198), 'z', 0.166, 14), ring((0, 0, 0.214), 'z', 0.166, 14)], cap0=False, cap1=False)
    for x, y, z in ((0.05, 0.04, 0.25), (-0.06, 0.03, 0.26), (0.01, -0.07, 0.25), (-0.02, 0.0, 0.27)):
        ball(m, 'fruit', (x, y, z), 0.035, 6)


# the push clip's hands (make_pieces.handles_clip) on the cart's crossbar: the bar along the figure's left (+x), the
# fingers forward over it (+z, a little down), at HANDLE metres off the ground, the left hand WIDTH along the bar
CART_HANDLE, CART_WIDTH = 1.05, 0.46


def cart(m):
    # a two-wheeled handcart pushed by its crossbar (the owner, 2026-11-26: Push demoed with one). Made in the figure's
    # frame from the right hand's grip (x the figure's left, y up, z forward; the ground CART_HANDLE below) and turned
    # into the grip frame the clip holds it in, so its wheels stand on the ground when the hands are on the bar
    f = Mesh()
    g = -CART_HANDLE
    rod(f, 'wood', 'x', (-0.09, 0, 0), (CART_WIDTH + 0.09, 0, 0), 0.017)                 # the crossbar
    for x in (-0.05, CART_WIDTH + 0.05):                                                 # two shafts to the bed
        arc(f, 'wood', [(x, 0, 0.0), (x, g + 0.62, 0.5), (x, g + 0.6, 1.35)], 0.022, 6)
    cx, w = CART_WIDTH / 2, 0.62
    box(f, 'wood', (cx, g + 0.58, 0.92), (w, 0.04, 0.86))                               # the bed
    for sx in (-1, 1):
        box(f, 'darkwood', (cx + sx * w / 2, g + 0.71, 0.92), (0.03, 0.24, 0.86))       # its sides
    box(f, 'darkwood', (cx, g + 0.71, 0.505), (w, 0.24, 0.03))
    box(f, 'darkwood', (cx, g + 0.71, 1.335), (w, 0.24, 0.03))
    rod(f, 'iron', 'x', (cx - w / 2 - 0.08, g + 0.34, 1.0), (cx + w / 2 + 0.08, g + 0.34, 1.0), 0.02)   # the axle
    for sx in (-1, 1):
        x = cx + sx * (w / 2 + 0.06)
        rim = [(x, g + 0.34 + 0.32 * math.cos(a), 1.0 + 0.32 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 19)]
        arc(f, 'iron', rim, 0.022, 5)
        for k in range(6):
            a = math.pi * k / 6
            arc(f, 'wood', [(x, g + 0.34 + 0.3 * math.cos(a), 1.0 + 0.3 * math.sin(a)),
                            (x, g + 0.34 - 0.3 * math.cos(a), 1.0 - 0.3 * math.sin(a))], 0.012, 5)
        rod(f, 'iron', 'x', (x - 0.05, g + 0.34, 1.0), (x + 0.05, g + 0.34, 1.0), 0.045)
    box(f, 'darkwood', (cx, g + 0.29, 1.3), (0.05, 0.3, 0.05))                          # a leg to stand it on
    Y = np.array(GROUND['cart']['y'], float)
    Z = np.array(GROUND['cart']['z'], float)
    Z /= np.linalg.norm(Z)
    G = np.stack([np.cross(Y, Z), Y, Z], 1)                                             # grip -> figure
    for mat, tris in f.parts.items():
        for t in tris:
            m.tri(mat, *[G.T @ p for p in t])


def lantern(m):
    arc(m, 'iron', [(0, -0.05, 0.05), (0, 0, 0), (0, 0.05, 0.05)], 0.003, 4)
    m.loft('iron', [ring((0, 0, 0.05), 'z', 0.04, 6), ring((0, 0, 0.07), 'z', 0.07, 6)])
    m.loft('glass', [ring((0, 0, 0.07), 'z', 0.06, 6), ring((0, 0, 0.19), 'z', 0.06, 6)], cap0=False, cap1=False)
    m.loft('iron', [ring((0, 0, 0.19), 'z', 0.07, 6), ring((0, 0, 0.21), 'z', 0.07, 6)])


def torch(m):
    rod(m, 'wood', 'y', (0, -0.2, 0), (0, 0.32, 0), 0.016, 0.022)
    rod(m, 'leather', 'y', (0, 0.28, 0), (0, 0.38, 0), 0.03, 0.028)
    m.loft('flame', [ring((0, 0.38, 0), 'y', 0.03, 6), ring((0, 0.52, 0), 'y', 0.003, 6)])


def arrow(m):
    # not held in a grip: the figure lays it from the drawing hand (its nock, at the origin) toward the bow, along +Z
    rod(m, 'wood', 'z', (0, 0, 0.0), (0, 0, 0.72), 0.004, n=6)
    m.loft('iron', [ring((0, 0, 0.71), 'z', 0.008, 4, phase=math.pi / 4), ring((0, 0, 0.78), 'z', 0.0005, 4, phase=math.pi / 4)])
    for a in (0, 2 * math.pi / 3, 4 * math.pi / 3):
        d = np.array([math.cos(a), math.sin(a), 0])
        q = [np.array([0, 0, 0.02]), d * 0.016 + [0, 0, 0.03], d * 0.016 + [0, 0, 0.1], np.array([0, 0, 0.11])]
        m.quad('paint', *q)


# ---- the trades' props (2026-11-26, for tools/trade_clips.py; textured from the library: TEX) ----
def ladle(m):
    # a wooden ladle held near the top of its shaft, the shaft down along +Y (the cook clip points it down) to the
    # bowl, which opens back toward the hand (up, as it stirs)
    rod(m, 'twood', 'y', (0, -0.07, 0), (0, 0.31, 0), 0.010, 0.012)
    m.loft('twood', [ring((0, y, 0), 'y', r, 12) for y, r in ((0.305, 0.050), (0.335, 0.046), (0.36, 0.030), (0.372, 0.006))],
           cap0=False, cap1=True)


def sack(m):
    # a grain sack carried by its tied neck (it hangs from the hand like the bucket: HANG), the body below the fingers
    rod(m, 'rope', 'z', (0, 0, -0.02), (0, 0, 0.07), 0.022, 0.03, 8)
    m.loft('burlap', [ring((0, 0, z), 'z', r, 12, rx=r * 0.8) for z, r in
                      ((0.06, 0.03), (0.12, 0.13), (0.24, 0.19), (0.42, 0.205), (0.58, 0.17), (0.65, 0.06))], cap0=False)


def quill(m):
    # a quill pen, its nib forward of the fingers along +Y (the write clip points it down and forward at the page),
    # the feather back past the hand
    rod(m, 'feather', 'y', (0, -0.17, 0), (0, 0.06, 0), 0.0035, 0.0018, 5)
    rod(m, 'ink', 'y', (0, 0.06, 0), (0, 0.085, 0), 0.0018, 0.0004, 5)
    for s in (-1, 1):
        m.quad('feather', (0, -0.03, 0), (0, -0.06, s * 0.012), (0, -0.15, s * 0.016), (0, -0.175, 0))


def book(m):
    # an open book lying on the left palm (grip flat: the hand open under it; upright turns the palm up): the spine
    # along the fingers (+Z), the leaves rising a little either side, the pages out of the palm (+X)
    for s in (-1, 1):
        a = math.radians(12)
        cy, cx = s * 0.075 * math.cos(a), 0.02 + 0.075 * math.sin(a)
        for mat, h, w, t in (('tleather', 0.15, 0.225, 0.006), ('parchment', 0.142, 0.212, 0.016)):
            off = 0.0 if mat == 'tleather' else 0.011
            c = np.array([cx + off * math.cos(a), cy - s * off * math.sin(a), 0.0])
            u = np.array([math.sin(a) * s, math.cos(a), 0.0]) * (h / 2)       # across the leaf
            v = np.array([0.0, 0.0, w / 2])                                    # along the spine
            nrm = np.array([math.cos(a), -s * math.sin(a), 0.0]) * (t / 2)
            P = [c + i * u + j * v + k * nrm for k in (-1, 1) for i, j in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
            for q in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
                m.quad(mat, *[P[i] for i in q])


def oar(m):
    # an oar held at its handle, the loom running out along +Y to the blade (the row clip turns each hand so the oars
    # run out over the sides); one prop for either hand
    rod(m, 'twood', 'y', (0, -0.09, 0), (0, 0.14, 0), 0.017, 0.017)
    rod(m, 'twood', 'y', (0, 0.14, 0), (0, 2.15, 0), 0.026, 0.022)
    box(m, 'twood', (0, 2.42, 0), (0.014, 0.56, 0.15))


def paddle(m):
    # a canoe paddle held by the lower hand at the throat, the shaft up along +Y to the T-grip (the upper hand's:
    # SUPPORT), the blade below the hand
    rod(m, 'twood', 'y', (0, -0.30, 0), (0, 0.86, 0), 0.016)
    box(m, 'twood', (0, 0.88, 0), (0.03, 0.035, 0.11))
    m.loft('twood', [ring((0, y, 0), 'y', r, 8, rx=0.009) for y, r in ((-0.28, 0.02), (-0.40, 0.085), (-0.72, 0.09), (-0.82, 0.05))])


def broom(m):
    # a broom held by the lower hand on its handle, the handle up along +Y (the upper hand's: SUPPORT), the straw head
    # below on the floor ahead, bound with rope
    rod(m, 'twood', 'y', (0, -0.56, 0), (0, 0.60, 0), 0.014)
    rod(m, 'rope', 'y', (0, -0.62, 0), (0, -0.56, 0), 0.026)
    m.loft('straw', [ring((0, y, 0), 'y', r, 10, rx=r * 0.45) for y, r in ((-0.58, 0.025), (-0.66, 0.06), (-0.80, 0.10), (-0.96, 0.13))])


def saw(m):
    # a hand saw held by its handle, the blade forward along +Y (the saw clip points it forward and down at the board),
    # the teeth on the fingers' side (+Z, down)
    box(m, 'twood', (0, -0.005, 0.01), (0.03, 0.11, 0.10))
    P = [(0, 0.05, -0.03), (0, 0.62, -0.01), (0, 0.62, 0.045), (0, 0.05, 0.085)]
    m.quad('steel', *P)
    for k in range(28):
        y0 = 0.05 + 0.57 * k / 28
        y1 = 0.05 + 0.57 * (k + 1) / 28
        z0 = 0.085 - 0.04 * (k / 28)
        z1 = 0.085 - 0.04 * ((k + 1) / 28)
        m.tri('steel', (0, y0, z0), (0, y1, z1), (0, (y0 + y1) / 2, (z0 + z1) / 2 + 0.006))


def net(m):
    # a cast net gathered in the hand (it hangs like the bucket: HANG): a cone of netting, the lead weights round its
    # mouth below
    m.loft('net', [ring((0, 0, z), 'z', r, 14) for z, r in ((0.02, 0.025), (0.12, 0.06), (0.35, 0.12), (0.60, 0.17))],
           cap0=False, cap1=False)
    for k in range(10):
        a = 2 * math.pi * k / 10
        ball(m, 'iron', (0.17 * math.cos(a), 0.17 * math.sin(a), 0.61), 0.012, 5)


def feedbag(m):
    # a small feed bag hanging by its strap from the left hand (HANG), its mouth up toward the hand, grain in it
    arc(m, 'rope', [(0, -0.08, 0.07), (0, -0.03, 0.01), (0, 0.03, 0.01), (0, 0.08, 0.07)], 0.005, 5)
    m.loft('burlap', [ring((0, 0, z), 'z', r, 12) for z, r in ((0.07, 0.085), (0.16, 0.11), (0.28, 0.105), (0.31, 0.07))],
           cap0=False, cap1=True)
    m.loft('grain', [ring((0, 0, 0.09), 'z', 0.083, 12), ring((0, 0, 0.089), 'z', 0.001, 12)], cap0=False, cap1=False)


def lead(m):
    # a halter rope held in the hand, its end hanging (HANG) with a turn of slack
    arc(m, 'rope', [(0, 0, -0.03), (0, 0.01, 0.15), (0.03, 0.04, 0.35), (0.0, 0.02, 0.55), (-0.02, -0.01, 0.62)], 0.009, 6)


def shuttle(m):
    # a weaver's boat shuttle held in the fingers, along the handle axis
    m.loft('twood', [ring((0, y, 0), 'y', r, 8, rx=r * 0.6) for y, r in ((-0.12, 0.003), (-0.08, 0.016), (0.08, 0.016), (0.12, 0.003))])


def purse(m):
    # a coin purse held by its drawstring neck (it hangs from the fingers: HANG), the pouch below, a coin at its mouth
    rod(m, 'rope', 'z', (0, 0, -0.01), (0, 0, 0.03), 0.010, 0.012, 6)
    m.loft('tleather', [ring((0, 0, z), 'z', r, 10) for z, r in ((0.025, 0.014), (0.05, 0.04), (0.09, 0.05), (0.12, 0.035), (0.13, 0.004))],
           cap0=False)
    m.loft('brass', [ring((0.0, 0.012, 0.022), 'x', 0.011, 8, rx=0.002), ring((0.003, 0.012, 0.022), 'x', 0.011, 8, rx=0.002)])


def sickle(m):
    # a reaping sickle: the wooden handle in the fist, the blade curving forward and round from its top (+Y, then +Z)
    rod(m, 'twood', 'y', (0, -0.07, 0), (0, 0.06, 0), 0.016, 0.014)
    pts = [(0.06 + 0.16 * math.sin(a), 0.16 - 0.16 * math.cos(a)) for a in np.linspace(0, math.pi * 1.15, 12)]
    for (y0, z0), (y1, z1) in zip(pts, pts[1:]):
        m.quad('steel', (0, y0, z0), (0, y1, z1), (0, y1 * 0.92 + 0.004, z1 * 0.92), (0, y0 * 0.92 + 0.004, z0 * 0.92))


def censer(m):
    # a censer swung on its chains (it hangs from the hand like a lantern: HANG): a brass bowl and pierced lid below
    for a in (0, 2 * math.pi / 3, 4 * math.pi / 3):
        arc(m, 'iron', [(0, 0, 0), (0.05 * math.cos(a), 0.05 * math.sin(a), 0.42)], 0.002, 3)
    m.loft('brass', [ring((0, 0, z), 'z', r, 10) for z, r in ((0.42, 0.055), (0.47, 0.065), (0.52, 0.05), (0.54, 0.02))], cap0=True)
    m.loft('brass', [ring((0, 0, z), 'z', r, 10) for z, r in ((0.42, 0.055), (0.39, 0.045), (0.37, 0.012))], cap0=False)


def rod_fishing(m):
    # a fishing rod held at its butt, out along +Y and bending a little toward the fingers' side, the line hanging
    # from its tip
    pts = [(0, y, 0.0004 * (y * 10) ** 2) for y in np.linspace(-0.25, 2.3, 9)]
    rs = np.linspace(0.016, 0.004, 9)
    for p0, p1, r0, r1 in zip(pts, pts[1:], rs, rs[1:]):
        rod(m, 'twood', 'y', p0, p1, r0, r1, 6)
    tip = np.array(pts[-1])
    arc(m, 'string', [tip, tip + (0, -0.05, 0.5), tip + (0, -0.08, 1.1)], 0.0012, 3)


def goad(m):
    # a herder's goad: a long staff held a third of the way up, the iron point forward along +Y
    rod(m, 'twood', 'y', (0, -0.55, 0), (0, 1.25, 0), 0.015, 0.011)
    m.loft('iron', [ring((0, 1.25, 0), 'y', 0.011, 6), ring((0, 1.33, 0), 'y', 0.0008, 6)])


def beater(m):
    # a rug beater: loops of cane on a handle, the head out along +Y
    rod(m, 'twood', 'y', (0, -0.08, 0), (0, 0.32, 0), 0.013)
    for k in range(3):
        r = 0.12 - 0.03 * k
        arc(m, 'twicker', [(0, 0.32 + r * (1 - math.cos(a)), r * math.sin(a) * 0.9) for a in np.linspace(-math.pi * 0.85, math.pi * 0.85, 11)],
            0.006, 5)


def scroll(m):
    # a scroll held open across the left palm (grip flat, upright like the book): the sheet across the palm (+Y), a
    # rolled end either side on its wooden rod
    box(m, 'parchment', (0.02, 0.0, 0.0), (0.002, 0.26, 0.20))
    for s in (-1, 1):
        rod(m, 'parchment', 'z', (0.03, s * 0.13, -0.11), (0.03, s * 0.13, 0.11), 0.016)
        rod(m, 'twood', 'z', (0.03, s * 0.13, -0.13), (0.03, s * 0.13, 0.13), 0.006)


# where the left hand may hold a two-handed prop, when the clip says two_hands: a segment of its handle ([x0, y0, z0,
# x1, y1, z1] in the prop's frame). The figure slides the hand along it to the point nearest where the clip has the
# hand, and turns it round the segment as little as it can; a gun's segment runs along the fore-stock; a pistol's is
# one point, the left hand cupped round the right's fingers
SUPPORT = {'spear': [0, 0.3, 0, 0, 1.0, 0], 'hoe': [0, -0.4, 0, 0, 0.9, 0], 'pickaxe': [0, -0.12, 0, 0, 0.5, 0],
           'axe': [0, -0.12, 0, 0, 0.45, 0], 'warhammer': [0, -0.1, 0, 0, 0.5, 0], 'mace': [0, -0.1, 0, 0, 0.38, 0],
           'sword': [0, -0.1, 0, 0, -0.1, 0], 'paddle': [0, 0.45, 0, 0, 0.86, 0], 'broom': [0, 0.2, 0, 0, 0.58, 0],
           'rifle': [0, 0.06, 0.16, 0, 0.06, 0.42], 'crossbow': [0, 0.075, 0.1, 0, 0.075, 0.3],
           'pistol': [0.04, -0.03, 0.02, 0.04, -0.03, 0.02],
           'cart': [0, CART_WIDTH - 0.16, 0, 0, CART_WIDTH + 0.06, 0]}
# how the hand closes on it (make_mpfb.py hands(): fist, trigger: the index finger along the barrel, wide: round a cup)
GRIP = {'pistol': 'trigger', 'rifle': 'trigger', 'crossbow': 'trigger', 'cup': 'wide', 'bowl': 'flat', 'bread': 'wide',
        'book': 'flat', 'quill': 'trigger', 'shuttle': 'wide', 'scroll': 'flat', 'purse': 'wide'}
STRING = {'bow': [0, 0.72, -0.09, 0, -0.72, -0.09]}
# degrees a prop turns about its handle in a lower hand (the forearm held forward in its guard): the shield stands up
# with its board out, not flat like a tray (mirrored on the right)
LOW_TURN = {'shield': 90}
# the prop's axis that points down whatever the hand's turn: a bucket and a lantern hang from their bails, which lie
# along the handle axis in the fist (the figure turns the forearm to lay the bail level and swings the load about it)
HANG = {'bucket': [0, 0, 1], 'lantern': [0, 0, 1], 'basket': [0, 0, 1], 'sack': [0, 0, 1], 'net': [0, 0, 1], 'feedbag': [0, 0, 1],
        'lead': [0, 0, 1], 'censer': [0, 0, 1], 'purse': [0, 0, 1]}
# a hanging prop's body, kept out of the legs (the arm swings out at the shoulder): its radius, and from where to where
# along the hang axis (the short bodies carried the bucket in the thigh)
HANG_CLEAR = {'bucket': [0.12, 0.13, 0.36], 'lantern': [0.07, 0.05, 0.21]}
# a prop that stands on the ground (the cart's wheels): height, how far below the grip the ground is (the figure lifts or
# lowers the hand so the prop meets the ground on every body: a short body's hands come lower in the same clip); y and
# z, the prop's +Y and +Z in the figure's frame as it stands (the figure keeps it so whatever the hand's turn: a few
# degrees of wrist tipped the wheels, a metre ahead, through the floor)
GROUND = {'cart': {'height': CART_HANDLE, 'y': [1, 0, 0], 'z': [0, -0.25, 1]}}
# the grip-frame axis the figure turns the wrist to keep up (but while the hand is at the face): a cup's mouth, and a
# bowl's opening, so the open hand under it turns palm up (grip 'flat': the fingers stay as the clip has them)
UPRIGHT = {'cup': [0, 1, 0], 'bowl': [1, 0, 0], 'book': [1, 0, 0], 'scroll': [1, 0, 0]}
# the bow's arrow is this many times the bow arm's length (shoulder to wrist) on each body, so a long-armed draw
# (about 1.5 arms) leaves the head in front of the bow; the arrow model's own length
ARROW_ARM = {'bow': 1.65}
# held in front of the belly: where the wrist goes, metres from the lower spine joint (out to the hand's side, up,
# forward); the figure's arm reaches there (a bowl: the clip held the arm back, through it)
CARRY = {'bowl': [-0.12, 0.02, 0.26]}
LENGTH = {'arrow': 0.78}
# a weapon's striking part along the handle (+Y, from..to): the figure turns the wrist so it does not pass through the head
BLADE = {'sword': [0.1, 0.91], 'dagger': [0.07, 0.32], 'axe': [0.4, 0.68], 'mace': [0.42, 0.65], 'warhammer': [0.5, 0.65]}
# a gun's stock ([x0, y0, z0, x1, y1, z1, half thickness, half width, half height] in the prop's frame, along its z): the
# figure turns the wrist so it keeps out of the upper arms below the shoulder's pocket (the rifle at the hip ran its butt
# through the right upper arm), and swings the elbow so the forearm lies beside the butt's box, not in it
STOCK = {'rifle': [0, 0, -0.08, 0, 0, -0.39, 0.045, 0.02, 0.06], 'crossbow': [0, 0.04, -0.13, 0, 0.04, -0.27, 0.035, 0.0175, 0.045]}

PROPS = [('sword', 'Sword', 'R', sword), ('dagger', 'Dagger', 'R', dagger), ('axe', 'Axe', 'R', axe),
         ('mace', 'Mace', 'R', mace), ('warhammer', 'War hammer', 'R', warhammer), ('spear', 'Spear', 'R', spear),
         ('shield', 'Shield', 'L', shield), ('bow', 'Bow', 'L', bow), ('crossbow', 'Crossbow', 'R', crossbow),
         ('rifle', 'Rifle', 'R', rifle), ('pistol', 'Pistol', 'R', pistol), ('pickaxe', 'Pickaxe', 'R', pickaxe),
         ('hoe', 'Hoe', 'R', hoe), ('hammer', 'Hammer', 'R', hammer), ('bucket', 'Bucket', 'R', bucket),
         ('cup', 'Cup', 'R', cup), ('lantern', 'Lantern', 'L', lantern), ('torch', 'Torch', 'L', torch),
         ('arrow', 'Arrow', 'R', arrow), ('bowl', 'Bowl', 'R', bowl), ('bread', 'Bread', 'L', bread),
         ('basket', 'Basket', 'L', basket), ('cart', 'Handcart', 'R', cart),
         ('ladle', 'Ladle', 'R', ladle), ('sack', 'Sack', 'R', sack), ('quill', 'Quill', 'R', quill), ('book', 'Book', 'L', book),
         ('oar', 'Oar', 'R', oar), ('paddle', 'Paddle', 'R', paddle), ('broom', 'Broom', 'R', broom), ('saw', 'Saw', 'R', saw),
         ('net', 'Cast net', 'R', net), ('feedbag', 'Feed bag', 'L', feedbag), ('lead', 'Lead rope', 'R', lead),
         ('shuttle', 'Shuttle', 'R', shuttle), ('purse', 'Coin purse', 'R', purse), ('sickle', 'Sickle', 'R', sickle),
         ('censer', 'Censer', 'L', censer), ('rod', 'Fishing rod', 'R', rod_fishing), ('goad', 'Goad', 'R', goad),
         ('beater', 'Rug beater', 'R', beater), ('scroll', 'Scroll', 'L', scroll)]


def _tex_bytes(name):
    """the library set's albedo for material name, downsampled to TEX_PX: (bytes, mime)"""
    import io
    from PIL import Image
    sset, _, cut = TEX[name]
    d = os.path.join(LIBRARY, sset)
    f = next(os.path.join(d, x) for x in ('albedo.jpg', 'albedo.png') if os.path.exists(os.path.join(d, x)))
    if os.path.getsize(f) < 1000:
        sys.exit('%s is a Git LFS pointer: git lfs pull --include="core/materials/library/%s/*"' % (f, sset))
    im = Image.open(f).convert('RGBA' if cut else 'RGB').resize((TEX_PX, TEX_PX), Image.LANCZOS)
    b = io.BytesIO()
    if cut:
        im.quantize(64, method=Image.Quantize.FASTOCTREE).save(b, 'PNG', optimize=True)
        return b.getvalue(), 'image/png'
    im.save(b, 'JPEG', quality=78, optimize=True)
    return b.getvalue(), 'image/jpeg'


def _uvs(T, n, tile):
    """per-face planar UVs: each triangle projected onto the two axes its normal lies furthest from, one repeat a tile"""
    ax = np.argmax(np.abs(n), 1)
    keep = np.array([[1, 2], [0, 2], [0, 1]])[ax]                  # the two other axes, per triangle
    uv = np.take_along_axis(T, np.repeat(keep[:, None, :], 3, 1), 2)  # (n, 3, 2)
    return (uv / tile).reshape(-1, 2).astype(np.float32)


def write(path, m):
    g = glbio.GlbWriter()
    g.j['asset']['generator'] = 'core/charactermodels/make_props.py'
    mats, prims, images, textures = [], [], [], []
    for name, tris in m.parts.items():
        if not tris:
            continue
        T = np.array(tris, np.float32)                        # (n, 3, 3)
        T = T[np.linalg.norm(np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]), axis=1) > 1e-10]
        n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0])
        n /= np.linalg.norm(n, axis=1, keepdims=True)
        P = T.reshape(-1, 3)
        N = np.repeat(n, 3, 0).astype(np.float32)
        col, met, rough = MAT[name]
        mat = {'name': 'prop.' + name, 'doubleSided': True, 'pbrMetallicRoughness': {'baseColorFactor': col + [1.0], 'metallicFactor': met,
                                                                 'roughnessFactor': rough}}
        if name == 'flame':
            mat['emissiveFactor'] = col
        attrs = {'POSITION': g.acc(P.astype(np.float32), 'VEC3', 34962, minmax=True), 'NORMAL': g.acc(N, 'VEC3', 34962)}
        if name in TEX:
            data, mime = _tex_bytes(name)
            images.append({'bufferView': g.view(data), 'mimeType': mime})
            textures.append({'source': len(images) - 1, 'sampler': 0})
            mat['pbrMetallicRoughness']['baseColorTexture'] = {'index': len(textures) - 1}
            if TEX[name][2]:
                mat['alphaMode'], mat['alphaCutoff'] = 'MASK', 0.5
            attrs['TEXCOORD_0'] = g.acc(_uvs(T, n, TEX[name][1]), 'VEC2', 34962)
        mats.append(mat)
        prims.append({'attributes': attrs, 'indices': g.acc(np.arange(len(P), dtype=np.uint32), 'SCALAR', 34963), 'material': len(mats) - 1})
    if images:
        g.j['images'], g.j['textures'] = images, textures
        g.j['samplers'] = [{'wrapS': 10497, 'wrapT': 10497, 'magFilter': 9729, 'minFilter': 9987}]
    g.j['materials'] = mats
    g.j['meshes'] = [{'name': os.path.basename(path)[:-4], 'primitives': prims}]
    g.j['nodes'] = [{'name': os.path.basename(path)[:-4], 'mesh': 0}]
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(path, 'wb').write(g.bytes())


def main():
    # --only a,b,c [--out dir]: write only these props (a rebuild moves every prop's bytes by float noise, so the
    # published ones are kept), and in data/props.json replace or add just their entries
    only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
    out_dir = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else OUT
    os.makedirs(out_dir, exist_ok=True)
    out = []
    for pid, label, hand, build in PROPS:
        if only and pid not in only:
            continue
        m = Mesh()
        build(m)
        write(os.path.join(out_dir, pid + '.glb'), m)
        out.append({'id': pid, 'label': label, 'hand': hand, 'glb': 'pieces/props/%s.glb' % pid, 'grip': GRIP.get(pid, 'fist')})
        if pid in SUPPORT:
            out[-1]['support'] = SUPPORT[pid]
        if pid in LOW_TURN:
            out[-1]['low_turn'] = LOW_TURN[pid]
        if pid in HANG:
            out[-1]['hang'] = HANG[pid]
        if pid in HANG_CLEAR:
            out[-1]['hang_clear'] = HANG_CLEAR[pid]
        if pid in UPRIGHT:
            out[-1]['upright'] = UPRIGHT[pid]
        if pid in CARRY:
            out[-1]['carry'] = CARRY[pid]
        if pid in ARROW_ARM:
            out[-1]['arrow_arm'] = ARROW_ARM[pid]
        if pid in LENGTH:
            out[-1]['length'] = LENGTH[pid]
        if pid in GROUND:
            out[-1]['ground'] = GROUND[pid]
        if pid in BLADE:
            out[-1]['blade'] = BLADE[pid]
        if pid in STOCK:
            out[-1]['stock'] = STOCK[pid]
        if pid in STRING:
            out[-1]['string'], out[-1]['arrow'] = STRING[pid], 'arrow'
        print('%-10s %s %6d tris' % (pid, hand, sum(len(t) for t in m.parts.values())))
    # the imported props (tools/import_props.py: Meshy models, kept by their 'src') stay after the made ones
    pj = os.path.join(HERE, 'data', 'props.json')
    if only and os.path.exists(pj):
        prev = json.load(open(pj, encoding='utf-8'))['props']
        new = {p['id']: p for p in out}
        out = [new.pop(p['id'], p) for p in prev]
        made = [p for p in out if not p.get('src')]
        out = made + list(new.values()) + [p for p in out if p.get('src')]
    elif os.path.exists(pj):
        out += [p for p in json.load(open(pj, encoding='utf-8'))['props'] if p.get('src')]
    json.dump({'about': 'Hand-held props (tools/make_props.py), modelled in the grip frame: +Y along the handle, +Z where '
               'the fingers point, +X out of the palm; hand R or L. grip: how the hand closes (skeleton.json hands curls). '
               'support: the segment of the handle the left hand may hold when a clip\'s two_hands names the prop. string: a bow '
               'string\'s ends (the figure draws it, through the drawing hand, and nocks the arrow prop). low_turn: degrees the prop '
               'turns about its handle in a lower hand (L2, R2: the forearm held forward in its guard), mirrored on the right. '
                 'hang: the axis that points down, the load swinging about its bail (+Y) once the forearm has turned the '
                 'bail level; hang_clear: the hanging body\'s radius and its span along the hang axis, kept out of the legs. blade: '
                 'the striking part along +Y (from, to), kept out of the head (and the other hand kept out of it). stock: a gun\'s butt (a segment along z, its half thickness, half width and half height), kept out of the upper arms and the forearm beside it. upright: the axis the wrist turns to keep up '
               '(grip flat: the hand left open). carry: where the wrist goes, from the lower spine (the arm reaches there). arrow_arm: the arrow\'s length per bow-arm length; length: a prop\'s own. '
               'ground: a prop that stands on the ground (a cart): height, metres from the grip down to the ground (the hand is lifted or lowered to it); y, z: the prop\'s +Y and +Z in the figure\'s frame (kept so whatever the hand\'s turn). '
               'data/clips.json hold says which clip holds what.',
               'props': out}, open(os.path.join(HERE, 'data', 'props.json'), 'w', encoding='utf-8', newline='\n'), indent=1)


if __name__ == '__main__':
    main()
