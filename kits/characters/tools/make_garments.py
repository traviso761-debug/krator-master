# Headless: blender -b --python tools/make_garments.py -- <male|female> [--only <id>,...] [--render <png dir>]
# Voth (Chichani) clothing for the MakeHuman bodies, made as MakeHuman clothes (.mhclo + .obj + .mhmat + texture) in
# MPFB's user data, so tools/mpfb_build.py fits, weights and morphs them like any library item.
#
# Each garment is built on the body it is for, from parts:
#   tube   rings round an axis (the spine, an arm, a leg, a foot): each ring point is cast out from the axis to the skin
#          and set off it by an ease; below a 'hang' row a ring only grows (cloth falls straight or flares from the
#          widest point above it instead of hugging the waist)
#   arc    a tube over part of the circle (a cape over the back, a flap, a shin guard)
# then smoothed and pushed out of the skin a few times. Rows below the crotch are matched to MakeHuman's skirt helper
# (they swing with both legs), the rest to the body. Every part has its own strip of one texture, painted here:
# woven cloth, hem bands, step frets, zigzags and the diamond of Voth (data from GARMENTS).
import bpy, bmesh, addon_utils, os, sys, math, json, uuid
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
addon_utils.enable('bl_ext.user_default.mpfb', default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.targetservice import TargetService
from bl_ext.user_default.mpfb.services.clothesservice import ClothesService
from bl_ext.user_default.mpfb.services.locationservice import LocationService
from bl_ext.user_default.mpfb.entities.meshcrossref import MeshCrossRef
from bl_ext.user_default.mpfb.entities.objectproperties import GeneralObjectProperties

ARGS = sys.argv[sys.argv.index('--') + 1:]
BODY = ARGS[0]
ONLY = ARGS[ARGS.index('--only') + 1].split(',') if '--only' in ARGS else None
RENDER = ARGS[ARGS.index('--render') + 1] if '--render' in ARGS else None
MACRO = {'male': {'gender': 1.0, 'muscle': 0.6, 'height': 0.55}, 'female': {'gender': 0.0, 'muscle': 0.55, 'height': 0.5}}[BODY]
OUT = LocationService.get_user_data('clothes')
TEX = 1024

# ---------------------------------------------------------------------------------------------------------------
# the palette: Chichani dyes. Undyed maguey and cotton for the poor; ochre, madder, indigo and soot for the trades;
# Voth's deep purple and ash-white, crimson, gold and quetzal green for the court
C = {'maguey': (0.70, 0.64, 0.52), 'cotton': (0.86, 0.82, 0.72), 'earth': (0.42, 0.30, 0.20), 'soot': (0.10, 0.09, 0.09),
     'ochre': (0.66, 0.42, 0.13), 'madder': (0.58, 0.18, 0.12), 'indigo': (0.10, 0.13, 0.28), 'rust': (0.55, 0.28, 0.14),
     'clay': (0.66, 0.38, 0.24), 'umber': (0.30, 0.21, 0.15), 'purple': (0.17, 0.06, 0.22), 'ash': (0.86, 0.84, 0.82),
     'crimson': (0.42, 0.04, 0.07), 'gold': (0.86, 0.64, 0.22), 'jade': (0.16, 0.48, 0.36), 'quetzal': (0.10, 0.42, 0.30),
     'leather': (0.36, 0.22, 0.12), 'hide': (0.58, 0.42, 0.28), 'black': (0.06, 0.05, 0.05), 'teal': (0.12, 0.36, 0.38)}

# ---------------------------------------------------------------------------------------------------------------
# the body
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
macro = TargetService.get_default_macro_info_dict(); macro.update(MACRO)
base = HumanService.create_human(mask_helpers=True, detailed_helpers=True, extra_vertex_groups=True, feet_on_ground=True, scale=0.1, macro_detail_dict=macro)
rig = HumanService.add_builtin_rig(base, 'mixamo')
for m in base.modifiers:
    if m.type == 'MASK': m.show_viewport = m.show_render = False
dep = bpy.context.evaluated_depsgraph_get()
ev = base.evaluated_get(dep).to_mesh()
CO = np.array([(base.matrix_world @ v.co)[:] for v in ev.vertices])
gi = base.vertex_groups['body'].index
inbody = np.zeros(len(CO), bool)
for v in base.data.vertices:
    if any(g.group == gi for g in v.groups): inbody[v.index] = True
POLY = [list(p.vertices) for p in ev.polygons if all(inbody[i] for i in p.vertices)]
base.evaluated_get(dep).to_mesh_clear()
for m in base.modifiers:
    if m.type == 'MASK': m.show_viewport = m.show_render = True
BVH = BVHTree.FromPolygons([Vector(c) for c in CO], POLY)


def J(n, end='head'):
    b = rig.pose.bones['mixamorig:' + n]
    return np.array((rig.matrix_world @ (b.head if end == 'head' else b.tail))[:])


# the skin without the arms (beyond the shoulder joints): a tunic is fitted to this, so the arms pass through its
# armholes (the sleeves cover them) instead of its shoulders bulging over the deltoids
def _arm_mask():
    arm = np.zeros(len(CO), bool)
    for s in ('Left', 'Right'):
        a, b = J(s + 'Arm'), J(s + 'Hand', 'tail')
        d = (b - a) / np.linalg.norm(b - a)
        t = (CO - a) @ d
        dist = np.linalg.norm(CO - a - np.outer(t, d), axis=1)
        arm |= (t > 0.015) & (dist < 0.11)
    return arm
ARM = _arm_mask()
BVH_T = BVHTree.FromPolygons([Vector(c) for c in CO], [p for p in POLY if not any(ARM[i] for i in p)])


def _limb_mask():
    m = np.zeros(len(CO), bool)
    for s in ('Left', 'Right'):
        for a, b in ((J(s + 'Arm') - (J(s + 'ForeArm') - J(s + 'Arm')) * 0.45, J(s + 'ForeArm')), (J(s + 'ForeArm'), J(s + 'Hand', 'tail'))):
            d = b - a; L = np.linalg.norm(d); d = d / L
            t = (CO - a) @ d
            dist = np.linalg.norm(CO - a - np.outer(t, d), axis=1)
            m |= (t > -0.02) & (t < L + 0.02) & (dist < 0.12)
    return m
# the arms with their shoulders: what a sleeve is fitted to (rays from inside the shoulder no longer find the far
# side of the chest)
BVH_A = BVHTree.FromPolygons([Vector(c) for c in CO], [p for p in POLY if all(_LM[i] for i in p)]) if (_LM := _limb_mask()) is not None else None


HIPS, NECK, HEAD = J('Hips'), J('Neck'), J('Head')
CROTCH = J('LeftUpLeg')[2] - 0.075             # a little below the hip joints
WAIST = J('Spine')[2] + 0.02
CHEST = J('Spine2')[2] + 0.02
TOP = NECK[2] + 0.005                          # neck base
KNEE = J('LeftLeg')[2]
ANKLE = J('LeftFoot')[2]
SHOULDER = J('LeftArm')[2]


def spine_at(z):
    """the body's axis at height z: the spine joints' x, y (the hips' below them)"""
    pts = [J('Hips'), J('Spine'), J('Spine1'), J('Spine2'), J('Neck'), J('Head')]
    if z <= pts[0][2]: return np.array([pts[0][0], pts[0][1] + 0.01, z])
    for a, b in zip(pts, pts[1:]):
        if a[2] <= z <= b[2]:
            t = (z - a[2]) / max(1e-6, b[2] - a[2])
            p = a + (b - a) * t
            return np.array([p[0], p[1], z])
    return np.array([pts[-1][0], pts[-1][1], z])


def first_hit(o, d, maxd=0.6, bvh=None):
    loc, n, i, dist = (bvh or BVH).ray_cast(Vector(o), Vector(d), maxd)
    return None if loc is None else dist


def nearest(p, bvh=None):
    loc, n, i, dist = (bvh or BVH).find_nearest(Vector(p))
    return np.array(loc[:]), np.array(n[:])


def frame(t):
    """two unit vectors across the axis direction t: x the side most along +X (or -Y), y = t x x"""
    t = t / np.linalg.norm(t)
    ref = np.array([1.0, 0, 0]) if abs(t[0]) < 0.8 else np.array([0, -1.0, 0])
    x = ref - t * ref.dot(t); x /= np.linalg.norm(x)
    return x, np.cross(t, x)


# ---------------------------------------------------------------------------------------------------------------
# parts: a grid of points P[rows, cols], v down the rows (0 at the top edge), u across the cols
class Part:
    def __init__(self, name, P, closed, group, paint, uv_len=None):
        self.name, self.P, self.closed, self.group, self.paint = name, P, closed, group, paint
        # what of it hangs free (cloth_spec): the row each column starts to hang from, and how stiff it is
        self.cloth = None

    def lengths(self):
        P = self.P
        cols = np.linalg.norm(np.diff(P, axis=0), axis=2).sum(0).mean()           # down a column
        R = np.concatenate([P, P[:, :1]], 1) if self.closed else P
        rows = np.linalg.norm(np.diff(R, axis=1), axis=2).sum(1).mean()            # round a row
        return rows, cols


def ring_points(c, x, y, angles, ease, rmin=0.0, rmax=0.6, scale=(1.0, 1.0), bvh=None):
    """points round axis point c: per angle, out to the skin along that direction, plus the ease (a ray through a hole
    in the skin, an armhole, takes its neighbours' distance)"""
    ds, rs = [], []
    for a in angles:
        d = x * math.cos(a) * scale[0] + y * math.sin(a) * scale[1]
        d = d / np.linalg.norm(d)
        h = first_hit(c, d, bvh=bvh)
        ds.append(d); rs.append(np.nan if h is None else h + ease)
    rs = np.array(rs)
    if np.isnan(rs).all(): rs[:] = rmin
    elif np.isnan(rs).any():
        k = np.arange(len(rs)); ok = ~np.isnan(rs)
        rs = np.interp(k, np.concatenate([k[ok] - len(rs), k[ok], k[ok] + len(rs)]), np.tile(rs[ok], 3))
    return [c + d * min(max(rmin, r), rmax) for d, r in zip(ds, rs)]


def smooth_push(P, closed, ease, iters=3, fix_top=False, fix_bottom=False, rows_ease=None, bvh=None):
    """relax the grid (each point toward its neighbours' mean) and push it back out of the skin"""
    R, Cn = P.shape[:2]
    E = rows_ease if rows_ease is not None else np.full(R, ease)
    for _ in range(iters):
        Q = P.copy()
        for i in range(R):
            if (i == 0 and fix_top) or (i == R - 1 and fix_bottom): continue
            for j in range(Cn):
                nb = []
                if i > 0: nb.append(P[i - 1, j])
                if i < R - 1: nb.append(P[i + 1, j])
                if closed or j > 0: nb.append(P[i, (j - 1) % Cn])
                if closed or j < Cn - 1: nb.append(P[i, (j + 1) % Cn])
                Q[i, j] = P[i, j] * 0.5 + np.mean(nb, 0) * 0.5
        P = Q
        for i in range(R):
            for j in range(Cn):
                loc, n = nearest(P[i, j], bvh)
                s = (P[i, j] - loc).dot(n)
                if s < E[i]: P[i, j] = P[i, j] + n * (E[i] - s)
    return P


def hang(P, axes, start, flare, closed=True):
    """from row 'start' down (one per column, or one for all), each column's distance from the axis never shrinks (and
    grows by flare per metre)"""
    starts = start if hasattr(start, '__len__') else [start] * P.shape[1]
    for j in range(P.shape[1]):
        for i in range(starts[j] + 1, P.shape[0]):
            c = axes[i]
            d = P[i, j] - c; d[2] = 0
            prev = P[i - 1, j] - axes[i - 1]; prev[2] = 0
            r, r0 = np.linalg.norm(d), np.linalg.norm(prev)
            dz = abs(P[i - 1, j][2] - P[i, j][2])
            want = r0 + flare * dz
            if r < want:
                dd = d / r if r > 1e-6 else prev / max(r0, 1e-6)
                P[i, j] = np.array([c[0], c[1], P[i, j][2]]) + dd * want
    return P


def hull2(pts):
    pts = sorted(map(tuple, pts))
    def half(seq):
        h = []
        for p in seq:
            while len(h) >= 2 and (h[-1][0] - h[-2][0]) * (p[1] - h[-2][1]) - (h[-1][1] - h[-2][1]) * (p[0] - h[-2][0]) <= 0: h.pop()
            h.append(p)
        return h
    lo, up = half(pts), half(reversed(pts))
    return np.array(lo[:-1] + up[:-1])


def hull_rows(P, axes, rows):
    """cloth spans hollows: each of these rings goes out to the convex hull of itself (between the breasts, round both
    legs, over the small of the back)"""
    for i in rows:
        c = axes[i][:2]
        H = hull2(P[i, :, :2])
        if len(H) < 3: continue
        E = np.roll(H, -1, 0) - H
        for j in range(P.shape[1]):
            d = P[i, j, :2] - c; r = np.linalg.norm(d)
            if r < 1e-6: continue
            d = d / r
            best = r
            for a, e in zip(H, E):          # ray c + t d against segment a + s e
                den = d[0] * e[1] - d[1] * e[0]
                if abs(den) < 1e-12: continue
                w = a - c
                t = (w[0] * e[1] - w[1] * e[0]) / den
                s_ = (w[0] * d[1] - w[1] * d[0]) / den
                if t > 0 and -1e-9 <= s_ <= 1 + 1e-9: best = max(best, t)
            P[i, j, :2] = c + d * best
    return P


def torso_tube(name, z0, z1, ease, paint, n=40, hang_from=None, flare=0.0, arc=None, rows=None, group_below=None,
               scale=(1.0, 1.0), ease_bottom=None, iters=3, hang_side=None, points=None, hull_from=None, over_arms=False,
               stiff=0.12, layer=None):
    """rings round the body's vertical axis from z0 (top) down to z1; dense near the shoulders. arc=(a0, a1): only
    that part of the circle (radians, 0 at the back, +pi/2 at the body's left). hang_from: the height cloth falls
    from at the front and back; hang_side: at the sides (lower, under the arms). points=(depth, power): the lower edge
    reaches 'depth' further down at the front and the back (a quechquemitl's points). hull_from: rings below this
    height span hollows. over_arms: fitted over the arms too (a mantle, a cape), not under them"""
    bvh = BVH if over_arms else BVH_T
    zs = []
    z = z0
    while z > z1 + 1e-4:
        zs.append(z)
        step = 0.012 if z > SHOULDER - 0.04 else 0.03
        z -= step
    if zs and zs[-1] - z1 < 0.008: zs[-1] = z1
    else: zs.append(z1)
    if rows: zs = list(np.linspace(z0, z1, rows))
    if arc: angles = np.linspace(arc[0], arc[1], n)
    else: angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    # 0 at the back (+Y), turning toward the body's left (+X)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    Es = np.linspace(ease, ease_bottom if ease_bottom is not None else ease, len(zs))
    P = np.array([ring_points(spine_at(z), x, y, angles, Es[k], rmin=0.05, scale=scale, bvh=bvh) for k, z in enumerate(zs)])
    axes = [spine_at(z) for z in zs]
    near = lambda zz: int(np.argmin([abs(z - zz) for z in zs]))
    start = None
    if hang_from is not None:
        hs = hang_side if hang_side is not None else hang_from
        start = [near(hs) if abs(math.sin(a)) > 0.55 else near(hang_from) for a in angles]
        P = hang(P, axes, start, flare)
    P = smooth_push(P, arc is None, ease, iters=iters, rows_ease=Es, bvh=bvh)
    if hang_from is not None:
        P = hang(P, axes, start, flare)
    if hull_from is not None and arc is None:
        P = hull_rows(P, axes, [i for i, z in enumerate(zs) if z < hull_from])
    if points:
        depth, pw = points
        top = zs[start[0]] if start else zs[0]
        for j, a in enumerate(angles):
            f = 1 + depth / max(0.05, top - zs[-1]) * abs(math.cos(a)) ** pw
            for i in range(len(zs)):
                if zs[i] < top:
                    zn = top - (top - zs[i]) * f
                    d = P[i, j] - axes[i]; d[2] = 0
                    P[i, j] = np.array([axes[i][0], axes[i][1], zn]) + d * (1 + (f - 1) * 0.5 * (top - zs[i]) / max(0.05, top - zs[-1]))
    grp = ['helper-skirt' if (group_below is not None and P[k, :, 2].mean() < group_below) else 'body' for k in range(len(zs))]
    part = Part(name, P, arc is None, grp, paint)
    if start is not None and stiff is not None:
        part.cloth = {'start': start, 'stiff': stiff}
        if layer is not None: part.cloth['layer'] = layer
    return part


def limb_tube(name, a, b, ease, paint, n=20, rows=8, ease_end=None, start_back=0.0, arc=None, group='body', path=None, bvh=None, rmax=0.25):
    """rings round the line a -> b, or round a polyline path (an arm through its elbow): ease grows to ease_end toward
    the end. The ring frames are carried along the path (no twist)"""
    pts = np.array(path if path is not None else [a, b], float)
    t0 = (pts[1] - pts[0]) / np.linalg.norm(pts[1] - pts[0])
    pts[0] = pts[0] - t0 * start_back
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)]); total = cum[-1]
    if arc: angles = np.linspace(arc[0], arc[1], n)
    else: angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Es = np.linspace(ease, ease_end if ease_end is not None else ease, rows)
    x, _ = frame(t0)
    rings = []
    for k in range(rows):
        sdist = total * k / (rows - 1)
        i = min(len(seg) - 1, int(np.searchsorted(cum, sdist, side='right') - 1))
        f = (sdist - cum[i]) / seg[i]
        c = pts[i] + (pts[i + 1] - pts[i]) * f
        # the direction, blended across a joint
        t = (pts[i + 1] - pts[i]) / seg[i]
        if i + 1 < len(seg) and f > 0.7:
            t2 = (pts[i + 2] - pts[i + 1]) / seg[i + 1]; w = (f - 0.7) / 0.6
            t = t * (1 - w) + t2 * w
        if i > 0 and f < 0.3:
            t1 = (pts[i] - pts[i - 1]) / seg[i - 1]; w = (0.3 - f) / 0.6
            t = t * (1 - w) + t1 * w
        t = t / np.linalg.norm(t)
        x = x - t * x.dot(t); x = x / np.linalg.norm(x)
        y = np.cross(t, x)
        rings.append(ring_points(c, x, y, angles, Es[k], rmin=0.02, rmax=rmax, bvh=bvh))
    P = np.array(rings)
    P = smooth_push(P, arc is None, ease, iters=2, rows_ease=Es, bvh=bvh)
    return Part(name, P, arc is None, [group] * rows, paint)


