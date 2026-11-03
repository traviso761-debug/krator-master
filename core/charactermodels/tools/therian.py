"""The therian heads besides the coyote (tools/heads.py, which makes them): a cat, a lion, a rat, a monkey and a bird,
each a species dict in heads.py's shape, for the animal peoples (Korona's therian tribes, LORE 6.18: a beaked people, a
muzzled people; the Outlands' Coyote Men are the coyote). Each varies the coyote's numbers (its field's parts, its
paint, its eyes, its nose) and adds what the coyote has not:
- the cat: a short blunt muzzle and whisker pads, big forward eyes with slit pupils, tall pointed ears, a pink nose,
  tabby bars on the crown, the cheeks and the nape, whiskers;
- the lion: a long broad muzzle and heavy jaw, small round black-backed ears, amber eyes, and a mane: a field of its
  own round the head, the cheeks and the neck, clear of the face, in dark long fur (kind 'mane', data/fur.json);
- the rat: a long tapering snout, small black bulging eyes on the sides, large round thin bare pink ears (their
  material untinted), a pink nose, whiskers;
- the monkey (a macaque): a round skull with a brow ridge, a short broad prognathous muzzle with nostrils cut in it
  and no pad, close forward brown eyes, round bare ears on the sides, and a bare face: its triangles on a second
  material in the skin's colour (role 'skin'), the cheeks in long whiskers;
- the bird (a corvid): a round head, eyes on the sides with large round pupils, no ears, a beak of its own primitive
  (an upper mandible hooked at the tip, a lower one, the nares cut at its base, the mouth's line dark, horn going dark
  toward the tip, untinted), the cere bare, a dark stripe through the eye, plumage (kind 'plumage') standing up in a
  crest on the crown and lying back down the nape.
Lengths in metres on the man's head (heads.py COYOTE says what each number is).
"""
import copy
import numpy as np

import heads as H

ORDER = ['cat', 'lion', 'rat', 'monkey', 'bird']


def sm(a, b, v):
    return (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))


def derive(base, **over):
    """a species from another: 'geo', 'paint', 'eye' and 'nose' updated key by key, the rest replaced"""
    sp = copy.deepcopy(base)
    for k, v in over.items():
        if k in ('geo', 'paint', 'eye', 'nose') and isinstance(v, dict) and isinstance(sp.get(k), dict):
            sp[k].update(v)
        else:
            sp[k] = v
    return sp


# ---------------------------------------------------------------------------------------------------------------
# whiskers: on each side a fan of thin ribbons (two crossed, so one is seen from any side) from the whisker pad on
# the muzzle's side, the front ones pointing forward and the back ones back, drooping a little; white, untinted
def whiskers(n, length, droop=0.25, thick=0.0012, lift=0.0):
    def make(h, M, c):
        s = h.s
        root, tip, r0, r1 = h.muzzle
        V, N, C, T = [], [], [], []
        for sd in (-1, 1):
            for i in range(n):
                u = i / max(n - 1, 1)
                t = 0.5 + 0.35 * u
                phi = 0.18 + 0.32 * (((i * 7) % n) / max(n, 1))
                a = root + (tip - root) * t
                r = r0 + (r1 - r0) * t
                p = a + r * np.array([sd * np.cos(phi), -np.sin(phi), 0.0])
                d = np.array([sd * 0.9, -0.15 + lift + 0.3 * (0.35 - phi), 0.55 - 1.0 * u]); d /= np.linalg.norm(d)
                up = np.array([0.0, 1.0, 0.0]); side = np.cross(d, up); side /= np.linalg.norm(side)
                up = np.cross(side, d)
                L = length * s
                K = 8
                for wdir, nrm in ((up, side), (side, up)):
                    base = sum(len(x) for x in V)
                    pts, nn, cc = [], [], []
                    for k in range(K + 1):
                        f = k / K
                        q = p + d * L * f - np.array([0.0, droop * L * f * f, 0.0])
                        w = thick * s * (1.0 - 0.8 * f)
                        pts += [q - wdir * w, q + wdir * w]
                        nn += [nrm, nrm]
                        cc += [[0.92, 0.9, 0.86]] * 2
                    V.append(np.array(pts)); N.append(np.array(nn)); C.append(np.array(cc))
                    for k in range(K):
                        a0 = base + 2 * k
                        T += [[a0, a0 + 2, a0 + 3], [a0, a0 + 3, a0 + 1]]
        V, N, C = np.concatenate(V), np.concatenate(N), np.concatenate(C)
        return [c['prim'](V, N, C, c['none'](V), np.zeros((len(V), 2)), np.array(T), np.zeros(len(V)), c['vids'](V),
                          'Mod.%s_whiskers' % h.sp['id'], rough=0.6, double=True)]
    return make


