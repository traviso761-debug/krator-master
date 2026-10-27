"""The frog head (mods.frog_head, kit item mod_head_frog): a frogman's head in place of the human one, made as the lizard's
is (tools/reptile.py: two signed distance fields meshed on a 3 mm grid), after the owner's reference paintings
(2026-10-27): broad, flat and rounded, sitting low on the shoulders with hardly a neck; the mouth a wide line from the
blunt snout round under the eardrum; big eyes bulging from turrets high on the head, gold with a horizontal pupil,
shut by the lower lid rising ('blink'); a round eardrum (tympanum) behind each eye under a ridge running back
(the dorsolateral fold); small nostrils on top of the snout; the throat a full, pale pouch.
- the upper head, rigid on Head: a loft (UPPER), the eye turrets, the folds, the eardrums dished in, the nape running
  into the shoulders;
- the lower jaw, on face_jaw: a loft (LOWER), the throat's pouch under it; near the mouth's line it is never wider
  than the upper lip (the upper overhangs it a little).
Painted per vertex (paint; the skin tint multiplies it): dark blotches over the back, a pale stripe along the upper lip,
a dark mask from the nostril through the eye to the eardrum, the eardrum dark in a pale ring, the throat and the
underside pale cream. The skin is the library's skin.smooth (moist, fine pores; reptile.scale_map), which the body
wears under the head too (kit item skin_detail)."""
import os

import numpy as np

import heads as HD
import reptile as RP

LIBRARY = os.path.join(RP.HERE, '..', '..', 'materials', 'library', 'skin.smooth')
TILE = 0.25                # metres of skin per repeat of the skin texture
UPPER = np.array([  # z      half width  top    mouth
    (-0.088, 0.035, 0.080, 0.048),
    (-0.072, 0.072, 0.102, 0.036),
    (-0.045, 0.094, 0.115, 0.030),
    (-0.010, 0.100, 0.119, 0.029),
    (0.030, 0.097, 0.117, 0.030),
    (0.065, 0.088, 0.110, 0.032),
    (0.095, 0.074, 0.099, 0.034),
    (0.118, 0.057, 0.088, 0.036),
    (0.133, 0.038, 0.078, 0.038),
    (0.142, 0.014, 0.068, 0.040)])
LOWER = np.array([  # z      half width  top    bottom (half widths to meet the upper lip flush)
    (-0.065, 0.071, 0.033, -0.015),
    (-0.040, 0.094, 0.027, -0.035),
    (0.000, 0.098, 0.026, -0.040),
    (0.040, 0.094, 0.027, -0.036),
    (0.075, 0.083, 0.029, -0.024),
    (0.100, 0.068, 0.031, -0.010),
    (0.120, 0.051, 0.033, 0.004),
    (0.134, 0.032, 0.035, 0.016),
    (0.141, 0.011, 0.036, 0.025)])
PALATE = 0.008
RICTUS = -0.045            # the mouth's corner, under the eardrum
HINGE = (-0.052, 0.034)    # z, y of the jaw's hinge
EYE = (0.045, 0.124, 0.021)   # z, y of the eye on the head's top side, the eyeball's radius
SIZE = 1.12                # the head against the body's (beside the references the first was small for the shoulders)