def sheet(name, P, group, paint, ease=0.006, iters=2):
    P = smooth_push(np.array(P), False, ease, iters=iters)
    return Part(name, P, False, group, paint)


def flap(name, top_center, width, length, out, paint, cols=7, rows=10, ease=0.012, group_below=None, sway=0.0):
    """a cloth panel hanging from top_center, its face along 'out' (horizontal), 'width' across, 'length' down"""
    out = out / np.linalg.norm(out)
    side = np.cross(np.array([0, 0, 1.0]), out); side /= np.linalg.norm(side)
    P = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            u = j / (cols - 1) - 0.5
            p = top_center + side * u * width * (1 + 0.1 * v) + np.array([0, 0, -length * v]) + out * (sway * v * v)
            row.append(p)
        P.append(row)
    P = np.array(P)
    P = smooth_push(P, False, ease, iters=3)
    grp = ['helper-skirt' if (group_below is not None and P[i, :, 2].mean() < group_below) else 'body' for i in range(rows)]
    part = Part(name, P, False, grp, paint)
    part.cloth = {'start': 0, 'stiff': 0.08, 'layer': 1}
    return part


# ---------------------------------------------------------------------------------------------------------------
# texture painting: each part a strip of the texture; its paint is a dict
#   base: colour, weave: grain strength, bands: [(where, from_m, to_m, style, fg, bg, repeat_m)]
#   where 'bottom' (metres up from the lower edge), 'top' (down from the upper edge); styles solid, fret, steps,
#   zigzag, diamonds, checks, stripes, dots, feather
rng = np.random.default_rng(7)
FRET = ["XXXXXXXXXXXX",
        "X..........X",
        "X.XXXXXXXX.X",
        "X.X......X.X",
        "X.X.XXXX.X.X",
        "X.X.X..X.X.X",
        "X.X.X..XXX.X",
        "X.X.X......X",
        "X.X.XXXXXXXX",
        "X.X.........",
        "X.XXXXXXXXXX",
        "X..........."]