# ---------------------------------------------------------------------------------------------------------------
def cat_hook(h, V, N, col, dens, ln, face, c):
    """tabby bars: across the crown (bent down toward the eyes at the sides, the tabby's M), back from the eyes over
    the cheeks, and round the nape; the whisker pads dotted"""
    s, m = h.s, h.m
    x, y, z = V[:, 0], V[:, 1], V[:, 2]
    ye, zf = m['eye_y'], m['front']
    ph = (z - c['cz']) / (0.02 * s) + 0.5 * np.abs(x) / (0.02 * s)
    bars = sm(0.35, 0.65, 0.5 + 0.5 * np.cos(2 * np.pi * ph)) * c['crown'] * c['front'] * (1 - c['muzzle'])
    ph2 = ((z - zf) - 0.6 * (y - ye)) / (0.016 * s)
    cheeks = sm(0.4, 0.7, 0.5 + 0.5 * np.cos(2 * np.pi * ph2)) * c['cheek'] * (1 - c['muzzle']) * 0.7
    ph3 = (y - ye) / (0.022 * s)
    back = sm(0.4, 0.7, 0.5 + 0.5 * np.cos(2 * np.pi * ph3)) * (1 - c['front']) * (1 - c['throat'])
    st = np.clip(np.maximum.reduce([bars, cheeks, back]), 0, 1) * (1 - c['ears'])
    col = col * (1 - 0.4 * st)[:, None]
    # the whisker pads: a few dark dots on each side of the muzzle, where the whiskers root
    root, tip, r0, r1 = h.muzzle
    for sd in (-1, 1):
        for i in range(4):
            t = 0.55 + 0.1 * i
            a = root + (tip - root) * t
            r = r0 + (r1 - r0) * t
            for phi in (0.2, 0.45):
                p = a + r * np.array([sd * np.cos(phi), -np.sin(phi), 0.0])
                dot = 1 - sm(0.0015 * s, 0.0028 * s, np.linalg.norm(V - p, axis=1))
                col = col * (1 - 0.5 * dot)[:, None]
    return col, dens, ln, face


CAT = derive(H.COYOTE, id='cat', name='Cat head', fur='plush', test=True,
    geo={'cr_y': 0.03, 'cr_r': (0.95, 0.066, 0.40),
         'mz_root': (-0.02, -0.045), 'mz_tip': (-0.028, 0.022), 'mz_r': (0.034, 0.016),
         'jaw_root': (0.0, -0.026, -0.015), 'jaw_tip': (0.0, -0.014, -0.012), 'jaw_r': (0.03, 0.011),
         'cheek': (0.7, -0.02, -0.065), 'cheek_r': (0.04, 0.034, 0.042), 'zygoma': None,
         'nose_off': (0.0, 0.006, 0.013), 'nose_r': 0.009,
         'pad_r': (0.0075, 0.0058, 0.0062), 'pad_front': 0.0042, 'nostril': (0.0036, -0.0012, 0.004),
         'philtrum': ((0.0, -0.002, 0.0042), (0.0, -0.0075, 0.0025)), 'pad_scale': 0.75,
         'ears': {'base': (0.6, 0.07, -0.005), 'tip': (0.03, 0.095, -0.005), 'w': 0.034, 'd': 0.011, 'form': 'point', 'facing': None},
         'eye_r': 0.016, 'eye': (0.40, 0.012, -0.03), 'gaze': (0.22, 0.03, 0.97), 'tilt': 0.3, 'eye_back': 0.5, 'lids': (1.15, 0.72, 1.2),
         'k': dict(H.COYOTE['geo']['k'], muzzle=0.025)},
    paint={'ln': 0.5, 'ln_front': 0.3, 'ln_muzzle': 0.2, 'ln_ruff': 0.7,
           'crown': (0.6, 0.58, 0.55), 'crown_amt': 0.5, 'streak': 0.25,
           'muzzle_top': (0.85, 0.8, 0.75), 'muzzle_top_amt': 0.4, 'cream': (1.0, 0.98, 0.95), 'cream_amt': 1.0,
           'ear_back': (0.55, 0.5, 0.47), 'ear_back_amt': 0.6, 'ear_inner': (1.0, 0.9, 0.88), 'ear_dark': 0.5,
           'nose_dark': 0.3, 'lip': 0.3, 'liner': 0.8, 'tear': 0.2, 'hook': cat_hook},
    eye={'gold': (0.78, 0.86, 0.3), 'amber': (0.5, 0.68, 0.22), 'ring': (0.1, 0.12, 0.04), 'sclera': (0.12, 0.1, 0.08),
         'pupil': ('slit', 0.045, 0.075)},
    nose={'color': (0.62, 0.36, 0.36), 'top': (0.08, 0.04, 0.04)},
    prims=whiskers(5, 0.075))


