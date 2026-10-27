"""The lizard head (mods.lizard_head, kit item mod_head_lizard): a Komodo dragon's head with an iguana's crest, in place
of the human head, made without Blender from the body's own base piece (the owner's reference photographs, 2026-10-27).

Two signed distance fields, meshed as the therian heads are (tools/heads.py: surface nets, each vertex projected onto
the surface, stray islands dropped, smoothed), on a 3 mm grid:
- the upper head, rigid on Head: a loft along the head (UPPER: per station its half width, its top and the mouth's
  line; a broad flat-topped section over the line, a shallow palate under it), the temples swelling behind the eyes,
  the brow ridges that hood them, the nostrils' bosses near the tip, the nape carried down into the neck, and the eye
  sockets cut out with a thick rim of lid round each;
- the lower jaw, on face_jaw (the figure opens it about the hinge: mods.JAW_MOTION): a loft (LOWER) a little narrower
  than the upper, so the upper lip's scales overhang it as a monitor's do, the heavy jowls behind the mouth's corner,
  and the throat hanging into the neck in loose folds.
Each vertex carries a colour the skin's tint multiplies (paint: the lips' paler scales, a pale ring round each eye, the
throat lighter, a dark mottle over all) and a UV in metres, each triangle projected on the plane it faces most
(heads.box_uv), for the scale texture (scale_map: the library's organic.scale, with its normal map). The eyes are
balls behind round lids, a round pupil in an iris the eye colour tints (amphibian.iris_texture); the lower lids rise to shut them (a 'blink' morph
target: a monitor shuts its eye from below). The crest: flat blades down the midline from the crown over the nape
and down the back of the neck, longest at the nape, leaning back (crest), the neck's on the neck's own weights and
deltas. The teeth (recurved, inside the closed mouth), the dark nostrils, the mouth's inside and the collar from the
neck up into the head are as the spike's (mods.lizard_head)."""
import io
import math
import os

import numpy as np
from PIL import Image

import heads as HD

HERE = os.path.dirname(os.path.abspath(__file__))
LIBRARY = os.path.join(HERE, '..', '..', 'materials', 'library', 'organic.scale')
CELL = 0.003
TILE = 0.2                 # metres of skin per repeat of the scale texture
RIGID = (-1, 1.0, 'Head', 0.0, np.zeros(3))      # a recipe: the Head joint's morph delta (the face sliders do nothing)

# the man's head, metres from the Head joint (scaled by mods.head_scale): z forward, y up
UPPER = np.array([  # z      half width  top    mouth
    (-0.118, 0.026, 0.098, 0.062),
    (-0.104, 0.052, 0.128, 0.046),
    (-0.082, 0.066, 0.150, 0.036),
    (-0.052, 0.074, 0.164, 0.032),
    (-0.015, 0.078, 0.170, 0.034),
    (0.025, 0.074, 0.168, 0.037),
    (0.065, 0.064, 0.157, 0.040),
    (0.105, 0.055, 0.140, 0.042),
    (0.145, 0.049, 0.125, 0.044),
    (0.185, 0.045, 0.113, 0.045),
    (0.215, 0.041, 0.105, 0.046),
    (0.240, 0.035, 0.097, 0.047),
    (0.257, 0.025, 0.088, 0.048),
    (0.267, 0.010, 0.076, 0.050)])
LOWER = np.array([  # z      half width  top    bottom
    (-0.060, 0.044, 0.026, -0.020),
    (-0.042, 0.062, 0.030, -0.042),
    (-0.020, 0.071, 0.036, -0.052),
    (0.025, 0.067, 0.036, -0.047),
    (0.065, 0.059, 0.038, -0.036),
    (0.105, 0.051, 0.040, -0.022),
    (0.145, 0.045, 0.042, -0.008),
    (0.185, 0.041, 0.043, 0.004),
    (0.215, 0.037, 0.044, 0.012),
    (0.238, 0.031, 0.045, 0.020),
    (0.253, 0.021, 0.046, 0.026),
    (0.262, 0.008, 0.047, 0.032)])