FRETA = np.array([[c == 'X' for c in r] for r in FRET])


def motif(style, w, h, fg, bg):
    """one cell of a band, w x h pixels, as an RGB array"""
    img = np.empty((h, w, 3)); img[:] = bg
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / w, (yy + 0.5) / h
    if style == 'solid': img[:] = fg
    elif style == 'fret':
        m = FRETA[(v * FRETA.shape[0]).astype(int).clip(0, FRETA.shape[0] - 1), (u * FRETA.shape[1]).astype(int).clip(0, FRETA.shape[1] - 1)]
        img[m] = fg
    elif style == 'steps':                       # stepped pyramids, Mesoamerican temple profiles
        s = np.floor(np.minimum(u, 1 - u) * 8) / 4
        img[(1 - v) < s] = fg
    elif style == 'zigzag':
        tri = np.abs(((u * 2) % 2) - 1)
        img[np.abs(v - (0.15 + 0.7 * tri)) < 0.16] = fg
    elif style == 'diamonds':                    # the diamond of Voth, hollowed
        d = np.abs(u - 0.5) * 2 + np.abs(v - 0.5) * 2
        img[(d < 0.9) & (d > 0.45)] = fg
        img[d < 0.2] = fg
    elif style == 'checks':
        img[((u * 2).astype(int) + (v * 2).astype(int)) % 2 == 0] = fg
    elif style == 'stripes':
        img[(v * 4).astype(int) % 2 == 0] = fg
    elif style == 'dots':
        img[((u - 0.5) ** 2 + (v - 0.5) ** 2) < 0.06] = fg
    elif style == 'feather':                     # overlapping feather scales
        uu = (u + 0.5 * (v > 0.5)) % 1
        vv = (v * 2) % 1
        d = ((uu - 0.5) * 1.6) ** 2 + (vv - 0.1) ** 2
        img[d < 0.36] = fg
        img[(d < 0.36) & (np.abs(uu - 0.5) < 0.04)] = np.array(bg) * 0.7 + np.array(fg) * 0.3
    return img