# ---------------------------------------------------------------------------------------------------------------
def lion_extras(h):
    """the mane: a field round the head (behind the brow, over the ears' roots), under the jaw and down the neck, cut
    clear of the face; kept on h for the paint"""
    s, m = h.s, h.m
    ye, zf, xw, cz = m['eye_y'], m['front'], m['half_width'], h.cranium[0][2]
    def mane(P):
        d = H.ellipsoid(P, np.array([0.0, ye - 0.005 * s, cz - 0.05 * s]), np.array([xw * 1.45, 0.095 * s, 0.095 * s]))
        d = H.smin(d, H.ellipsoid(P, np.array([0.0, ye - 0.075 * s, zf - 0.1 * s]), np.array([xw * 1.3, 0.05 * s, 0.07 * s])), 0.03 * s)
        d = H.smin(d, H.ellipsoid(P, np.array([0.0, m['cut'], m['neck_z'] - 0.01]), np.array([xw * 1.45, 0.075 * s, 0.095 * s])), 0.03 * s)
        return H.smax(d, -h.face_clear(P), 0.02 * s)
    h.face_clear = lambda P: H.ellipsoid(P, np.array([0.0, ye - 0.015 * s, zf - 0.03 * s]), np.array([xw * 1.18, 0.1 * s, 0.12 * s]))
    h.mane = mane
    return [(mane, 0.035)]


def lion_hook(h, V, N, col, dens, ln, face, c):
    """the mane dark and long (kind 'mane': the face's fur is the same kind, short), tawny elsewhere"""
    s = h.s
    inm = (1 - sm(0.0, 0.012 * s, h.mane(V))) * sm(0.0, 0.015 * s, h.face_clear(V)) * (1 - c['ears'])
    col = col * (1 - inm[:, None] * (1 - np.array([0.5, 0.4, 0.33])))
    ln = ln * (1 - inm) + 1.1 * inm
    return col, dens, ln, face