class Frog:
    """the head's fields in the Head joint's frame at rest (the body's head scale k)"""

    def __init__(self, k):
        k = k * SIZE
        self.k = k
        s = k
        ez, ey, er = EYE
        self.eye_r = er * k
        self.eyes, self.turrets = [], []
        for sd in (-1, 1):
            e = np.array([sd * 0.058, ey, ez]) * k
            g = np.array([sd * 0.78, 0.22, 0.58]); g /= np.linalg.norm(g)
            axes = HD.frame(g, sd, 0.0)
            # the eye bulges: the ball stands proud of a turret of skin a little narrower than it, whose rim is the lid's
            # fold (an opening cut into the turret frayed on the 3 mm grid)
            c = e + g * 0.002 * s
            self.eyes.append({'c': c, 'open': c, 'axes': axes, 'side': sd})
            self.turrets.append((c - g * 0.012 * s, np.array([0.022, 0.02, 0.022]) * s))
        self.lids = (1.0, 0.86, 1.3)
        self.folds = [(np.array([sd * 0.066, 0.113, 0.005]) * s, np.array([sd * 0.08, 0.094, -0.068]) * s, 0.0075 * s, 0.006 * s)
                      for sd in (-1, 1)]
        self.tympana = [(np.array([sd * 0.094, 0.088, -0.014]) * s, sd) for sd in (-1, 1)]
        self.tymp_r = 0.0135 * s
        self.nostrils = [(np.array([sd * 0.016, 0.0755, 0.131]) * s, np.array([0.0026, 0.0022, 0.0032]) * s) for sd in (-1, 1)]
        self.nape = (np.array([0.0, 0.075, -0.058]) * s, np.array([0.0, -0.04, -0.028]) * s, 0.062 * s, 0.056 * s)
        self.pouch = (np.array([0.0, -0.022, 0.035]) * s, np.array([0.074, 0.042, 0.078]) * s)
        self.throat = (np.array([0.0, -0.03, 0.02]) * s, np.array([0.0, -0.07, -0.02]) * s, 0.05 * s, 0.05 * s)

    def upper(self, P):
        k = self.k
        d = RP._loft(P, UPPER, True, k, palate=PALATE, rictus=RICTUS, n_top=2.2)
        for c, r in self.turrets:
            d = HD.smin(d, HD.ellipsoid(P, c, r), 0.014 * k)
        for a, b, ra, rb in self.folds:
            d = HD.smin(d, HD.round_cone(P, a, b, ra, rb), 0.012 * k)
        d = HD.smin(d, HD.round_cone(P, *self.nape), 0.04 * k)
        for c, sd in self.tympana:                   # the eardrum: a shallow dish in the side of the head
            dish = HD.ellipsoid(P, c + np.array([sd * 0.006 * k, 0, 0]), np.array([0.0075 * k, self.tymp_r, self.tymp_r]))
            d = HD.smax(d, -dish, 0.002 * k)
        for c, r in self.nostrils:
            d = HD.smin(d, HD.ellipsoid(P, c - np.array([0, 0.0015 * k, 0]), r * 2.2), 0.003 * k)
            d = HD.smax(d, -HD.ellipsoid(P, c + np.array([0, 0.0012 * k, 0]), r), 0.0008 * k)
        return np.maximum(d, -0.075 * k - P[:, 1])

    def lower(self, P):
        k = self.k
        d = RP._loft(P, LOWER, False, k)
        d = HD.smin(d, HD.ellipsoid(P, *self.pouch), 0.03 * k)
        d = HD.smin(d, HD.round_cone(P, *self.throat), 0.03 * k)
        line = RP._lerp(LOWER, 2, P[:, 2] / k) * k
        lim = 0.99 * RP._lerp(UPPER, 1, P[:, 2] / k) * k + 0.6 * np.maximum(line - 0.01 * k - P[:, 1], 0)
        d = HD.smax(d, np.abs(P[:, 0]) - lim, 0.004 * k)
        return np.maximum(d, -0.085 * k - P[:, 1])


# the skin's pattern (a poison dart frog's, any colour): three fields over the skin at rest, the same for the head's
# vertices and the body's texels (body_mask), so the marks run on from the head across the body; the figures pick one
# and threshold it by the record's amount (50-figure.js patternShader, kchar_pattern.gdshader, kchar_skin.gdshader):
# R the distance to the nearest of a scatter of points (spots: R under the amount), G the distance to the line between
# the two nearest (a net of bands: G under it), B a marbling (blotches: B over 1 - it); A the pale parts (throat, belly,
# the lip's stripe), drawn in the third colour
PATTERN_CELL = 0.055       # metres between the spots' centres