def paint_strip(spec, W, H, circ, length):
    img = np.empty((H, W, 3)); img[:] = spec['base']
    g = spec.get('weave', 0.06)
    if g:
        n = rng.normal(0, g * 0.5, (H, W, 1))
        thread = (((np.arange(W) % 3) == 0)[None, :, None] * 0.5 + ((np.arange(H) % 3) == 0)[:, None, None] * 0.5) * g
        img = img * (1 + n - thread)
    for where, f0, f1, style, fg, bg, rep in spec.get('bands', []):
        # metres to rows (v grows downward: row 0 is the top edge)
        if where == 'bottom': r0, r1 = (1 - f1 / length) * H, (1 - f0 / length) * H
        else: r0, r1 = f0 / length * H, f1 / length * H
        r0, r1 = int(max(0, round(r0))), int(min(H, round(r1)))
        if r1 - r0 < 1: continue
        n_rep = max(1, int(round(circ / rep))) if rep else 1
        cw = max(2, W // n_rep)
        cell = motif(style, cw, r1 - r0, np.array(fg), np.array(bg if bg is not None else spec['base']))
        band = np.tile(cell, (1, W // cw + 1, 1))[:, :W]
        img[r0:r1] = band * (1 + rng.normal(0, 0.02, (r1 - r0, W, 1)))
    return img.clip(0, 1)


# ---------------------------------------------------------------------------------------------------------------
SPINE = ('Hips', 'Spine', 'Spine1', 'Spine2')


def cloth_spec(p, offset, slot):
    """the bone chains a hanging part gets (make_mpfb.py turns them into joints): every ~7.5 cm round a tube (~10 cm
    across a cape or flap) a column becomes a chain, from the row it starts to hang from down to the hem, one bone
    per ~12 cm, shorter near the top; each chain hangs from the spine joint just above its top (the head's, for
    headgear). Its layer says what it lies over: 0 a skirt, 1 a tunic's or robe's hem and flaps, 2 capes, cloaks and
    mantles (the figure keeps a layer's chains outside the lower layers')"""
    if not p.cloth: return None
    R, Cn = p.P.shape[:2]
    st = p.cloth['start']
    starts = list(st) if hasattr(st, '__len__') else [st] * Cn
    circ, _ = p.lengths()
    if p.closed:
        n = int(max(8, min(20, round(circ / 0.075))))
        cols = sorted({int(round(k * Cn / n)) % Cn for k in range(n)})
    else:
        n = int(max(2, round(circ / 0.1) + 1))
        cols = sorted({int(round(x)) for x in np.linspace(0, Cn - 1, n)})
    chains = []
    for col in cols:
        r0 = int(starts[col])
        if r0 >= R - 1: continue
        seg = np.linalg.norm(np.diff(p.P[r0:, col], axis=0), axis=1)
        nseg = int(np.clip(round(seg.sum() / 0.12), 1, 6))
        # shorter bones near the top, where the thighs push hardest
        rows = sorted({int(round(r0 + (R - 1 - r0) * u ** 1.5)) for u in np.linspace(0, 1, nseg + 1)})
        z = p.P[r0, col, 2]
        parent = 'Hips'
        for jn in SPINE:
            if J(jn)[2] <= z + 0.02: parent = jn
        if slot == 'head': parent = 'Head'
        chains.append({'col': col, 'rows': rows, 'parent': parent})
    if not chains: return None
    return {'name': p.name, 'offset': offset, 'rows': R, 'cols': Cn, 'closed': bool(p.closed), 'stiff': p.cloth['stiff'],
            'layer': p.cloth.get('layer', 1 if slot == 'torso' else 2 if slot == 'head' else 0), 'chains': chains}


def build(gid, label, parts, slot='torso'):
    """the parts as one mesh with UVs (one texture strip each), its texture and material, and the .mhclo"""
    me = bpy.data.meshes.new(gid)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new('UVMap')
    lens = [p.lengths() for p in parts]
    share = np.array([max(0.12, l[1]) for l in lens]); share = share / share.sum()
    img = np.zeros((TEX, TEX, 3))
    y0, groups = 0, []
    for k, (p, (circ, length)) in enumerate(zip(parts, lens)):
        h = TEX - y0 if k == len(parts) - 1 else int(round(share[k] * TEX))
        img[y0:y0 + h] = paint_strip(p.paint, TEX, h, circ, length)
        v_top, v_bot = 1 - y0 / TEX, 1 - (y0 + h) / TEX
        pad = 1.5 / TEX
        R, Cn = p.P.shape[:2]
        vs = [[bm.verts.new(Vector(p.P[i, j])) for j in range(Cn)] for i in range(R)]
        for i in range(R):
            for j in range(Cn): groups.append(p.group[i])
        jcount = Cn if p.closed else Cn - 1
        for i in range(R - 1):
            for j in range(jcount):
                j2 = (j + 1) % Cn
                f = bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j2], vs[i][j2]))
                for loop, (ii, jj) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                    u = jj / (Cn if p.closed else Cn - 1)
                    v = v_top - pad - (v_top - v_bot - 2 * pad) * ii / (R - 1)
                    loop[uvl].uv = (u, v)
        y0 += h
    bm.verts.index_update()
    # faces out of the body: flip the part's faces where they face in (by the first face's centre against the skin)
    bm.normal_update()
    for f in bm.faces:
        c = f.calc_center_median()
        loc, n = nearest(np.array(c[:]))
        if np.array(f.normal[:]).dot(np.array(c[:]) - loc) < 0: f.normal_flip()
    bm.to_mesh(me); bm.free()
    obj = bpy.data.objects.new(gid, me)
    bpy.context.collection.objects.link(obj)
    for name in sorted(set(groups)): obj.vertex_groups.new(name=name)
    for i, g in enumerate(groups): obj.vertex_groups[g].add([i], 1.0, 'REPLACE')
    d = os.path.join(OUT, gid)
    os.makedirs(d, exist_ok=True)
    # the texture (Blender's own image writer: its Python has no PIL); rows bottom-up, sRGB
    im = bpy.data.images.new(gid, TEX, TEX, alpha=False)
    rgba = np.ones((TEX, TEX, 4), np.float32); rgba[..., :3] = np.power(img[::-1], 1 / 2.2)
    im.pixels.foreach_set(rgba.ravel())
    im.filepath_raw = os.path.join(d, gid + '.png'); im.file_format = 'PNG'; im.save()
    with open(os.path.join(d, gid + '.mhmat'), 'w') as f:
        f.write('# Voth clothing (kits/characters/tools/make_garments.py)\nname %s\nambientColor 1.0 1.0 1.0\n'
                'diffuseColor 1.0 1.0 1.0\nspecularColor 0.1 0.1 0.1\nshininess 0.1\nopacity 1.0\ntransparent False\n'
                'backfaceCull False\ncastShadows True\nreceiveShadows True\ndiffuseTexture %s.png\n'
                'shader shaders/glsl/litsphere\nshaderConfig diffuse True\n' % (gid, gid))
    props = {'name': gid, 'author': 'Krator (generated)', 'license': 'CC0', 'description': label, 'homepage': '',
             'uuid': str(uuid.uuid5(uuid.NAMESPACE_URL, 'krator/voth/' + gid))}
    check = ClothesService.mesh_is_valid_as_clothes(obj, base)
    if not check['all_checks_ok']:
        print('GARMENT INVALID', gid, check); return None
    mhclo = ClothesService.create_mhclo_from_clothes_matching(base, obj, properties_dict=props, delete_group=None)
    mhclo.material = gid + '.mhmat'
    ref = ClothesService.get_reference_scale(base)
    mhclo.write_mhclo(os.path.join(d, gid + '.mhclo'), reference_scale=ref, also_export_mhmat=True)
    # the cloth chains, by garment vertex (part offset + row * cols + col): make_mpfb.py adds the bones
    specs, off = [], 0
    for p in parts:
        c = cloth_spec(p, off, slot)
        if c: specs.append(c)
        off += p.P.shape[0] * p.P.shape[1]
    json.dump({'garment': gid, 'verts': off, 'parts': specs}, open(os.path.join(d, gid + '.cloth.json'), 'w'), indent=1)
    print('GARMENT', gid, len(me.vertices), 'verts', len(me.polygons), 'quads,', sum(len(c['chains']) for c in specs), 'chains ->', d)
    return obj