PALATE = 0.009             # how far the upper head reaches under the mouth's line (inside the lower jaw)
RICTUS = -0.035            # the mouth's corner: behind it, no mouth
HINGE = (-0.048, 0.042)    # z, y of the jaw's hinge
EYE = (0.038, 0.127, 0.012)   # z, y of the eye on the head's side, the eyeball's radius
CREST_NECK = 0.17          # the crest runs down the back of the neck to this far below the Head joint


def _lerp(table, col, z):
    return np.interp(z, table[:, 0], table[:, col])


def _loft(P, table, upper, k, palate=PALATE, rictus=RICTUS, n_top=2.6):
    """a loft's field: per station an ellipse-like section (flat-topped over the mouth's line, a superellipse of n_top),
    capped at both ends. palate, rictus: as PALATE, RICTUS (the frog's are its own: tools/amphibian.py)"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    zk = z / k
    w, a, b = _lerp(table, 1, zk) * k, _lerp(table, 2, zk) * k, _lerp(table, 3, zk) * k
    if upper:
        cy = b
        over = y >= cy
        # behind the mouth's corner the upper head rounds down into the jowls (a shallow palate there stood out of them
        # as a ledge)
        h = np.where(over, a - b, (palate + 0.03 * np.clip((rictus - zk) / 0.04, 0, 1)) * k)
        n = np.where(over, n_top, 2.0)
    else:
        cy = a
        under = y <= cy
        h = np.where(under, a - b, 0.006 * k)
        n = np.where(under, 2.3, 2.0)
    # both lips tuck in toward the mouth's line (widest there, the upper lip stood out over the jaw as a shelf, a tab
    # at the corner): the section narrows over the last third of its height above (below) the line
    sm = lambda t: (lambda u: u * u * (3 - 2 * u))(np.clip(t, 0, 1))
    away = (y - cy) if upper else (cy - y)
    w = w * np.where(away > 0, 0.86 + 0.14 * sm(away / (0.35 * np.abs(a - b) + 1e-9)), 0.86)
    r = ((np.abs(x) / w) ** n + (np.abs(y - cy) / h) ** n) ** (1.0 / n)
    d = (r - 1.0) * np.minimum(w, h)
    d = HD.smax(d, table[0, 0] * k - z, 0.012 * k)
    return HD.smax(d, z - table[-1, 0] * k, 0.006 * k)


class Lizard:
    """the head's fields in the Head joint's frame at rest (the body's head scale k)"""

    def __init__(self, k):
        self.k = k
        ez, ey, er = EYE
        self.eye_r = er * k
        self.eyes = []
        for sd in (-1, 1):
            # the eye on the head's side under the brow, looking out and a little forward and down
            w = _lerp(UPPER, 1, ez)
            e = np.array([sd * w * 0.84, ey, ez]) * k
            g = np.array([sd * 0.86, -0.05, 0.5]); g /= np.linalg.norm(g)
            axes = HD.frame(g, sd, 0.08)
            self.eyes.append({'c': e - g * self.eye_r * 0.55, 'open': e + g * self.eye_r * 0.1, 'axes': axes, 'side': sd})
        self.lids = (1.05, 0.82, 1.25)             # the opening's half-length, half-height and depth, of the eye's radius
        s = k
        self.brows = [(np.array([sd * 0.054, 0.150, -0.008]) * s, np.array([sd * 0.05, 0.143, 0.075]) * s, 0.009 * s, 0.007 * s)
                      for sd in (-1, 1)]
        self.temples = [(np.array([sd * 0.056, 0.104, -0.064]) * s, np.array([0.032, 0.048, 0.06]) * s) for sd in (-1, 1)]
        self.bosses = [(np.array([sd * 0.029, 0.083, 0.212]) * s, np.array([0.012, 0.010, 0.016]) * s) for sd in (-1, 1)]
        self.nostrils = [(np.array([sd * 0.037, 0.084, 0.217]) * s, np.array([0.0035, 0.003, 0.0055]) * s) for sd in (-1, 1)]
        self.nape = (np.array([0.0, 0.118, -0.082]) * s, np.array([0.0, -0.035, -0.024]) * s, 0.054 * s, 0.05 * s)
        self.ridge = (np.array([0.0, 0.16, 0.02]) * s, np.array([0.0, 0.12, -0.08]) * s, 0.012 * s, 0.014 * s)   # under the crest
        self.jowls = [(np.array([sd * 0.048, 0.004, -0.018]) * s, np.array([0.03, 0.04, 0.044]) * s) for sd in (-1, 1)]
        self.throat = (np.array([0.0, -0.028, 0.035]) * s, np.array([0.0, -0.064, -0.012]) * s, 0.044 * s, 0.046 * s)

    def upper(self, P):
        k = self.k
        d = _loft(P, UPPER, True, k)
        for c, r in self.temples:
            d = HD.smin(d, HD.ellipsoid(P, c, r), 0.03 * k)
        for a, b, ra, rb in self.brows:
            d = HD.smin(d, HD.round_cone(P, a, b, ra, rb), 0.022 * k)
        for c, r in self.bosses:
            d = HD.smin(d, HD.ellipsoid(P, c, r), 0.012 * k)
        d = HD.smin(d, HD.round_cone(P, *self.nape), 0.04 * k)
        d = HD.smin(d, HD.round_cone(P, *self.ridge), 0.02 * k)
        for c, r in self.nostrils:                   # a shallow pit in each boss (the dark nostril inside it)
            d = HD.smax(d, -HD.ellipsoid(P, c, r * 1.4), 0.002 * k)
        for e in self.eyes:                          # the lid's thick rim round the opening, the opening, the eyeball behind
            rim = HD.socket(P, e['open'], e['axes'], np.array(self.lids) * self.eye_r * np.array([1.5, 1.7, 0.8]))
            d = HD.smin(d, rim, 0.005 * k)
            d = HD.smax(d, -HD.socket(P, e['open'], e['axes'], np.array(self.lids) * self.eye_r), 0.002 * k)
        return np.maximum(d, -0.06 * k - P[:, 1])

    def lower(self, P):
        k = self.k
        d = _loft(P, LOWER, False, k)
        line = _lerp(LOWER, 2, P[:, 2] / k) * k
        for c, r in self.jowls:
            # kept under the mouth's line: blended into the jaw's top they spread it into a ledge wider than the upper
            # lip (a tab at the corner)
            d = HD.smin(d, HD.smax(HD.ellipsoid(P, c, r), P[:, 1] - (line - 0.012 * k), 0.008 * k), 0.028 * k)
        d = HD.smin(d, HD.round_cone(P, *self.throat), 0.03 * k)
        # near the mouth's line no wider than the upper lip over it (the lip overhangs the jaw), widening below
        lim = 0.9 * _lerp(UPPER, 1, P[:, 2] / k) * k + 0.5 * np.maximum(line - 0.01 * k - P[:, 1], 0)
        d = HD.smax(d, np.abs(P[:, 0]) - lim, 0.004 * k)
        # the throat's loose folds: shallow grooves across it, running back and down
        y, z = P[:, 1], P[:, 2]
        under = np.clip((-0.01 * k - y) / (0.02 * k), 0, 1) * np.clip((0.09 * k - z) / (0.04 * k), 0, 1)
        fold = 0.5 + 0.5 * np.cos(2 * np.pi * (z * 0.8 - y * 0.6) / (0.014 * k))
        d = d + 0.0016 * k * under * fold ** 3
        return np.maximum(d, -0.075 * k - P[:, 1])


def _mesh(f, lo, hi, cell):
    """heads.mesh_field on f made a distance (divided by its gradient's length), so the projection lands"""
    def gr(P, e=2e-5):
        return np.stack([f(P + np.array(o)) - f(P - np.array(o)) for o in ((e, 0, 0), (0, e, 0), (0, 0, e))], 1) / (2 * e)

    def fn(P):
        g = np.linalg.norm(gr(P), axis=1)
        return f(P) / np.maximum(g, 0.2)

    def gn(P):
        g = gr(P)
        return g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12)
    return HD.mesh_field(fn, gn, lo, hi, cell)


