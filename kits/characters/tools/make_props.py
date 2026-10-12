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
       'flame': ([1.0, 0.55, 0.15], 0.0, 1.0), 'glass': ([0.95, 0.8, 0.45], 0.0, 0.2), 'clay': ([0.62, 0.38, 0.24], 0.0, 0.85)}


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
    # a round shield on the palm side (+X): the hand holds its centre grip
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


# where the left hand may hold a two-handed prop, when the clip says two_hands: a segment of its handle ([x0, y0, z0,
# x1, y1, z1] in the prop's frame). The figure slides the hand along it to the point nearest where the clip has the
# hand, and turns it round the segment as little as it can; a gun's segment runs along the fore-stock
SUPPORT = {'spear': [0, 0.3, 0, 0, 1.0, 0], 'hoe': [0, -0.4, 0, 0, 0.9, 0], 'pickaxe': [0, -0.12, 0, 0, 0.5, 0],
           'axe': [0, -0.12, 0, 0, 0.45, 0], 'warhammer': [0, -0.1, 0, 0, 0.5, 0], 'mace': [0, -0.1, 0, 0, 0.38, 0],
           'sword': [0, -0.1, 0, 0, -0.1, 0],
           'rifle': [0, 0.06, 0.16, 0, 0.06, 0.42], 'crossbow': [0, 0.075, 0.1, 0, 0.075, 0.3]}
# how the hand closes on it (make_mpfb.py hands(): fist, trigger: the index finger along the barrel, wide: round a cup)
GRIP = {'pistol': 'trigger', 'rifle': 'trigger', 'crossbow': 'trigger', 'cup': 'wide'}
STRING = {'bow': [0, 0.72, -0.09, 0, -0.72, -0.09]}

PROPS = [('sword', 'Sword', 'R', sword), ('dagger', 'Dagger', 'R', dagger), ('axe', 'Axe', 'R', axe),
         ('mace', 'Mace', 'R', mace), ('warhammer', 'War hammer', 'R', warhammer), ('spear', 'Spear', 'R', spear),
         ('shield', 'Shield', 'L', shield), ('bow', 'Bow', 'L', bow), ('crossbow', 'Crossbow', 'R', crossbow),
         ('rifle', 'Rifle', 'R', rifle), ('pistol', 'Pistol', 'R', pistol), ('pickaxe', 'Pickaxe', 'R', pickaxe),
         ('hoe', 'Hoe', 'R', hoe), ('hammer', 'Hammer', 'R', hammer), ('bucket', 'Bucket', 'R', bucket),
         ('cup', 'Cup', 'R', cup), ('lantern', 'Lantern', 'L', lantern), ('torch', 'Torch', 'L', torch),
         ('arrow', 'Arrow', 'R', arrow)]


def write(path, m):
    g = glbio.GlbWriter()
    g.j['asset']['generator'] = 'kits/characters/make_props.py'
    mats, prims = [], []
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
        mats.append(mat)
        prims.append({'attributes': {'POSITION': g.acc(P.astype(np.float32), 'VEC3', 34962, minmax=True),
                                     'NORMAL': g.acc(N, 'VEC3', 34962)},
                      'indices': g.acc(np.arange(len(P), dtype=np.uint32), 'SCALAR', 34963), 'material': len(mats) - 1})
    g.j['materials'] = mats
    g.j['meshes'] = [{'name': os.path.basename(path)[:-4], 'primitives': prims}]
    g.j['nodes'] = [{'name': os.path.basename(path)[:-4], 'mesh': 0}]
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(path, 'wb').write(g.bytes())


def main():
    os.makedirs(OUT, exist_ok=True)
    out = []
    for pid, label, hand, build in PROPS:
        m = Mesh()
        build(m)
        write(os.path.join(OUT, pid + '.glb'), m)
        out.append({'id': pid, 'label': label, 'hand': hand, 'glb': 'pieces/props/%s.glb' % pid, 'grip': GRIP.get(pid, 'fist')})
        if pid in SUPPORT:
            out[-1]['support'] = SUPPORT[pid]
        if pid in STRING:
            out[-1]['string'], out[-1]['arrow'] = STRING[pid], 'arrow'
        print('%-10s %s %6d tris' % (pid, hand, sum(len(t) for t in m.parts.values())))
    json.dump({'about': 'Hand-held props (tools/make_props.py), modelled in the grip frame: +Y along the handle, +Z where '
               'the fingers point, +X out of the palm; hand R or L. grip: how the hand closes (skeleton.json hands curls). '
               'support: the segment of the handle the left hand may hold when a clip\'s two_hands names the prop. string: a bow '
               'string\'s ends (the figure draws it, through the drawing hand, and nocks the arrow prop). '
               'data/clips.json hold says which clip holds what.',
               'props': out}, open(os.path.join(HERE, 'data', 'props.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
