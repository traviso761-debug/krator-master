"""Tails for the therian heads (tools/heads.py, tools/therian.py): one body mod per species on the tail joints every
skeleton carries (Tail1..Tail8 under Hips, tools/tail.py), made from the published pieces with no Blender, as the
reptile tail is (tools/nonhuman.py, mods.tail_piece).

Each species' tail is its own chain: a length (metres on the man, scaled by the body's hip height), a fall per segment
(degrees below the level: negative rises, past 90 curls forward), a shrink, a radius at the root and the tip; so a
cat's stands up, a monkey's curls, a rat's hangs. The joints' rest offsets on the skeleton are the reptile's; the kit
item carries the species' own (tail.rest, the hips' frame, Tail2 on), which the figure puts on the joints while the
tail is worn (50-figure.js tailRest, kchar_figure.gd _tail_rest), scaled as the morphs scale the skeleton's, and the
piece's bind is that chain. The spring chain, the sway, the gravity and the collision radii are the item's (tail.*).
- the coyote's brush: short, bushy (fur kind brush), hanging, its tip black, its underside cream;
- the cat's: long and thin, carried up and over, tabby rings, plush fur, lively;
- the lion's: long, thin, hanging in a curve, a dark tuft at the end in the mane's long fur;
- the rat's: long, naked and scaly (the reptile's scale map tinted pink, role skin), tapering to a point, hanging;
- the monkey's: long, carried up and curling at the end, plush fur, lively;
- the bird's: no tube: a fan of nine flat tail feathers from the tailbone on the first three joints, stiff.
A furred tail is drawn with the garments' fur shells on its own UV (kit item fur rows: v along the tail, 0.1 m per
unit; u round it), coloured by its vertex colours times the coat tint (role coat, the hair colour).

    python3 tools/tails.py [mpfb_male mpfb_female] [coyote cat lion rat monkey bird]
writes pieces/<body>/mod_tail_<species>.glb, .morph.bin and .gshapes.bin and the kit items (replacing their earlier
entries); each item is a test mod (no people draws one), group tail (one tail at a time).
"""
import json
import math
import os
import sys

import numpy as np
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import glbio  # noqa: E402
import mods  # noqa: E402
import tail as TL  # noqa: E402
import nonhuman as NH  # noqa: E402

ROOT = os.path.dirname(HERE)
SINK = 0.05            # the tube starts this far before the root joint, inside the body
HIPS = 0.09            # its root takes the hips' weights, fading over this length
RING = 16              # vertices round a tube
PER = 4                # rings per segment
VSCALE = 0.1           # metres of tail per unit of v (the fur rows run on v)
SHADE = 0.7            # the base shade (the kit's coat gain is the hair's over it, as the heads')


def sm(a, b, v):
    return (lambda t: t * t * (3 - 2 * t))(np.clip((v - a) / (b - a), 0, 1))


# ---------------------------------------------------------------------------------------------------------------
# the species: length (m on the man), angles (a segment each: its fall below the level), shrink, r0 and r1 (the
# radius at the root and the tip, m on the man), power (how fast the radius falls at first), tall (the section's
# height over its width), tuft ((u0, u1, radius) a bulge near the tip, or None), paint (u along, th round: 0 the top,
# pi the belly -> rgb shade), fur ([(v0, v1, kind)] on v = metres / VSCALE), role, texture ('scale' or None), motion
def coyote_paint(u, th):
    c = np.full((len(u), 3), SHADE)
    c = c * (1 - 0.15 * (1 - sm(0.3, 0.8, np.abs(th - np.pi) / np.pi)))[:, None]        # the top a little darker
    belly = sm(0.45, 0.8, 1 - np.abs(th - np.pi) / np.pi) * (1 - sm(0.8, 0.9, u))
    c = c * (1 - belly[:, None]) + np.array([0.98, 0.95, 0.88]) * belly[:, None]
    tip = sm(0.82, 0.92, u)
    return c * (1 - 0.72 * tip)[:, None]


def cat_paint(u, th):
    c = np.full((len(u), 3), SHADE)
    rings = sm(0.35, 0.65, 0.5 + 0.5 * np.cos(2 * np.pi * u * 7.0)) * sm(0.08, 0.2, u)
    c = c * (1 - 0.4 * rings)[:, None]
    belly = sm(0.5, 0.85, 1 - np.abs(th - np.pi) / np.pi)
    c = c * (1 - 0.35 * belly[:, None]) + np.array([0.98, 0.96, 0.92]) * 0.35 * belly[:, None]
    return c * (1 - 0.5 * sm(0.9, 0.97, u))[:, None]