def _noise(V, cell, seed):
    """value noise in 0..1 (trilinear on a hashed lattice)"""
    q = V / cell
    i = np.floor(q).astype(np.int64)
    t = q - i
    t = t * t * (3 - 2 * t)

    def h(a, b, c):
        x = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791) ^ (seed * 2654435761)
        return ((x * 2246822519) % 4294967291) % 1000 / 999.0
    out = 0.0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (t[:, 0] if dx else 1 - t[:, 0]) * (t[:, 1] if dy else 1 - t[:, 1]) * (t[:, 2] if dz else 1 - t[:, 2])
                out = out + w * h(i[:, 0] + dx, i[:, 1] + dy, i[:, 2] + dz)
    return out


def paint(lz, V, N, upper):
    """each vertex's colour (the skin's tint and the scale texture multiply it) and whether it is the mouth's inside.
    After the photographs: a dark mottle over the top and sides, paler scales along both lips, a pale ring round each
    eye, the jowls and throat lighter and warmer"""
    k = lz.k
    x, y, z = V[:, 0], V[:, 1], V[:, 2]
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    col = np.ones((len(V), 3))
    n1, n2 = _noise(V, 0.016 * k, 3), _noise(V, 0.006 * k, 5)
    mott = 0.78 + 0.3 * sm(0.25, 0.75, n1) + 0.12 * (n2 - 0.5)
    col *= mott[:, None]
    top = sm(0.2, 0.8, N[:, 1]) * (1 if upper else 0)
    col *= (1 - 0.1 * top)[:, None]
    lip_y = (_lerp(UPPER, 3, z / k) if upper else _lerp(LOWER, 2, z / k)) * k
    lip = (1 - sm(0.004 * k, 0.012 * k, np.abs(y - lip_y))) * sm(RICTUS * k, (RICTUS + 0.03) * k, z)
    col = col * (1 - 0.55 * lip[:, None]) + lip[:, None] * np.array([1.16, 1.12, 0.98]) * 0.55 * (0.9 + 0.2 * n2[:, None])
    if not upper:
        pale = sm(0.0, -0.6, N[:, 1]) * sm(0.03 * k, -0.02 * k, y)
        col = col * (1 - 0.4 * pale[:, None]) + pale[:, None] * np.array([1.12, 1.06, 0.9]) * 0.4 * mott[:, None]
    for e in lz.eyes:
        rad = np.array(lz.lids) * lz.eye_r
        g, hh, v = e['axes']
        q = V - e['open']
        qn = np.sqrt(((q @ hh) / rad[0]) ** 2 + ((q @ v) / rad[1]) ** 2 + ((q @ g) / (rad[2] * 2)) ** 2)
        ring = (1 - sm(1.25, 2.1, qn)) * sm(0.9, 1.15, qn)
        col = col * (1 - 0.85 * ring[:, None]) + ring[:, None] * np.array([1.38, 1.24, 0.78]) * 0.85
        col *= (1 - 0.6 * (1 - sm(0.95, 1.12, qn)))[:, None]          # the lids' edge dark
    for c, r in lz.nostrils:
        dn = np.linalg.norm((V - c) / (r * 1.8), axis=1)
        col *= (0.25 + 0.75 * sm(0.7, 1.3, dn))[:, None]
    # the mouth's inside: under the upper's line (over the lower's), well inside the lips, ahead of the corner
    if upper:
        mouth = (y < (_lerp(UPPER, 3, z / k) - 0.002) * k) & (N[:, 1] < -0.3)
    else:
        mouth = (y > (_lerp(LOWER, 2, z / k) + 0.001) * k) & (N[:, 1] > 0.3)
    mouth &= (z > (RICTUS + 0.02) * k) & (np.abs(x) < 0.8 * _lerp(LOWER, 1, z / k) * k)
    return np.clip(col, 0, 1.4), mouth