LION = derive(H.COYOTE, id='lion', name='Lion head', fur='mane', test=True,
    geo={'cr_y': 0.03, 'cr_r': (1.0, 0.068, 0.42),
         'mz_root': (-0.015, -0.05), 'mz_tip': (-0.04, 0.065), 'mz_r': (0.052, 0.034),
         'jaw_root': (0.0, -0.04, -0.02), 'jaw_tip': (0.0, -0.024, -0.012), 'jaw_r': (0.044, 0.026),
         'cheek': (0.75, -0.02, -0.07), 'cheek_r': (0.044, 0.036, 0.046),
         'zygoma': ((0.62, -0.004, -0.045), (0.88, 0.006, -0.105), 0.013, 0.016),
         'nose_off': (0.0, 0.006, 0.006), 'nose_r': 0.016,
         'pad_r': (0.016, 0.011, 0.012), 'pad_front': 0.008, 'nostril': (0.0075, -0.002, 0.0075),
         'philtrum': ((0.0, -0.004, 0.008), (0.0, -0.014, 0.004)), 'pad_scale': 1.4,
         'ears': {'base': (0.68, 0.05, -0.012), 'tip': (0.03, 0.055, -0.01), 'w': 0.03, 'd': 0.01, 'form': 'round', 'facing': None},
         'eye_r': 0.015, 'eye': (0.42, 0.008, -0.038), 'gaze': (0.3, 0.03, 0.95), 'tilt': 0.15, 'lids': (1.2, 0.6, 1.2),
         'k': dict(H.COYOTE['geo']['k'], muzzle=0.035, jaw=0.025),
         'bounds': ((-0.03, 0.0, -0.05), (0.03, 0.02, 0.0))},
    paint={'ln': 0.3, 'ln_front': 0.2, 'ln_muzzle': 0.12, 'ln_ruff': 0.35,
           'crown': (0.72, 0.66, 0.55), 'crown_amt': 0.3, 'streak': 0.0,
           'muzzle_top': (0.85, 0.75, 0.6), 'muzzle_top_amt': 0.4, 'cream': (1.0, 0.96, 0.88), 'cream_amt': 0.9,
           'ear_back': (0.2, 0.17, 0.15), 'ear_back_amt': 0.85, 'ear_inner': (0.95, 0.9, 0.85), 'ear_dark': 0.4,
           'nose_dark': 0.8, 'lip': 0.12, 'liner': 0.85, 'tear': 0.5, 'hook': lion_hook},
    eye={'gold': (0.92, 0.68, 0.22), 'amber': (0.65, 0.4, 0.1), 'ring': (0.15, 0.08, 0.02), 'sclera': (0.2, 0.14, 0.08),
         'pupil': ('round', 0.92, 0.935)},
    nose={'color': (0.08, 0.06, 0.055), 'top': (0.05, 0.03, 0.02)},
    extras=lion_extras, prims=whiskers(4, 0.09, thick=0.0015))


# ---------------------------------------------------------------------------------------------------------------
def rat_hook(h, V, N, col, dens, ln, face, c):
    """the ears bare (their material untinted: pink), the fur short"""
    dens = np.minimum(dens, 1 - c['ears'])
    return col, dens, ln, face


RAT = derive(H.COYOTE, id='rat', name='Rat head', fur='plush', test=True,
    geo={'cr_y': 0.025, 'cr_r': (0.88, 0.058, 0.40),
         'mz_root': (-0.01, -0.06), 'mz_tip': (-0.045, 0.115), 'mz_r': (0.04, 0.007),
         'jaw_root': (0.0, -0.028, -0.02), 'jaw_tip': (0.0, -0.02, -0.03), 'jaw_r': (0.03, 0.006),
         'cheek': (0.66, -0.02, -0.07), 'cheek_r': (0.034, 0.028, 0.04), 'zygoma': None,
         'nose_off': (0.0, 0.002, 0.004), 'nose_r': 0.007,
         'pad_r': (0.0062, 0.005, 0.0052), 'pad_front': 0.0035, 'nostril': (0.0029, -0.001, 0.0033),
         'philtrum': ((0.0, -0.0018, 0.0035), (0.0, -0.006, 0.002)), 'pad_scale': 0.7,
         'ears': {'base': (0.72, 0.045, -0.03), 'tip': (0.045, 0.07, -0.02), 'w': 0.036, 'd': 0.008, 'form': 'round', 'facing': (0.75, 0.0, 0.66)},
         'eye_r': 0.0105, 'eye': (0.48, 0.002, -0.045), 'gaze': (0.6, 0.05, 0.8), 'tilt': 0.1, 'eye_back': 0.35, 'eye_open': 0.3,
         'lids': (1.1, 0.95, 1.1),
         'k': dict(H.COYOTE['geo']['k'], muzzle=0.035, jaw=0.02)},
    paint={'ln': 0.35, 'ln_front': 0.25, 'ln_muzzle': 0.15, 'ln_ruff': 0.4,
           'crown': (0.62, 0.58, 0.55), 'crown_amt': 0.4, 'streak': 0.1,
           'muzzle_top': (0.7, 0.66, 0.62), 'muzzle_top_amt': 0.3, 'cream': (0.92, 0.9, 0.86), 'cream_amt': 0.8,
           'ear_back': (0.8, 0.58, 0.56), 'ear_back_amt': 0.95, 'ear_inner': (0.85, 0.62, 0.6), 'ear_dark': 0.15,
           'nose_dark': 0.2, 'lip': 0.45, 'liner': 0.75, 'tear': 0.25, 'hook': rat_hook},
    eye={'gold': (0.08, 0.05, 0.04), 'amber': (0.06, 0.04, 0.03), 'ring': (0.03, 0.02, 0.02), 'sclera': (0.06, 0.04, 0.04),
         'pupil': ('round', 0.9, 0.93)},
    nose={'color': (0.72, 0.45, 0.45), 'top': (0.06, 0.03, 0.03)},
    roles={'Mod.rat_ears': None},
    prims=whiskers(7, 0.09, droop=0.15, thick=0.001, lift=0.1))