# ---------------------------------------------------------------------------------------------------------------
# the garments. Ease in metres off the skin; bands in metres from an edge
def P(base, weave=0.07, bands=()): return {'base': C[base] if isinstance(base, str) else base, 'weave': weave, 'bands': list(bands)}
def B(where, a, b, style, fg, bg=None, rep=0.08): return (where, a, b, style, C[fg], C[bg] if bg else None, rep)

L, R = 'Left', 'Right'


def sleeves(gid, end, ease, paint, ease_end=None, rows=8, n=18):
    """end: 'elbow', 'wrist', or how far down the upper arm"""
    out = []
    for s in (L, R):
        a, e, h = J(s + 'Arm'), J(s + 'ForeArm'), J(s + 'Hand')
        path = [a, e] if end == 'elbow' else [a, e, h - (h - e) * 0.08] if end == 'wrist' else [a, a + (e - a) * end]
        out.append(limb_tube('%s_sleeve_%s' % (gid, s[0]), None, None, ease, paint, n=n, rows=rows, ease_end=ease_end,
                             start_back=0.07, path=path, bvh=BVH_A, rmax=0.16))
    return out


def sandal(gid, paint_sole, paint_strap, guard=False, laces=0, greave=False, strap_paint2=None):
    parts = []
    for s in (L, R):
        foot, toe = J(s + 'Foot'), J(s + 'ToeBase')
        tip = J(s + 'ToeBase', 'tail')
        heel = np.array([foot[0], foot[1] + 0.06, 0.0]); front = np.array([tip[0], tip[1] - 0.03, 0.0])
        axis = front - heel
        # the sole: a flat tube heel to toe, just under the foot
        rows, n = 10, 16
        Pts = []
        for k in range(rows):
            c = heel + axis * k / (rows - 1)
            c[2] = 0.006
            width = 0.045 + 0.012 * math.sin(math.pi * min(1, k / (rows - 1) * 1.2))
            row = [c + np.array([math.cos(a) * width, 0, math.sin(a) * 0.0065]) for a in np.linspace(0, 2 * math.pi, n, endpoint=False)]
            Pts.append(row)
        parts.append(Part('%s_sole_%s' % (gid, s[0]), np.array(Pts), True, ['body'] * rows, paint_sole))
        # straps round the forefoot and the instep, and a heel strap
        for k, f in enumerate((0.62, 0.40)):
            a = heel + axis * (f - 0.04); b = heel + axis * (f + 0.04)
            a[2] = b[2] = 0.035
            parts.append(limb_tube('%s_strap%d_%s' % (gid, k, s[0]), a, b, 0.004, paint_strap, n=16, rows=2))
        ank_a, ank_b = foot + np.array([0, 0.01, -0.01]), foot + np.array([0, 0.01, 0.03])
        parts.append(limb_tube('%s_ankle_%s' % (gid, s[0]), ank_a, ank_b, 0.005, paint_strap, n=16, rows=2))
        if guard:                                 # a heel guard: the back half of a band round the heel
            a, b = foot + np.array([0, 0.0, -0.065]), foot + np.array([0, 0.0, -0.005])
            parts.append(limb_tube('%s_guard_%s' % (gid, s[0]), a, b, 0.005, paint_strap, n=12, rows=3, arc=(math.pi / 2 - 1.9, math.pi / 2 + 1.9)))
        knee = J(s + 'Leg')
        for k in range(laces):                    # wraps up the shin
            f = (k + 1) / (laces + 1) * 0.45
            c = foot + (knee - foot) * f
            parts.append(limb_tube('%s_lace%d_%s' % (gid, k, s[0]), c, c + (knee - foot) * 0.03, 0.005, strap_paint2 or paint_strap, n=14, rows=2))
        if greave:                                # a shin plate: the front of the lower leg
            a, b = foot + (knee - foot) * 0.12, foot + (knee - foot) * 0.82
            parts.append(limb_tube('%s_greave_%s' % (gid, s[0]), a, b, 0.009, greave, n=10, rows=8, arc=(math.pi * 1.05, math.pi * 1.95)))
    return parts


def loincloth(gid, paint_band, paint_flap, length):
    parts = [torso_tube(gid + '_band', WAIST - 0.03, WAIST - 0.10, 0.008, paint_band, n=36, rows=4)]
    # the flaps hang from the front and the back of the band
    for side, out in (('front', np.array([0, -1.0, 0])), ('back', np.array([0, 1.0, 0]))):
        c = spine_at(WAIST - 0.06)
        h = first_hit(c, out)
        top = c + out * ((h or 0.12) + 0.014)
        parts.append(flap('%s_%s' % (gid, side), top, 0.20, length, out, paint_flap, group_below=CROTCH + 0.02, sway=0.02))
    # a brief under it: a short tube round the pelvis, closed between the legs by its lowest rows
    return parts


def cape(gid, z1, paint, flare=0.25, span=1.5, ease=0.025, top=None):
    """a cloak over the back: across the shoulders (from 'top', under a mantle), falling to z1"""
    return torso_tube(gid, TOP + 0.01 if top is None else top, z1, ease, paint, n=24, arc=(-span, span), hang_from=SHOULDER - 0.12, flare=flare,
                      group_below=CROTCH + 0.05, iters=2, over_arms=True, stiff=0.05, layer=2)


