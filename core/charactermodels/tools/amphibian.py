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


class Frog:
    """the head's fields in the Head joint's frame at rest (the body's head scale k)"""

    def __init__(self, k):
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


def paint(fr, V, N, upper):
    """each vertex's colour (the skin's tint and texture multiply it) and whether it is the mouth's inside"""
    k = fr.k
    x, y, z = V[:, 0], V[:, 1], V[:, 2]
    sm = lambda a, b, v: (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))
    mix = lambda c, w, to: c * (1 - w[:, None]) + np.asarray(to, float)[None] * w[:, None]
    col = np.ones((len(V), 3))
    # dark blotches over the back and sides, fading out underneath
    n1, n2 = RP._noise(V, 0.022 * k, 11), RP._noise(V, 0.008 * k, 13)
    blot = sm(0.58, 0.68, n1 + 0.15 * (n2 - 0.5)) * sm(-0.3, 0.3, N[:, 1] + 0.3)
    col = col * (1 - 0.5 * blot)[:, None]
    col *= (0.92 + 0.16 * n2)[:, None]
    # pale underneath: the throat's pouch, the jaw's underside
    under = sm(0.1, -0.5, N[:, 1]) * (0 if upper else 1) + (0 if upper else 1) * sm(0.0, -0.03 * k, y)
    col = mix(col, np.clip(under, 0, 1), (1.5, 1.45, 1.12))
    # a pale stripe along the upper lip, from the snout's tip back under the eardrum
    line = RP._lerp(UPPER, 3, z / k) * k
    if upper:
        lip = (1 - sm(0.004 * k, 0.009 * k, np.abs(y - line - 0.0045 * k))) * sm(RICTUS * k, (RICTUS + 0.015) * k, z) * sm(0.3, 0.6, np.abs(N[:, 0]) + 0.3)
        col = mix(col, lip, (1.45, 1.42, 1.15))
        # the mask: dark from the nostril through the eye to the eardrum, between the lip stripe and the fold
        a, b = fr.nostrils[1][0], fr.tympana[1][0]
        for sd in (-1, 1):
            a_ = a * np.array([sd, 1, 1]); b_ = b * np.array([sd, 1, 1])
            ab = b_ - a_
            t = np.clip(((V - a_) @ ab) / (ab @ ab), 0, 1)
            dl = np.linalg.norm(V - (a_ + t[:, None] * ab), axis=1)
            mask = (1 - sm(0.008 * k, 0.016 * k, dl)) * (np.sign(x) == sd)
            col = col * (1 - 0.45 * mask)[:, None]
    for c, sd in fr.tympana:
        dt = np.linalg.norm((V - c)[:, 1:], axis=1) * (np.sign(x) == sd) + (np.sign(x) != sd) * 1.0
        ring = (1 - sm(0.0, 0.003 * k, np.abs(dt - fr.tymp_r * 1.05)))
        inner = 1 - sm(fr.tymp_r * 0.85, fr.tymp_r * 1.0, dt)
        col = col * (1 - 0.4 * inner)[:, None]
        col = mix(col, ring, (1.3, 1.25, 1.05))
    for e in fr.eyes:                               # the turret's rim, where it meets the ball, dark
        dn = np.linalg.norm(V - e['c'], axis=1) / fr.eye_r
        col *= (1 - 0.5 * (1 - sm(1.0, 1.25, dn)))[:, None]
    for c, r in fr.nostrils:
        col *= (0.3 + 0.7 * sm(0.8, 1.4, np.linalg.norm((V - c) / (r * 1.6), axis=1)))[:, None]
    if upper:
        mouth = (y < (RP._lerp(UPPER, 3, z / k) - 0.002) * k) & (N[:, 1] < -0.3)
    else:
        mouth = (y > (RP._lerp(LOWER, 2, z / k) + 0.001) * k) & (N[:, 1] > 0.3)
    mouth &= (z > (RICTUS + 0.02) * k) & (np.abs(x) < 0.8 * RP._lerp(LOWER, 1, z / k) * k)
    return np.clip(col, 0, 1.6), mouth


def eyeball(fr, H):
    """the eyes: balls with their poles on the gaze: a horizontal black pupil, a gold iris netted with dark veins, a dark
    rim; (positions, normals, colours, triangles)"""
    eV, eN, eC, eT = [], [], [], []
    RI, RJ = 48, 49                                  # fine at the pole, where the pupil is
    sm = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a) / (b - a), 0, 1))
    for e in fr.eyes:
        g, hh, v = e['axes']
        th, ph = np.meshgrid(np.linspace(0, np.pi, RI), np.linspace(0, 2 * np.pi, RJ), indexing='ij')
        d = (np.cos(th)[..., None] * g + np.sin(th)[..., None] * (np.cos(ph)[..., None] * hh + np.sin(ph)[..., None] * v)).reshape(-1, 3)
        base = sum(len(x) for x in eV)
        eV.append(H + e['c'] + d * fr.eye_r); eN.append(d)
        cg, ch, cv = d @ g, d @ hh, d @ v
        vein = RP._noise(d * 0.02, 0.0025, 17)
        c = np.array([0.8, 0.56, 0.16])[None] * (0.85 + 0.25 * vein[:, None])
        # (its back, proud of the turret and seen, a darker gold rather than a dark rim)
        c = c * (1 - 0.45 * sm(0.4, -0.2, cg))[:, None]
        pe = (ch / 0.4) ** 2 + (cv / 0.2) ** 2
        c = c * sm(0.85, 1.0, pe)[:, None] * (cg > 0)[:, None] + c * (cg <= 0)[:, None]
        c = np.maximum(c, 0.012)
        eC.append(c)
        for i in range(RI - 1):
            for j in range(RJ - 1):
                a0, b0 = base + i * RJ + j, base + (i + 1) * RJ + j
                eT += [[a0, b0, b0 + 1], [a0, b0 + 1, a0 + 1]]
    return np.concatenate(eV), np.concatenate(eN), np.concatenate(eC), np.array(eT)