def lion_paint(u, th):
    c = np.full((len(u), 3), SHADE)
    belly = sm(0.5, 0.85, 1 - np.abs(th - np.pi) / np.pi)
    c = c * (1 - 0.25 * belly[:, None]) + np.array([0.98, 0.94, 0.86]) * 0.25 * belly[:, None]
    tuft = sm(0.8, 0.86, u)
    return c * (1 - tuft[:, None] * (1 - np.array([0.42, 0.33, 0.27])))


def rat_paint(u, th):
    return np.tile([1.0, 0.86, 0.84], (len(u), 1))


def monkey_paint(u, th):
    c = np.full((len(u), 3), SHADE)
    belly = sm(0.5, 0.85, 1 - np.abs(th - np.pi) / np.pi)
    c = c * (1 - 0.3 * belly[:, None]) + np.array([0.96, 0.92, 0.84]) * 0.3 * belly[:, None]
    return c * (1 - 0.35 * sm(0.85, 0.95, u))[:, None]


def bird_paint(u, th):
    c = np.full((len(u), 3), SHADE)
    band = sm(0.66, 0.72, u) * (1 - sm(0.78, 0.84, u))
    c = c * (1 - band[:, None]) + np.array([0.97, 0.95, 0.9]) * band[:, None]
    return c * (1 - 0.6 * sm(0.84, 0.9, u))[:, None]


MOTION = {
    'coyote': {'stiff': [0.5, 0.3, 0.2, 0.15, 0.11, 0.09, 0.08, 0.08, 0.08], 'grav': 3.0, 'damp': 0.06, 'sway': {'deg': 8.0, 'root': 0.15, 'period': 3.0}, 'pad': 0.01},
    'cat': {'stiff': [0.5, 0.26, 0.17, 0.12, 0.09, 0.07, 0.06, 0.05, 0.05], 'grav': 1.4, 'damp': 0.05, 'sway': {'deg': 18.0, 'root': 0.1, 'period': 2.4}, 'pad': 0.01},
    'lion': {'stiff': [0.5, 0.3, 0.2, 0.15, 0.11, 0.09, 0.08, 0.07, 0.07], 'grav': 3.0, 'damp': 0.06, 'sway': {'deg': 11.0, 'root': 0.12, 'period': 3.6}, 'pad': 0.01},
    'rat': {'stiff': [0.5, 0.3, 0.2, 0.14, 0.1, 0.08, 0.07, 0.06, 0.06], 'grav': 3.5, 'damp': 0.06, 'sway': {'deg': 6.0, 'root': 0.1, 'period': 2.8}, 'pad': 0.008},
    'monkey': {'stiff': [0.5, 0.26, 0.17, 0.12, 0.09, 0.07, 0.06, 0.05, 0.05], 'grav': 1.2, 'damp': 0.05, 'sway': {'deg': 16.0, 'root': 0.1, 'period': 2.6}, 'pad': 0.01},
    'bird': {'stiff': [0.6, 0.5, 0.45, 0.4], 'grav': 2.0, 'damp': 0.08, 'sway': {'deg': 4.0, 'root': 0.2, 'period': 2.0}, 'pad': 0.01},
}