def scale_map(mean_rgb, px=512, library=LIBRARY):
    """the library's organic.scale (or another set: the frog's skin.smooth) as the head's and the tail's skin: its
    albedo made near-colourless (its light and dark kept, its mean the body texture's, so the skin tint colours it as
    it does the skin) and its normal map; None when the library's images are not checked out (git lfs)"""
    a, n = os.path.join(library, 'albedo.jpg'), os.path.join(library, 'normal.jpg')
    try:
        im = Image.open(a).convert('L').resize((px, px), Image.LANCZOS)
        nm = Image.open(n).convert('RGB').resize((px, px), Image.LANCZOS)
    except (OSError, ValueError):
        return None
    lum = np.asarray(im, float)
    lum = 1.0 + 0.85 * (lum / lum.mean() - 1.0)
    img = np.clip(np.asarray(mean_rgb, float)[None, None, :] * lum[:, :, None], 0, 255).astype(np.uint8)
    out = []
    for x, kw in ((Image.fromarray(img, 'RGB'), {'quality': 88}), (nm, {'quality': 90})):
        bio = io.BytesIO()
        x.save(bio, 'JPEG', **kw)
        out.append((bio.getvalue(), 'image/jpeg'))
    return out


def surface(m, V, T, U, C, jw, mats, vid_of, tile=TILE):
    """a meshed field into the _Smooth surfaces m[material] (vertex colours in m[material].C); a vertex split by the UV's
    charts or a material's edge keeps one _VIDX (vid_of: per source vertex, filled as they are made)"""
    for mat in np.unique(mats):
        sm = m[mat]
        idx = {}
        for t in T[mats == mat]:
            tri = []
            for a in t:
                if a not in idx:
                    src = vid_of['src'][a]
                    known = vid_of['vid'].get(src)
                    idx[a] = sm.v(V[a], tuple(U[a] / tile), jw, RIGID, vid=known)
                    if known is None:
                        vid_of['vid'][src] = sm.VID[idx[a]]
                    sm.C.append(C[a])
                tri.append(idx[a])
            sm.T.append(tri)