def head_rings(name, f0, f1, ease, paint, n=32, rows=4, apex=False, scale=(1.0, 1.0)):
    """rings round the head's axis (Head joint to the crown) from fraction f0 to f1 of the way up; apex: the last row
    closes over the crown (a cap)"""
    a, b = J('Head'), J('Head', 'tail')
    t = (b - a) / np.linalg.norm(b - a)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    x = x - t * x.dot(t); x /= np.linalg.norm(x); y = np.cross(t, x)
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    fs = np.linspace(f0, f1, rows)
    P = np.array([ring_points(a + (b - a) * f, x, y, angles, ease, rmin=0.03, rmax=0.2, scale=scale) for f in fs])
    if apex:
        c = a + (b - a) * f1
        P[-1] = c + (P[-1] - c) * 0.25 + t * ease
        P[-2] = c + (P[-2] - c) * 0.7 + t * ease * 0.7 + (P[-2] - c) * 0.0
    P = smooth_push(P, True, ease, iters=2)
    return Part(name, P, True, ['body'] * rows, paint)


def fan(name, r0, r1, spread, paint, rows=7, cols=13, tilt=0.35, back=0.07, curl=0.18, stiff=0.6):
    """a feather fan standing behind the head (a quetzal headdress): rows outward from r0 to r1 (metres), cols across
    +-spread radians, leaning back by tilt; its feathers are cloth chains, stiff, so they shiver rather than droop"""
    a, b = J('Head'), J('Head', 'tail')
    up = (b - a) / np.linalg.norm(b - a)
    bk = np.array([0, 1.0, 0]) - up * up[1]; bk /= np.linalg.norm(bk)
    side = np.cross(up, bk); side /= np.linalg.norm(side)
    up2 = up * math.cos(tilt) + bk * math.sin(tilt)
    c = a + (b - a) * 0.62 + bk * back
    P = []
    for i in range(rows):
        r = r0 + (r1 - r0) * i / (rows - 1)
        row = []
        for j in range(cols):
            an = -spread + 2 * spread * j / (cols - 1)
            row.append(c + side * math.sin(an) * r + up2 * math.cos(an) * r + bk * curl * (r - r0) ** 2 / max(1e-6, r1 - r0))
        P.append(row)
    part = Part(name, np.array(P), False, ['body'] * rows, paint)
    part.cloth = {'start': 0, 'stiff': stiff, 'layer': 2}
    return part


GARMENTS = {}


def garment(gid, slot, body, label):
    def deco(fn):
        GARMENTS[gid] = (slot, body, label, fn)
        return fn
    return deco


# ---- peasants (macehualtin): undyed maguey and cotton, a single plain band ----
@garment('voth_m_peasant_cloak', 'torso', 'male', 'Field cloak')
def _():
    p = P('maguey', 0.12, [B('bottom', 0.0, 0.035, 'solid', 'earth'), B('bottom', 0.045, 0.06, 'solid', 'earth')])
    return [cape('voth_m_peasant_cloak', WAIST - 0.06, p, flare=0.15, span=1.75, ease=0.02)]


@garment('voth_m_peasant_maxtlatl', 'legs', 'male', 'Loincloth')
def _():
    return loincloth('voth_m_peasant_maxtlatl', P('cotton', 0.08, [B('top', 0, 0.012, 'solid', 'earth')]),
                     P('cotton', 0.08, [B('bottom', 0.0, 0.04, 'solid', 'earth'), B('bottom', 0.05, 0.06, 'solid', 'earth')]), 0.36)


@garment('voth_f_peasant_huipil', 'torso', 'female', 'Plain huipil')
def _():
    p = P('cotton', 0.09, [B('top', 0.0, 0.025, 'solid', 'madder'), B('bottom', 0.0, 0.03, 'zigzag', 'madder', None, 0.05)])
    return [torso_tube('voth_f_peasant_huipil', TOP, HIPS[2] - 0.10, 0.012, p, hang_from=CHEST - 0.03, hang_side=WAIST - 0.02, flare=0.10, hull_from=CHEST + 0.02)] + \
        sleeves('voth_f_peasant_huipil', 0.35, 0.02, P('cotton', 0.09, [B('bottom', 0, 0.02, 'solid', 'madder')]), ease_end=0.03, rows=4)


@garment('voth_f_peasant_cueitl', 'legs', 'female', 'Wrap skirt')
def _():
    p = P('maguey', 0.1, [B('bottom', 0.0, 0.03, 'solid', 'earth'), B('top', 0.0, 0.03, 'solid', 'earth')])
    return [torso_tube('voth_f_peasant_cueitl', WAIST, KNEE - 0.16, 0.007, p, hang_from=CROTCH + 0.06, flare=0.2, group_below=CROTCH + 0.04, rows=16, hull_from=WAIST)]


for b, sex in (('male', 'm'), ('female', 'f')):
    def _mk(sex=sex):
        return sandal('voth_%s_sandals' % sex, P('leather', 0.15), P('hide', 0.1))
    GARMENTS['voth_%s_sandals' % sex] = ('feet', b, 'Maguey sandals', _mk)