SPECIES = {
    'coyote': {'name': 'Tail (coyote)', 'length': 0.42, 'angles': (55, 62, 64, 60, 52, 44, 36, 28), 'shrink': 0.9,
               'r0': 0.034, 'r1': 0.012, 'power': 0.8, 'tall': 1.0, 'tuft': None, 'paint': coyote_paint,
               'fur': [(None, None, 'brush')], 'role': 'coat', 'texture': None},
    'cat': {'name': 'Tail (cat)', 'length': 0.56, 'angles': (-38, -52, -50, -36, -18, 2, 18, 28), 'shrink': 0.93,
            'r0': 0.021, 'r1': 0.009, 'power': 1.0, 'tall': 1.0, 'tuft': None, 'paint': cat_paint,
            'fur': [(None, None, 'plush')], 'role': 'coat', 'texture': None},
    'lion': {'name': 'Tail (lion)', 'length': 0.85, 'angles': (50, 56, 56, 50, 42, 32, 22, 12), 'shrink': 0.92,
             'r0': 0.026, 'r1': 0.011, 'power': 1.0, 'tall': 1.0, 'tuft': (0.82, 0.97, 0.03), 'paint': lion_paint,
             'fur': [(None, 0.8, 'plush'), (0.8, None, 'mane')], 'role': 'coat', 'texture': None},
    'rat': {'name': 'Tail (rat)', 'length': 0.62, 'angles': (56, 62, 58, 48, 38, 28, 18, 10), 'shrink': 0.9,
            'r0': 0.016, 'r1': 0.0025, 'power': 1.2, 'tall': 1.0, 'tuft': None, 'paint': rat_paint,
            'fur': [], 'role': 'skin', 'texture': 'scale'},
    'monkey': {'name': 'Tail (monkey)', 'length': 0.74, 'angles': (-30, -46, -54, -44, -16, 26, 74, 118), 'shrink': 0.94,
               'r0': 0.02, 'r1': 0.01, 'power': 1.0, 'tall': 1.0, 'tuft': None, 'paint': monkey_paint,
               'fur': [(None, None, 'plush')], 'role': 'coat', 'texture': None},
    'bird': {'name': 'Tail (bird)', 'length': 0.34, 'angles': (42, 36, 30), 'shrink': 1.0,
             'r0': 0.012, 'r1': 0.004, 'power': 1.0, 'tall': 1.0, 'tuft': None, 'paint': bird_paint,
             'fur': [], 'role': 'coat', 'texture': None, 'feathers': 9},
}
ORDER = ['coyote', 'cat', 'lion', 'rat', 'monkey', 'bird']


# ---------------------------------------------------------------------------------------------------------------
def chain(root, L, angles, shrink):
    """the joints' rest positions and the tip: n + 1 points from the root"""
    n = len(angles)
    l0 = L * (1 - shrink) / (1 - shrink ** n) if abs(shrink - 1) > 1e-9 else L / n
    pts = [np.asarray(root, float)]
    for k, a in enumerate(angles):
        a = math.radians(a)
        pts.append(pts[-1] + np.array([0.0, -math.sin(a), -math.cos(a)]) * l0 * shrink ** k)
    return np.array(pts)


def radius_fn(sp, k):
    def r(u):
        u = np.clip(u, 0, 1)
        base = k * (sp['r1'] + (sp['r0'] - sp['r1']) * (1 - u) ** (1.35 * sp['power']))
        if sp['tuft']:
            u0, u1, rt = sp['tuft']
            base = base + k * rt * np.sin(np.pi * np.clip((u - u0) / (u1 - u0), 0, 1)) ** 0.8
        return base
    return r


def station_dir(pts, L, s):
    """the centre and the direction at arc s along the polyline pts (its cumulative lengths L)"""
    n = len(pts) - 1
    k = int(np.clip(np.searchsorted(L, s, side='right') - 1, 0, n - 1))
    a = (s - L[k]) / (L[k + 1] - L[k])
    d0 = pts[1] - pts[0]
    if s < 0:
        c = pts[0] + d0 / np.linalg.norm(d0) * s
        return c, d0 / np.linalg.norm(d0), 0, 0.0
    c = pts[k] + (pts[k + 1] - pts[k]) * a
    dirv = pts[k + 1] - pts[k]
    if 0.25 < a < 0.75:
        dirv = dirv / np.linalg.norm(dirv)
    else:                                         # near a joint: the mean of the two segments' directions, so rings do not cross
        kk = k if a >= 0.75 else k - 1
        d1 = pts[kk + 1] - pts[kk] if kk >= 0 else pts[1] - pts[0]
        d2 = pts[min(kk + 2, n)] - pts[kk + 1] if kk + 1 < n else d1
        dirv = d1 / np.linalg.norm(d1) + d2 / np.linalg.norm(d2)
        dirv = dirv / np.linalg.norm(dirv)
    return c, dirv, k, a


def weights(body, names, hip, s, k, a):
    """the joint at the segment's start and the next, linear along it; the root's first stretch the hips' too"""
    n = len(names)
    if s < 0:
        return [(hip, 0.6), (body.jidx[names[0]], 0.4)]
    j0 = body.jidx[names[k]]
    j1 = body.jidx[names[min(k + 1, n - 1)]]
    jw = [(j0, 1 - 0.5 * a), (j1, 0.5 * a)] if k + 1 < n else [(j0, 1.0)]
    if s < HIPS:
        h = 0.6 * (1 - s / HIPS)
        jw = [(q, w * (1 - h)) for q, w in jw] + [(hip, h)]
    return jw