# ---------------------------------------------------------------------------------------------------------------
def monkey_extras(h):
    """the brow ridge across the forehead over the eyes"""
    s, m = h.s, h.m
    ye, zf, xw = m['eye_y'], m['front'], m['half_width']
    ridge = lambda P: H.round_cone(P, np.array([-xw * 0.5, ye + 0.022 * s, zf - 0.03 * s]), np.array([xw * 0.5, ye + 0.022 * s, zf - 0.03 * s]), 0.012 * s, 0.012 * s)
    return [(ridge, 0.015)]


def monkey_cuts(h):
    """the nostrils: two hollows in the front of the muzzle's top (no pad)"""
    s, m = h.s, h.m
    ye, zf = m['eye_y'], m['front']
    h.nostril_pts = [np.array([sd * 0.007 * s, ye - 0.024 * s, zf + 0.038 * s]) for sd in (-1, 1)]
    cut = lambda P: min_of([H.ellipsoid(P, p, np.array([0.0035, 0.003, 0.0045]) * s) for p in h.nostril_pts])
    return [(cut, 0.002)]


def min_of(ds):
    return np.minimum.reduce(ds)


def monkey_hook(h, V, N, col, dens, ln, face, c):
    """the bare face: the front of the head from the brow to the chin and between the cheeks, in the skin's colour
    (its own material, role 'skin'), the lips and nostrils darker, no fur; the ears bare too"""
    s, m = h.s, h.m
    x, y, z = V[:, 0], V[:, 1], V[:, 2]
    ye, zf, xw = m['eye_y'], m['front'], m['half_width']
    mask = sm(zf - 0.075 * s, zf - 0.055 * s, z) * (1 - sm(ye + 0.03 * s, ye + 0.042 * s, y)) * (1 - sm(xw * 0.78, xw * 0.92, np.abs(x))) \
        * sm(ye - 0.105 * s, ye - 0.09 * s, y)
    mask = np.maximum(mask, c['muzzle'] * sm(ye - 0.105 * s, ye - 0.09 * s, y))
    skin = np.tile([0.98, 0.93, 0.9], (len(V), 1))
    for p in h.nostril_pts:
        skin = skin * (1 - 0.55 * (1 - sm(0.003 * s, 0.006 * s, np.linalg.norm(V - p, axis=1))))[:, None]
    skin[c['lip']] = 0.55
    col = col * (1 - mask)[:, None] + skin * mask[:, None]
    dens = np.minimum(dens, 1 - mask)
    dens = np.minimum(dens, 1 - c['ears'])
    return col, dens, ln, mask