def _hash3(i, seed):
    """per integer lattice point (n, 3), three numbers in 0.15..0.85"""
    h = (i[:, 0] * 73856093) ^ (i[:, 1] * 19349663) ^ (i[:, 2] * 83492791) ^ (seed * 2654435761)
    out = []
    for m in (2246822519, 3266489917, 668265263):
        out.append(((h * m) % 4294967291) % 10000 / 9999.0)
    return 0.15 + 0.7 * np.stack(out, 1)


def worley(P, cell, seed):
    """the distances, in cells, to the nearest and the second nearest of a jittered point per lattice cell"""
    q = P / cell
    i = np.floor(q).astype(np.int64)
    f1 = np.full(len(P), 9.0)
    f2 = np.full(len(P), 9.0)
    for o in [(a, b, c) for a in (-1, 0, 1) for b in (-1, 0, 1) for c in (-1, 0, 1)]:
        j = i + np.array(o)
        d = np.linalg.norm(j + _hash3(j, seed) - q, axis=1)
        f2 = np.where(d < f1, f1, np.minimum(f2, d))
        f1 = np.minimum(f1, d)
    return f1, f2


def pattern_fields(P):
    """R, G, B of the pattern (above) at rest positions P (metres, the body's frame), each 0..1"""
    f1, f2 = worley(P, PATTERN_CELL, 5)
    fb = 0.55 * RP._noise(P, 0.07, 21) + 0.3 * RP._noise(P, 0.03, 22) + 0.15 * RP._noise(P, 0.013, 23)
    return np.stack([np.clip(f1 / 0.95, 0, 1), np.clip((f2 - f1) / 0.7, 0, 1), np.clip((fb - 0.5) * 2.4 + 0.5, 0, 1)], 1)


def paint(fr, V, N, upper, H):
    """per vertex: the pattern's fields and the pale share (RGBA: COLOR_0), a shade the colour is multiplied by (the
    mask through the eye, the eardrum, the nostrils, the turret's rim: TEXCOORD_1 x), and whether it is the mouth's
    inside. V in the Head joint's frame (H its place: the pattern is the body's, in its frame)"""
    k = fr.k
    x, y, z = V[:, 0], V[:, 1], V[:, 2]
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    M = np.concatenate([pattern_fields(V + H), np.zeros((len(V), 1))], 1)
    shade = 0.93 + 0.14 * RP._noise(V, 0.008 * k, 13)
    shade *= 1 - 0.06 * sm(0.2, 0.8, N[:, 1])
    pale = np.zeros(len(V))
    if not upper:                                   # the throat's pouch and the jaw's underside
        pale = np.maximum(pale, sm(0.15, -0.45, N[:, 1]) * sm(0.012 * k, -0.02 * k, y))
    line = RP._lerp(UPPER, 3, z / k) * k
    if upper:
        # a pale stripe along the upper lip, from the snout's tip back under the eardrum
        lip = (1 - sm(0.0022 * k, 0.0045 * k, np.abs(y - line - 0.0035 * k))) * sm(RICTUS * k, (RICTUS + 0.015) * k, z) * sm(0.3, 0.6, np.abs(N[:, 0]) + 0.3)
        pale = np.maximum(pale, lip)
        # the mask: dark from the nostril through the eye to the eardrum
        a, b = fr.nostrils[1][0], fr.tympana[1][0]
        for sd in (-1, 1):
            a_ = a * np.array([sd, 1, 1]); b_ = b * np.array([sd, 1, 1])
            ab = b_ - a_
            t = np.clip(((V - a_) @ ab) / (ab @ ab), 0, 1)
            dl = np.linalg.norm(V - (a_ + t[:, None] * ab), axis=1)
            shade *= 1 - 0.45 * (1 - sm(0.008 * k, 0.016 * k, dl)) * (np.sign(x) == sd) * (1 - lip)
    for c, sd in fr.tympana:
        dt = np.linalg.norm((V - c)[:, 1:], axis=1) * (np.sign(x) == sd) + (np.sign(x) != sd) * 1.0
        pale = np.maximum(pale, 0.7 * (1 - sm(0.0, 0.003 * k, np.abs(dt - fr.tymp_r * 1.05))))
        shade *= 1 - 0.4 * (1 - sm(fr.tymp_r * 0.85, fr.tymp_r * 1.0, dt))
    for e in fr.eyes:                               # the turret's rim, where it meets the ball, dark
        shade *= 1 - 0.5 * (1 - sm(1.0, 1.25, np.linalg.norm(V - e['c'], axis=1) / fr.eye_r))
    for c, r in fr.nostrils:
        shade *= 0.3 + 0.7 * sm(0.8, 1.4, np.linalg.norm((V - c) / (r * 1.6), axis=1))
    M[:, 3] = np.clip(pale, 0, 1)
    if upper:
        mouth = (y < (RP._lerp(UPPER, 3, z / k) - 0.002) * k) & (N[:, 1] < -0.3)
    else:
        mouth = (y > (RP._lerp(LOWER, 2, z / k) + 0.001) * k) & (N[:, 1] > 0.3)
    mouth &= (z > (RICTUS + 0.02) * k) & (np.abs(x) < 0.8 * RP._lerp(LOWER, 1, z / k) * k)
    return M, np.clip(shade, 0, 1), mouth