def tube(body, m, sp, names, pts, rfn, recipe, colours, turn=None, wfn=None, ring_n=RING, thick=None):
    """a tapering tube along pts (the chain and its tip), rings of ring_n vertices, each weighted to the joints it
    lies between; turn: a rotation (3 x 3) about the root the whole tube takes (a feather of the fan); wfn(u): a
    width across instead of the radius (a flat feather), thick its half thickness. Returns the tip vertex"""
    hip = body.jidx['Hips']
    root = pts[0]
    L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    n = len(pts) - 1
    st = [-SINK, -SINK / 2] + [L[k] + (L[k + 1] - L[k]) * q / PER for k in range(n) for q in range(PER)] + [L[-1] - 0.004]
    place = lambda p: root + turn @ (p - root) if turn is not None else p
    rings = []
    for s in st:
        c, dirv, k, a = station_dir(pts, L, s)
        side = np.array([1.0, 0, 0])
        up = np.cross(dirv, side)
        if np.linalg.norm(up) < 1e-6:
            up = np.array([0.0, 1.0, 0.0])
        up /= np.linalg.norm(up)
        if up[1] < 0:
            up = -up
        side = np.cross(up, dirv); side /= np.linalg.norm(side)
        u = float(np.clip(s / L[-1], 0, 1))
        if wfn is not None:
            rs, ru = max(wfn(u), 1e-4), thick
        else:
            r = float(rfn(u)) * (1.08 if s < 0 else 1.0)
            rs, ru = r, r * sp['tall']
        jw = weights(body, names, hip, s, k, a)
        ring, first = [], None
        for i in range(ring_n + 1):
            th = 2 * math.pi * i / ring_n
            p = place(c + rs * math.sin(th) * side + ru * math.cos(th) * up)     # th 0 the top, pi the belly
            uv = (i / ring_n, s / VSCALE)
            vi = m.v(p, uv, jw, recipe, vid=None if i < ring_n else m.VID[first])
            if i == 0:
                first = vi
            ring.append(vi)
            colours.append(((u, th)))
        rings.append(ring)
    m.grid(rings)
    tipv = m.v(place(pts[-1]), (0.5, L[-1] / VSCALE), [(body.jidx[names[-1]], 1.0)], recipe)
    colours.append((1.0, 0.0))
    m.fan(rings[-1], tipv)
    c0, d0, _, _ = station_dir(pts, L, -SINK)
    rv = m.v(place(c0), (0.5, -SINK / VSCALE), [(hip, 0.6), (body.jidx[names[0]], 0.4)], recipe)
    colours.append((0.0, 0.0))
    m.fan(rings[0], rv, flip=True)
    return L