# ---- tradesfolk: dyed cotton, banded hems, the step fret; Dunmer cut (a long tunic, a sash, a shoulder mantle) ----
@garment('voth_m_trade_xicolli', 'torso', 'male', 'Artisan xicolli')
def _():
    body = P('ochre', 0.06, [B('top', 0.0, 0.02, 'solid', 'soot'), B('bottom', 0.0, 0.012, 'solid', 'soot'),
                             B('bottom', 0.012, 0.07, 'fret', 'soot', 'ochre', 0.07), B('bottom', 0.07, 0.085, 'solid', 'madder')])
    sash = P('madder', 0.05, [B('top', 0.0, 0.012, 'solid', 'soot'), B('bottom', 0.0, 0.012, 'solid', 'soot'),
                              B('top', 0.016, 0.054, 'steps', 'ochre', 'madder', 0.06)])
    mantle = P('rust', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'soot'), B('bottom', 0.02, 0.05, 'zigzag', 'ochre', 'rust', 0.05)])
    return [torso_tube('voth_m_trade_xicolli', TOP - 0.01, CROTCH - 0.16, 0.012, body, hang_from=WAIST - 0.03, flare=0.22, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
            torso_tube('voth_m_trade_xicolli_sash', WAIST + 0.035, WAIST - 0.035, 0.024, sash, rows=3, n=40, hull_from=WAIST + 0.1),
            torso_tube('voth_m_trade_xicolli_mantle', TOP + 0.005, SHOULDER - 0.07, 0.04, mantle, n=44, hang_from=TOP - 0.035, flare=0.55, iters=2, over_arms=True, stiff=0.35, layer=2)]


@garment('voth_m_trade_kilt', 'legs', 'male', 'Wrap kilt')
def _():
    p = P('umber', 0.07, [B('bottom', 0.0, 0.015, 'solid', 'ochre'), B('bottom', 0.02, 0.05, 'checks', 'soot', 'umber', 0.025),
                          B('top', 0.0, 0.025, 'solid', 'soot')])
    return [torso_tube('voth_m_trade_kilt', WAIST + 0.01, KNEE + 0.02, 0.008, p, hang_from=CROTCH + 0.07, flare=0.22, group_below=CROTCH + 0.04, rows=16, hull_from=WAIST)]


@garment('voth_f_trade_huipil', 'torso', 'female', 'Banded huipil')
def _():
    body = P('cotton', 0.06, [B('top', 0.0, 0.02, 'solid', 'indigo'), B('top', 0.05, 0.11, 'fret', 'madder', 'cotton', 0.07),
                              B('top', 0.12, 0.13, 'solid', 'indigo'), B('top', 0.15, 0.19, 'diamonds', 'indigo', 'cotton', 0.05),
                              B('bottom', 0.0, 0.03, 'solid', 'madder'), B('bottom', 0.035, 0.07, 'zigzag', 'ochre', 'cotton', 0.05)])
    return [torso_tube('voth_f_trade_huipil', TOP, CROTCH - 0.08, 0.013, body, hang_from=CHEST - 0.03, hang_side=WAIST - 0.02, flare=0.12, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)] + \
        sleeves('voth_f_trade_huipil', 0.45, 0.022, P('cotton', 0.06, [B('bottom', 0, 0.025, 'solid', 'indigo')]), ease_end=0.035, rows=5)


@garment('voth_f_trade_skirt', 'legs', 'female', 'Ankle skirt and sash')
def _():
    p = P('indigo', 0.07, [B('bottom', 0.0, 0.02, 'solid', 'cotton'), B('bottom', 0.025, 0.07, 'steps', 'cotton', 'indigo', 0.08),
                           B('top', 0.0, 0.05, 'solid', 'madder'), B('top', 0.012, 0.038, 'zigzag', 'ochre', 'madder', 0.04)])
    return [torso_tube('voth_f_trade_skirt', WAIST + 0.02, ANKLE + 0.05, 0.007, p, hang_from=CROTCH + 0.06, flare=0.24, group_below=CROTCH + 0.04, rows=22, hull_from=WAIST)]


for b, sex in (('male', 'm'), ('female', 'f')):
    def _mk(sex=sex):
        return sandal('voth_%s_trade_sandals' % sex, P('leather', 0.12), P('umber', 0.1), guard=True, laces=3)
    GARMENTS['voth_%s_trade_sandals' % sex] = ('feet', b, 'Heeled sandals', _mk)


# ---- the court (pipiltin): Voth's deep purple and ash-white, crimson, gold and quetzal feathers; a Hlaalu line ----
@garment('voth_m_noble_robe', 'torso', 'male', 'Court robe and mantle')
def _():
    robe = P('purple', 0.04, [B('top', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.0, 0.012, 'solid', 'gold'),
                              B('bottom', 0.012, 0.075, 'diamonds', 'ash', 'purple', 0.06), B('bottom', 0.075, 0.087, 'solid', 'gold')])
    mantle = P('crimson', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.02, 0.09, 'feather', 'quetzal', 'jade', 0.04),
                                 B('top', 0.0, 0.02, 'solid', 'gold'), B('top', 0.02, 0.05, 'fret', 'gold', 'crimson', 0.05)])
    collar = P('gold', 0.02, [B('top', 0.0, 0.01, 'solid', 'black'), B('bottom', 0.0, 0.008, 'solid', 'black')])
    sl = P('purple', 0.04, [B('bottom', 0.0, 0.05, 'fret', 'gold', 'purple', 0.05)])
    cloak = P('purple', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.02, 0.12, 'diamonds', 'ash', 'purple', 0.10),
                               B('bottom', 0.12, 0.135, 'solid', 'gold')])
    return [torso_tube('voth_m_noble_robe', TOP - 0.01, CROTCH - 0.08, 0.012, robe, hang_from=CHEST - 0.08, hang_side=WAIST, flare=0.10, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
            torso_tube('voth_m_noble_robe_mantle', TOP + 0.01, SHOULDER - 0.13, 0.045, mantle, n=48, hang_from=TOP - 0.03, flare=0.7, iters=2, points=(0.06, 2), over_arms=True, stiff=0.35, layer=2),
            torso_tube('voth_m_noble_robe_collar', TOP + 0.06, TOP + 0.005, 0.02, collar, n=32, rows=4, ease_bottom=0.03),
            cape('voth_m_noble_robe_cloak', KNEE - 0.22, cloak, flare=0.22, span=1.2, ease=0.032, top=TOP - 0.035)] + \
        sleeves('voth_m_noble_robe', 'wrist', 0.016, sl, ease_end=0.05, rows=10)


@garment('voth_m_noble_skirt', 'legs', 'male', 'Court skirt')
def _():
    p = P('crimson', 0.04, [B('bottom', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.015, 0.08, 'steps', 'gold', 'crimson', 0.09),
                            B('bottom', 0.08, 0.09, 'solid', 'black'), B('top', 0.0, 0.04, 'solid', 'black'), B('top', 0.01, 0.03, 'diamonds', 'gold', 'black', 0.04)])
    apron = P('purple', 0.03, [B('bottom', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.02, 0.12, 'diamonds', 'ash', 'purple', 0.1),
                               B('top', 0.0, 0.015, 'solid', 'gold')])
    c = spine_at(WAIST - 0.05); h = first_hit(c, np.array([0, -1.0, 0]))
    return [torso_tube('voth_m_noble_skirt', WAIST + 0.01, ANKLE + 0.04, 0.008, p, hang_from=CROTCH + 0.07, flare=0.26, group_below=CROTCH + 0.04, rows=24, hull_from=WAIST),
            flap('voth_m_noble_skirt_apron', c + np.array([0, -1.0, 0]) * ((h or 0.12) + 0.03), 0.24, WAIST - 0.05 - (KNEE - 0.2), np.array([0, -1.0, 0]),
                 apron, cols=7, rows=14, ease=0.035, group_below=CROTCH + 0.04, sway=0.07)]


@garment('voth_f_noble_gown', 'torso', 'female', 'Court huipil and cape')
def _():
    bod = P('purple', 0.04, [B('top', 0.0, 0.015, 'solid', 'gold'), B('top', 0.04, 0.09, 'fret', 'gold', 'purple', 0.06),
                             B('bottom', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.015, 0.08, 'diamonds', 'ash', 'purple', 0.06)])
    quech = P('ash', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.02, 0.08, 'feather', 'quetzal', 'jade', 0.035),
                            B('bottom', 0.08, 0.095, 'solid', 'crimson'), B('top', 0.0, 0.03, 'solid', 'crimson')])
    sl = P('purple', 0.04, [B('bottom', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.015, 0.06, 'fret', 'gold', 'purple', 0.05)])
    return [torso_tube('voth_f_noble_gown', TOP, HIPS[2] - 0.06, 0.011, bod, hang_from=CHEST - 0.03, hang_side=WAIST - 0.02, flare=0.08, hull_from=CHEST + 0.02),
            torso_tube('voth_f_noble_gown_quech', TOP + 0.008, SHOULDER - 0.06, 0.045, quech, n=48, hang_from=TOP - 0.03, flare=0.6, iters=2, points=(0.22, 3), over_arms=True, stiff=0.3, layer=2)] + \
        sleeves('voth_f_noble_gown', 'wrist', 0.014, sl, ease_end=0.06, rows=10)