def belly_share(body, P, N):
    """the pale share over the body at rest (points P, normals N): the belly up the front of the torso, narrowing over the
    chest, and the throat's front up the neck to the jaw (body_mask, and the head's collar, so they meet)"""
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    hy, cy, ny, hd = body.P('Hips')[1], body.P('Spine2')[1], body.P('Neck')[1], body.P('Head')[1]
    front = sm(0.2, 0.55, N[:, 2])
    y, ax = P[:, 1], np.abs(P[:, 0])
    half = 0.11 - 0.05 * sm(cy - 0.12, ny - 0.02, y)        # the belly's half width, narrowing up the chest
    belly = front * sm(hy - 0.08, hy + 0.02, y) * (1 - sm(ny - 0.03, ny + 0.01, y)) * (1 - sm(half - 0.03, half + 0.01, ax))
    throat = front * sm(ny - 0.06, ny - 0.02, y) * (1 - sm(hd + 0.01, hd + 0.04, y)) * (1 - sm(0.04, 0.07, ax))
    return np.clip(np.maximum(belly, throat), 0, 1)


def body_mask(body, px=512):
    """the pattern's fields and the pale share (the belly and the throat's front) over the base skin, baked into its UV
    square (RGBA PNG, glTF's v down): each texel's fields from its place on the skin at rest, so the marks run on across
    the UV islands' edges; dilated a few texels past each island against seams"""
    import io
    from PIL import Image
    S = body.prims['Human.body']
    P, U, T = S['POSITION'].astype(float), S['TEXCOORD_0'].astype(float), S['T']
    fn = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])
    Nv = np.zeros_like(P)
    for c in range(3):
        np.add.at(Nv, T[:, c], fn)
    Nv /= np.maximum(np.linalg.norm(Nv, axis=1, keepdims=True), 1e-12)
    belly = belly_share(body, P, Nv)
    acc = np.zeros((px, px, 3))
    bel = np.zeros((px, px))
    have = np.zeros((px, px), bool)
    UVp = U * px - 0.5
    for t in T:
        a, b, c = UVp[t]
        lo = np.floor(np.minimum(np.minimum(a, b), c)).astype(int)
        hi = np.ceil(np.maximum(np.maximum(a, b), c)).astype(int)
        lo, hi = np.clip(lo, 0, px - 1), np.clip(hi, 0, px - 1)
        if (hi < lo).any():
            continue
        X, Y = np.meshgrid(np.arange(lo[0], hi[0] + 1), np.arange(lo[1], hi[1] + 1))
        Q = np.stack([X.ravel(), Y.ravel()], 1).astype(float)
        v0, v1, v2 = b - a, c - a, Q - a
        den = v0[0] * v1[1] - v1[0] * v0[1]
        if abs(den) < 1e-12:
            continue
        w1 = (v2[:, 0] * v1[1] - v1[0] * v2[:, 1]) / den
        w2 = (v0[0] * v2[:, 1] - v2[:, 0] * v0[1]) / den
        w0 = 1 - w1 - w2
        ins = (w0 >= -0.02) & (w1 >= -0.02) & (w2 >= -0.02)
        if not ins.any():
            continue
        W = np.stack([w0, w1, w2], 1)[ins]
        q = Q[ins].astype(int)
        pos = W @ P[t]
        acc[q[:, 1], q[:, 0]] = pos
        bel[q[:, 1], q[:, 0]] = W @ belly[t]
        have[q[:, 1], q[:, 0]] = True
    ii = np.nonzero(have)
    F = np.zeros((px, px, 4))
    F[ii[0], ii[1], :3] = pattern_fields(acc[ii])
    F[ii[0], ii[1], 3] = np.clip(bel[ii], 0, 1)
    for _ in range(6):                               # dilation: each empty texel takes a filled neighbour's
        grow = ~have
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            src = np.roll(np.roll(have, dy, 0), dx, 1) & grow
            F[src] = np.roll(np.roll(F, dy, 0), dx, 1)[src]
            have = have | src
            grow = ~have
    bio = io.BytesIO()
    Image.fromarray(np.clip(F * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA').save(bio, 'PNG', optimize=True)
    return bio.getvalue(), 'image/png'


def iris_texture(pupil='horizontal', px=512):
    """an eyeball's colour in its UV (u round the gaze, v the square root of the angle from it): near-grey for the eye
    colour to tint (role 'iris'), the pupil black (a frog's horizontal, a monitor's round), its margin dark, a lighter
    collarette, radial fibres and a net of dark veins, a dark band through a frog's pupil, the limbus dark and the
    ball's back darker. JPEG"""
    import io
    from PIL import Image
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    v, u = np.mgrid[0:px, 0:px] / (px - 1.0)
    th, ph = v ** 2 * np.pi, u * 2 * np.pi
    d = np.stack([np.cos(th), np.sin(th) * np.cos(ph), np.sin(th) * np.sin(ph)], -1).reshape(-1, 3)
    cg, ch, cv = d[:, 0], d[:, 1], d[:, 2]
    if pupil == 'horizontal':
        pe = (np.abs(ch) / 0.36) ** 1.7 + (np.abs(cv) / 0.19) ** 2
    else:
        pe = (np.hypot(ch, cv) / 0.24) ** 2
    lum = np.full(len(d), 0.86)
    fib = RP._noise(np.stack([ph.ravel() * 6.0, th.ravel() * 1.5, np.zeros(len(d))], 1), 0.06, 31)
    lum *= 0.88 + 0.24 * fib
    f1, f2 = worley(d, 0.09, 33)
    lum *= 1 - 0.45 * (1 - sm(0.02, 0.07, f2 - f1)) * sm(1.3, 2.0, pe)
    lum *= 1 - 0.35 * (1 - sm(1.0, 1.35, pe))                       # the pupil's margin
    lum *= 1 + 0.12 * np.exp(-((pe - 1.9) / 0.35) ** 2)               # the collarette
    if pupil == 'horizontal':
        lum *= 1 - 0.3 * np.exp(-(cv / 0.07) ** 2) * sm(1.0, 1.6, pe)   # the dark band through the pupil
        lum *= 1 + 0.08 * np.clip(cv / 0.6, -1, 1)
    lum *= 1 - 0.75 * sm(np.cos(np.radians(52)), np.cos(np.radians(64)), cg)   # the limbus, then the ball's back
    lum = lum * sm(0.88, 1.0, pe) + 0.012 * (1 - sm(0.88, 1.0, pe))
    img = np.clip(lum.reshape(px, px) * 255, 0, 255).astype(np.uint8)
    bio = io.BytesIO()
    Image.fromarray(np.stack([img] * 3, -1), 'RGB').save(bio, 'JPEG', quality=92)
    return bio.getvalue(), 'image/jpeg'


def eyeball(eyes, r, H):
    """the eyes (a frog's or a lizard's: each {'c', 'axes'}): balls with their poles on the gaze, UV for iris_texture;
    (positions, normals, UVs, triangles)"""
    eV, eN, eU, eT = [], [], [], []
    RI, RJ = 40, 49
    for e in eyes:
        g, hh, v = e['axes']
        sv, su = np.meshgrid(np.linspace(0, 1, RI), np.linspace(0, 1, RJ), indexing='ij')
        th, ph = sv ** 2 * np.pi, su * 2 * np.pi
        d = (np.cos(th)[..., None] * g + np.sin(th)[..., None] * (np.cos(ph)[..., None] * hh + np.sin(ph)[..., None] * v)).reshape(-1, 3)
        base = sum(len(x) for x in eV)
        eV.append(H + e['c'] + d * r); eN.append(d)
        eU.append(np.stack([su.ravel(), sv.ravel()], 1))
        for i in range(RI - 1):
            for j in range(RJ - 1):
                a0, b0 = base + i * RJ + j, base + (i + 1) * RJ + j
                eT += [[a0, b0, b0 + 1], [a0, b0 + 1, a0 + 1]]
    return np.concatenate(eV), np.concatenate(eN), np.concatenate(eU), np.array(eT)


FINGERS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']
WEB = 0.6                  # how far up the fingers the webs reach at their sides (of each finger's length), less between


def _finger(body, side, name, W, BP):
    """a finger's chain at rest: its joints' places, its tip (the farthest skin its last joint carries) and its radius"""
    j = [body.jidx['%sHand%s%d' % (side, name, i)] for i in (1, 2, 3)]
    P = np.array([body.P('%sHand%s%d' % (side, name, i)) for i in (1, 2, 3)])
    d = P[2] - P[1]
    d /= np.linalg.norm(d)
    on = W[:, j[2]] > 0.5
    tip = BP[on][np.argmax((BP[on] - P[2]) @ d)]
    axis = np.concatenate([P, tip[None]])
    seg = np.linalg.norm(np.diff(axis, axis=0), axis=1)
    near = W[:, j].sum(1) > 0.5
    q = BP[near] - P[1]
    rad = float(np.median(np.linalg.norm(q - (q @ d)[:, None] * d, axis=1)))
    q = BP[on] - P[2]                               # the last segment's own radius (the pads' size)
    rtip = float(np.median(np.linalg.norm(q - (q @ d)[:, None] * d, axis=1)))
    return {'joints': j, 'axis': axis, 'cum': np.concatenate([[0], np.cumsum(seg)]), 'r': rad, 'rtip': rtip, 'tip': tip}


def _along(f, t):
    """the point a share t of the finger's length along it, and the joint that carries it"""
    L = f['cum'][-1] * t
    i = int(np.clip(np.searchsorted(f['cum'], L) - 1, 0, 2))
    u = (L - f['cum'][i]) / max(f['cum'][i + 1] - f['cum'][i], 1e-9)
    return f['axis'][i] + (f['axis'][i + 1] - f['axis'][i]) * u, f['joints'][i]


def hand_webs(body, web, pad, recipe_of):
    """webbed hands: between each pair of neighbouring fingers a thin web from the knuckles up a share of the fingers
    (WEB at its sides, scalloped deeper between them), each point on the two fingers' joints by where it lies across;
    and a round pad under each fingertip, on its last joint. Into the _Smooth surfaces web and pad (vertex .C: the
    pattern's fields, the pale share and the shade, as the head's); recipe_of(point) -> (recipe, base vertex)"""
    B = body.prims['Human.body']
    BP = B['POSITION'].astype(float)
    nj = len(body.names)
    W = np.zeros((len(BP), nj))
    for k in range(B['J'].shape[1]):
        np.add.at(W, (np.arange(len(BP)), B['J'][:, k]), B['W'][:, k])
    NS, NT, TH = 6, 9, 0.0008
    for side in ('Left', 'Right'):
        F = [_finger(body, side, n, W, BP) for n in FINGERS]
        palm = np.cross(F[1]['axis'][1] - F[1]['axis'][0], F[3]['axis'][0] - F[1]['axis'][0])
        palm /= np.linalg.norm(palm)
        for a, b in zip(F[:-1], F[1:]):
            rows_top, rows_bot = [], []
            for si in range(NS + 1):
                s = si / NS
                ring_t, ring_b = [], []
                reach = WEB * (1 - 0.35 * np.sin(np.pi * s)) * (0.75 if a is F[0] else 1.0)
                for ti in range(NT + 1):
                    t = reach * ti / NT
                    pa, ja = _along(a, t)
                    pb, jb = _along(b, t)
                    across = pb - pa
                    gap = np.linalg.norm(across)
                    across /= max(gap, 1e-9)
                    pa_ = pa + across * a['r'] * 0.7          # from the inside of one finger to the other's
                    pb_ = pb - across * b['r'] * 0.7
                    p = pa_ + (pb_ - pa_) * s
                    jw = [(ja, 1 - s), (jb, s)]
                    rc, _ = recipe_of(p)
                    for off, ring in ((TH, ring_t), (-TH, ring_b)):
                        q = p + palm * off
                        ring.append(web.v(q, (q[0] / 0.25, q[1] / 0.25), jw, rc))
                        web.C.append(np.concatenate([pattern_fields(q[None])[0], [0.0, 1.0]]))
                rows_top.append(ring_t)
                rows_bot.append(ring_b)
            # the two faces (wound to face the palm's way and away) and the free edge between them (the fingers' sides
            # are inside the fingers)
            def quad(q, want):
                for tri in ([q[0], q[1], q[2]], [q[0], q[2], q[3]]):
                    P3 = [web.P[x] for x in tri]
                    fn = np.cross(P3[1] - P3[0], P3[2] - P3[0])
                    web.T.append(tri if fn @ want >= 0 else tri[::-1])
            for r in range(NS):
                for c in range(NT):
                    quad([rows_top[r][c], rows_top[r + 1][c], rows_top[r + 1][c + 1], rows_top[r][c + 1]], palm)
                    quad([rows_bot[r][c], rows_bot[r + 1][c], rows_bot[r + 1][c + 1], rows_bot[r][c + 1]], -palm)
                e = [rows_top[r][NT], rows_top[r + 1][NT], rows_bot[r + 1][NT], rows_bot[r][NT]]
                mid = web.P[e[0]] - web.P[rows_top[r][NT - 1]]            # out past the free edge
                quad(e, mid)
        for f in F:                                     # the pads under the tips
            d = f['axis'][3] - f['axis'][2]
            d /= np.linalg.norm(d)
            c = f['tip'] - d * f['rtip'] * 1.1
            rc, _ = recipe_of(c)
            R = np.array([f['rtip'] * 1.05, f['rtip'] * 0.8, f['rtip'] * 1.0])
            n_, m_ = 12, 8
            rows = []
            for i in range(m_ + 1):
                ph = np.pi * i / m_
                ring = []
                for kq in range(n_ + 1):
                    th = 2 * np.pi * kq / n_
                    e1 = np.cross(d, palm); e1 /= np.linalg.norm(e1)
                    q = c + R[0] * np.sin(ph) * np.cos(th) * e1 + R[1] * np.cos(ph) * palm + R[2] * np.sin(ph) * np.sin(th) * d
                    ring.append(pad.v(q, (kq / n_, i / m_), [(f['joints'][2], 1.0)], rc))
                    pad.C.append(np.concatenate([pattern_fields(q[None])[0], [0.0, 0.92]]))
                rows.append(ring)
            n0 = len(pad.T)
            pad.grid(rows)
            for i in range(n0, len(pad.T)):               # wound outward from the pad's centre
                tri = pad.T[i]
                P3 = [pad.P[x] for x in tri]
                if np.cross(P3[1] - P3[0], P3[2] - P3[0]) @ (np.mean(P3, 0) - c) < 0:
                    pad.T[i] = tri[::-1]