def make(body, out, sp_id, rec):
    """the species' tail piece on body (its tail joints added on the species' chain) and its kit item's tail dict"""
    sp = SPECIES[sp_id]
    B = body.prims['Human.body']
    hips = body.bind[body.jidx['Hips']]
    hips_y = hips[1, 3]
    k = hips_y / TL.HIPS_REF
    root = TL.root_at(B['POSITION'].astype(float), B['T'], hips[:3, 3])
    pts = chain(root, sp['length'] * k, sp['angles'], sp['shrink'])
    names = TL.names()[:len(sp['angles'])]
    rows = []
    for q, n in enumerate(names):
        M = hips.copy(); M[:3, 3] = pts[q]
        rows.append((n, 'Hips' if q == 0 else names[q - 1], M))
    body.add(rows)
    _, kb = cKDTree(B['POSITION'].astype(float)).query(root - np.array([0, 0, TL.ROOT_IN]))
    b_root = int(B['VID'][kb])
    recipe = (b_root, 0.0, '', 1.0, root)
    m = mods._Smooth(rec)
    colours = []
    rfn = radius_fn(sp, k)
    if sp.get('feathers'):
        nf = sp['feathers']
        for i in range(nf):
            phi = math.radians((i - (nf - 1) / 2) * 9.0)
            Ry = np.array([[math.cos(phi), 0, math.sin(phi)], [0, 1, 0], [-math.sin(phi), 0, math.cos(phi)]])
            wfn = lambda u, kk=k: kk * 0.022 * np.sin(np.pi * np.clip(u, 0, 1) ** 0.7) ** 0.8 + 0.002 * (1 - u)
            L = tube(body, m, sp, names, pts, rfn, recipe, colours, turn=Ry, wfn=wfn, ring_n=6, thick=0.0015 * k)
    else:
        L = tube(body, m, sp, names, pts, rfn, recipe, colours)
    cu = np.array([c[0] for c in colours]); cth = np.array([c[1] for c in colours])
    C = np.clip(sp['paint'](cu, cth), 0, 1)
    image = nrm = None
    if sp['texture'] == 'scale':
        import reptile as RP
        smap = RP.scale_map(mods.texture_mean(body))
        image, nrm = smap if smap else (mods.scale_texture(mods.texture_mean(body)), None)
    mid = 'mod_tail_' + sp_id
    mat = 'Mod.tail_' + sp_id
    axis = lambda q: mods._nearest_on(pts, q)
    prim = m.prim({'name': mat, 'rough': 0.85 if sp['texture'] is None else 0.55}, image, outward=axis)
    prim['C'] = C
    if nrm:
        prim['normal'] = nrm
    mods.write_piece(body, os.path.join(out, mid + '.glb'), mid, [prim])
    Rh = hips[:3, :3] / np.linalg.norm(hips[:3, :3], axis=0)
    off = lambda v: [round(float(x), 5) for x in Rh.T @ v]
    Lc = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    tail = {'joints': names, 'rest': [off(pts[q] - pts[q - 1]) for q in range(1, len(names))], 'tip': off(pts[-1] - pts[-2]),
            'radius': [round(float(rfn(Lc[q] / Lc[-1])), 4) for q in range(len(names) + 1)]}
    tail.update(MOTION[sp_id])
    fur = []
    for v0, v1, kind in sp['fur']:
        a = -1.0 if v0 is None else round(v0 * Lc[-1] / VSCALE, 3)
        b = 100.0 if v1 is None else round(v1 * Lc[-1] / VSCALE, 3)
        fur.append([a, b, kind, round(2 * math.pi * float(rfn(0.5)), 4), VSCALE])
    entry = {'id': mid, 'name': sp['name'], 'slot': 'mods', 'glb': 'pieces/%s/%s.glb' % (os.path.basename(out), mid),
             'grants': {'tail': True}, 'group': 'tail', 'kind': 'therian', 'test': True, 'tail': tail}
    if fur:
        entry['fur'] = fur
    print(os.path.basename(out), mid, '%d vertices, %d triangles, %.2f m' % (len(prim['P']), len(prim['T']), Lc[-1]))
    return entry, {mat: sp['role']}


def run(body_name, species):
    pieces, data = os.path.join(ROOT, 'pieces', body_name), os.path.join(ROOT, 'data', body_name)
    kp = os.path.join(data, 'kit.json')
    kit = json.load(open(kp, encoding='utf-8'))
    skel = json.load(open(os.path.join(data, 'skeleton.json'), encoding='utf-8'))
    J = skel['joints']
    T = len(kit['morph']['targets'])
    ents = NH.read_kmr1(open(os.path.join(pieces, 'base.morph.bin'), 'rb').read())
    d_base = NH.dense(next(e for e in ents if 'Human.body' in e[0]), T)
    d_joint, _ = NH.joint_delta_fn(kit, J)
    for sp_id in species:
        b = mods.Body(os.path.join(pieces, 'base.glb'))      # fresh: each species adds its own chain
        rec = mods.Recipe()
        entry, roles = make(b, pieces, sp_id, rec)
        hips_y = b.bind[b.jidx['Hips']][1, 3]
        s = d_joint('Hips')[:, 1] / hips_y
        big = NH.write_deltas(os.path.join(pieces, entry['id'] + '.glb'), entry['id'], rec, d_base, d_joint, s)
        at = [i for i, it in enumerate(kit['items']) if it['id'] == entry['id']]
        if at:
            kit['items'][at[0]] = entry
        else:
            kit['items'].append(entry)
        kit['tint']['roles'].update(roles)
        print('  deltas at most %.3f m' % big)
    with open(kp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(kit, f, indent=1)


if __name__ == '__main__':
    a = sys.argv[1:]
    bodies = [x for x in a if x.startswith('mpfb_')] or ['mpfb_male', 'mpfb_female']
    species = [x for x in a if x in SPECIES] or ORDER
    for bd in bodies:
        run(bd, species)