@garment('voth_f_noble_skirt', 'legs', 'female', 'Court skirt, two tiers')
def _():
    under = P('crimson', 0.04, [B('bottom', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.015, 0.08, 'steps', 'gold', 'crimson', 0.09),
                                B('top', 0.0, 0.05, 'solid', 'black'), B('top', 0.012, 0.038, 'diamonds', 'gold', 'black', 0.045)])
    over = P('purple', 0.04, [B('bottom', 0.0, 0.012, 'solid', 'gold'), B('bottom', 0.012, 0.07, 'fret', 'ash', 'purple', 0.06),
                              B('bottom', 0.07, 0.08, 'solid', 'gold')])
    return [torso_tube('voth_f_noble_skirt', WAIST + 0.015, 0.03, 0.006, under, hang_from=CROTCH + 0.06, flare=0.27, group_below=CROTCH + 0.04, rows=26, hull_from=WAIST),
            torso_tube('voth_f_noble_skirt_over', WAIST - 0.02, KNEE - 0.16, 0.02, over, hang_from=CROTCH + 0.04, flare=0.32, group_below=CROTCH + 0.04, rows=18, hull_from=WAIST,
                       layer=1)]   # outside the under-skirt (layered() in 50-figure.js); to mid-shin, so a stride's knee
                                   # moves inside it rather than catching its hem


for b, sex in (('male', 'm'), ('female', 'f')):
    def _mk(sex=sex):
        return sandal('voth_%s_noble_sandals' % sex, P('gold', 0.05), P('crimson', 0.05), guard=True, laces=2,
                      greave=P('gold', 0.04, [B('top', 0.0, 0.01, 'solid', 'black'), B('bottom', 0.0, 0.01, 'solid', 'black'),
                                              B('top', 0.03, 0.09, 'diamonds', 'black', 'gold', 0.05)]), strap_paint2=P('gold', 0.04))
    GARMENTS['voth_%s_noble_sandals' % sex] = ('feet', b, 'Gilded sandals and greaves', _mk)


# ---- headgear: the court's quetzal feathers on a gold band, the trades' head wrap with a tail down the back ----
for b, sex in (('male', 'm'), ('female', 'f')):
    def _mk(sex=sex):
        band = P('gold', 0.03, [B('top', 0.0, 0.006, 'solid', 'black'), B('bottom', 0.0, 0.006, 'solid', 'black'),
                                B('top', 0.008, 0.028, 'diamonds', 'jade', 'gold', 0.035)])
        feathers = P('quetzal', 0.04, [B('top', 0.0, 0.04, 'solid', 'gold'), B('top', 0.04, 0.07, 'dots', 'crimson', 'gold', 0.03),
                                       B('top', 0.07, 0.09, 'solid', 'crimson'), B('bottom', 0.0, 0.05, 'feather', 'teal', 'quetzal', 0.035),
                                       B('top', 0.09, 0.30, 'stripes', 'jade', 'quetzal', 0.0)])
        big = sex == 'm'
        return [head_rings('voth_%s_noble_headdress_band' % sex, 0.6, 0.72, 0.03, band, n=36, rows=3),
                fan('voth_%s_noble_headdress' % sex, 0.07, 0.40 if big else 0.27, 1.25 if big else 1.05, feathers,
                    cols=15 if big else 11)]
    GARMENTS['voth_%s_noble_headdress' % sex] = ('head', b, 'Quetzal headdress', _mk)

    def _mk2(sex=sex):
        wrap = P('indigo' if sex == 'm' else 'madder', 0.08, [B('bottom', 0.0, 0.012, 'solid', 'ochre'),
                                                              B('bottom', 0.014, 0.04, 'zigzag', 'ochre', 'indigo' if sex == 'm' else 'madder', 0.04)])
        tail = P('indigo' if sex == 'm' else 'madder', 0.08, [B('bottom', 0.0, 0.02, 'solid', 'ochre'), B('bottom', 0.025, 0.05, 'steps', 'ochre', 'indigo' if sex == 'm' else 'madder', 0.05)])
        a, bt = J('Head'), J('Head', 'tail')
        c = a + (bt - a) * 0.55
        h = first_hit(c, np.array([0, 1.0, 0]))
        top = c + np.array([0, 1.0, 0]) * ((h or 0.1) + 0.035)
        t = flap('voth_%s_trade_wrap_tail' % sex, top, 0.09, 0.30, np.array([0, 1.0, 0]), tail, cols=4, rows=8, ease=0.03, sway=0.02)
        t.cloth['layer'] = 2
        return [head_rings('voth_%s_trade_wrap' % sex, 0.5, 1.0, 0.03, wrap, n=32, rows=9, apex=True), t]
    GARMENTS['voth_%s_trade_wrap' % sex] = ('head', b, 'Head wrap', _mk2)


# ---------------------------------------------------------------------------------------------------------------
# the xref cache MPFB's matching reads (made once per machine)
cache = LocationService.get_user_cache('basemesh_xref')
if not os.path.exists(cache) or not os.listdir(cache):
    os.makedirs(cache, exist_ok=True)
    MeshCrossRef(base, after_modifiers=False, build_faces_by_group_reference=True, cache_dir=cache, write_cache=True, read_cache=False)
made = {}
for gid, (slot, body, label, fn) in GARMENTS.items():
    if body != BODY or (ONLY and gid not in ONLY): continue
    o = build(gid, label, fn(), slot)
    if o: made[gid] = {'slot': slot, 'label': label}
print('MADE', json.dumps(made))

if RENDER:
    # a check: load each garment back as MPFB clothes on this body and render it front and side (Cycles, CPU)
    for o in list(bpy.data.objects):
        if o.name in made: bpy.data.objects.remove(o)
    from bl_ext.user_default.mpfb.services.assetservice import AssetService
    skin = bpy.data.materials.new('skin'); skin.use_nodes = True
    skin.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.30, 0.24, 0.21, 1)
    base.data.materials.clear(); base.data.materials.append(skin)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 16; sc.cycles.device = 'CPU'
    sc.render.resolution_x, sc.render.resolution_y = 420, 760
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (0.8, 0.82, 0.78, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.0
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3.5
    sun.rotation_euler = (0.8, 0.2, 0.6); sc.collection.objects.link(sun)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 85
    os.makedirs(RENDER, exist_ok=True)
    tier = lambda g: 'noble' if 'noble' in g else 'trade' if 'trade' in g else 'peasant'
    for t in ('peasant', 'trade', 'noble'):
        objs = []
        for gid in made:
            if tier(gid) != t: continue
            objs.append(HumanService.add_mhclo_asset(os.path.join(OUT, gid, gid + '.mhclo'), base, asset_type='Clothes', subdiv_levels=0, material_type='MAKESKIN'))
        if not objs: continue
        for o in objs:
            for ms in o.material_slots:
                if ms.material: ms.material.use_backface_culling = False
        for tag, yaw in (('front', 0.25), ('side', 1.45), ('back', math.pi - 0.3)):
            d = 5.2
            cam.location = (math.sin(yaw) * d, -math.cos(yaw) * d, 0.92)
            cam.rotation_euler = (math.radians(90), 0, yaw)
            sc.render.filepath = os.path.join(RENDER, '%s_%s_%s.png' % (BODY, t, tag))
            bpy.ops.render.render(write_still=True)
        for o in objs: bpy.data.objects.remove(o)
    print('RENDERED', RENDER)