def lids(lz, color=(1.25, 1.14, 0.8), open_deg=-30.0, shut_deg=42.0, span=75.0):
    """the lower lids: for each eye a band of a sphere a little larger than the eyeball, from the opening's lower edge
    down into the head (hidden there, open); the 'blink' morph turns it up over the eye to the upper edge. Pale
    scales, the edge dark"""
    V, N, C, T, dV, dN, U = [], [], [], [], [], [], []
    rl = lz.eye_r * 1.12
    open_, shut = np.radians(open_deg), np.radians(shut_deg)
    A = np.radians(np.linspace(-80.0, 80.0, 21))
    F = np.radians(np.linspace(0.0, span, max(10, int(span / 7.5))))
    for e in lz.eyes:
        g, hh, v = e['axes']
        base = sum(len(x) for x in V)
        aa, ff = np.meshgrid(A, F, indexing='ij')

        def at(phi):
            d = np.cos(aa)[..., None] * (np.cos(phi)[..., None] * g + np.sin(phi)[..., None] * v) + np.sin(aa)[..., None] * hh
            return d.reshape(-1, 3)
        d0, d1 = at(open_ - ff), at(shut - ff)
        V.append(e['c'] + d0 * rl); N.append(d0)
        dV.append((d1 - d0) * rl); dN.append(d1 - d0)
        c = np.tile(color, (len(d0), 1))
        c[ff.ravel() < np.radians(10.0)] = 0.25
        C.append(c)
        U.append(np.stack([aa.ravel() * rl, ff.ravel() * rl], 1))
        na, nf = len(A), len(F)
        for i in range(na - 1):
            for j in range(nf - 1):
                p0, p1 = base + i * nf + j, base + (i + 1) * nf + j
                T += [[p0, p1, p1 + 1], [p0, p1 + 1, p0 + 1]]
    V, N, C, dV, dN, U = (np.concatenate(x) for x in (V, N, C, dV, dN, U))
    T = np.array(T)
    fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]])
    flip = (fn * N[T].mean(1)).sum(1) < 0
    T[flip] = T[flip][:, ::-1]
    return V, N, C, T, dV, dN, U


def _midline_top(f, z, y0, y1, n=40):
    """the highest y in [y0, y1] where field f crosses at (0, y, z)"""
    ys = np.linspace(y1, y0, n)
    P = np.stack([np.zeros(n), ys, np.full(n, z)], 1)
    d = f(P)
    i = int(np.argmax(d < 0))
    if d[i] >= 0:
        return None
    lo, hi = ys[i], ys[i - 1]
    for _ in range(20):
        mid = 0.5 * (lo + hi)
        if f(np.array([[0.0, mid, z]]))[0] < 0:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)