MONKEY = derive(H.COYOTE, id='monkey', name='Monkey head', fur='plush', test=True,
    geo={'cr_y': 0.035, 'cr_z': 0.005, 'cr_r': (0.95, 0.065, 0.40),
         'mz_root': (-0.028, -0.05), 'mz_tip': (-0.042, 0.015), 'mz_r': (0.04, 0.026),
         'jaw_root': (0.0, -0.03, -0.012), 'jaw_tip': (0.0, -0.018, -0.01), 'jaw_r': (0.034, 0.02),
         'cheek': (0.7, -0.025, -0.065), 'cheek_r': (0.038, 0.034, 0.04),
         'zygoma': ((0.6, -0.004, -0.04), (0.86, 0.006, -0.1), 0.01, 0.012),
         'nose_off': (0.0, 0.006, 0.0), 'nose_r': 0.012, 'pad_r': None,
         'ears': {'base': (0.9, 0.01, -0.02), 'tip': (0.03, 0.045, -0.008), 'w': 0.024, 'd': 0.009, 'form': 'round', 'facing': (0.9, 0.0, 0.45)},
         'eye_r': 0.013, 'eye': (0.36, 0.004, -0.03), 'gaze': (0.12, 0.0, 0.99), 'tilt': 0.05, 'lids': (1.15, 0.7, 1.2),
         'k': dict(H.COYOTE['geo']['k'], muzzle=0.03)},
    paint={'ln': 0.55, 'ln_front': 0.3, 'ln_muzzle': 0.1, 'ln_ruff': 0.8,
           'crown': (0.6, 0.55, 0.45), 'crown_amt': 0.3, 'streak': 0.0,
           'muzzle_top': (1.0, 1.0, 1.0), 'muzzle_top_amt': 0.0, 'cream': (0.9, 0.86, 0.78), 'cream_amt': 0.5,
           'ear_back': (0.95, 0.95, 0.95), 'ear_back_amt': 1.0, 'ear_inner': (0.92, 0.9, 0.9), 'ear_dark': 0.2,
           'nose_dark': 0.0, 'lip': 0.35, 'liner': 0.6, 'tear': 0.0, 'hook': monkey_hook},
    eye={'gold': (0.55, 0.36, 0.16), 'amber': (0.36, 0.22, 0.09), 'ring': (0.12, 0.08, 0.04), 'sclera': (0.55, 0.47, 0.4),
         'pupil': ('round', 0.9, 0.92)},
    nose=None, lid_shade=0.9,
    roles={'Mod.monkey_lids': 'skin', 'Mod.monkey_ears': 'skin', 'Mod.monkey_face': 'skin'},
    extras=monkey_extras, cuts=monkey_cuts, face=True)


# ---------------------------------------------------------------------------------------------------------------
BEAK_CELL = 0.002


def beak(h, M, c):
    """the beak: an upper mandible from inside the face, hooked down at the tip, over a lower one, both narrower
    than deep; the nares two hollows at the base of the upper; the mouth's line painted dark along the join; horn
    grey at the base going dark toward the tip. Its own primitive on a 2 mm grid, untinted"""
    s, m = h.s, h.m
    ye, zf = m['eye_y'], m['front']
    a0 = np.array([0.0, ye - 0.012 * s, zf - 0.035 * s]); a1 = np.array([0.0, ye - 0.014 * s, zf + 0.055 * s]); a2 = np.array([0.0, ye - 0.042 * s, zf + 0.1 * s])
    b0 = np.array([0.0, ye - 0.034 * s, zf - 0.035 * s]); b1 = np.array([0.0, ye - 0.046 * s, zf + 0.082 * s])
    nares = [np.array([sd * 0.0065 * s, ye - 0.004 * s, zf - 0.012 * s]) for sd in (-1, 1)]

    def sdf(P):
        Q = P * np.array([1.25, 1.0, 1.0])                              # narrower across than deep
        d = H.smin(H.round_cone(Q, a0, a1, 0.028 * s, 0.014 * s), H.round_cone(Q, a1, a2, 0.014 * s, 0.0025 * s), 0.01 * s)
        d = H.smin(d, H.round_cone(Q, b0, b1, 0.022 * s, 0.0025 * s), 0.006 * s)
        for p in nares:
            d = H.smax(d, -H.ellipsoid(P, p, np.array([0.003, 0.0022, 0.0045]) * s), 0.0015 * s)
        return d

    def grad(P, e=2e-5):
        g = np.stack([sdf(P + np.array(o)) - sdf(P - np.array(o)) for o in ((e, 0, 0), (0, e, 0), (0, 0, e))], 1)
        return g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12)
    lo = np.array([-0.03 * s, ye - 0.06 * s, zf - 0.04 * s]); hi = np.array([0.03 * s, ye + 0.02 * s, zf + 0.11 * s])
    V, T, N, nb = c['mesh_field'](sdf, grad, lo, hi, BEAK_CELL, smooth=1)
    t = np.clip((V[:, 2] - a0[2]) / (a2[2] - a0[2]), 0, 1)
    col = np.array([0.5, 0.46, 0.38])[None] * (1 - t)[:, None] + np.array([0.1, 0.09, 0.08])[None] * t[:, None]
    yl = (ye - 0.027 * s) - (V[:, 2] - (zf - 0.03 * s)) * (0.017 / 0.125)   # the mouth's line, base to tip
    line = (np.abs(V[:, 1] - yl) < 0.0012 * s) & (V[:, 2] > zf - 0.025 * s)
    col[line] = 0.03
    for p in nares:
        col[np.linalg.norm(V - p, axis=1) < 0.004 * s] *= 0.4
    return [c['prim'](V, N, col, c['none'](V), np.zeros((len(V), 2)), T, np.zeros(len(V)), c['vids'](V), 'Mod.bird_beak', rough=0.4)]


def bird_hook(h, V, N, col, dens, ln, face, c):
    """plumage: a crest standing on the crown, long down the nape, short on the face; the cere bare round the beak's
    root; a dark stripe through the eye"""
    s, m = h.s, h.m
    x, y, z = V[:, 0], V[:, 1], V[:, 2]
    ye, zf, xw = m['eye_y'], m['front'], m['half_width']
    crest = c['crown'] * (1 - c['front']) * sm(ye + 0.04 * s, ye + 0.07 * s, y)
    ln = ln * (1 - crest) + 1.0 * crest
    nape = (1 - c['front']) * (1 - c['crown'])
    ln = np.maximum(ln, 0.9 * nape)
    cere = 1 - sm(0.012 * s, 0.022 * s, np.linalg.norm(V - np.array([0.0, ye - 0.018 * s, zf - 0.02 * s]), axis=1))
    dens = np.minimum(dens, 1 - cere)
    col = col * (1 - 0.3 * cere)[:, None]
    stripe = (1 - sm(0.009 * s, 0.014 * s, np.abs(y - (ye + 0.006 * s)))) * sm(xw * 0.25, xw * 0.4, np.abs(x)) * (1 - sm(zf - 0.03 * s, zf - 0.01 * s, z)) * c['front']
    col = col * (1 - 0.55 * stripe)[:, None]
    return col, dens, ln, face


BIRD = derive(H.COYOTE, id='bird', name='Bird head', fur='plumage', test=True,
    geo={'cr_y': 0.03, 'cr_z': -0.005, 'cr_r': (0.9, 0.062, 0.42),
         'mz_root': (-0.012, -0.06), 'mz_tip': (-0.016, 0.0), 'mz_r': (0.045, 0.03),
         'jaw_root': (0.0, -0.03, -0.01), 'jaw_tip': (0.0, -0.02, -0.01), 'jaw_r': (0.036, 0.024),
         'cheek': (0.7, -0.02, -0.07), 'cheek_r': (0.036, 0.034, 0.04), 'zygoma': None,
         'nose_off': (0.0, 0.0, 0.0), 'nose_r': 0.01, 'pad_r': None, 'ears': None,
         'eye_r': 0.014, 'eye': (0.56, 0.01, -0.045), 'gaze': (0.72, 0.04, 0.69), 'tilt': 0.0, 'eye_back': 0.5, 'eye_open': 0.2,
         'lids': (1.05, 0.95, 1.1),
         'k': dict(H.COYOTE['geo']['k'], muzzle=0.03)},
    paint={'ln': 1.0, 'ln_front': 0.45, 'ln_muzzle': 0.15, 'ln_ruff': 0.7,
           'crown': (0.6, 0.6, 0.62), 'crown_amt': 0.4, 'streak': 0.0,
           'muzzle_top': (1.0, 1.0, 1.0), 'muzzle_top_amt': 0.0, 'cream': (0.95, 0.94, 0.9), 'cream_amt': 0.7,
           'ear_back': (1.0, 1.0, 1.0), 'ear_back_amt': 0.0, 'ear_inner': (1.0, 1.0, 1.0), 'ear_dark': 0.0,
           'nose_dark': 0.0, 'lip': None, 'liner': 0.7, 'tear': 0.0, 'hook': bird_hook},
    eye={'gold': (0.78, 0.48, 0.12), 'amber': (0.5, 0.28, 0.07), 'ring': (0.1, 0.06, 0.03), 'sclera': (0.08, 0.06, 0.05),
         'pupil': ('round', 0.86, 0.88)},
    nose=None, prims=beak)


SPECIES = {'cat': CAT, 'lion': LION, 'rat': RAT, 'monkey': MONKEY, 'bird': BIRD}