def crest(lz, body, H, hide):
    """the crest's roots, from the crown back over the nape and down the back of the neck, a spacing apart along the
    midline: [(root, out, along, height, base vertex or None)], the head's on the upper field's midline (rigid on Head:
    rays from inside the skull, round from straight up to down the nape), the neck's on the base skin's midline below
    it (each on its nearest base vertex's weights and deltas)"""
    k = lz.k
    c = np.array([0.0, 0.06, -0.01]) * k
    pts = []
    for a in np.radians(np.linspace(-25.0, 165.0, 200)):
        d = np.array([0.0, math.cos(a), -math.sin(a)])
        t = np.linspace(0.0, 0.2 * k, 400)
        f = lz.upper(c + t[:, None] * d)
        i = np.nonzero(f > 0)[0]
        if len(i):
            p = c + t[i[0]] * d
            if p[1] < -0.03 * k:
                break
            pts.append(p)
    B = body.prims['Human.body']
    BP = B['POSITION'].astype(float) - H
    shown = np.ones(len(BP), bool)
    shown[np.unique(B['T'][hide])] = False
    mid = shown & (np.abs(BP[:, 0]) < 0.012) & (BP[:, 2] < 0.0)
    neck = []
    for y in np.arange(pts[-1][1] - 0.012 * k, -CREST_NECK * k, -0.004 * k):
        band = np.nonzero(mid & (np.abs(BP[:, 1] - y) < 0.004 * k))[0]
        if len(band):
            nb = band[np.argmin(BP[band, 2])]
            neck.append((BP[nb] + np.array([0.0, 0.0, -0.002]), nb))
    path = [(p, None) for p in pts if p[2] < 0.025 * k] + neck
    P = np.array([p for p, _ in path])
    arc = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    rows, last = [], -1
    for s_ in np.arange(0.0, arc[-1], 0.0135 * k):
        i = int(np.searchsorted(arc, s_))
        i = min(max(i, 1), len(P) - 1)
        if i == last:                  # a long step (the nape onto the neck's skin): one spine there, not several stacked
            continue
        last = i
        p, nb = path[i]
        along = P[min(i + 1, len(P) - 1)] - P[i - 1]
        along /= np.linalg.norm(along)
        out = np.cross(along, np.array([1.0, 0.0, 0.0]))
        if out[1] + (-out[2]) < 0:
            out = -out
        # raised toward straight up (on the nape and the neck the skin faces back: an iguana's spines stand up and back)
        out = out + np.array([0.0, 1.6, 0.0])
        out /= np.linalg.norm(out)
        along = along - out * (along @ out)
        along /= np.linalg.norm(along)
        rows.append([p, out, along, nb, s_ / arc[-1]])
    # heights: short on the crown, rising to the nape, tallest down the neck's upper half, then tapering
    out_ = []
    for p, o, along, nb, u in rows:
        h = 0.01 + 0.05 * min(u / 0.45, 1.0) ** 1.4 if u < 0.7 else 0.06 - 0.028 * (u - 0.7) / 0.3
        out_.append((p, o, along, h * k, nb))
    return out_


def blade(m, C, root, up, back, h, length, thick, jw, recipe, rings=5):
    """a flat spine: a lens-shaped section narrowing to a point, leaning back along back, its root sunk 4 mm"""
    side = np.cross(up, back)
    side /= np.linalg.norm(side)
    rows = []
    for r in range(rings):
        t = r / (rings - 1)
        cen = root - up * 0.004 + up * (h * t) + back * (0.3 * h * t ** 1.5)
        L = length * (1 - t) ** 0.9 + 0.0008
        th = thick * (1 - t) + 0.0004
        ring = []
        for kq, (a, b) in enumerate(((-0.5, 0), (-0.15, 1), (0.25, 1), (0.5, 0), (0.25, -1), (-0.15, -1))):
            ring.append(m.v(cen + back * (a * L) + side * (b * th * 0.5), (kq / 6, t), jw, recipe))
            C.append(np.array([0.5, 0.5, 0.52]) * (1 - t) + np.array([0.85, 0.83, 0.78]) * t)
        ring.append(m.v(m.P[ring[0]], (1.0, t), jw, None, vid=m.VID[ring[0]]))
        C.append(C[-6])
        rows.append(ring)
    m.grid(rows)
    tip = m.v(root - up * 0.004 + up * h * 1.04 + back * (0.33 * h), (0.5, 1.0), jw, recipe)
    C.append(np.array([0.85, 0.83, 0.78]))
    m.fan(rows[-1], tip)
    return tip
