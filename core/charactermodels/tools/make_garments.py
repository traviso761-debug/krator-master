# Headless: blender -b --python tools/make_garments.py -- <male|female> [--only <id>,...] [--render <png dir>]
# Voth (Chichani), Izani (Iziz), Beast Rider, Hykkousoi, Dalab and Yuni clothing for the MakeHuman bodies, made as MakeHuman clothes (.mhclo + .obj + .mhmat + texture) in
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
import bpy, bmesh, addon_utils, bisect, os, sys, math, json, uuid
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
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arms2                                          # where a second pair of arms hangs (tools/mods.py makes them)

ARGS = sys.argv[sys.argv.index('--') + 1:]
BODY = ARGS[0]
ONLY = ARGS[ARGS.index('--only') + 1].split(',') if '--only' in ARGS else None
RENDER = ARGS[ARGS.index('--render') + 1] if '--render' in ARGS else None
MACRO = {'male': {'gender': 1.0, 'muscle': 0.6, 'height': 0.55}, 'female': {'gender': 0.0, 'muscle': 0.55, 'height': 0.5}}[BODY]
OUT = LocationService.get_user_data('clothes')
TEX = 1024

# ---------------------------------------------------------------------------------------------------------------
# fabrics: each part's cloth takes the grain of a material-library set (core/materials/library/<id>/albedo.jpg, its
# luminance about its mean multiplied into the painted colours), at a tile size for clothing (metres a tile; the
# older sets' records are sized for buildings). The set comes from the paint's base colour name (FABRIC_OF) unless the
# paint names one (P(..., fabric=)); boots and sandals take leather. core/charactermodels/prompt-clothes.md lists the sets
LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'core', 'materials', 'library')
FABRIC = {'cloth.weave.plain': 0.12, 'cloth.weave.twill': 0.15, 'cloth.plain': 0.25, 'cloth.silk': 0.3, 'cloth.felt': 0.3,
          'cloth.weave.burlap': 0.2, 'cloth.cotton.coarse': 0.2, 'cloth.wool': 0.2, 'cloth.velvet': 0.2, 'cloth.quilted': 0.3,
          'cloth.bazin': 0.3, 'cloth.oiled': 0.3, 'leather.polished': 0.25, 'leather.buckskin': 0.3, 'fur.short': 0.2,
          'fur.astrakhan': 0.15, 'straw.plaited': 0.2, 'beads.glass': 0.12, 'shell.nacre': 0.3, 'metal.gold': 0.3,
          'metal.bronze': 0.3, 'metal.iron': 0.3}
FABRIC_OF = {'maguey': 'cloth.weave.burlap', 'cotton': 'cloth.cotton.coarse', 'sahel': 'cloth.cotton.coarse',
             'white': 'cloth.cotton.coarse', 'linen': 'cloth.plain', 'sealinen': 'cloth.plain', 'cream': 'cloth.plain',
             'leather': 'leather.polished', 'saddle': 'leather.polished', 'hide': 'leather.buckskin', 'buck': 'leather.buckskin',
             'fur': 'fur.short', 'darkfur': 'fur.short', 'felt': 'cloth.felt', 'velvet': 'cloth.velvet',
             'purple': 'cloth.silk', 'crimson': 'cloth.silk', 'mongolblue': 'cloth.silk', 'saffron': 'cloth.silk', 'maroon': 'cloth.silk',
             'yuniyellow': 'cloth.bazin', 'drab': 'cloth.quilted', 'repgrey': 'cloth.wool', 'repgreyd': 'cloth.wool',
             'repblack': 'cloth.wool', 'repred': 'cloth.wool', 'repochre': 'cloth.wool', 'repcream': 'cloth.plain',
             'nacre': 'shell.nacre', 'gold': 'metal.gold', 'bronze': 'metal.bronze', 'copper': 'metal.bronze', 'brass': 'metal.bronze',
             'iron': 'metal.iron', 'silver': 'metal.iron', 'pomegranate': 'cloth.silk', 'kesar': 'cloth.silk', 'peacock': 'cloth.silk',
             'lacrose': 'cloth.silk', 'yakbrown': 'cloth.wool', 'osaffron': 'cloth.cotton.coarse', 'omaroon': 'cloth.wool'}
GRAIN = {}


def grain(fid):
    """a set's grain: its albedo's luminance over its mean (1 is the set's average), or None when the set is missing"""
    if fid not in GRAIN:
        path = os.path.join(LIB, fid, 'albedo.jpg')
        g = None
        if os.path.exists(path) and os.path.getsize(path) > 1000:           # not a Git LFS pointer
            im = bpy.data.images.load(path, check_existing=True)
            w, h = im.size
            px = np.array(im.pixels[:], np.float32).reshape(h, w, 4)[::-1, :, :3]
            lum = px @ np.array([0.299, 0.587, 0.114], np.float32)
            g = (lum / max(float(lum.mean()), 1e-3)).clip(0.4, 1.6)
            bpy.data.images.remove(im)
        else:
            print('make_garments: no library set %s (git lfs pull it): flat weave' % fid)
        GRAIN[fid] = g
    return GRAIN[fid]

# ---------------------------------------------------------------------------------------------------------------
# the palette: Chichani dyes. Undyed maguey and cotton for the poor; ochre, madder, indigo and soot for the trades;
# Voth's deep purple and ash-white, crimson, gold and quetzal green for the court
C = {'maguey': (0.70, 0.64, 0.52), 'cotton': (0.86, 0.82, 0.72), 'earth': (0.42, 0.30, 0.20), 'soot': (0.10, 0.09, 0.09),
     'ochre': (0.66, 0.42, 0.13), 'madder': (0.58, 0.18, 0.12), 'indigo': (0.10, 0.13, 0.28), 'rust': (0.55, 0.28, 0.14),
     'clay': (0.66, 0.38, 0.24), 'umber': (0.30, 0.21, 0.15), 'purple': (0.17, 0.06, 0.22), 'ash': (0.86, 0.84, 0.82),
     'crimson': (0.42, 0.04, 0.07), 'gold': (0.86, 0.64, 0.22), 'jade': (0.16, 0.48, 0.36), 'quetzal': (0.10, 0.42, 0.30),
     'leather': (0.36, 0.22, 0.12), 'hide': (0.58, 0.42, 0.28), 'black': (0.06, 0.05, 0.05), 'teal': (0.12, 0.36, 0.38),
     # the Izani (Iziz): undyed oat, moss and bark for the poor; sand, saddle leather and slate for the guilds; the court
     # in verdigris and cream with copper, its sun and orb in gold; the ghost-white of salvaged Ancient plate
     'oat': (0.70, 0.64, 0.52), 'moss': (0.30, 0.33, 0.21), 'bark': (0.30, 0.23, 0.17), 'sand': (0.78, 0.62, 0.42),
     'saddle': (0.45, 0.27, 0.14), 'slate': (0.27, 0.29, 0.31), 'verdigris': (0.26, 0.52, 0.46), 'cream': (0.88, 0.84, 0.74),
     'copper': (0.62, 0.35, 0.18), 'ancient': (0.86, 0.88, 0.89), 'sunorange': (0.86, 0.47, 0.13), 'deepgreen': (0.10, 0.24, 0.21),
     # Beast Riders: buckskin, bone, fur; the tribes' green; Mongol silk blue, saffron and maroon; Apache turquoise and
     # rose; and Moebius's pastels (peach, mint, lilac, sky) as flat fields with one strong accent
     'buck': (0.72, 0.56, 0.38), 'bone': (0.88, 0.84, 0.72), 'fur': (0.44, 0.33, 0.22), 'darkfur': (0.20, 0.15, 0.11),
     'jungle': (0.20, 0.44, 0.26), 'mint': (0.60, 0.82, 0.70), 'rose': (0.84, 0.54, 0.50), 'lilac': (0.64, 0.56, 0.78),
     'turq': (0.20, 0.62, 0.62), 'mongolblue': (0.16, 0.30, 0.58), 'saffron': (0.93, 0.66, 0.20), 'maroon': (0.42, 0.11, 0.14),
     'peach': (0.95, 0.74, 0.58), 'sky': (0.56, 0.76, 0.88),
     # Hykkousoi: sea-linen, nacre (pearl, its pink and its green), bronze, olive wood, slate blue and the deep sea;
     # their wave-sun in gold
     'sealinen': (0.87, 0.85, 0.78), 'nacre': (0.91, 0.90, 0.92), 'nacrepink': (0.93, 0.80, 0.82), 'nacregreen': (0.78, 0.90, 0.86),
     'bronze': (0.64, 0.45, 0.20), 'olive': (0.42, 0.40, 0.24), 'slateblue': (0.32, 0.41, 0.54), 'deepsea': (0.10, 0.20, 0.31),
     'ribpink': (0.86, 0.56, 0.62), 'ribgreen': (0.44, 0.74, 0.68),
     # Dalab: terracotta, earth and cream; the holy red; The God's gold and its cold teal; priests' white
     'terracotta': (0.70, 0.36, 0.22), 'holyred': (0.74, 0.10, 0.10), 'godteal': (0.28, 0.84, 0.80), 'white': (0.95, 0.94, 0.91),
     # Yuni: the yellow of the hyperboloid, indigo and mud-cloth for the many, Gaudi's mosaic for the families
     'yuniyellow': (0.96, 0.78, 0.18), 'mud': (0.40, 0.28, 0.18), 'sahel': (0.93, 0.91, 0.84), 'orderblue': (0.20, 0.36, 0.70),
     'tileblue': (0.16, 0.50, 0.72), 'tilegreen': (0.34, 0.62, 0.36), 'coral': (0.92, 0.46, 0.36), 'violet': (0.42, 0.26, 0.56),
     # the Order of Historians (Longsong) and Xanadu: the Order's saffron and maroon are the Beast Riders' above; Xanadu's
     # Persian, Indian and Tibetan dyes: pomegranate, kesar, peacock teal, lac rose, silver for the rich
     'silver': (0.78, 0.78, 0.80), 'pomegranate': (0.62, 0.12, 0.16), 'kesar': (0.96, 0.58, 0.12), 'peacock': (0.06, 0.42, 0.44),
     'lacrose': (0.78, 0.30, 0.42), 'yakbrown': (0.34, 0.24, 0.16),
     # the Order's own: deeper than the Beast Riders' saffron and maroon (a robe dyed in turmeric and madder, worn dark)
     'osaffron': (0.90, 0.46, 0.05), 'omaroon': (0.30, 0.05, 0.07),
     # the Free Giants: Gaulish wool in woad, weld and madder, heather and loden; bronze and iron
     'woad': (0.20, 0.30, 0.48), 'weld': (0.80, 0.70, 0.30), 'heather': (0.46, 0.34, 0.44), 'loden': (0.28, 0.33, 0.20),
     'iron': (0.30, 0.31, 0.33),
     # the Iron Republic: its deep red, ochre and cream; grey felt, linen, black velvet and brass; salvage iron
     'repred': (0.52, 0.07, 0.08), 'repochre': (0.78, 0.55, 0.18), 'repcream': (0.92, 0.88, 0.78), 'felt': (0.46, 0.45, 0.43),
     'linen': (0.88, 0.85, 0.76), 'velvet': (0.07, 0.06, 0.07), 'brass': (0.78, 0.62, 0.28), 'greyblue': (0.34, 0.38, 0.44),
     # its uniforms: field grey and a darker grey, drab, iron black
     'repgrey': (0.38, 0.39, 0.37), 'repgreyd': (0.24, 0.25, 0.24), 'drab': (0.40, 0.38, 0.29), 'drabd': (0.30, 0.28, 0.21),
     'repblack': (0.11, 0.11, 0.12)}

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
        # at the back, a garment that reaches below the crotch hangs from just under the seat: falling from the
        # chest or the waist it would hang straight past the buttocks, and a pose that sets the hips back pushes them
        # through it (capes and sheets over the arms hang from the shoulders as they are)
        hb = hang_from
        if arc is None and not over_arms and z1 < CROTCH and hang_from > CROTCH + 0.02:
            hb = CROTCH + 0.02
        start = [near(hs) if abs(math.sin(a)) > 0.55 else near(hb) if math.cos(a) > 0 else near(hang_from) for a in angles]
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


# motifs drawn from a library pattern sheet, recoloured: the sheet's stitches as a mask (fg where it is 1, bg where 0),
# so each garment keeps its own two colours and gets the sheet's hand-made detail. (set, motifs across the sheet,
# stitches dark on light)
SHEETS = {'cross': ('embroidery.cross', 3, True), 'rose': ('embroidery.saxon', 4, False), 'bogolan': ('pattern.bogolan', 4, False),
          'feather': ('feather.quetzal', 6, False), 'beads': ('beads.glass', 4, False)}
MASKS = {}


def sheet_mask(style):
    """a SHEETS style's mask (0 to 1, from the sheet's luminance between its 10th and 90th percentiles), or None"""
    if style not in MASKS:
        fid, _, dark = SHEETS[style]
        path = os.path.join(LIB, fid, 'albedo.jpg')
        m = None
        if os.path.exists(path) and os.path.getsize(path) > 1000:
            im = bpy.data.images.load(path, check_existing=True)
            w, h = im.size
            lum = np.array(im.pixels[:], np.float32).reshape(h, w, 4)[::-1, :, :3] @ np.array([0.299, 0.587, 0.114], np.float32)
            bpy.data.images.remove(im)
            lo, hi = np.percentile(lum, 10), np.percentile(lum, 90)
            m = ((lum - lo) / max(hi - lo, 1e-3)).clip(0, 1)
            if dark:
                m = 1 - m
        MASKS[style] = m
    return MASKS[style]


def motif(style, w, h, fg, bg):
    """one cell of a band, w x h pixels, as an RGB array"""
    m = sheet_mask(style) if style in SHEETS else None
    if m is not None:
        sc = m.shape[1] / (w * SHEETS[style][1])           # sheet pixels a cell pixel: the cell is one motif across
        a = m[np.ix_((np.arange(h) * sc).astype(int) % m.shape[0], (np.arange(w) * sc).astype(int) % m.shape[1])][:, :, None]
        return np.asarray(bg, float) * (1 - a) + np.asarray(fg, float) * a
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
    elif style == 'sun':                         # the Izani sun: a disc and its rays
        d = np.hypot(u - 0.5, v - 0.5); an = np.arctan2(v - 0.5, u - 0.5)
        img[d < 0.2] = fg
        img[(d > 0.26) & (d < 0.46) & (((an / (2 * np.pi) * 12) % 1) < 0.45)] = fg
    elif style == 'orb':                         # the orb of the palace: a ringed sphere
        d = np.hypot(u - 0.5, v - 0.5)
        img[(d < 0.16) | ((d > 0.28) & (d < 0.36))] = fg
    elif style == 'hex':                         # Ancient hex plate, its seams
        x, y = u * 2, v * 2 * 0.866
        r = (y / 0.866).astype(int)
        x = x + 0.5 * (r % 2)
        cx, cy = x % 1 - 0.5, (y % 0.866) - 0.433
        h = np.maximum(np.abs(cx) * 0.866 + np.abs(cy) * 0.5, np.abs(cy))
        img[h > 0.36] = fg
    elif style == 'chevron':
        img[np.abs(v - (0.25 + 0.5 * np.abs(u - 0.5) * 2)) < 0.14] = fg
    elif style == 'teeth':                       # a row of teeth or claws hanging from the band's top
        img[v < (1 - np.abs(u - 0.5) * 2) * 0.85] = fg
    elif style == 'claw':                        # the claw of the Beast Riders: three raked marks
        for k in range(3):
            img[(np.abs((u - 0.22 - 0.28 * k) - (v - 0.5) * 0.45) < 0.06) & (v > 0.12) & (v < 0.88)] = fg
    elif style == 'tiger':
        img[np.sin(2 * np.pi * (u * 2 + 0.35 * np.sin(2 * np.pi * v))) > 0.55] = fg
    elif style == 'wave':                        # the running wave of the Hykkousoi
        img[v > 0.55 + 0.28 * np.sin(2 * np.pi * u) - 0.1 * np.cos(4 * np.pi * u)] = fg
    elif style == 'beads':
        img[(((u * 3) % 1 - 0.5) ** 2 + ((v * 2) % 1 - 0.5) ** 2) < 0.1] = fg
    elif style == 'trencadis':                   # Gaudi's broken-tile mosaic: shards of fg and bg and their mix, grouted
        rs = np.random.default_rng(w * 7 + h)
        pts = rs.random((7, 2)); cols = [np.array(fg), np.array(bg), (np.array(fg) + np.array(bg)) / 2, np.array(fg) * 0.8 + 0.2,
                                         np.array(bg) * 0.85, np.array(fg), np.array(bg) * 0.7 + 0.3]
        d = np.stack([(u - px) ** 2 + (v - py) ** 2 for px, py in pts])
        o = np.sort(d, 0)
        k = np.argmin(d, 0)
        for i in range(len(pts)): img[k == i] = cols[i]
        img[(np.sqrt(o[1]) - np.sqrt(o[0])) < 0.03] = np.array(bg) * 0.35 + 0.55
    elif style == 'bogolan':                     # mud-cloth: rows of dots between dashes and crosses
        img[(np.abs(v - 0.2) < 0.06) & ((u * 4) % 1 < 0.6)] = fg
        img[(np.abs(v - 0.8) < 0.06) & ((u * 4) % 1 < 0.6)] = fg
        img[((u - 0.5) ** 2 + (v - 0.5) ** 2) < 0.012] = fg
        img[(np.abs(np.abs(u - 0.5) - np.abs(v - 0.5)) < 0.04) & (np.abs(u - 0.5) < 0.22) & (np.abs(u - 0.5) > 0.1)] = fg
    elif style == 'eye':                         # the one great eye of The God: an almond, its iris, its rays
        ax, ay = (u - 0.5) * 2, (v - 0.5) * 2
        alm = np.abs(ay) < 0.55 * (1 - ax ** 2)
        img[alm] = (1, 1, 1)
        img[alm & (ax ** 2 + ay ** 2 < 0.12)] = fg
        img[alm & (ax ** 2 + ay ** 2 < 0.03)] = (0.05, 0.05, 0.05)
    elif style == 'rays':                        # stripes along the strip (a halo's rays, a wrap's turns)
        img[(u * 2).astype(int) % 2 == 0] = fg
    elif style == 'tartan':                      # the Free Giants' checks: crossing bands, darker where they cross
        a, b = ((u * 3) % 1) < 0.34, ((v * 3) % 1) < 0.34
        img[a | b] = np.array(fg) * 0.55 + np.array(bg) * 0.45
        img[a & b] = fg
        img[(((u * 12) % 1) < 0.12) & ~a & ~b] = np.array(fg) * 0.8 + np.array(bg) * 0.2
    elif style == 'knot':                        # two waves interlaced: a Celtic running knot
        w1, w2 = 0.5 + 0.32 * np.sin(u * 2 * math.pi), 0.5 - 0.32 * np.sin(u * 2 * math.pi)
        img[(np.abs(v - w1) < 0.11) | (np.abs(v - w2) < 0.11)] = fg
    elif style == 'cross':                       # Slavic cross-stitch: a stepped diamond round a cross, on a stitch grid
        gu, gv = np.floor(u * 9), np.floor(v * 9)
        d = np.abs(gu - 4) + np.abs(gv - 4)
        img[(d == 4) | ((d <= 1) & ((gu == 4) | (gv == 4)))] = fg
        img[(d == 4) & ((gu + gv) % 2 == 1)] = np.array(fg) * 0.6 + np.array(bg) * 0.4
    elif style == 'rose':                        # a Saxon painted rosette: six petals round a dot, leaves between
        x, y = u - 0.5, v - 0.5
        r, th = np.sqrt(x * x + y * y), np.arctan2(y, x)
        img[r < 0.36 * (0.55 + 0.45 * np.abs(np.cos(3 * th)))] = fg
        img[r < 0.08] = bg
        img[(np.abs(np.abs(x) - 0.42) < 0.05) & (np.abs(y) < 0.18)] = np.array(fg) * 0.5 + np.array(bg) * 0.5
    elif style == 'triskele':                    # the Republic: three arms from the centre, each fist holding a sword
        x, y = u - 0.5, v - 0.5
        m = np.zeros_like(u, bool)
        for k in range(3):
            a = 2 * math.pi * k / 3 + math.pi / 2
            dx, dy = math.cos(a), math.sin(a)
            px, py = -dy, dx
            t, s_ = x * dx + y * dy, x * px + y * py
            m |= (t > 0.04) & (t < 0.3) & (np.abs(s_) < 0.045)                       # the arm
            m |= ((t - 0.3) ** 2 + s_ ** 2) < 0.055 ** 2                            # the fist
            m |= (np.abs(t - 0.3) < 0.018) & (s_ > -0.08) & (s_ < 0.22)             # the sword, at 90 degrees
        m |= (x * x + y * y) < 0.06 ** 2
        img[m] = fg
    elif style == 'buttons':                     # a button down the middle of each cell
        img[((u - 0.5) ** 2 + (v - 0.5) ** 2) < 0.2 ** 2] = fg
    elif style == 'buttons2':                    # double-breasted: two buttons a row
        for cx in (0.2, 0.8):
            img[((u - cx) ** 2 * 1.0 + (v - 0.5) ** 2) < 0.09 ** 2] = fg
    elif style == 'quilt':                       # diamond quilting: thin stitched seams in a lattice
        a1, a2 = ((u + v) * 1.0) % 1, ((u - v) * 1.0) % 1
        img[(np.abs(a1 - 0.5) < 0.035) | (np.abs(a2 - 0.5) < 0.035)] = fg
    elif style == 'frog':                        # frogging: a braid across the chest, a loop and a knot at each end
        img[(np.abs(v - 0.5) < 0.09) & (np.abs(u - 0.5) < 0.38)] = fg
        for cx in (0.12, 0.88):
            d = np.sqrt((u - cx) ** 2 + (v - 0.5) ** 2)
            img[(d < 0.11) & (d > 0.05)] = fg
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
    fab = spec.get('fabric')
    gr = grain(fab) if fab in FABRIC else None
    if g and gr is None:
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
    # panels: a column of the strip from u0 to u1 (0 at the back of a tube, 0.5 at the front), its motif repeating
    # down every 'rep' metres (a tabard woven into a robe)
    for u0, u1, style, fg, bg, rep in spec.get('panels', []):
        c0, c1 = int(u0 * W), int(u1 * W)
        n_rep = max(1, int(round(length / rep))) if rep else 1
        ch = max(2, H // n_rep)
        cell = motif(style, c1 - c0, ch, np.array(fg), np.array(bg))
        img[:, c0:c1] = np.tile(cell, (H // ch + 1, 1, 1))[:H] * (1 + rng.normal(0, 0.02, (H, c1 - c0, 1)))
    if gr is not None:
        # the fabric's grain at its size on the cloth (the strip is circ metres across and length down), its depth
        # by the paint's weave (0.07 the usual cloth: about full strength)
        n = gr.shape[0]
        tile = FABRIC[fab]
        ix = (np.arange(W) * (circ / W) / tile * n).astype(int) % n
        iy = (np.arange(H) * (length / H) / tile * n).astype(int) % n
        k = min(1.0, max(g, 0.02) / 0.07)
        img = img * (1 + (gr[np.ix_(iy, ix)][:, :, None] - 1) * k)
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
    y0, groups, pfaces = 0, [], []
    for k, (p, (circ, length)) in enumerate(zip(parts, lens)):
        pfaces.append([])
        h = TEX - y0 if k == len(parts) - 1 else int(round(share[k] * TEX))
        img[y0:y0 + h] = paint_strip(p.paint, TEX, h, circ, length)
        v_top, v_bot = 1 - y0 / TEX, 1 - (y0 + h) / TEX
        pad = 1.5 / TEX
        R, Cn = p.P.shape[:2]
        vs = [[bm.verts.new(Vector(p.P[i, j])) for j in range(Cn)] for i in range(R)]
        for i in range(R):
            for j in range(Cn): groups.append(p.group[i])
        jcount = Cn if p.closed else Cn - 1
        holes = getattr(p, 'holes', [])
        for i in range(R - 1):
            for j in range(jcount):
                j2 = (j + 1) % Cn
                # a four-armed top leaves out the faces where a lower arm comes out of the ribs (four_armed)
                if holes:
                    cq = (p.P[i, j] + p.P[i + 1, j] + p.P[i + 1, j2] + p.P[i, j2]) / 4
                    if any(np.linalg.norm(cq - hc) < hr for hc, hr in holes):
                        continue
                f = bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j2], vs[i][j2]))
                pfaces[-1].append(f)
                for loop, (ii, jj) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                    u = jj / (Cn if p.closed else Cn - 1)
                    v = v_top - pad - (v_top - v_bot - 2 * pad) * ii / (R - 1)
                    loop[uvl].uv = (u, v)
        y0 += h
    # a hole's vertices (four_armed) belong to no face: gone, and listed in the .cloth.json so the chains' grid indices
    # can be shifted to the mesh's
    bm.verts.index_update()
    loose = [v for v in bm.verts if not v.link_faces]
    gone = sorted(v.index for v in loose)
    if loose:
        bmesh.ops.delete(bm, geom=loose, context='VERTS')
        gs = set(gone)
        groups = [g for i, g in enumerate(groups) if i not in gs]
    bm.verts.index_update()
    # faces out of the body, a part at a time (a grid's faces wind the same way): flipped together when most of them
    # face the skin. Face by face, a wing or a horn held off the body would flip back and forth
    bm.normal_update()
    for fs in pfaces:
        vote = 0.0
        for f in fs:
            c = np.array(f.calc_center_median()[:])
            loc, n = nearest(c)
            vote += np.sign(np.array(f.normal[:]).dot(c - loc)) * f.calc_area()
        if vote < 0:
            for f in fs: f.normal_flip()
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
        f.write('# Voth clothing (core/charactermodels/tools/make_garments.py)\nname %s\nambientColor 1.0 1.0 1.0\n'
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
    # the lower pair's sleeves and armbands, as ranges of the mesh's vertices: make_mpfb.py weights them to the lower
    # arms' joints (they have no holes, so each is one run)
    lower, o = [], 0
    for p in parts:
        n = p.P.shape[0] * p.P.shape[1]
        if '_sleeve2_' in p.name or '_armband2_' in p.name:
            lower.append([o - bisect.bisect_left(gone, o), o + n - bisect.bisect_left(gone, o)])
        o += n
    json.dump({'garment': gid, 'verts': off - len(gone), 'parts': specs, 'arms': 4 if gid in FOUR else 2, 'gone': gone, 'lower': lower},
              open(os.path.join(d, gid + '.cloth.json'), 'w'), indent=1)
    print('GARMENT', gid, len(me.vertices), 'verts', len(me.polygons), 'quads,', sum(len(c['chains']) for c in specs), 'chains ->', d)
    return obj


# ---------------------------------------------------------------------------------------------------------------
# the garments. Ease in metres off the skin; bands in metres from an edge
def P(base, weave=0.07, bands=(), panels=(), fabric=None):
    """a paint: base colour (a name in C), grain strength, bands, panels, and the fabric (a FABRIC set; by default the
    base colour's, FABRIC_OF, else a plain weave)"""
    f = fabric or (FABRIC_OF.get(base, 'cloth.weave.plain') if isinstance(base, str) else 'cloth.weave.plain')
    return {'base': C[base] if isinstance(base, str) else base, 'weave': weave, 'bands': list(bands), 'panels': list(panels),
            'fabric': f}


def leathery(paint):
    """a paint as leather, unless its fabric is already a hide, fur, felt or metal (a boot, a sandal)"""
    if paint.get('fabric', '').startswith(('leather', 'fur', 'cloth.felt', 'metal', 'straw')):
        return paint
    return dict(paint, fabric='leather.polished')


def PN(u0, u1, style, fg, bg, rep=0.25): return (u0, u1, style, C[fg], C[bg], rep)
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


# ---- four-armed clothes (a body with a second pair of arms: tools/mods.py, arms2.py) ----
# The lower pair's skin is the arms' skin moved where the lower pair hangs (BVH_A2), so a lower sleeve is fitted as an
# upper one is; a top leaves holes where the lower arms come out of the ribs (four_armed). make_mpfb.py gives the lower
# sleeves the lower joints' weights (by the garment's arms: 4 in its .cloth.json, FOUR here)
FOUR = set()
LOWF = arms2.FWD_MAN if BODY == 'male' else arms2.FWD        # how far forward the lower pair sits (arms2.fwd)


def low(p, side):
    """a point on the upper arm of side 'Left' or 'Right' (Blender), where the lower pair has it"""
    sx = 1 if side == 'Left' else -1
    return arms2.from_gl(arms2.place(arms2.to_gl(p), arms2.to_gl(J(side + 'Arm'))[0], sx, f=LOWF))[0]


def _low_co():
    out = CO.copy()
    for side, sx in (('Left', 1), ('Right', -1)):
        m = CO[:, 0] * sx > 0
        out[m] = arms2.from_gl(arms2.place(arms2.to_gl(CO[m]), arms2.to_gl(J(side + 'Arm'))[0], sx, f=LOWF))
    return out
BVH_A2 = BVHTree.FromPolygons([Vector(c) for c in _low_co()], [p for p in POLY if all(_LM[i] for i in p)])


def sleeves2(gid, end, ease, paint, ease_end=None, rows=8, n=18):
    """the lower pair's sleeves (as sleeves())"""
    out = []
    for s in (L, R):
        a, e, h = J(s + 'Arm'), J(s + 'ForeArm'), J(s + 'Hand')
        path = [a, e] if end == 'elbow' else [a, e, h - (h - e) * 0.08] if end == 'wrist' else [a, a + (e - a) * end]
        out.append(limb_tube('%s_sleeve2_%s' % (gid, s[0]), None, None, ease, paint, n=n, rows=rows, ease_end=ease_end,
                             start_back=0.04, path=[low(q, s) for q in path], bvh=BVH_A2, rmax=0.16))
    return out


def four_armed(gid, parts, r=0.075):
    """a top for four arms: its body parts open where each lower arm comes out (r round the lower shoulder joint,
    set in toward the ribs), and it goes in FOUR"""
    FOUR.add(gid)
    holes = []
    for s in (L, R):
        sx = 1 if s == 'Left' else -1
        holes.append((low(J(s + 'Arm'), s) + np.array([-sx * 0.035, 0, 0]), r))
    for p in parts:
        # only cloth over the ribs is opened: sleeves, bands, straps, belts and jewellery pass by the lower arms (a
        # strap cut there would leave loose ends standing off the body)
        if not any(k in p.name for k in ('_sleeve', '_armband', '_strap', '_baldric', '_belt', '_pectoral', '_torc', '_brooch')):
            p.holes = holes
    return parts


def sandal(gid, paint_sole, paint_strap, guard=False, laces=0, greave=False, strap_paint2=None):
    parts = []
    paint_sole, paint_strap = leathery(paint_sole), leathery(paint_strap)
    if strap_paint2 is not None:
        strap_paint2 = leathery(strap_paint2)
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


def trousers(gid, paint, ease=0.012, ease_end=0.02, cuff=None, seat_paint=None, n=18, rows=12):
    """trousers: a seat round the pelvis from the waist to just below the crotch (spanning between the legs), and a
    leg per side from the hip through the knee to the cuff (a height); they follow the legs, they do not swing"""
    out = [torso_tube(gid + '_seat', WAIST + 0.01, CROTCH - 0.02, ease, seat_paint or paint, n=36, rows=8, hull_from=WAIST - 0.02)]
    for s in (L, R):
        hip, knee, foot = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        z = cuff if cuff is not None else ANKLE + 0.05
        f = (knee[2] - z) / max(1e-6, knee[2] - foot[2])
        end = knee + (foot - knee) * min(1.0, f)
        out.append(limb_tube('%s_leg_%s' % (gid, s[0]), None, None, ease, paint, n=n, rows=rows, ease_end=ease_end,
                             start_back=0.06, path=[hip, knee, end], rmax=0.2))
    return out


def boots(gid, paint_sole, paint_upper, top=0.45, wraps=0, wrap_paint=None, cuff_paint=None, ease_top=0.03, wrap_over=None):
    """a closed boot: the sole, and an upper from 'top' (a fraction of the way up the shin) down over the ankle and
    along the foot to the toe, closed there, roomy at the top so trousers tuck into it; wraps: bands of cloth wound up
    the shin over it, standing further off above wrap_over (a fraction up the shin: over the trousers' cuff)"""
    parts = []
    paint_sole, paint_upper = leathery(paint_sole), leathery(paint_upper)
    for s in (L, R):
        foot, toe, tip, knee = J(s + 'Foot'), J(s + 'ToeBase'), J(s + 'ToeBase', 'tail'), J(s + 'Leg')
        heel = np.array([foot[0], foot[1] + 0.05, 0.0]); front = np.array([tip[0], tip[1] - 0.012, 0.0])
        axis = front - heel
        rows, n = 10, 16
        Q = []
        for k in range(rows):
            c = heel + axis * k / (rows - 1)
            c[2] = 0.008
            width = 0.05 + 0.012 * math.sin(math.pi * min(1, k / (rows - 1) * 1.2))
            Q.append([c + np.array([math.cos(a) * width, 0, math.sin(a) * 0.008]) for a in np.linspace(0, 2 * math.pi, n, endpoint=False)])
        parts.append(Part('%s_sole_%s' % (gid, s[0]), np.array(Q), True, ['body'] * rows, paint_sole))
        up = foot + (knee - foot) * top
        # the shaft, straight down the shin to below the ankle; the foot, a tube heel to toe (the front is -Y), closed
        # past the toes; the two overlap round the ankle
        parts.append(limb_tube('%s_shaft_%s' % (gid, s[0]), up, np.array([foot[0], foot[1], 0.03]), ease_top, paint_upper, n=18,
                               rows=9, ease_end=0.012, rmax=0.14))
        hb = first_hit(np.array([foot[0], foot[1], 0.035]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05   # the heel's back
        fa = np.array([foot[0], foot[1] + hb - 0.008, 0.04]); fb = np.array([tip[0], tip[1] - 0.016, 0.026])
        u = limb_tube('%s_foot_%s' % (gid, s[0]), fa, fb, 0.012, paint_upper, n=18, rows=12, ease_end=0.015, rmax=0.09)
        for k in (0, -1):                              # closed at the heel (inside the shaft) and past the toes
            c = u.P[k].mean(0)
            u.P[k] = c + (u.P[k] - c) * 0.3
        parts.append(u)
        if cuff_paint is not None:
            parts.append(limb_tube('%s_cuff_%s' % (gid, s[0]), up - (knee - foot) * 0.06, up + (knee - foot) * 0.02, ease_top + 0.008, cuff_paint, n=18, rows=3))
        for k in range(wraps):
            f = 0.08 + (0.6 - 0.08) * k / max(1, wraps - 1)
            c = foot + (knee - foot) * f
            e = 0.042 if wrap_over is not None and f > wrap_over else 0.014
            parts.append(limb_tube('%s_wrap%d_%s' % (gid, k, s[0]), c, c + (knee - foot) * 0.05, e, wrap_paint, n=16, rows=2))
    return parts


def hood(gid, paint, ease=0.035, ease_low=0.055, open_front=0.95, low=-0.45, rows=14, n=34, peak=0.05):
    """a hood: rings round the head's axis from below the jaw (low, a fraction of the head below its joint: the cowl
    over the neck) up over the crown, open at the face (open_front radians either side of the front, narrowing above
    the brow so it closes over the head), its top drawn back to a peak"""
    a, b = J('Head'), J('Head', 'tail')
    t = (b - a) / np.linalg.norm(b - a)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    x = x - t * x.dot(t); x /= np.linalg.norm(x); y = np.cross(t, x)
    fs = np.linspace(low, 1.0, rows)
    eases = np.interp(fs, [low, 0.1, 1.0], [ease_low, ease, ease])
    opens = np.interp(fs, [low, 0.55, 0.92], [open_front, open_front, 0.03])
    Q = np.array([ring_points(a + (b - a) * f, x, y, np.linspace(-(math.pi - o), math.pi - o, n), e, rmin=0.04, rmax=0.22)
                  for f, e, o in zip(fs, eases, opens)])
    c = a + (b - a) * 1.0
    Q[-1] = c + (Q[-1] - c) * 0.2 + t * ease + x * peak
    Q[-2] = c + (Q[-2] - c) * 0.65 + t * ease * 0.6 + x * peak * 0.5
    Q = smooth_push(Q, False, ease, iters=2, rows_ease=eases)
    return Part(gid, Q, False, ['body'] * rows, paint)


def blob(name, c, size, paint, n=12, rows=5, out=None):
    """a small closed solid (a pouch, the orb): an ellipsoid at c, size (across, deep, high), its depth along 'out'"""
    out = np.array([0, -1.0, 0]) if out is None else out / np.linalg.norm(out)
    side = np.cross(np.array([0, 0, 1.0]), out); side /= np.linalg.norm(side)
    Q = []
    for i in range(rows):
        ph = math.pi * (0.06 + 0.88 * i / (rows - 1))
        r, z = math.sin(ph), math.cos(ph)
        Q.append([c + side * math.cos(a) * r * size[0] / 2 + out * math.sin(a) * r * size[1] / 2 + np.array([0, 0, z * size[2] / 2])
                  for a in np.linspace(0, 2 * math.pi, n, endpoint=False)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint)


def pauldron(name, side, paint, reach=0.5, ease=0.028):
    """a plate over one shoulder and the top of the upper arm (its outer half)"""
    a, e = J(side + 'Arm'), J(side + 'ForeArm')
    return limb_tube(name, None, None, ease, paint, n=12, rows=6, ease_end=ease * 0.7, start_back=0.06,
                     path=[a, a + (e - a) * reach], arc=(-1.7, 1.7), bvh=BVH_A, rmax=0.16)


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
    # the tilma: wrapped right round the body over the shoulders and knotted on the right one (it was a cape over
    # the back alone, and left the chest bare; an open arc meeting at the front still gaped there)
    return [torso_tube('voth_m_peasant_cloak', TOP + 0.01, WAIST - 0.06, 0.02, p, n=32, hang_from=SHOULDER - 0.12, flare=0.15,
                       iters=2, over_arms=True, stiff=0.05, layer=2),
            blob('voth_m_peasant_cloak_knot', _front(SHOULDER - 0.03, 0.045) + np.array([-0.09, 0, 0]), (0.06, 0.04, 0.05), P('maguey', 0.12))]


@garment('voth_m_peasant_maxtlatl', 'legs', 'male', 'Loincloth')
def _():
    return loincloth('voth_m_peasant_maxtlatl', P('cotton', 0.08, [B('top', 0, 0.012, 'solid', 'earth')]),
                     P('cotton', 0.08, [B('bottom', 0.0, 0.04, 'solid', 'earth'), B('bottom', 0.05, 0.06, 'solid', 'earth')]), 0.36)


@garment('voth_f_peasant_huipil', 'torso', 'female', 'Plain huipil')
def _():
    p = P('cotton', 0.09, [B('top', 0.0, 0.025, 'solid', 'madder'), B('bottom', 0.0, 0.03, 'zigzag', 'madder', None, 0.05)])
    # it follows the body under the bust and hangs from the waist: spanning the hollows from the bust down, it fell
    # straight from the breasts to the hem and stood out from the belly
    return [torso_tube('voth_f_peasant_huipil', TOP, HIPS[2] - 0.10, 0.012, p, hang_from=WAIST, hang_side=WAIST - 0.02, flare=0.05, hull_from=CHEST - 0.07)] + \
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
# shapes for the Moebius line (LORE.md 5): bands across the body, horns, wings, brims, collars and crests
def band(name, z_low, z_high, width, ease, paint, high=math.pi / 2, n=48, rows=3, iters=2):
    """a band round the torso on a tilted plane: highest (z_high) on the side at angle 'high' (0 the back, +pi/2 the
    body's left), lowest opposite: a bandolier or a himation over the left shoulder to the right hip, the strap of an
    exomis"""
    zm, amp = (z_high + z_low) / 2, (z_high - z_low) / 2
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    Q = []
    for r in range(rows):
        dz = (r / (rows - 1) - 0.5) * width
        row = []
        for a in angles:
            z = zm + amp * math.cos(a - high) - dz
            c = spine_at(z)
            d = x * math.cos(a) + y * math.sin(a)
            h = first_hit(c, d, bvh=BVH_T)
            row.append(c + d * ((h if h is not None else 0.14) + ease))
        Q.append(row)
    Q = smooth_push(np.array(Q), True, ease, iters=iters, bvh=BVH_T)
    return Part(name, Q, True, ['body'] * rows, paint)


def horn(name, path, r0, r1, paint, n=10, rows=10):
    """a tapering tube along a path, closed at its tip: a horn, a quill, a spike"""
    pts = np.array(path, float)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
    x, _ = frame(pts[1] - pts[0])
    Q = []
    for k in range(rows):
        sd = cum[-1] * k / (rows - 1)
        i = min(len(seg) - 1, int(np.searchsorted(cum, sd, side='right') - 1))
        c = pts[i] + (pts[i + 1] - pts[i]) * (sd - cum[i]) / seg[i]
        t = (pts[i + 1] - pts[i]) / seg[i]
        x = x - t * x.dot(t); x /= np.linalg.norm(x); y = np.cross(t, x)
        r = r0 + (r1 - r0) * k / (rows - 1)
        Q.append([c + (x * math.cos(a) + y * math.sin(a)) * r for a in np.linspace(0, 2 * math.pi, n, endpoint=False)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint)


def head_frame():
    a, b = J('Head'), J('Head', 'tail')
    up = (b - a) / np.linalg.norm(b - a)
    bk = np.array([0, 1.0, 0]) - up * up[1]; bk /= np.linalg.norm(bk)
    left = np.cross(bk, up); left /= np.linalg.norm(left)
    if left[0] < 0: left = -left
    return a, b, up, bk, left


def brim(name, f, width, paint, ease=0.025, rows=4, n=36, droop=0.0, lift=0.0, scallop=0.0):
    """a flat ring round the head at fraction f of its height, out 'width' past the skin: a hat's brim; its edge
    droops (or lifts) and can be scalloped"""
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * f
    Q = []
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    inner = []
    for an in angles:
        d = bk * math.cos(an) + left * math.sin(an)
        h = first_hit(c, d) or 0.09
        inner.append((d, h + ease))
    for k in range(rows):
        s = k / (rows - 1)
        Q.append([c + d * (r + s * width * (1 + scallop * math.cos(12 * an))) + up * (lift - droop) * s * s for (d, r), an in zip(inner, angles)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint)


def wing(name, side, span, height, paint, rows=6, cols=9, rise=0.04, curl=0.05, f=0.62):
    """a flat wing out from the side of the head (side +1 left, -1 right): span out, height down, curling back"""
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * f
    h = first_hit(c, left * side) or 0.08
    root = c + left * side * (h + 0.02)
    Q = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            u = j / (cols - 1)
            out = left * side * span * u
            down = -up * height * (v - 0.25) * (1 + 0.4 * u)
            row.append(root + out + down + up * rise * u * u + bk * curl * u * u)
        Q.append(row)
    return Part(name, np.array(Q), False, ['body'] * rows, paint)


def collar_disc(name, width, paint, drop=0.05, rows=4, n=48, scallop=0.12, ease=0.02):
    """a broad flat collar round the neck lying over the shoulders, its edge scalloped: a shell"""
    zs = TOP + 0.005
    c = spine_at(zs)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    Q = []
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    for k in range(rows):
        s = k / (rows - 1)
        row = []
        for an in angles:
            d = x * math.cos(an) + y * math.sin(an)
            h = first_hit(c, d, bvh=BVH) or 0.07
            r = h + ease + s * width * (1 + scallop * abs(math.cos(8 * an)))
            row.append(c + d * r + np.array([0, 0, -drop * s * s]))
        Q.append(row)
    Q = smooth_push(np.array(Q), True, ease, iters=1, fix_top=True)
    return Part(name, Q, True, ['body'] * rows, paint)


def crest(name, height, paint, rows=5, cols=15, sweep=0.06, a0=-1.1, a1=1.9):
    """a crest standing on the head front to back (a helmet's plume): from the skull out by 'height', sweeping back"""
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * 0.55
    Q = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            phi = a0 + (a1 - a0) * j / (cols - 1)
            d = up * math.cos(phi) + bk * math.sin(phi)
            base = first_hit(c, d) or 0.1
            hh = height * math.sin(math.pi * (j + 0.5) / cols) ** 0.6
            row.append(c + d * (base + 0.03 + hh * v) + bk * sweep * v)
        Q.append(row)
    return Part(name, np.array(Q), False, ['body'] * rows, paint)


def tower_hat(name, height, profile, paint, f=0.64, ease=0.014, rows=12, n=32):
    """a tall hat on the head's axis: its band fitted round the head at fraction f, then rings up 'height' with radius
    profile(s) x the band's (s 0 at the band, 1 at the top), closed flat on top: a mitre, the hyperboloid of Yuni"""
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * f
    # a short hat still closes 1.5 cm above the crown: the cloth cap's flat top sat inside the head, and the hair
    # (then the scalp) came through it
    height = max(height, (first_hit(c, up) or 0.0) + 0.015)
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    base = []
    for an in angles:
        d = bk * math.cos(an) + left * math.sin(an)
        base.append((d, (first_hit(c, d) or 0.09) + ease))
    Q = []
    for k in range(rows):
        sk = k / (rows - 1)
        Q.append([c + up * height * sk + d * r * profile(sk) for d, r in base])
    top = c + up * height
    Q.append([top + (q - top) * 0.02 for q in Q[-1]])
    return Part(name, np.array(Q), True, ['body'] * (rows + 1), paint)


def eye_disc(name, at, out, size, paint, iris_paint):
    """The God's one eye: a flat almond facing 'out', a teal iris standing on it"""
    out = out / np.linalg.norm(out)
    return [blob(name, at, (size, size * 0.18, size * 0.6), paint, n=14, rows=6, out=out),
            blob(name + '_iris', at + out * size * 0.1, (size * 0.36, size * 0.12, size * 0.36), iris_paint, n=10, rows=5, out=out)]


def pendants(name, z, angles, size, paint, ease=0.04):
    """small hanging trophies (claws, teeth, shells) round the body at height z, by angle (0 the back, +pi/2 left)"""
    c = spine_at(z)
    out = []
    for k, an in enumerate(angles):
        d = np.array([math.sin(an), math.cos(an), 0])
        h = first_hit(c, d, bvh=BVH_T) or 0.14
        out.append(blob('%s%d' % (name, k), c + d * (h + ease) + np.array([0, 0, -size[2] * 0.6]), size, paint, n=8, rows=5, out=d))
    return out


# ---------------------------------------------------------------------------------------------------------------
# the Izani (Iziz): science fantasy without the machines. A thousand years in the Ancients' ruins in a rain jungle:
# wrap tunics, sashes, hoods and leg wraps for the poor; long open coats, belts and pouches and a salvaged Ancient
# shoulder plate for the guilds; the court in long robes with high collars and the sun of Iziz on a tabard, a gold
# circlet with the palace's orb and a sun halo behind the head
FRONT = np.array([0, -1.0, 0])


def _out(c, d, extra):
    h = first_hit(c, d)
    return c + d * ((h or 0.12) + extra)


def izani_sash(gid, paint, tail_paint, ease=0.026, tail=0.34):
    c = spine_at(WAIST - 0.02)
    d = np.array([0.85, -0.5, 0]); d /= np.linalg.norm(d)
    t = flap(gid + '_sash_tail', _out(c, d, ease + 0.01), 0.09, tail, d, tail_paint, cols=4, rows=8, ease=0.02, sway=0.02)
    return [torso_tube(gid + '_sash', WAIST + 0.03, WAIST - 0.045, ease, paint, rows=3, n=40, hull_from=WAIST + 0.1), t]


def izani_belt(gid, paint, pouch_paint, ease=0.042):
    c = spine_at(WAIST - 0.015)
    parts = [torso_tube(gid + '_belt', WAIST + 0.02, WAIST - 0.05, ease, paint, rows=3, n=40, hull_from=WAIST + 0.1)]
    for k, d in enumerate((np.array([-0.75, -0.66, 0]), np.array([0.8, 0.6, 0]), np.array([0.98, -0.2, 0]))):
        d = d / np.linalg.norm(d)
        parts.append(blob('%s_pouch%d' % (gid, k), _out(c, d, ease + 0.03), (0.075, 0.04, 0.085), pouch_paint, out=d))
    return parts


def izani_collar(gid, paint, high=0.07, arc=None):
    return torso_tube(gid + '_collar', TOP + high, TOP - 0.005, 0.02, paint, n=32, rows=4, ease_bottom=0.034, arc=arc)


def izani_crown(gid, band, halo, orb, big):
    a, b = J('Head'), J('Head', 'tail')
    c = a + (b - a) * 0.66
    h = fan(gid, 0.06, 0.25 if big else 0.21, 1.95, halo, rows=6, cols=21, tilt=0.12, back=0.085, curl=0.0)
    h.cloth = None                                    # rigid: worked copper, not feathers
    return [head_rings(gid + '_band', 0.6, 0.7, 0.012, band, n=36, rows=3), h,
            blob(gid + '_orb', _out(c, FRONT, 0.03), (0.03, 0.03, 0.03), orb, n=12, rows=6)]


for b, sex in (('male', 'm'), ('female', 'f')):
    # ---- the poor: undyed oat and moss, bark-brown trousers, a rain hood ----
    def _tunic(sex=sex):
        body = P('oat', 0.11, [B('top', 0.0, 0.03, 'solid', 'bark'), B('bottom', 0.0, 0.025, 'solid', 'moss'),
                               B('bottom', 0.03, 0.04, 'solid', 'bark')])
        sl = P('oat', 0.11, [B('bottom', 0.0, 0.03, 'solid', 'oat'), B('bottom', 0.03, 0.04, 'solid', 'bark')])
        hem = CROTCH - 0.14 if sex == 'm' else KNEE + 0.02
        gid = 'iziz_%s_peasant_tunic' % sex
        return [torso_tube(gid, TOP, hem, 0.014, body, hang_from=WAIST - 0.02, flare=0.18, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)] + \
            sleeves(gid, 'elbow', 0.02, sl, ease_end=0.032, rows=6) + \
            izani_sash(gid, P('moss', 0.08, [B('top', 0.0, 0.01, 'solid', 'bark'), B('bottom', 0.0, 0.01, 'solid', 'bark')]),
                       P('moss', 0.08, [B('bottom', 0.0, 0.03, 'stripes', 'bark', 'moss', 0.0)]))
    GARMENTS['iziz_%s_peasant_tunic' % sex] = ('torso', b, 'Wrap tunic and sash', _tunic)

    def _ptrou(sex=sex):
        return trousers('iziz_%s_peasant_trousers' % sex, P('bark', 0.12, [B('bottom', 0.0, 0.02, 'solid', 'umber')]),
                        ease=0.016, ease_end=0.03, cuff=ANKLE + 0.4 * (KNEE - ANKLE))
    GARMENTS['iziz_%s_peasant_trousers' % sex] = ('legs', b, 'Field trousers', _ptrou)

    def _wraps(sex=sex):
        return boots('iziz_%s_peasant_wraps' % sex, P('bark', 0.15), P('oat', 0.12, [B('top', 0.0, 0.02, 'solid', 'bark')]), top=0.2,
                     ease_top=0.012, wraps=6, wrap_paint=P('oat', 0.12, [B('top', 0.0, 0.008, 'solid', 'bark'), B('bottom', 0.0, 0.008, 'solid', 'bark')]), wrap_over=0.36)
    GARMENTS['iziz_%s_peasant_wraps' % sex] = ('feet', b, 'Wrapped shoes', _wraps)

    def _hood(sex=sex):
        return [hood('iziz_%s_peasant_hood' % sex, P('moss', 0.12, [B('bottom', 0.0, 0.03, 'solid', 'bark'), B('top', 0.0, 0.02, 'solid', 'bark')],
                                                     fabric='cloth.oiled'))]
    GARMENTS['iziz_%s_peasant_hood' % sex] = ('head', b, 'Rain hood', _hood)

    # ---- the guilds (salvagers, hunters, the Watch): sand under saddle leather, a belt and pouches, Ancient plate ----
    def _coat(sex=sex):
        gid = 'iziz_%s_trade_coat' % sex
        under = P('sand', 0.07, [B('top', 0.0, 0.02, 'solid', 'saddle'), B('bottom', 0.0, 0.02, 'solid', 'saddle')])
        sl = P('sand', 0.07, [B('bottom', 0.0, 0.03, 'solid', 'saddle')])
        coat = P('saddle', 0.05, [B('bottom', 0.0, 0.015, 'solid', 'bark'), B('bottom', 0.02, 0.06, 'chevron', 'sand', 'saddle', 0.06),
                                  B('bottom', 0.065, 0.075, 'solid', 'bark'), B('top', 0.0, 0.02, 'solid', 'bark')])
        open_ = (-(math.pi - 0.34), math.pi - 0.34)
        hem = KNEE + 0.02 if sex == 'm' else KNEE - 0.12
        return [torso_tube(gid + '_under', TOP, HIPS[2] - 0.12, 0.012, under, hang_from=WAIST, flare=0.1, hull_from=CHEST + 0.02),
                torso_tube(gid, TOP - 0.005, hem, 0.03, coat, n=40, arc=open_, hang_from=WAIST - 0.03, flare=0.2,
                           group_below=CROTCH + 0.02, layer=2),
                izani_collar(gid, P('bark', 0.05, [B('top', 0.0, 0.012, 'solid', 'sand')]), high=0.06, arc=open_),
                pauldron(gid + '_plate', L, P('ancient', 0.02, [B('top', 0.0, 0.3, 'hex', 'slate', 'ancient', 0.05)]))] + \
            sleeves(gid, 'wrist', 0.014, sl, ease_end=0.022, rows=9) + \
            izani_belt(gid, P('bark', 0.05, [B('top', 0.0, 0.01, 'solid', 'copper'), B('bottom', 0.0, 0.01, 'solid', 'copper')]),
                       P('saddle', 0.06, [B('top', 0.0, 0.02, 'solid', 'bark')]))
    GARMENTS['iziz_%s_trade_coat' % sex] = ('torso', b, 'Guild coat, belt and plate', _coat)

    def _ttrou(sex=sex):
        return trousers('iziz_%s_trade_trousers' % sex, P('slate', 0.08), ease=0.01, ease_end=0.014, cuff=ANKLE + 0.05)
    GARMENTS['iziz_%s_trade_trousers' % sex] = ('legs', b, 'Guild trousers', _ttrou)

    def _tboots(sex=sex):
        return boots('iziz_%s_trade_boots' % sex, P('bark', 0.1), P('saddle', 0.06), top=0.6,
                     cuff_paint=P('bark', 0.06, [B('top', 0.0, 0.01, 'solid', 'copper')]))
    GARMENTS['iziz_%s_trade_boots' % sex] = ('feet', b, 'Tall boots', _tboots)

    # ---- the court: verdigris and cream, copper and gold; the sun of Iziz and the palace's orb ----
    def _nfeet(sex=sex):
        return boots('iziz_%s_noble_boots' % sex, P('copper', 0.04), P('cream', 0.04, [B('top', 0.0, 0.015, 'solid', 'verdigris')]), top=0.3,
                     cuff_paint=P('gold', 0.03))
    GARMENTS['iziz_%s_noble_boots' % sex] = ('feet', b, 'Court boots', _nfeet)

    def _crown(sex=sex):
        return izani_crown('iziz_%s_noble_crown' % sex, P('gold', 0.02, [B('top', 0.0, 0.004, 'solid', 'copper'), B('bottom', 0.0, 0.004, 'solid', 'copper')]),
                           P('gold', 0.03, [B('top', 0.0, 0.3, 'rays', 'sunorange', 'gold', 0.035), B('bottom', 0.0, 0.03, 'solid', 'copper')]),
                           P('verdigris', 0.02), sex == 'm')
    GARMENTS['iziz_%s_noble_crown' % sex] = ('head', b, 'Sun crown and orb', _crown)


def _sun_robe(base_, trim, panels=()):
    return P(base_, 0.04, [B('top', 0.0, 0.015, 'solid', trim), B('bottom', 0.0, 0.015, 'solid', trim), B('bottom', 0.02, 0.09, 'sun', 'gold', base_, 0.09),
                           B('bottom', 0.095, 0.105, 'solid', trim)], panels)


@garment('iziz_m_noble_robe', 'torso', 'male', 'Court robe and cape')
def _():
    gid = 'iziz_m_noble_robe'
    sl = P('verdigris', 0.04, [B('bottom', 0.0, 0.015, 'solid', 'copper'), B('bottom', 0.02, 0.07, 'orb', 'gold', 'verdigris', 0.06)])
    cloak = P('sunorange', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'copper'), B('top', 0.0, 0.02, 'solid', 'copper')])
    # the tabard is woven in: a cream panel down the front (u 0.5), the sun repeating down it
    tabard = [PN(0.455, 0.545, 'sun', 'gold', 'cream', 0.2), PN(0.442, 0.455, 'solid', 'copper', 'copper'), PN(0.545, 0.558, 'solid', 'copper', 'copper')]
    return [torso_tube(gid, TOP - 0.01, ANKLE + 0.07, 0.012, _sun_robe('verdigris', 'copper', tabard), hang_from=CHEST - 0.06, hang_side=WAIST, flare=0.12,
                       group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
            izani_collar(gid, P('copper', 0.03, [B('top', 0.0, 0.01, 'solid', 'gold'), B('bottom', 0.0, 0.01, 'solid', 'gold')]), high=0.08),
            cape(gid + '_cape', KNEE - 0.12, cloak, flare=0.2, span=1.25, ease=0.034, top=TOP - 0.03)] + \
        sleeves(gid, 'wrist', 0.016, sl, ease_end=0.085, rows=10) + \
        izani_sash(gid, P('copper', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold'), B('bottom', 0.0, 0.008, 'solid', 'gold')]),
                   P('copper', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), ease=0.03, tail=0.5)


@garment('iziz_m_noble_trousers', 'legs', 'male', 'Court trousers')
def _():
    return trousers('iziz_m_noble_trousers', P('cream', 0.04), ease=0.01, ease_end=0.014, cuff=ANKLE + 0.05)


@garment('iziz_f_noble_gown', 'torso', 'female', 'Court gown, collar and train')
def _():
    gid = 'iziz_f_noble_gown'
    bod = P('verdigris', 0.04, [B('top', 0.0, 0.015, 'solid', 'copper'), B('top', 0.04, 0.10, 'sun', 'gold', 'verdigris', 0.09),
                                B('bottom', 0.0, 0.015, 'solid', 'copper')])
    sl = P('verdigris', 0.04, [B('bottom', 0.0, 0.015, 'solid', 'copper'), B('bottom', 0.02, 0.07, 'orb', 'gold', 'verdigris', 0.06)])
    train = P('deepgreen', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'copper'), B('bottom', 0.02, 0.12, 'sun', 'gold', 'deepgreen', 0.14),
                                  B('top', 0.0, 0.02, 'solid', 'copper')])
    return [torso_tube(gid, TOP, HIPS[2] - 0.07, 0.011, bod, hang_from=CHEST - 0.03, hang_side=WAIST - 0.02, flare=0.06, hull_from=CHEST + 0.02),
            izani_collar(gid, P('copper', 0.03, [B('top', 0.0, 0.01, 'solid', 'gold'), B('bottom', 0.0, 0.01, 'solid', 'gold')]), high=0.085),
            cape(gid + '_train', 0.04, train, flare=0.3, span=1.15, ease=0.034, top=TOP - 0.03)] + \
        sleeves(gid, 'wrist', 0.014, sl, ease_end=0.09, rows=10) + \
        izani_sash(gid, P('copper', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold'), B('bottom', 0.0, 0.008, 'solid', 'gold')]),
                   P('copper', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), ease=0.022, tail=0.45)


@garment('iziz_f_noble_skirt', 'legs', 'female', 'Court skirt')
def _():
    p = P('cream', 0.04, [B('bottom', 0.0, 0.015, 'solid', 'copper'), B('bottom', 0.015, 0.06, 'solid', 'verdigris'),
                          B('bottom', 0.065, 0.13, 'orb', 'gold', 'cream', 0.09), B('bottom', 0.135, 0.145, 'solid', 'verdigris'),
                          B('top', 0.0, 0.03, 'solid', 'copper')])
    return [torso_tube('iziz_f_noble_skirt', WAIST + 0.015, 0.035, 0.007, p, hang_from=CROTCH + 0.06, flare=0.3, group_below=CROTCH + 0.04, rows=26, hull_from=WAIST)]


# ---------------------------------------------------------------------------------------------------------------
# the Beast Riders (Mav's Refuge, Girder): Mongol and Apache, in the Moebius line. Tribesfolk in fringed buckskin over
# leggings and a breechcloth, knee moccasins, a headband; riders in the deel (the Mongol wrap coat) with a sash and a
# stack of animal belts (tiger, snake, tooth and claw), trophies hanging, a bandolier, a fur-brimmed hat with quills;
# chiefs in the tribes' green with bone pauldrons, a quetzal mantle, horns (men) or the Khalkha wings (women)
BELTS = {'tiger': lambda: P('saffron', 0.03, [B('top', 0.0, 0.2, 'tiger', 'darkfur', 'saffron', 0.06)]),
         'snake': lambda: P('jungle', 0.03, [B('top', 0.0, 0.2, 'feather', 'mint', 'jungle', 0.03)]),
         'teeth': lambda: P('darkfur', 0.04, [B('top', 0.0, 0.04, 'teeth', 'bone', 'darkfur', 0.03)]),
         'claw': lambda: P('maroon', 0.03, [B('top', 0.0, 0.2, 'claw', 'bone', 'maroon', 0.06)]),
         'beads': lambda: P('turq', 0.07, [B('top', 0.0, 0.2, 'beads', 'rose', 'turq', 0.03)], fabric='beads.glass')}


def animal_belts(gid, kinds, ease0=0.028, z0=None, trophies=3):
    """belts stacked from the waist down over the hips, each a beast's (BELTS), and trophies hanging off the lowest"""
    z = WAIST + 0.02 if z0 is None else z0
    parts = []
    for k, kind in enumerate(kinds):
        parts.append(torso_tube('%s_belt%d' % (gid, k), z, z - 0.04, ease0 + 0.008 * k, BELTS[kind](), rows=3, n=40, hull_from=WAIST + 0.1))
        z -= 0.042
    if trophies:
        parts += pendants(gid + '_trophy', z + 0.01, np.linspace(-0.9, 0.9, trophies) + math.pi, (0.02, 0.012, 0.05), P('bone', 0.02), ease=ease0 + 0.03)
    return parts


for b, sex in (('male', 'm'), ('female', 'f')):
    def _bshirt(sex=sex):
        gid = 'beast_%s_peasant_shirt' % sex
        body = P('buck', 0.05, [B('top', 0.0, 0.015, 'solid', 'maroon'), B('top', 0.03, 0.07, 'beads', 'turq', 'buck', 0.03),
                                B('top', 0.075, 0.085, 'solid', 'maroon'), B('bottom', 0.0, 0.07, 'rays', 'buck', 'fur', 0.012),
                                B('bottom', 0.07, 0.085, 'solid', 'turq')])
        sl = P('buck', 0.05, [B('bottom', 0.0, 0.04, 'rays', 'buck', 'fur', 0.012)])
        hem = CROTCH - 0.12 if sex == 'm' else KNEE - 0.04
        return [torso_tube(gid, TOP, hem, 0.014, body, hang_from=WAIST - 0.03, flare=0.16, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)] + \
            sleeves(gid, 'elbow', 0.02, sl, ease_end=0.035, rows=6) + animal_belts(gid, ['claw', 'teeth']) + \
            [band(gid + '_bandolier', CROTCH + 0.04, SHOULDER + 0.03, 0.035, 0.03, BELTS['beads']())]
    GARMENTS['beast_%s_peasant_shirt' % sex] = ('torso', b, 'Fringed shirt and belts', _bshirt)

    def _btrou(sex=sex):
        gid = 'beast_%s_peasant_trousers' % sex
        parts = trousers(gid, P('buck', 0.05, [B('bottom', 0.0, 0.03, 'rays', 'buck', 'fur', 0.012)]), ease=0.008, ease_end=0.01, cuff=ANKLE + 0.03)
        if sex == 'm':                       # the breechcloth over the leggings, front and back
            cloth_ = P('mongolblue', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'saffron'), B('bottom', 0.03, 0.08, 'claw', 'bone', 'mongolblue', 0.08),
                                             B('top', 0.0, 0.02, 'solid', 'maroon')])
            for side, out in (('front', np.array([0, -1.0, 0])), ('back', np.array([0, 1.0, 0]))):
                parts.append(flap('%s_%s' % (gid, side), _out(spine_at(WAIST - 0.04), out, 0.03), 0.2, WAIST - 0.04 - (KNEE + 0.02), out, cloth_,
                                  group_below=CROTCH + 0.02, sway=0.03))
        return parts
    GARMENTS['beast_%s_peasant_trousers' % sex] = ('legs', b, 'Leggings and breechcloth', _btrou)

    def _bmocc(sex=sex):
        return boots('beast_%s_peasant_moccasins' % sex, P('fur', 0.08), P('buck', 0.05, [B('top', 0.0, 0.03, 'beads', 'turq', 'buck', 0.025)]),
                     top=0.72, ease_top=0.022, cuff_paint=P('buck', 0.05, [B('bottom', 0.0, 0.03, 'rays', 'buck', 'fur', 0.01)]))
    GARMENTS['beast_%s_peasant_moccasins' % sex] = ('feet', b, 'Knee moccasins', _bmocc)

    def _bband(sex=sex):
        gid = 'beast_%s_peasant_headband' % sex
        a_, b_, up, bk, left = head_frame()
        c = a_ + (b_ - a_) * 0.66
        t = flap(gid + '_tail', _out(c, bk, 0.03), 0.05, 0.32, bk, P('rose', 0.03, [B('bottom', 0.0, 0.04, 'rays', 'rose', 'maroon', 0.01)]),
                 cols=3, rows=8, ease=0.025, sway=0.02)
        t.cloth['layer'] = 2
        return [head_rings(gid, 0.6, 0.72, 0.012, P('rose', 0.02, [B('top', 0.0, 0.2, 'beads', 'turq', 'rose', 0.03)]), n=36, rows=3), t]
    GARMENTS['beast_%s_peasant_headband' % sex] = ('head', b, 'Headband', _bband)

    def _bdeel(sex=sex):
        gid = 'beast_%s_trade_deel' % sex
        # the deel closes over to the right: its edge a saffron stripe off the front
        deel = P('mongolblue', 0.03, [B('top', 0.0, 0.02, 'solid', 'saffron'), B('bottom', 0.0, 0.03, 'solid', 'saffron'),
                                      B('bottom', 0.03, 0.09, 'claw', 'saffron', 'mongolblue', 0.1)],
                 [PN(0.40, 0.425, 'solid', 'saffron', 'saffron')])
        sl = P('mongolblue', 0.03, [B('bottom', 0.0, 0.06, 'solid', 'saffron'), B('bottom', 0.06, 0.07, 'solid', 'maroon')])
        hem = KNEE - 0.16 if sex == 'm' else ANKLE + 0.14
        return [torso_tube(gid, TOP, hem, 0.014, deel, hang_from=WAIST - 0.04, flare=0.2, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                izani_collar(gid, P('saffron', 0.02, [B('top', 0.0, 0.012, 'solid', 'maroon')]), high=0.075),
                pauldron(gid + '_fur', R, P('darkfur', 0.08, [B('top', 0.0, 0.3, 'feather', 'fur', 'darkfur', 0.025)]), reach=0.55, ease=0.03)] + \
            sleeves(gid, 'wrist', 0.016, sl, ease_end=0.03, rows=9) + \
            [torso_tube(gid + '_sash', WAIST + 0.035, WAIST - 0.03, 0.026, P('saffron', 0.03), rows=3, n=40, hull_from=WAIST + 0.1)] + \
            animal_belts(gid, ['tiger', 'snake', 'teeth'], ease0=0.034, z0=WAIST - 0.035, trophies=4) + \
            [band(gid + '_bandolier', WAIST + 0.02, SHOULDER + 0.03, 0.04, 0.032, BELTS['teeth'](), high=-math.pi / 2)]
    GARMENTS['beast_%s_trade_deel' % sex] = ('torso', b, 'Rider\'s deel and animal belts', _bdeel)

    def _btrou2(sex=sex):
        return trousers('beast_%s_trade_trousers' % sex, P('darkfur', 0.05), ease=0.012, ease_end=0.016, cuff=ANKLE + 0.06)
    GARMENTS['beast_%s_trade_trousers' % sex] = ('legs', b, 'Riding trousers', _btrou2)

    def _bboot(sex=sex):
        return boots('beast_%s_trade_boots' % sex, P('darkfur', 0.08), P('maroon', 0.03, [B('top', 0.0, 0.03, 'solid', 'saffron'), B('top', 0.04, 0.1, 'claw', 'saffron', 'maroon', 0.07)]),
                     top=0.66, cuff_paint=P('fur', 0.1, [B('top', 0.0, 0.3, 'feather', 'darkfur', 'fur', 0.02)]))
    GARMENTS['beast_%s_trade_boots' % sex] = ('feet', b, 'Riding boots', _bboot)

    def _bhat(sex=sex):
        gid = 'beast_%s_trade_hat' % sex
        a_, b_, up, bk, left = head_frame()
        top = b_ + up * 0.04
        quills = []
        for side in (-1, 1):                  # two quills swept back from the crown (the Moebius line)
            quills.append(horn('%s_quill%d' % (gid, side + 1), [top - bk * 0.02 + left * side * 0.02, top + up * 0.12 + bk * 0.08 + left * side * 0.07,
                                                                 top + up * 0.22 + bk * 0.22 + left * side * 0.12], 0.008, 0.002, P('bone', 0.02, [B('bottom', 0.0, 0.05, 'solid', 'maroon')]), n=8, rows=8))
        return [head_rings(gid, 0.5, 1.0, 0.03, P('maroon', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'saffron')]), n=32, rows=7, apex=True),
                brim(gid + '_brim', 0.55, 0.045, P('fur', 0.1, [B('top', 0.0, 0.3, 'feather', 'darkfur', 'fur', 0.02)]), lift=0.035),
                horn(gid + '_spike', [b_ + up * 0.01, b_ + up * 0.09], 0.012, 0.003, P('saffron', 0.02))] + quills
    GARMENTS['beast_%s_trade_hat' % sex] = ('head', b, 'Fur hat and quills', _bhat)

    def _bnboot(sex=sex):
        return boots('beast_%s_noble_boots' % sex, P('darkfur', 0.06), P('jungle', 0.03, [B('top', 0.0, 0.03, 'solid', 'saffron'), B('top', 0.04, 0.12, 'claw', 'bone', 'jungle', 0.07)]),
                     top=0.66, cuff_paint=P('bone', 0.02, [B('top', 0.0, 0.3, 'teeth', 'darkfur', 'bone', 0.025)]))
    GARMENTS['beast_%s_noble_boots' % sex] = ('feet', b, 'Chief\'s boots', _bnboot)

    def _bndeel(sex=sex):
        gid = 'beast_%s_noble_deel' % sex
        deel = P('jungle', 0.03, [B('top', 0.0, 0.02, 'solid', 'saffron'), B('bottom', 0.0, 0.02, 'solid', 'saffron'),
                                  B('bottom', 0.02, 0.12, 'claw', 'saffron', 'jungle', 0.12), B('bottom', 0.12, 0.135, 'solid', 'mint')],
                 [PN(0.40, 0.43, 'beads', 'turq', 'saffron', 0.04)])
        sl = P('jungle', 0.03, [B('bottom', 0.0, 0.07, 'feather', 'mint', 'jungle', 0.03), B('bottom', 0.07, 0.085, 'solid', 'saffron')])
        mantle = P('turq', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'saffron'), B('bottom', 0.03, 0.4, 'feather', 'jungle', 'turq', 0.05),
                                  B('top', 0.0, 0.03, 'solid', 'saffron')])
        bonep = P('bone', 0.03, [B('top', 0.0, 0.3, 'stripes', 'peach', 'bone', 0.0)])
        parts = [torso_tube(gid, TOP, ANKLE + 0.1, 0.014, deel, hang_from=WAIST - 0.04, flare=0.18, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                 izani_collar(gid, P('saffron', 0.02, [B('top', 0.0, 0.012, 'solid', 'jungle')]), high=0.085),
                 cape(gid + '_mantle', KNEE - 0.05, mantle, flare=0.25, span=1.35, ease=0.036, top=TOP - 0.03)] + \
            sleeves(gid, 'wrist', 0.016, sl, ease_end=0.04, rows=9) + \
            [torso_tube(gid + '_sash', WAIST + 0.035, WAIST - 0.03, 0.026, P('saffron', 0.03), rows=3, n=40, hull_from=WAIST + 0.1)] + \
            animal_belts(gid, ['claw', 'tiger', 'snake', 'teeth'], ease0=0.034, z0=WAIST - 0.035, trophies=6) + \
            [band(gid + '_bandolier', WAIST + 0.0, SHOULDER + 0.03, 0.045, 0.034, BELTS['teeth']())]
        if sex == 'm':                        # bone plates over both shoulders, outsized
            parts += [pauldron(gid + '_plateL', L, bonep, reach=0.6, ease=0.04), pauldron(gid + '_plateR', R, bonep, reach=0.6, ease=0.04)]
        return parts
    GARMENTS['beast_%s_noble_deel' % sex] = ('torso', b, 'Chief\'s deel, mantle and belts', _bndeel)


@garment('beast_m_noble_horns', 'head', 'male', 'Horned fur cap')
def _():
    gid = 'beast_m_noble_horns'
    a_, b_, up, bk, left = head_frame()
    c = a_ + (b_ - a_) * 0.78
    hornp = P('bone', 0.03, [B('top', 0.0, 0.05, 'solid', 'saffron'), B('top', 0.05, 0.5, 'stripes', 'peach', 'bone', 0.0)])
    horns = [horn('%s_horn%d' % (gid, k), [c + left * sd * 0.06, c + left * sd * 0.17 + up * 0.05, c + left * sd * 0.24 + up * 0.17 + bk * 0.04,
                                            c + left * sd * 0.21 + up * 0.31 + bk * 0.13], 0.042, 0.006, hornp, n=14, rows=14)
             for k, sd in enumerate((-1, 1))]
    return [head_rings(gid, 0.45, 1.0, 0.03, P('darkfur', 0.08, [B('top', 0.0, 0.5, 'feather', 'fur', 'darkfur', 0.025)]), n=32, rows=7, apex=True),
            head_rings(gid + '_band', 0.55, 0.64, 0.04, P('saffron', 0.02, [B('top', 0.0, 0.2, 'claw', 'jungle', 'saffron', 0.05)]), n=36, rows=3)] + horns


@garment('beast_f_noble_wings', 'head', 'female', 'Winged headdress')
def _():
    gid = 'beast_f_noble_wings'
    wp = P('jungle', 0.03, [B('top', 0.0, 0.025, 'solid', 'saffron'), B('bottom', 0.0, 0.025, 'solid', 'saffron'),
                            B('top', 0.03, 0.2, 'feather', 'mint', 'jungle', 0.04)])
    a_, b_, up, bk, left = head_frame()
    parts = [head_rings(gid, 0.5, 1.0, 0.025, P('darkfur', 0.06, [B('bottom', 0.0, 0.03, 'beads', 'turq', 'darkfur', 0.03)]), n=32, rows=7, apex=True),
             wing(gid + '_wingL', 1, 0.24, 0.16, wp), wing(gid + '_wingR', -1, 0.24, 0.16, wp)]
    for sd in (-1, 1):                         # strands of beads and teeth hanging from each wing's tip
        tip = a_ + (b_ - a_) * 0.62 + left * sd * 0.32 - up * 0.08 + bk * 0.04
        for k in range(3):
            parts.append(blob('%s_bead%d_%d' % (gid, sd + 1, k), tip - up * 0.035 * k, (0.022, 0.022, 0.026), P('turq' if k % 2 else 'bone', 0.02), n=8, rows=5))
    return parts


# ---------------------------------------------------------------------------------------------------------------
# the Hykkousoi (Ys): Greek and Roman, of the sea, in the Moebius line. Sailors in the exomis (the right shoulder and
# the gills bare) or a short chiton, a rope belt, sandals and a broad petasos; marines in a cuirass of nacre ribs over
# a tunic, a strip skirt, a short cloak, bronze greaves and a crested helmet; the Archon's court in long sea-linen,
# a shell collar, the himation over the left shoulder, a diadem with the wave-sun as a scallop behind the head
WAVE_HEM = lambda base_, fg: [B('bottom', 0.0, 0.015, 'solid', fg), B('bottom', 0.02, 0.07, 'wave', fg, base_, 0.07), B('bottom', 0.075, 0.085, 'solid', fg)]

for b, sex in (('male', 'm'), ('female', 'f')):
    def _hsail(sex=sex):
        gid = 'hykk_%s_peasant_exomis' % sex
        body = P('sealinen', 0.04, WAVE_HEM('sealinen', 'slateblue'))
        rope = P('olive', 0.05, [B('top', 0.0, 0.2, 'rays', 'sand', 'olive', 0.02)])
        if sex == 'm':                       # from under the arms, held up by a strap over the left shoulder
            return [torso_tube(gid, CHEST - 0.02, CROTCH - 0.16, 0.016, body, hang_from=WAIST - 0.02, flare=0.2, group_below=CROTCH + 0.02, hull_from=CHEST + 0.05),
                    band(gid + '_strap', CHEST - 0.06, SHOULDER + 0.035, 0.05, 0.012, P('sealinen', 0.04, [B('top', 0.0, 0.01, 'solid', 'slateblue')])),
                    torso_tube(gid + '_rope', WAIST + 0.02, WAIST - 0.02, 0.026, rope, rows=3, n=40, hull_from=WAIST + 0.1)]
        return [torso_tube(gid, TOP, KNEE - 0.02, 0.014, body, hang_from=CHEST - 0.03, hang_side=WAIST - 0.02, flare=0.14, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                torso_tube(gid + '_rope', CHEST - 0.06, CHEST - 0.09, 0.02, rope, rows=3, n=40)] + \
            sleeves(gid, 0.35, 0.024, P('sealinen', 0.04, [B('bottom', 0.0, 0.012, 'solid', 'slateblue')]), ease_end=0.04, rows=4)
    GARMENTS['hykk_%s_peasant_exomis' % sex] = ('torso', b, 'Exomis and rope' if sex == 'm' else 'Short chiton and rope', _hsail)

    def _hsand(sex=sex):
        return sandal('hykk_%s_sandals' % sex, P('olive', 0.08), P('leather', 0.06))
    GARMENTS['hykk_%s_sandals' % sex] = ('feet', b, 'Sea sandals', _hsand)

    def _hhat(sex=sex):
        gid = 'hykk_%s_peasant_hat' % sex
        straw = P('sand', 0.07, [B('bottom', 0.0, 0.02, 'solid', 'slateblue')], fabric='straw.plaited')
        return [head_rings(gid, 0.62, 1.0, 0.03, straw, n=32, rows=5, apex=True),
                brim(gid + '_brim', 0.64, 0.17, P('sand', 0.07, [B('bottom', 0.0, 0.015, 'solid', 'slateblue'), B('top', 0.0, 0.2, 'rays', 'peach', 'sand', 0.02)],
                                                 fabric='straw.plaited'),
                     droop=0.03, rows=5, n=40)]
    GARMENTS['hykk_%s_peasant_hat' % sex] = ('head', b, 'Petasos', _hhat)

    def _hlor(sex=sex):
        gid = 'hykk_%s_trade_lorica' % sex
        tunic = P('slateblue', 0.03, WAVE_HEM('slateblue', 'nacre'))
        # the cuirass in ribs of nacre, pink and green by turns (the gills it covers)
        ribs = P('nacre', 0.02, [B('top', 0.03 + 0.05 * k, 0.05 + 0.05 * k, 'solid', 'ribpink' if k % 2 else 'ribgreen') for k in range(9)] +
                 [B('top', 0.0, 0.02, 'solid', 'bronze'), B('bottom', 0.0, 0.02, 'solid', 'bronze')])
        plates = P('nacre', 0.02, [B('top', 0.02 + 0.04 * k, 0.035 + 0.04 * k, 'solid', 'ribgreen') for k in range(5)])
        cloak = P('deepsea', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'bronze'), B('bottom', 0.02, 0.07, 'wave', 'slateblue', 'deepsea', 0.08)])
        return [torso_tube(gid + '_tunic', TOP, CROTCH - 0.12, 0.012, tunic, hang_from=WAIST - 0.03, flare=0.14, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                torso_tube(gid, TOP - 0.01, WAIST - 0.05, 0.03, ribs, hull_from=CHEST + 0.02, rows=12),
                pauldron(gid + '_plateL', L, plates, reach=0.5, ease=0.036), pauldron(gid + '_plateR', R, plates, reach=0.5, ease=0.036),
                cape(gid + '_cloak', CROTCH - 0.05, cloak, flare=0.2, span=1.2, ease=0.04, top=TOP - 0.03)] + \
            sleeves(gid, 0.4, 0.02, P('slateblue', 0.03), ease_end=0.03, rows=4)
    GARMENTS['hykk_%s_trade_lorica' % sex] = ('torso', b, 'Nacre cuirass and cloak', _hlor)

    def _hpter(sex=sex):
        p = P('leather', 0.03, [B('top', 0.0, 0.03, 'solid', 'bronze'), B('top', 0.03, 0.4, 'rays', 'bronze', 'leather', 0.05),
                                B('bottom', 0.0, 0.02, 'solid', 'bronze')])
        return [torso_tube('hykk_%s_trade_pteruges' % sex, WAIST - 0.03, CROTCH - 0.16, 0.034, p, hang_from=CROTCH + 0.06, flare=0.2, group_below=CROTCH + 0.04,
                           rows=12, hull_from=WAIST)]
    GARMENTS['hykk_%s_trade_pteruges' % sex] = ('legs', b, 'Strip skirt', _hpter)

    def _hgreave(sex=sex):
        return sandal('hykk_%s_trade_greaves' % sex, P('olive', 0.06), P('leather', 0.05), guard=True, laces=3,
                      greave=P('bronze', 0.03, [B('top', 0.0, 0.01, 'solid', 'deepsea'), B('top', 0.02, 0.4, 'stripes', 'bronze', 'olive', 0.0)]))
    GARMENTS['hykk_%s_trade_greaves' % sex] = ('feet', b, 'Laced sandals and greaves', _hgreave)

    def _hhelm(sex=sex):
        gid = 'hykk_%s_trade_helm' % sex
        return [head_rings(gid, 0.52, 1.0, 0.02, P('bronze', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'deepsea'), B('bottom', 0.03, 0.06, 'wave', 'nacre', 'bronze', 0.05)]),
                           n=36, rows=8, apex=True),
                crest(gid + '_crest', 0.15, P('deepsea', 0.03, [B('bottom', 0.0, 0.025, 'solid', 'bronze'), B('top', 0.0, 0.02, 'solid', 'gold'),
                                                              B('top', 0.02, 0.4, 'rays', 'slateblue', 'deepsea', 0.014)]))]
    GARMENTS['hykk_%s_trade_helm' % sex] = ('head', b, 'Crested helmet', _hhelm)

    def _hnob(sex=sex):
        gid = 'hykk_%s_noble_chiton' % sex
        body = P('sealinen', 0.03, [B('top', 0.0, 0.015, 'solid', 'gold')] + WAVE_HEM('sealinen', 'gold'))
        shell = P('nacre', 0.02, [B('top', 0.0, 0.3, 'rays', 'nacrepink', 'nacre', 0.025), B('bottom', 0.0, 0.012, 'solid', 'gold')])
        drape = P('deepsea', 0.03, [B('top', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'gold'), B('top', 0.03, 0.1, 'wave', 'gold', 'deepsea', 0.09)])
        back = P('deepsea', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.02, 0.1, 'wave', 'slateblue', 'deepsea', 0.1)])
        # the chiton hangs from the waist, so the himation lies across cloth that follows the body, ending over the
        # right hip above the part that swings
        return [torso_tube(gid, TOP, ANKLE + 0.05, 0.012, body, hang_from=WAIST - 0.03, flare=0.18, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                collar_disc(gid + '_shell', 0.11, shell, drop=0.05),
                band(gid + '_himation', WAIST + 0.04, SHOULDER + 0.03, 0.16, 0.026, drape, rows=6),
                cape(gid + '_cloak', KNEE - 0.1, back, flare=0.22, span=1.2, ease=0.034, top=TOP - 0.03)] + \
            sleeves(gid, 'elbow', 0.02, P('sealinen', 0.03, [B('bottom', 0.0, 0.015, 'solid', 'gold')]), ease_end=0.06, rows=7)
    GARMENTS['hykk_%s_noble_chiton' % sex] = ('torso', b, 'Archon\'s chiton, shell collar and himation', _hnob)

    def _hnsand(sex=sex):
        return sandal('hykk_%s_noble_sandals' % sex, P('gold', 0.04), P('slateblue', 0.04), guard=True, laces=2, strap_paint2=P('gold', 0.03))
    GARMENTS['hykk_%s_noble_sandals' % sex] = ('feet', b, 'Gilded sandals', _hnsand)

    def _hcrown(sex=sex):
        gid = 'hykk_%s_noble_crown' % sex
        h = fan(gid, 0.06, 0.26 if sex == 'm' else 0.22, 1.5, P('gold', 0.02, [B('top', 0.0, 0.4, 'rays', 'ribpink', 'gold', 0.03), B('bottom', 0.0, 0.03, 'solid', 'deepsea'),
                                                                               B('top', 0.0, 0.02, 'solid', 'ribgreen')]),
                rows=6, cols=19, tilt=0.18, back=0.09, curl=0.03)
        h.cloth = None                        # the wave-sun: a scallop of nacre on gold, rigid
        return [head_rings(gid + '_band', 0.6, 0.7, 0.012, P('gold', 0.02, [B('top', 0.0, 0.2, 'wave', 'slateblue', 'gold', 0.04)]), n=36, rows=3), h]
    GARMENTS['hykk_%s_noble_crown' % sex] = ('head', b, 'Wave-sun diadem', _hcrown)


# ---------------------------------------------------------------------------------------------------------------
# Dalab: the mound-builders, green-skinned (the photosynthesis mod), Cahokian earth and Tiwanaku stone, in the Moebius
# line. Commoners dress for the sun, the skin bare to it: a kilt or wrap skirt, a sash, armbands; traders in a
# sleeveless tabard with the step fret, a belt and pouches; the genepriests in white with the holy red, a gold
# pectoral, and The God's image as a mitre: one great eye before a halo of rays
def armbands(gid, paint, f=0.45, w=0.035):
    out = []
    for sd in (L, R):
        a, e = J(sd + 'Arm'), J(sd + 'ForeArm')
        c = a + (e - a) * f
        out.append(limb_tube('%s_armband_%s' % (gid, sd[0]), c, c + (e - a) / np.linalg.norm(e - a) * w, 0.008, paint, n=16, rows=2, bvh=BVH_A))
    return out


for b, sex in (('male', 'm'), ('female', 'f')):
    def _dtop(sex=sex):
        gid = 'dalab_%s_peasant_sash' % sex
        sash = P('cream', 0.04, [B('top', 0.0, 0.012, 'solid', 'terracotta'), B('bottom', 0.0, 0.012, 'solid', 'terracotta'),
                                 B('top', 0.015, 0.06, 'steps', 'terracotta', 'cream', 0.06)])
        bandp = P('turq', 0.02, [B('top', 0.0, 0.2, 'beads', 'cream', 'turq', 0.02)])
        parts = [band(gid, CROTCH + 0.06, SHOULDER + 0.03, 0.07, 0.014, sash, high=-math.pi / 2, rows=4)] + armbands(gid, bandp)
        if sex == 'f':                        # a band over the breasts; the shoulders and the belly to the sun
            parts.append(torso_tube(gid + '_top', CHEST + 0.07, CHEST - 0.08, 0.012, P('cream', 0.04, [B('top', 0.0, 0.015, 'solid', 'terracotta'),
                                    B('bottom', 0.0, 0.015, 'solid', 'terracotta')]), rows=6, hull_from=CHEST + 0.1))
        return parts
    GARMENTS['dalab_%s_peasant_sash' % sex] = ('torso', b, 'Sun sash and armbands' if sex == 'm' else 'Breast band and sun sash', _dtop)

    def _dkilt(sex=sex):
        p = P('terracotta', 0.06, [B('top', 0.0, 0.03, 'solid', 'earth'), B('bottom', 0.0, 0.015, 'solid', 'earth'),
                                   B('bottom', 0.02, 0.08, 'steps', 'cream', 'terracotta', 0.08)])
        hem = KNEE + 0.06 if sex == 'm' else ANKLE + 0.16
        return [torso_tube('dalab_%s_peasant_kilt' % sex, WAIST + 0.01, hem, 0.009, p, hang_from=CROTCH + 0.06, flare=0.2, group_below=CROTCH + 0.04,
                           rows=14 if sex == 'm' else 20, hull_from=WAIST)]
    GARMENTS['dalab_%s_peasant_kilt' % sex] = ('legs', b, 'Kilt' if sex == 'm' else 'Wrap skirt', _dkilt)

    def _dsand(sex=sex):
        return sandal('dalab_%s_sandals' % sex, P('earth', 0.1), P('clay', 0.06))
    GARMENTS['dalab_%s_sandals' % sex] = ('feet', b, 'Mound sandals', _dsand)

    def _dtab(sex=sex):
        gid = 'dalab_%s_trade_tabard' % sex
        body = P('terracotta', 0.04, [B('top', 0.0, 0.02, 'solid', 'turq'), B('bottom', 0.0, 0.015, 'solid', 'earth'), B('bottom', 0.02, 0.09, 'fret', 'cream', 'terracotta', 0.08)],
                 [PN(0.44, 0.56, 'steps', 'turq', 'cream', 0.12)])
        hem = KNEE + 0.04 if sex == 'm' else KNEE - 0.14
        return [torso_tube(gid, TOP, hem, 0.013, body, hang_from=WAIST - 0.03, flare=0.18, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)] + \
            izani_belt(gid, P('earth', 0.05, [B('top', 0.0, 0.01, 'solid', 'turq'), B('bottom', 0.0, 0.01, 'solid', 'turq')]), P('clay', 0.06)) + \
            armbands(gid, P('turq', 0.02, [B('top', 0.0, 0.2, 'beads', 'gold', 'turq', 0.02)]))
    GARMENTS['dalab_%s_trade_tabard' % sex] = ('torso', b, 'Trader\'s tabard', _dtab)

    def _dtrou(sex=sex):
        return trousers('dalab_%s_trade_trousers' % sex, P('cream', 0.05, [B('bottom', 0.0, 0.03, 'steps', 'terracotta', 'cream', 0.04)]), ease=0.008, ease_end=0.03,
                        cuff=ANKLE + 0.3 * (KNEE - ANKLE))
    GARMENTS['dalab_%s_trade_trousers' % sex] = ('legs', b, 'Calf trousers', _dtrou)

    def _dtsand(sex=sex):
        return sandal('dalab_%s_trade_sandals' % sex, P('earth', 0.08), P('terracotta', 0.05), guard=True, laces=3, strap_paint2=P('turq', 0.03))
    GARMENTS['dalab_%s_trade_sandals' % sex] = ('feet', b, 'Laced sandals', _dtsand)

    def _dcap(sex=sex):
        gid = 'dalab_%s_trade_cap' % sex
        return [head_rings(gid, 0.6, 1.0, 0.02, P('turq', 0.07, [B('bottom', 0.0, 0.02, 'solid', 'terracotta'), B('top', 0.0, 0.3, 'beads', 'cream', 'turq', 0.025)],
                                                  fabric='beads.glass'),
                           n=32, rows=6, apex=True)]
    GARMENTS['dalab_%s_trade_cap' % sex] = ('head', b, 'Bead cap', _dcap)

    def _drobe(sex=sex):
        gid = 'dalab_%s_noble_robe' % sex
        robe = P('white', 0.03, [B('top', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'holyred'), B('bottom', 0.025, 0.1, 'steps', 'holyred', 'white', 0.1),
                                 B('bottom', 0.105, 0.115, 'solid', 'gold')],
                 [PN(0.46, 0.54, 'eye', 'godteal', 'holyred', 0.22)])
        pect = P('gold', 0.02, [B('top', 0.0, 0.3, 'rays', 'holyred', 'gold', 0.03), B('bottom', 0.0, 0.015, 'solid', 'holyred')])
        sl = P('white', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'holyred'), B('bottom', 0.02, 0.05, 'steps', 'holyred', 'white', 0.05)])
        parts = [torso_tube(gid, TOP, ANKLE + 0.05, 0.012, robe, hang_from=WAIST - 0.03, flare=0.16, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                 collar_disc(gid + '_pectoral', 0.12, pect, drop=0.06, scallop=0.0),
                 torso_tube(gid + '_sash', WAIST + 0.035, WAIST - 0.03, 0.024, P('holyred', 0.03, [B('top', 0.0, 0.01, 'solid', 'gold'), B('bottom', 0.0, 0.01, 'solid', 'gold')]),
                            rows=3, n=40, hull_from=WAIST + 0.1)] + \
            sleeves(gid, 'wrist', 0.016, sl, ease_end=0.07, rows=9)
        if sex == 'f':
            parts.append(cape(gid + '_cape', 0.05, P('holyred', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.02, 0.1, 'steps', 'gold', 'holyred', 0.1)]),
                              flare=0.28, span=1.1, ease=0.034, top=TOP - 0.03))
        return parts
    GARMENTS['dalab_%s_noble_robe' % sex] = ('torso', b, 'Genepriest\'s robe and pectoral', _drobe)

    def _dnsand(sex=sex):
        return sandal('dalab_%s_noble_sandals' % sex, P('white', 0.03), P('gold', 0.03), guard=True, laces=2, strap_paint2=P('holyred', 0.03))
    GARMENTS['dalab_%s_noble_sandals' % sex] = ('feet', b, 'Temple sandals', _dnsand)

    def _dmitre(sex=sex):
        gid = 'dalab_%s_noble_mitre' % sex
        a_, b_, up, bk, left = head_frame()
        mitre = tower_hat(gid, 0.26 if sex == 'm' else 0.22, lambda t: 1.0 + 0.35 * t, P('gold', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'holyred'),
                          B('top', 0.0, 0.02, 'solid', 'holyred'), B('top', 0.03, 0.2, 'rays', 'holyred', 'gold', 0.04)]))
        halo = fan(gid + '_halo', 0.08, 0.3 if sex == 'm' else 0.26, 1.7, P('gold', 0.02, [B('top', 0.0, 0.5, 'rays', 'white', 'gold', 0.035),
                                                                                         B('top', 0.0, 0.04, 'solid', 'holyred')]), rows=6, cols=21, tilt=0.1, back=0.1, curl=0.0)
        halo.cloth = None
        # the eye on the mitre's face, high, out past its wall (the wall's radius there: the band's, flared)
        hgt = 0.26 if sex == 'm' else 0.22
        c = a_ + (b_ - a_) * 0.64 + up * hgt * 0.55
        r = ((first_hit(a_ + (b_ - a_) * 0.64, FRONT) or 0.1) + 0.014) * (1 + 0.35 * 0.55)
        return [mitre, halo] + eye_disc(gid + '_eye', c + FRONT * (r + 0.012), FRONT, 0.12, P('white', 0.02), P('godteal', 0.02))
    GARMENTS['dalab_%s_noble_mitre' % sex] = ('head', b, 'Mitre of the Eye', _dmitre)


# ---------------------------------------------------------------------------------------------------------------
# Yuni: the butte city, Sahelian, with Gaudi and Burmecia for the families, in the Moebius line. The Thatch in bogolan
# mud-cloth: a short boubou or a wrapper, trousers, a Fulani cone hat or a head wrap; merchants in the indigo grand
# boubou, its chest worked in yellow, a kufi or a towering gele; the families in trencadis mosaic, a beaded collar,
# and the hyperboloid of Yuni as a hat
MUDCLOTH = lambda: P('mud', 0.06, [B('bottom', 0.0, 0.012, 'solid', 'sahel'), B('bottom', 0.015, 0.075, 'bogolan', 'sahel', 'mud', 0.06),
                                   B('top', 0.0, 0.015, 'solid', 'sahel'), B('top', 0.03, 0.09, 'bogolan', 'sahel', 'mud', 0.06)])

for b, sex in (('male', 'm'), ('female', 'f')):
    def _ytun(sex=sex):
        gid = 'yuni_%s_peasant_boubou' % sex
        hem = CROTCH - 0.16 if sex == 'm' else HIPS[2] - 0.06
        return [torso_tube(gid, TOP, hem, 0.016, MUDCLOTH(), hang_from=CHEST - 0.04, hang_side=WAIST, flare=0.2, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)] + \
            sleeves(gid, 'elbow', 0.024, P('mud', 0.06, [B('bottom', 0.0, 0.03, 'bogolan', 'sahel', 'mud', 0.04)]), ease_end=0.05, rows=6)
    GARMENTS['yuni_%s_peasant_boubou' % sex] = ('torso', b, 'Mud-cloth boubou' if sex == 'm' else 'Mud-cloth blouse', _ytun)

    def _ylegs(sex=sex):
        if sex == 'm':
            return trousers('yuni_m_peasant_trousers', P('sahel', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'mud')]), ease=0.008, ease_end=0.036, cuff=ANKLE + 0.04)
        return [torso_tube('yuni_f_peasant_wrapper', WAIST + 0.01, ANKLE + 0.06, 0.008, P('indigo', 0.05, [B('top', 0.0, 0.03, 'solid', 'yuniyellow'),
                           B('bottom', 0.0, 0.02, 'solid', 'yuniyellow'), B('bottom', 0.025, 0.12, 'bogolan', 'sahel', 'indigo', 0.07)]),
                           hang_from=CROTCH + 0.06, flare=0.14, group_below=CROTCH + 0.04, rows=22, hull_from=WAIST)]
    GARMENTS['yuni_%s_peasant_%s' % (sex, 'trousers' if sex == 'm' else 'wrapper')] = ('legs', b, 'Loose trousers' if sex == 'm' else 'Wrapper', _ylegs)

    def _ysand(sex=sex):
        return sandal('yuni_%s_sandals' % sex, P('mud', 0.1), P('ochre', 0.06))
    GARMENTS['yuni_%s_sandals' % sex] = ('feet', b, 'Leather sandals', _ysand)

    def _yhead(sex=sex):
        if sex == 'm':                        # the Fulani cone: a broad straw cone, its crown in leather
            return [brim('yuni_m_peasant_hat', 0.66, 0.2, P('sand', 0.08, [B('top', 0.0, 0.3, 'rays', 'ochre', 'sand', 0.025), B('bottom', 0.0, 0.015, 'solid', 'mud')],
                                                         fabric='straw.plaited'),
                         droop=0.09, rows=6, n=40, ease=0.012),
                    head_rings('yuni_m_peasant_hat_crown', 0.66, 1.0, 0.016, P('leather', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'ochre')]), n=32, rows=5, apex=True),
                    horn('yuni_m_peasant_hat_tip', [J('Head', 'tail') + np.array([0, 0, 0.0]), J('Head', 'tail') + np.array([0, 0, 0.17])], 0.05, 0.006,
                         P('leather', 0.05, [B('top', 0.0, 0.3, 'stripes', 'ochre', 'leather', 0.0)]), n=16, rows=6)]
        gid = 'yuni_f_peasant_wrap'
        return [head_rings(gid, 0.5, 1.0, 0.03, P('yuniyellow', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'indigo')]), n=32, rows=8, apex=True)]
    GARMENTS['yuni_%s_peasant_%s' % (sex, 'hat' if sex == 'm' else 'wrap')] = ('head', b, 'Cone hat' if sex == 'm' else 'Head wrap', _yhead)

    def _ygrand(sex=sex):
        gid = 'yuni_%s_trade_boubou' % sex
        base_ = 'indigo' if sex == 'm' else 'coral'
        bou = P(base_, 0.03, [B('top', 0.0, 0.02, 'solid', 'yuniyellow'), B('top', 0.04, 0.26, 'diamonds', 'yuniyellow', base_, 0.07),
                              B('top', 0.27, 0.285, 'solid', 'yuniyellow'), B('bottom', 0.0, 0.02, 'solid', 'yuniyellow'), B('bottom', 0.025, 0.07, 'fret', 'yuniyellow', base_, 0.07)])
        # the grand boubou: one great sheet over the arms, falling from the shoulders to the shins. It hangs free from
        # the shoulders at the sides (over the arms) but from the waist at the front and back, as a robe does: a chain
        # from the chest would pass through a seated lap rather than lie on it
        return [torso_tube(gid, TOP + 0.005, ANKLE + 0.14, 0.03, bou, n=48, hang_from=WAIST - 0.03, hang_side=SHOULDER - 0.04, flare=0.14, group_below=CROTCH + 0.02,
                           over_arms=True, stiff=0.2, layer=2),
                torso_tube(gid + '_under', TOP, HIPS[2] - 0.1, 0.012, P('sahel', 0.04), hull_from=CHEST + 0.02)] + \
            sleeves(gid, 'wrist', 0.014, P('sahel', 0.04, [B('bottom', 0.0, 0.02, 'solid', base_)]), ease_end=0.02, rows=8)
    GARMENTS['yuni_%s_trade_boubou' % sex] = ('torso', b, 'Grand boubou', _ygrand)

    def _ytrou(sex=sex):
        return trousers('yuni_%s_trade_trousers' % sex, P('sahel', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'yuniyellow')]), ease=0.008, ease_end=0.026, cuff=ANKLE + 0.04)
    GARMENTS['yuni_%s_trade_trousers' % sex] = ('legs', b, 'Under-trousers', _ytrou)

    def _yslip(sex=sex):
        return boots('yuni_%s_trade_slippers' % sex, P('ochre', 0.06), P('yuniyellow', 0.04, [B('top', 0.0, 0.015, 'solid', 'mud')]), top=0.06, ease_top=0.014)
    GARMENTS['yuni_%s_trade_slippers' % sex] = ('feet', b, 'Babouches', _yslip)

    def _yhead2(sex=sex):
        if sex == 'm':
            return [head_rings('yuni_m_trade_kufi', 0.62, 1.0, 0.016, P('sahel', 0.03, [B('bottom', 0.0, 0.05, 'diamonds', 'yuniyellow', 'sahel', 0.04),
                                                                                      B('top', 0.0, 0.2, 'fret', 'indigo', 'sahel', 0.04)]), n=32, rows=6, apex=True)]
        gid = 'yuni_f_trade_gele'              # the gele, tied high and fanned: the Moebius line
        g = fan(gid + '_fan', 0.05, 0.24, 1.2, P('coral', 0.03, [B('top', 0.0, 0.5, 'stripes', 'yuniyellow', 'coral', 0.0), B('bottom', 0.0, 0.03, 'solid', 'yuniyellow')]),
                rows=6, cols=15, tilt=0.05, back=0.03, curl=0.06)
        g.cloth = None
        return [head_rings(gid, 0.5, 1.0, 0.03, P('coral', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'yuniyellow')]), n=32, rows=8, apex=True), g]
    GARMENTS['yuni_%s_trade_%s' % (sex, 'kufi' if sex == 'm' else 'gele')] = ('head', b, 'Kufi' if sex == 'm' else 'Gele', _yhead2)

    def _ygown(sex=sex):
        gid = 'yuni_%s_noble_gown' % sex
        tiles = P('yuniyellow', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'tileblue'), B('bottom', 0.02, 0.2, 'trencadis', 'tileblue', 'yuniyellow', 0.07),
                                       B('bottom', 0.2, 0.215, 'solid', 'tilegreen'), B('top', 0.0, 0.02, 'solid', 'tileblue'),
                                       B('top', 0.02, 0.14, 'trencadis', 'tilegreen', 'yuniyellow', 0.07)])
        collar = P('tileblue', 0.02, [B('top', 0.0, 0.4, 'trencadis', 'coral', 'tileblue', 0.04), B('bottom', 0.0, 0.015, 'solid', 'yuniyellow')])
        sl = P('yuniyellow', 0.02, [B('bottom', 0.0, 0.08, 'trencadis', 'violet', 'yuniyellow', 0.05)])
        return [torso_tube(gid, TOP, ANKLE + 0.04, 0.014, tiles, hang_from=CHEST - 0.04, hang_side=WAIST, flare=0.22, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                collar_disc(gid + '_collar', 0.12, collar, drop=0.05, scallop=0.16)] + \
            sleeves(gid, 'wrist', 0.016, sl, ease_end=0.1, rows=10)
    GARMENTS['yuni_%s_noble_gown' % sex] = ('torso', b, 'Mosaic gown and collar', _ygown)

    def _yslip2(sex=sex):
        return boots('yuni_%s_noble_slippers' % sex, P('tileblue', 0.04), P('violet', 0.03, [B('top', 0.0, 0.015, 'solid', 'yuniyellow')]), top=0.06, ease_top=0.014)
    GARMENTS['yuni_%s_noble_slippers' % sex] = ('feet', b, 'Silk babouches', _yslip2)

    def _yhyp(sex=sex):
        gid = 'yuni_%s_noble_hyperboloid' % sex
        hyp = lambda t: 0.62 + 1.25 * (t - 0.55) ** 2 + 0.12 * t
        return [tower_hat(gid, 0.36 if sex == 'm' else 0.3, hyp, P('yuniyellow', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'tileblue'),
                          B('bottom', 0.03, 0.12, 'trencadis', 'tileblue', 'yuniyellow', 0.05), B('top', 0.0, 0.025, 'solid', 'violet'),
                          B('top', 0.025, 0.3, 'rays', 'yuniyellow', 'coral', 0.02)]), rows=14)]
    GARMENTS['yuni_%s_noble_hyperboloid' % sex] = ('head', b, 'Hyperboloid hat', _yhyp)


# ---------------------------------------------------------------------------------------------------------------
# The Iron Republic (LORE.md 6.3): a highland state born of a legion's mutiny, austere and military: its citizens
# dress as a citizen army. Field grey, drab and iron black wool cut like uniforms; the Republic's red only as
# piping and collar tabs, brass only on buttons and buckles, the triskelion of sword-arms only as a small mark. No
# folk ornament. Commoners in a belted grey tunic with a standing collar (women a plain dark dress), tall boots, a
# cloth cap or a plain headscarf; guildsfolk (Salvagers, Smiths, Mechanics, Rocketeers) in a quilted drab jacket with
# salvage plates and a leather apron, an ushanka; the Hall of the Republic in a double-breasted iron-black greatcoat
# piped in red, a cross-belt, plain epaulettes and a grey papakha
def _front(z, extra):
    """a point out from the front of the body at height z"""
    c = spine_at(z)
    d = np.array([0, -1.0, 0])
    h = first_hit(c, d)
    return c + d * ((h or 0.12) + extra)


def _rep_belt(gid, ease=0.03):
    """a plain leather belt with a brass buckle at the front"""
    return torso_tube(gid + '_belt', WAIST + 0.025, WAIST - 0.025, ease, P('leather', 0.05, [], [PN(0.47, 0.53, 'solid', 'brass', 'leather', 1.0)]),
                      rows=3, n=40, hull_from=WAIST + 0.1)


for b, sex in (('male', 'm'), ('female', 'f')):
    def _rtop(sex=sex):
        if sex == 'm':                        # the citizen's tunic: grey wool, standing collar with red tabs, a belt
            gid = 'rep_m_peasant_tunic'
            tun = P('repgrey', 0.06, [B('top', 0.0, 0.03, 'solid', 'repgreyd'), B('top', 0.0, 0.006, 'solid', 'repred'),
                                      B('bottom', 0.0, 0.012, 'solid', 'repgreyd')],
                    [PN(0.485, 0.515, 'buttons', 'brass', 'repgreyd', 0.07)])
            sl = P('repgrey', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'repgreyd')])
            return [torso_tube(gid, TOP, CROTCH - 0.07, 0.018, tun, hang_from=WAIST - 0.03, flare=0.08, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                    _rep_belt(gid)] + sleeves(gid, 'wrist', 0.018, sl, ease_end=0.022, rows=9)
        # a plain dark wool dress to mid-calf, high collar, long sleeves, a belt; a plain apron for work
        gid = 'rep_f_peasant_dress'
        dress = P('repgreyd', 0.06, [B('top', 0.0, 0.025, 'solid', 'repblack'), B('top', 0.0, 0.005, 'solid', 'repred'),
                                     B('bottom', 0.0, 0.015, 'solid', 'repblack')], [PN(0.485, 0.515, 'buttons', 'repblack', 'repgreyd', 0.06)])
        sl = P('repgreyd', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'repblack')])
        return [torso_tube(gid, TOP, KNEE - 0.24, 0.014, dress, hang_from=CHEST - 0.04, hang_side=WAIST, flare=0.18, group_below=CROTCH + 0.02,
                           hull_from=CHEST + 0.02), _rep_belt(gid, 0.022),
                flap(gid + '_apron', _front(WAIST - 0.01, 0.03), 0.28, WAIST - KNEE + 0.02, np.array([0, -1.0, 0]), P('drab', 0.06),
                     group_below=CROTCH + 0.02, sway=0.02)] + sleeves(gid, 'wrist', 0.016, sl, ease_end=0.02, rows=9)
    GARMENTS['rep_%s_peasant_%s' % (sex, 'tunic' if sex == 'm' else 'dress')] = ('torso', b, 'Citizen\'s tunic' if sex == 'm' else 'Plain wool dress', _rtop)

    if sex == 'm':
        def _rlegs():
            return trousers('rep_m_peasant_trousers', P('repgrey', 0.06), ease=0.012, ease_end=0.022, cuff=ANKLE + 0.45 * (KNEE - ANKLE))
        GARMENTS['rep_m_peasant_trousers'] = ('legs', b, 'Grey trousers', _rlegs)

    def _rboot1(sex=sex):                     # plain tall boots for everyone: the trousers tuck in
        return boots('rep_%s_peasant_boots' % sex, P('repblack', 0.06), P('repblack', 0.05, [B('top', 0.0, 0.015, 'solid', 'leather')]),
                     top=0.75 if sex == 'm' else 0.6, ease_top=0.03)
    GARMENTS['rep_%s_peasant_boots' % sex] = ('feet', b, 'Tall boots', _rboot1)

    def _rhead(sex=sex):
        if sex == 'm':                        # a plain cloth cap, a red band
            gid = 'rep_m_peasant_cap'
            return [tower_hat(gid, 0.06, lambda t: 1.0 + 0.1 * t, P('repgrey', 0.06, [B('top', 0.0, 0.012, 'solid', 'repred')]), rows=5)]
        return [hood('rep_f_peasant_platok', P('repgreyd', 0.06, [B('bottom', 0.0, 0.01, 'solid', 'repblack')]), ease=0.02, ease_low=0.035,
                     open_front=0.95, low=-0.3)]
    GARMENTS['rep_%s_peasant_%s' % (sex, 'cap' if sex == 'm' else 'platok')] = ('head', b, 'Cloth cap' if sex == 'm' else 'Plain headscarf', _rhead)

    def _rwork(sex=sex):
        # guildsfolk: a quilted drab jacket, salvage iron on the shoulders, a leather apron, a belt with pouches
        gid = 'rep_%s_trade_jacket' % sex
        quilt = P('drab', 0.06, [B('top', 0.0, 0.025, 'solid', 'repgreyd'), B('bottom', 0.0, 0.02, 'solid', 'repgreyd')],
                  [PN(0.0, 1.0, 'quilt', 'drabd', 'drab', 0.07)])
        sl = P('drab', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'repgreyd')], [PN(0.0, 1.0, 'quilt', 'drabd', 'drab', 0.07)])
        plate = P('iron', 0.03, [B('top', 0.0, 0.3, 'dots', 'ancient', 'iron', 0.04), B('bottom', 0.0, 0.01, 'solid', 'rust')])
        apron = P('leather', 0.06, [B('top', 0.0, 0.012, 'solid', 'brass'), B('bottom', 0.0, 0.015, 'solid', 'umber')])
        hem = CROTCH - 0.02 if sex == 'm' else CROTCH - 0.06
        return [torso_tube(gid, TOP, hem, 0.026, quilt, hang_from=WAIST - 0.03, flare=0.08, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                flap(gid + '_apron', _front(WAIST + 0.02, 0.05), 0.32 if sex == 'm' else 0.29, WAIST - KNEE + 0.08, np.array([0, -1.0, 0]), apron,
                     group_below=CROTCH + 0.02, sway=0.01),
                pauldron(gid + '_plate_L', L, plate, reach=0.4, ease=0.045), pauldron(gid + '_plate_R', R, plate, reach=0.4, ease=0.045)] + \
            izani_belt(gid, P('leather', 0.05, [B('top', 0.0, 0.01, 'solid', 'brass'), B('bottom', 0.0, 0.01, 'solid', 'brass')]), P('umber', 0.06),
                       ease=0.06) + sleeves(gid, 'wrist', 0.026, sl, ease_end=0.03, rows=8)
    GARMENTS['rep_%s_trade_jacket' % sex] = ('torso', b, 'Guild jacket, plates and apron', _rwork)

    def _rlegs2(sex=sex):
        if sex == 'm':
            return trousers('rep_m_trade_breeches', P('repgreyd', 0.06), ease=0.012, ease_end=0.02, cuff=KNEE - 0.08)
        return [torso_tube('rep_f_trade_skirt', WAIST + 0.01, ANKLE + 0.2, 0.01, P('repgreyd', 0.06, [B('bottom', 0.0, 0.015, 'solid', 'repblack')]),
                           hang_from=CROTCH + 0.06, flare=0.12, group_below=CROTCH + 0.04, rows=18, hull_from=WAIST)]
    GARMENTS['rep_%s_trade_%s' % (sex, 'breeches' if sex == 'm' else 'skirt')] = ('legs', b, 'Work breeches' if sex == 'm' else 'Work skirt', _rlegs2)

    def _rboot(sex=sex):
        return boots('rep_%s_trade_boots' % sex, P('umber', 0.08), P('leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'umber')]), top=0.85, ease_top=0.03)
    GARMENTS['rep_%s_trade_boots' % sex] = ('feet', b, 'Work boots', _rboot)

    def _rhead2(sex=sex):                     # the ushanka: a drab crown, fur brim and ear flaps
        a_, b_, up, bk, left = head_frame()
        gid = 'rep_%s_trade_ushanka' % sex
        fur = P('fur', 0.14)
        out = [head_rings(gid, 0.5, 1.0, 0.035, P('drab', 0.06, [B('top', 0.0, 0.03, 'solid', 'umber')]), n=32, rows=7, apex=True),
               head_rings(gid + '_brim', 0.5, 0.64, 0.05, fur, n=36, rows=3)]
        for k, sd in enumerate((-1, 1)):
            f = flap('%s_ear%d' % (gid, k), a_ + (b_ - a_) * 0.5 + left * sd * 0.105, 0.085, 0.11, left * sd, fur, cols=5, rows=5, ease=0.02)
            f.cloth = None
            out.append(f)
        return out
    GARMENTS['rep_%s_trade_ushanka' % sex] = ('head', b, 'Ushanka', _rhead2)

    def _rnob(sex=sex):
        # the Hall of the Republic: a double-breasted iron-black greatcoat, red piping and collar tabs, two rows of brass
        # buttons, plain epaulettes, a cross-belt and a belt; the triskelion small, on the collar tabs
        gid = 'rep_%s_noble_greatcoat' % sex
        coat = P('repblack', 0.04, [B('top', 0.0, 0.04, 'triskele', 'repred', 'repblack', 0.045), B('top', 0.04, 0.046, 'solid', 'repred'),
                                    B('bottom', 0.0, 0.006, 'solid', 'repred')], [PN(0.42, 0.58, 'buttons2', 'brass', 'repblack', 0.13)])
        sl = P('repblack', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'repblack'), B('bottom', 0.05, 0.056, 'solid', 'repred')])
        ep = P('repblack', 0.03, [B('bottom', 0.0, 0.01, 'solid', 'repred')])
        hem = KNEE - 0.1 if sex == 'm' else KNEE - 0.18
        return [torso_tube(gid, TOP, hem, 0.022, coat, hang_from=WAIST - 0.03, hang_side=WAIST, flare=0.16, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                band(gid + '_crossbelt', WAIST - 0.01, SHOULDER + 0.04, 0.035, 0.034, P('leather', 0.04), high=-math.pi / 2, rows=3),
                _rep_belt(gid, 0.034),
                pauldron(gid + '_ep_L', L, ep, reach=0.22, ease=0.032), pauldron(gid + '_ep_R', R, ep, reach=0.22, ease=0.032)] + \
            sleeves(gid, 'wrist', 0.02, sl, ease_end=0.03, rows=9)
    GARMENTS['rep_%s_noble_greatcoat' % sex] = ('torso', b, 'Greatcoat and cross-belt', _rnob)

    def _rnlegs(sex=sex):
        if sex == 'm':
            return trousers('rep_m_noble_breeches', P('repgreyd', 0.04), ease=0.01, ease_end=0.016, cuff=KNEE - 0.1)
        return [torso_tube('rep_f_noble_skirt', WAIST + 0.01, ANKLE + 0.16, 0.01, P('repblack', 0.04, [B('bottom', 0.0, 0.006, 'solid', 'repred')]),
                           hang_from=CROTCH + 0.06, flare=0.1, group_below=CROTCH + 0.04, rows=18, hull_from=WAIST)]
    GARMENTS['rep_%s_noble_%s' % (sex, 'breeches' if sex == 'm' else 'skirt')] = ('legs', b, 'Officer\'s breeches' if sex == 'm' else 'Black skirt', _rnlegs)

    def _rnboot(sex=sex):
        return boots('rep_%s_noble_boots' % sex, P('velvet', 0.03), P('black', 0.02), top=0.9 if sex == 'm' else 0.78, ease_top=0.026)
    GARMENTS['rep_%s_noble_boots' % sex] = ('feet', b, 'Riding boots', _rnboot)

    def _rnhead(sex=sex):                     # the papakha: grey astrakhan, its crown red, crossed in black
        # (a tower hat's strip runs up from the band: its 'bottom' end is the crown)
        gid = 'rep_%s_noble_papakha' % sex
        return [tower_hat(gid, 0.15 if sex == 'm' else 0.13, lambda t: 1.08 + 0.05 * t, P('repgrey', 0.24, [B('bottom', 0.0, 0.035, 'solid', 'repred')],
                                                                                          fabric='fur.astrakhan'), rows=10)]
    GARMENTS['rep_%s_noble_papakha' % sex] = ('head', b, 'Papakha', _rnhead)


# the Republic's festive dress, beside the austere set: its folk side (Russian and Transylvanian Saxon), worn for feast
# days, weddings and the Hall's ceremonies (data/peoples.json tiers *_fest): linen and red cross-stitch, the sarafan,
# felt boots, the Saxon coat and the Borten, the red frogged greatcoat with its triskelion hem, the velvet gown and the
# kokoshnik. Its ids are rep_<sex>_fest_*; the work boots are the austere set's
for b, sex in (('male', 'm'), ('female', 'f')):
    def _frtop(sex=sex):
        if sex == 'm':                        # the kosovorotka: a linen shirt to the hips, worn out, with a red sash
            gid = 'rep_m_fest_peasant_shirt'
            shirt = P('linen', 0.07, [B('top', 0.0, 0.04, 'cross', 'repred', 'linen', 0.045), B('bottom', 0.0, 0.012, 'solid', 'repred'),
                                      B('bottom', 0.015, 0.06, 'cross', 'repred', 'linen', 0.05)], [PN(0.53, 0.58, 'cross', 'repred', 'linen', 0.05)])
            sl = P('linen', 0.07, [B('bottom', 0.0, 0.045, 'cross', 'repred', 'linen', 0.045)])
            return [torso_tube(gid, TOP, CROTCH - 0.06, 0.018, shirt, hang_from=WAIST - 0.03, flare=0.12, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                    torso_tube(gid + '_belt', WAIST + 0.02, WAIST - 0.03, 0.03, P('repred', 0.05, [B('top', 0.0, 0.006, 'solid', 'repochre'),
                               B('bottom', 0.0, 0.006, 'solid', 'repochre')]), rows=3, n=40, hull_from=WAIST + 0.1)] + \
                sleeves(gid, 'wrist', 0.02, sl, ease_end=0.035, rows=9)
        # the sarafan: a red pinafore from the bust to the ankles over a linen blouse with full sleeves, a dark apron
        gid = 'rep_f_fest_peasant_sarafan'
        saraf = P('repred', 0.05, [B('top', 0.0, 0.02, 'solid', 'repochre'), B('bottom', 0.0, 0.02, 'solid', 'repochre'),
                                   B('bottom', 0.025, 0.1, 'rose', 'repochre', 'repred', 0.09)], [PN(0.47, 0.53, 'cross', 'repochre', 'repred', 0.05)])
        blouse = P('linen', 0.06, [B('top', 0.0, 0.035, 'cross', 'repred', 'linen', 0.04)])
        sl = P('linen', 0.06, [B('bottom', 0.0, 0.05, 'cross', 'repred', 'linen', 0.045)])
        apron = P('velvet', 0.05, [B('bottom', 0.0, 0.015, 'solid', 'repochre'), B('bottom', 0.02, 0.09, 'rose', 'repred', 'velvet', 0.08)])
        return [torso_tube(gid, CHEST + 0.06, ANKLE + 0.05, 0.014, saraf, hang_from=CHEST - 0.04, hang_side=WAIST, flare=0.22, group_below=CROTCH + 0.02,
                           hull_from=CHEST + 0.07),
                torso_tube(gid + '_blouse', TOP, CHEST + 0.03, 0.012, blouse, hull_from=CHEST + 0.02, rows=8),
                flap(gid + '_apron', _front(WAIST - 0.01, 0.03), 0.3, WAIST - KNEE + 0.02, np.array([0, -1.0, 0]), apron,
                     group_below=CROTCH + 0.02, sway=0.02)] + \
            sleeves(gid, 'wrist', 0.022, sl, ease_end=0.05, rows=9)
    GARMENTS['rep_%s_fest_peasant_%s' % (sex, 'shirt' if sex == 'm' else 'sarafan')] = ('torso', b, 'Kosovorotka and sash' if sex == 'm' else 'Sarafan and apron', _frtop)

    if sex == 'm':
        def _frlegs():
            return trousers('rep_m_fest_peasant_trousers', P('greyblue', 0.07, [B('bottom', 0.0, 0.02, 'solid', 'felt')]), ease=0.012, ease_end=0.028,
                            cuff=ANKLE + 0.4 * (KNEE - ANKLE))
        GARMENTS['rep_m_fest_peasant_trousers'] = ('legs', b, 'Grey-blue trousers', _frlegs)

    def _frfelt(sex=sex):                      # valenki: grey felt boots to below the knee
        return boots('rep_%s_fest_valenki' % sex, P('felt', 0.1), P('felt', 0.12, [B('top', 0.0, 0.02, 'solid', 'umber')]), top=0.72, ease_top=0.03)
    GARMENTS['rep_%s_fest_valenki' % sex] = ('feet', b, 'Felt boots', _frfelt)

    def _frhead(sex=sex):
        if sex == 'm':                        # a felt kolpak with a fur band
            gid = 'rep_m_fest_peasant_cap'
            return [tower_hat(gid, 0.07, lambda t: 1.0 + 0.12 * t, P('felt', 0.1, [B('top', 0.0, 0.03, 'solid', 'felt')]), rows=6),
                    head_rings(gid + '_fur', 0.58, 0.7, 0.03, P('darkfur', 0.1, [B('top', 0.0, 0.5, 'feather', 'fur', 'darkfur', 0.02)]), n=36, rows=3)]
        return [hood('rep_f_fest_peasant_platok', P('repred', 0.05, [B('bottom', 0.0, 0.05, 'rose', 'repcream', 'repred', 0.06),
                                                                B('bottom', 0.0, 0.008, 'solid', 'repochre')]), ease=0.02, ease_low=0.035, open_front=0.95, low=-0.3)]
    GARMENTS['rep_%s_fest_peasant_%s' % (sex, 'cap' if sex == 'm' else 'platok')] = ('head', b, 'Felt cap, fur band' if sex == 'm' else 'Red headscarf', _frhead)

    def _frwork(sex=sex):
        if sex == 'm':                        # a guildsman: the padded jacket, iron salvage plates, a leather apron, a belt
            gid = 'rep_m_fest_trade_jacket'
            quilt = P('repochre', 0.06, [B('top', 0.0, 0.025, 'solid', 'umber'), B('bottom', 0.0, 0.02, 'solid', 'umber')],
                      [PN(0.0, 1.0, 'quilt', 'ochre', 'repochre', 0.07)])
            sl = P('repochre', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'umber')], [PN(0.0, 1.0, 'quilt', 'ochre', 'repochre', 0.07)])
            plate = P('iron', 0.03, [B('top', 0.0, 0.3, 'dots', 'ancient', 'iron', 0.04), B('bottom', 0.0, 0.01, 'solid', 'rust')])
            apron = P('leather', 0.06, [B('top', 0.0, 0.012, 'solid', 'brass'), B('bottom', 0.0, 0.015, 'solid', 'umber')])
            return [torso_tube(gid, TOP, CROTCH - 0.02, 0.026, quilt, hang_from=WAIST - 0.03, flare=0.08, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                    flap(gid + '_apron', _front(WAIST + 0.02, 0.05), 0.32, WAIST - KNEE + 0.08, np.array([0, -1.0, 0]), apron,
                         group_below=CROTCH + 0.02, sway=0.01),
                    pauldron(gid + '_plate_L', L, plate, reach=0.4, ease=0.045), pauldron(gid + '_plate_R', R, plate, reach=0.4, ease=0.045)] + \
                izani_belt(gid, P('leather', 0.05, [B('top', 0.0, 0.01, 'solid', 'brass'), B('bottom', 0.0, 0.01, 'solid', 'brass')]), P('umber', 0.06),
                           ease=0.06) + sleeves(gid, 'wrist', 0.026, sl, ease_end=0.03, rows=8)
        # a guildswoman: the long belted Saxon coat in red wool, ochre facings, over a linen blouse
        gid = 'rep_f_fest_trade_coat'
        coat = P('repred', 0.06, [B('top', 0.0, 0.03, 'solid', 'repochre'), B('bottom', 0.0, 0.02, 'solid', 'repochre'),
                                  B('bottom', 0.025, 0.08, 'cross', 'repochre', 'repred', 0.06)], [PN(0.47, 0.53, 'solid', 'repochre', 'repred', 1.0)])
        sl = P('repred', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'repochre')])
        return [torso_tube(gid, TOP, KNEE - 0.12, 0.018, coat, hang_from=WAIST - 0.02, hang_side=WAIST, flare=0.2, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                torso_tube(gid + '_belt', WAIST + 0.025, WAIST - 0.025, 0.026, P('velvet', 0.03, [B('top', 0.0, 0.3, 'beads', 'brass', 'velvet', 0.03)]),
                           rows=3, n=40, hull_from=WAIST + 0.1)] + sleeves(gid, 'wrist', 0.018, sl, ease_end=0.04, rows=9)
    GARMENTS['rep_%s_fest_trade_%s' % (sex, 'jacket' if sex == 'm' else 'coat')] = ('torso', b, 'Ochre guild jacket, plates and apron' if sex == 'm' else 'Saxon coat', _frwork)

    def _frlegs2(sex=sex):
        if sex == 'm':
            return trousers('rep_m_fest_trade_breeches', P('umber', 0.06), ease=0.012, ease_end=0.02, cuff=KNEE - 0.08)
        return [torso_tube('rep_f_fest_trade_skirt', WAIST + 0.01, ANKLE + 0.05, 0.01, P('velvet', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'repochre'),
                           B('bottom', 0.025, 0.11, 'rose', 'repred', 'velvet', 0.09)]), hang_from=CROTCH + 0.06, flare=0.16, group_below=CROTCH + 0.04,
                           rows=20, hull_from=WAIST)]
    GARMENTS['rep_%s_fest_trade_%s' % (sex, 'breeches' if sex == 'm' else 'skirt')] = ('legs', b, 'Brown breeches' if sex == 'm' else 'Black skirt', _frlegs2)

    def _frhead2(sex=sex):
        a_, b_, up, bk, left = head_frame()
        if sex == 'm':                        # the ushanka: a fur crown and ear flaps
            gid = 'rep_m_fest_trade_ushanka'
            fur = P('fur', 0.14)
            out = [head_rings(gid, 0.5, 1.0, 0.035, P('greyblue', 0.06, [B('top', 0.0, 0.03, 'solid', 'umber')]), n=32, rows=7, apex=True),
                   head_rings(gid + '_brim', 0.5, 0.64, 0.05, fur, n=36, rows=3)]
            for k, sd in enumerate((-1, 1)):
                f = flap('%s_ear%d' % (gid, k), a_ + (b_ - a_) * 0.5 + left * sd * 0.105, 0.085, 0.11, left * sd, fur, cols=5, rows=5, ease=0.02)
                f.cloth = None
                out.append(f)
            return out
        # the Borten: the Saxon girl's tall black velvet cylinder, ribbons hanging behind
        gid = 'rep_f_fest_trade_borten'
        rib = flap(gid + '_ribbons', a_ + (b_ - a_) * 0.7 + bk * 0.1, 0.09, 0.4, bk, P('repred', 0.03, [B('top', 0.0, 0.5, 'stripes', 'repochre', 'repred', 0.0)]),
                   cols=4, rows=9, ease=0.02, sway=0.02)
        return [tower_hat(gid, 0.13, lambda t: 1.04, P('velvet', 0.02, [B('bottom', 0.0, 0.03, 'rose', 'repred', 'velvet', 0.035), B('top', 0.0, 0.02, 'solid', 'velvet')]),
                          rows=8), rib]
    GARMENTS['rep_%s_fest_trade_%s' % (sex, 'ushanka' if sex == 'm' else 'borten')] = ('head', b, 'Grey ushanka' if sex == 'm' else 'Borten', _frhead2)

    def _frnob(sex=sex):
        if sex == 'm':                        # the Hall of the Republic: a red greatcoat, frogged, the sash, epaulettes
            gid = 'rep_m_fest_noble_greatcoat'
            coat = P('repred', 0.03, [B('top', 0.0, 0.025, 'solid', 'repochre'), B('bottom', 0.0, 0.02, 'solid', 'repochre'),
                                      B('bottom', 0.025, 0.11, 'triskele', 'repochre', 'repred', 0.11), B('bottom', 0.115, 0.125, 'solid', 'repochre')],
                     [PN(0.42, 0.58, 'frog', 'repochre', 'repred', 0.07)])
            sl = P('repred', 0.03, [B('bottom', 0.0, 0.06, 'triskele', 'repochre', 'repred', 0.06), B('bottom', 0.06, 0.07, 'solid', 'repochre')])
            ep = P('brass', 0.07, [B('bottom', 0.0, 0.3, 'stripes', 'repochre', 'brass', 0.0)], fabric='metal.brass.braid')
            return [torso_tube(gid, TOP, KNEE - 0.06, 0.02, coat, hang_from=WAIST - 0.03, flare=0.2, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                    band(gid + '_sash', WAIST - 0.01, SHOULDER + 0.04, 0.065, 0.034, P('repcream', 0.03, [B('top', 0.0, 0.008, 'solid', 'repochre'),
                         B('bottom', 0.0, 0.008, 'solid', 'repochre')]), high=-math.pi / 2, rows=4),
                    torso_tube(gid + '_belt', WAIST + 0.03, WAIST - 0.03, 0.03, P('velvet', 0.03, [B('top', 0.0, 0.3, 'beads', 'brass', 'velvet', 0.05)]),
                               rows=3, n=40, hull_from=WAIST + 0.1),
                    pauldron(gid + '_ep_L', L, ep, reach=0.22, ease=0.032), pauldron(gid + '_ep_R', R, ep, reach=0.22, ease=0.032)] + \
                sleeves(gid, 'wrist', 0.018, sl, ease_end=0.03, rows=9)
        # a gown in red velvet to the floor, its front worked in ochre, a cream lace collar, a fur-edged cape
        gid = 'rep_f_fest_noble_gown'
        gown = P('repred', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'repochre'), B('bottom', 0.025, 0.12, 'triskele', 'repochre', 'repred', 0.1),
                                  B('bottom', 0.125, 0.135, 'solid', 'repochre'), B('top', 0.0, 0.02, 'solid', 'repochre')],
                 [PN(0.45, 0.55, 'cross', 'repochre', 'repred', 0.06)])
        sl = P('repred', 0.02, [B('bottom', 0.0, 0.05, 'cross', 'repochre', 'repred', 0.05)])
        return [torso_tube(gid, TOP, ANKLE + 0.03, 0.014, gown, hang_from=CHEST - 0.04, hang_side=WAIST, flare=0.24, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                collar_disc(gid + '_lace', 0.07, P('repcream', 0.02, [B('top', 0.0, 0.5, 'dots', 'white', 'repcream', 0.02)]), drop=0.04, scallop=0.2),
                cape(gid + '_cape', KNEE - 0.1, P('velvet', 0.03, [B('top', 0.0, 0.06, 'feather', 'fur', 'darkfur', 0.02), B('bottom', 0.0, 0.03, 'solid', 'repochre')]),
                     flare=0.28, span=1.2, ease=0.034, top=TOP - 0.02)] + sleeves(gid, 'wrist', 0.016, sl, ease_end=0.06, rows=10)
    GARMENTS['rep_%s_fest_noble_%s' % (sex, 'greatcoat' if sex == 'm' else 'gown')] = ('torso', b, 'Greatcoat, sash and epaulettes' if sex == 'm' else 'Velvet gown and cape', _frnob)

    if sex == 'm':
        def _frnlegs():
            return trousers('rep_m_fest_noble_breeches', P('repcream', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'repochre')]), ease=0.01, ease_end=0.016, cuff=KNEE - 0.1)
        GARMENTS['rep_m_fest_noble_breeches'] = ('legs', b, 'Cream breeches', _frnlegs)

    def _frnboot(sex=sex):
        if sex == 'm':
            return boots('rep_m_fest_noble_boots', P('velvet', 0.03), P('black', 0.02, [B('top', 0.0, 0.025, 'solid', 'brass')]), top=0.9, ease_top=0.026)
        return boots('rep_f_fest_noble_boots', P('velvet', 0.03), P('repred', 0.02, [B('top', 0.0, 0.015, 'solid', 'repochre')]), top=0.3, ease_top=0.018)
    GARMENTS['rep_%s_fest_noble_boots' % sex] = ('feet', b, 'Riding boots, brass' if sex == 'm' else 'Red boots', _frnboot)

    def _frnhead(sex=sex):
        if sex == 'm':                        # the papakha: a tall fur hat, its crown red with an ochre cross
            gid = 'rep_m_fest_noble_papakha'
            # (a tower hat's strip runs up from the band: its 'bottom' end is the crown)
            return [tower_hat(gid, 0.17, lambda t: 1.08 + 0.06 * t, P('darkfur', 0.24, [B('bottom', 0.0, 0.04, 'cross', 'repochre', 'repred', 0.05)],
                                                                      fabric='fur.astrakhan'), rows=10)]
        # the kokoshnik: a tall crescent standing over the brow, red and gold, pearls along its edge
        gid = 'rep_f_fest_noble_kokoshnik'
        k = fan(gid + '_crest', 0.07, 0.19, 1.25, P('repred', 0.02, [B('top', 0.0, 0.03, 'beads', 'white', 'repochre', 0.02),
                                                                  B('top', 0.03, 0.5, 'rose', 'repochre', 'repred', 0.05)]), rows=5, cols=17, tilt=-0.05, back=-0.035, curl=0.0)
        k.cloth = None
        return [head_rings(gid, 0.55, 0.7, 0.02, P('repochre', 0.02, [B('top', 0.0, 0.5, 'beads', 'white', 'repochre', 0.02)]), n=36, rows=3), k]
    GARMENTS['rep_%s_fest_noble_%s' % (sex, 'papakha' if sex == 'm' else 'kokoshnik')] = ('head', b, 'Black papakha' if sex == 'm' else 'Kokoshnik', _frnhead)


# ---------------------------------------------------------------------------------------------------------------
# the Giants (tools/giant.py: the man's body, scaled up by the pages). A temple guard of Dalab has four arms and wears
# the god's gold over bare skin; the Free Giants of Giant Country dress as Gauls: a belted tunic, checked braccae, a
# sagum pinned at the shoulder, a torc for a chief, a horned bronze helmet for a war leader. Their four-armed tops
# (four_armed, sleeves2) are the only tops a four-armed body takes; two-armed ones leave the lower arms out
def armbands2(gid, paint, f=0.45, w=0.035):
    """armbands on the lower pair (as armbands())"""
    out = []
    for sd in (L, R):
        a, e = low(J(sd + 'Arm'), sd), low(J(sd + 'ForeArm'), sd)
        c = a + (e - a) * f
        out.append(limb_tube('%s_armband2_%s' % (gid, sd[0]), c, c + (e - a) / np.linalg.norm(e - a) * w, 0.008, paint, n=16, rows=2, bvh=BVH_A2))
    return out


def _free_tunic(gid, arms, body, sl):
    parts = [torso_tube(gid, TOP, CROTCH - 0.14, 0.014, body, hang_from=WAIST - 0.03, flare=0.16, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
             torso_tube(gid + '_belt', WAIST + 0.03, WAIST - 0.03, 0.026, P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'bronze'),
                        B('bottom', 0.0, 0.008, 'solid', 'bronze')]), rows=3, n=40, hull_from=WAIST + 0.1)]
    parts += sleeves(gid, 'wrist', 0.016, sl, ease_end=0.03, rows=9)
    if arms == 4:
        parts = four_armed(gid, parts + sleeves2(gid, 'wrist', 0.016, sl, ease_end=0.03, rows=9))
    return parts


def _free_paint():
    body = P('weld', 0.06, [B('top', 0.0, 0.015, 'solid', 'madder'), B('bottom', 0.0, 0.02, 'solid', 'madder'),
                            B('bottom', 0.025, 0.07, 'knot', 'woad', 'weld', 0.09)], [PN(0.0, 1.0, 'tartan', 'madder', 'weld', 0.3)])
    sl = P('weld', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'madder')], [PN(0.0, 1.0, 'tartan', 'madder', 'weld', 0.2)])
    return body, sl


@garment('giant_free_m_tunic', 'torso', 'male', 'Free Giant tunic')
def _():
    return _free_tunic('giant_free_m_tunic', 2, *_free_paint())


@garment('giant_free_m_tunic4', 'torso', 'male', 'Free Giant tunic, four sleeves')
def _():
    return _free_tunic('giant_free_m_tunic4', 4, *_free_paint())


@garment('giant_free_m_jerkin4', 'torso', 'male', 'Warrior\'s jerkin, four-armed')
def _():
    gid = 'giant_free_m_jerkin4'
    hide = P('hide', 0.08, [B('top', 0.0, 0.02, 'solid', 'leather'), B('bottom', 0.0, 0.025, 'solid', 'leather'),
                            B('bottom', 0.03, 0.06, 'teeth', 'bronze', 'hide', 0.05)])
    bandp = P('bronze', 0.02, [B('top', 0.0, 0.2, 'knot', 'iron', 'bronze', 0.03)])
    parts = [torso_tube(gid, TOP, CROTCH - 0.04, 0.02, hide, hang_from=WAIST - 0.02, flare=0.1, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
             band(gid + '_baldric', WAIST - 0.01, SHOULDER + 0.04, 0.06, 0.03, P('leather', 0.05, [B('top', 0.0, 0.01, 'solid', 'bronze'),
                  B('bottom', 0.0, 0.01, 'solid', 'bronze')]), high=math.pi / 2, rows=4),
             torso_tube(gid + '_belt', WAIST + 0.035, WAIST - 0.035, 0.034, P('leather', 0.05, [B('top', 0.0, 0.3, 'beads', 'bronze', 'leather', 0.04)]),
                        rows=3, n=40, hull_from=WAIST + 0.1)]
    return four_armed(gid, parts + armbands(gid, bandp, f=0.35, w=0.06) + armbands2(gid, bandp, f=0.35, w=0.06))


def _chief(gid, arms):
    body = P('woad', 0.05, [B('top', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'gold'),
                            B('bottom', 0.025, 0.08, 'knot', 'gold', 'woad', 0.09)], [PN(0.0, 1.0, 'tartan', 'black', 'woad', 0.3)])
    sl = P('woad', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'gold')], [PN(0.0, 1.0, 'tartan', 'black', 'woad', 0.2)])
    parts = _free_tunic(gid, arms, body, sl)
    sagum = P('madder', 0.07, [B('bottom', 0.0, 0.03, 'solid', 'loden'), B('bottom', 0.035, 0.1, 'tartan', 'loden', 'madder', 0.12)])
    torc = P('gold', 0.07, [B('top', 0.0, 0.5, 'stripes', 'bronze', 'gold', 0.012)], fabric='metal.brass.braid')
    # the sagum hangs from the shoulders behind (a cloak, not a sleeve: the lower arms come out under it); pinned on the
    # right shoulder by a bronze brooch; the torc round the neck
    d = np.array([-0.5, -1.0, 0.0]) / math.sqrt(1.25)
    parts += [cape(gid + '_sagum', KNEE + 0.02, sagum, flare=0.3, span=1.35, ease=0.04, top=TOP - 0.02),
              collar_disc(gid + '_torc', 0.035, torc, drop=0.012, scallop=0.0, ease=0.025, rows=2),
              blob(gid + '_brooch', _out(spine_at(SHOULDER - 0.05), d, 0.035), (0.055, 0.025, 0.055), P('bronze', 0.02), out=d)]
    return parts


@garment('giant_free_m_chief', 'torso', 'male', 'Chief\'s tunic, sagum and torc')
def _():
    return _chief('giant_free_m_chief', 2)


@garment('giant_free_m_chief4', 'torso', 'male', 'Chief\'s tunic, sagum and torc, four-armed')
def _():
    return _chief('giant_free_m_chief4', 4)


@garment('giant_free_m_braccae', 'legs', 'male', 'Checked braccae')
def _():
    return trousers('giant_free_m_braccae', P('loden', 0.07, [B('bottom', 0.0, 0.02, 'solid', 'umber')], [PN(0.0, 1.0, 'tartan', 'madder', 'loden', 0.25)]),
                    ease=0.014, ease_end=0.026)


@garment('giant_free_m_boots', 'feet', 'male', 'Wrapped boots')
def _():
    # tall enough that the braccae tuck in (wraps over loose braccae stand off them as rings)
    return boots('giant_free_m_boots', P('earth', 0.1), P('leather', 0.06, [B('top', 0.0, 0.03, 'solid', 'heather')]), top=0.55, ease_top=0.045)


@garment('giant_free_m_helmet', 'head', 'male', 'Horned bronze helmet')
def _():
    gid = 'giant_free_m_helmet'
    a_, b_, up, bk, left = head_frame()
    c = a_ + (b_ - a_) * 0.74
    hornp = P('bronze', 0.02, [B('top', 0.0, 0.06, 'solid', 'gold'), B('top', 0.06, 0.5, 'stripes', 'gold', 'bronze', 0.0)])
    # short horns, as on the bronze helmets of the La Tene smiths: out from the sides and up
    horns = [horn('%s_horn%d' % (gid, k), [c + left * sd * 0.07, c + left * sd * 0.12 + up * 0.01, c + left * sd * 0.16 + up * 0.06,
                                            c + left * sd * 0.165 + up * 0.13 - bk * 0.01], 0.026, 0.006, hornp, n=12, rows=12)
             for k, sd in enumerate((-1, 1))]
    cap = P('bronze', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'gold'), B('bottom', 0.035, 0.12, 'knot', 'gold', 'bronze', 0.05)])
    return [head_rings(gid, 0.5, 1.0, 0.025, cap, n=32, rows=7, apex=True)] + horns


@garment('giant_dalab_m_harness4', 'torso', 'male', 'Temple guard\'s harness, four-armed')
def _():
    gid = 'giant_dalab_m_harness4'
    pect = P('gold', 0.02, [B('top', 0.0, 0.3, 'rays', 'holyred', 'gold', 0.03), B('bottom', 0.0, 0.015, 'solid', 'holyred')])
    strap = P('holyred', 0.03, [B('top', 0.0, 0.01, 'solid', 'gold'), B('bottom', 0.0, 0.01, 'solid', 'gold')])
    bandp = P('gold', 0.02, [B('top', 0.0, 0.2, 'steps', 'holyred', 'gold', 0.03)])
    # the god's sun on the chest over bare green skin, two straps crossing front and back, each from a shoulder down
    # to the belt on the other side (their low point under the belt, so no loop stands off the hips), gold on all
    # four arms
    parts = [collar_disc(gid + '_pectoral', 0.15, pect, drop=0.07, scallop=0.0),
             band(gid + '_strapL', WAIST - 0.01, SHOULDER + 0.03, 0.05, 0.016, strap, high=math.pi / 2, rows=3),
             band(gid + '_strapR', WAIST - 0.01, SHOULDER + 0.03, 0.05, 0.016, strap, high=-math.pi / 2, rows=3),
             torso_tube(gid + '_belt', WAIST + 0.04, WAIST - 0.04, 0.03, P('gold', 0.02, [B('top', 0.0, 0.3, 'steps', 'holyred', 'gold', 0.05)]),
                        rows=3, n=40, hull_from=WAIST + 0.1)]
    return four_armed(gid, parts + armbands(gid, bandp, f=0.3, w=0.08) + armbands2(gid, bandp, f=0.3, w=0.08), r=0.06)


# ---------------------------------------------------------------------------------------------------------------
# The Order of Historians (settlements/longsong; the owner, 2026-10-19): the History Monks' dress, Tibetan in cut, in the
# Order's saffron and maroon, the field agents in the Order's blue. Four sets by standing, the tiers of the people
# 'historians' (data/peoples.json):
#   NOVICE   a saffron shirt with elbow sleeves over a maroon wrap skirt (the shemdap), sandals
#   MONK     the plain saffron robe to the ankle, a maroon sash, sandals
#   ELDER    a maroon robe, the saffron shawl (the zen) over the left shoulder edged in gold, a crested saffron hat
#   AGENT    a knee-length quilted coat in the Order's blue with a maroon sash, dark trousers, boots: for the road
# Plain cotton and wool, not silk: the Order is not rich in its dress.
COTTON, WOOL = 'cloth.cotton.coarse', 'cloth.wool'


def turban(gid, base_paint, wrap_paint, jewel_paint, size=1.0, ribbons=4):
    """a great wrapped turban (rich Xanadui; the owner's references, at about a third to a half of their size): a dome
    of cloth rising from the brow and swelling past the head's width, its folds crossed by ribbons of a second colour
    and a band at the brow, a silver brooch with a crescent standing over it at the front"""
    a, b, up, bk, left = head_frame()
    H = np.linalg.norm(b - a)
    angles = np.linspace(0, 2 * math.pi, 44, endpoint=False)
    hug = ring_points(a + (b - a) * 0.62, left, bk, angles, 0.016, rmin=0.04, rmax=0.2)
    c0 = a + (b - a) * 0.62
    r0 = float(np.mean(np.linalg.norm(hug - c0, axis=1)))
    R = r0 + 0.055 * size                      # the widest: about a head and a half across
    f0, f1 = 0.62, 1.05 + 0.85 * size          # from the brow to about a head's height over the crown
    rows = 18

    def rad(f):
        t = (f - f0) / (f1 - f0)
        if t < 0.3: return r0 + (R - r0) * (0.5 - 0.5 * math.cos(math.pi * t / 0.3))
        u = (t - 0.3) / 0.7                            # then drawn in to a rounded crown, a little peaked
        return R * (1 - u ** 1.6) ** 0.55 * (1 - 0.25 * u) + 0.004

    def at(f, an, extra=0.0):
        c = a + up * H * f + bk * 0.012 * (f - f0)          # leaning a little back, as a wound turban sits
        return c + (left * math.cos(an) * 1.0 + bk * math.sin(an) * 1.06) * (rad(f) + extra)
    fs = np.linspace(f0, f1, rows)
    P = np.array([[at(f, an) for an in angles] for f in fs])
    P[0] = hug                                       # the first row hugs the brow
    P[1] = hug + (P[1] - hug) * 0.6
    P[-1] = P[-1].mean(0)                            # closed over the top
    P = smooth_push(P, True, 0.016, iters=2)
    parts = [Part(gid, P, True, ['body'] * rows, base_paint)]
    # the ribbons: bands wound round the dome on tilted courses, each crossing the others, standing just off the cloth
    for k in range(ribbons):
        ph, amp, fm = k * math.pi / ribbons * 2 + 0.4, 0.2 * size, f0 + (f1 - f0) * (0.3 + 0.08 * (k % 2))
        Q = []
        for w in (-0.04, 0.04):
            Q.append([at(fm + amp * math.sin(an + ph) + w * (1 + 0.3 * math.cos(an)), an, 0.008) for an in angles])
        parts.append(Part('%s_wrap%d' % (gid, k), np.array(Q), True, ['body'] * 2, wrap_paint))
    # the brow band
    Q = [hug + (hug - c0) / np.linalg.norm(hug - c0, axis=1)[:, None] * e + up * dz for e, dz in ((0.012, -0.012), (0.02, 0.03))]
    parts.append(Part(gid + '_brow', np.array(Q), True, ['body'] * 2, wrap_paint))
    # the brooch at the front (the front is -bk) and the crescent standing on it
    fb = f0 + (f1 - f0) * 0.3
    front = at(fb, -math.pi / 2, 0.02)
    parts.append(blob(gid + '_brooch', front, (0.07 * size, 0.024, 0.08 * size), jewel_paint, out=-bk))
    tip = front + up * 0.11 * size
    parts.append(horn(gid + '_crescentL', [front + up * 0.03, front + up * 0.06 + left * 0.035, tip + left * 0.03 - bk * 0.005], 0.011, 0.003, jewel_paint, n=8, rows=8))
    parts.append(horn(gid + '_crescentR', [front + up * 0.03, front + up * 0.06 - left * 0.035, tip - left * 0.03 - bk * 0.005], 0.011, 0.003, jewel_paint, n=8, rows=8))
    return parts


for b, sex in (('male', 'm'), ('female', 'f')):
    # ---- the novice
    def _onshirt(sex=sex):
        gid = 'order_%s_novice_shirt' % sex
        p = P('osaffron', 0.05, [B('top', 0.0, 0.015, 'solid', 'omaroon'), B('bottom', 0.0, 0.02, 'solid', 'omaroon')], fabric=COTTON)
        return [torso_tube(gid, TOP, WAIST - 0.07, 0.012, p, hull_from=CHEST + 0.02)] + \
            sleeves(gid, 'elbow', 0.018, P('osaffron', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'omaroon')], fabric=COTTON), ease_end=0.04, rows=6)
    GARMENTS['order_%s_novice_shirt' % sex] = ('torso', b, 'Novice\'s shirt', _onshirt)

    def _onskirt(sex=sex):
        p = P('omaroon', 0.05, [B('top', 0.0, 0.03, 'solid', 'yakbrown'), B('bottom', 0.0, 0.02, 'solid', 'osaffron')], fabric=WOOL)
        return [torso_tube('order_%s_novice_skirt' % sex, WAIST + 0.01, ANKLE + 0.08, 0.009, p, hang_from=CROTCH + 0.06, flare=0.18,
                           group_below=CROTCH + 0.04, rows=20, hull_from=WAIST)]
    GARMENTS['order_%s_novice_skirt' % sex] = ('legs', b, 'Novice\'s wrap skirt (shemdap)', _onskirt)

    def _osand(sex=sex):
        return sandal('order_%s_sandals' % sex, P('earth', 0.08), P('omaroon', 0.05))
    GARMENTS['order_%s_sandals' % sex] = ('feet', b, 'The Order\'s sandals', _osand)

    # ---- the monk: the plain saffron robe
    def _orobe(sex=sex):
        gid = 'order_%s_monk_robe' % sex
        robe = P('osaffron', 0.04, [B('top', 0.0, 0.015, 'solid', 'omaroon'), B('bottom', 0.0, 0.02, 'solid', 'omaroon')], fabric=COTTON)
        sl = P('osaffron', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'omaroon')], fabric=COTTON)
        return [torso_tube(gid, TOP, ANKLE + 0.05, 0.012, robe, hang_from=WAIST - 0.03, flare=0.16, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                torso_tube(gid + '_sash', WAIST + 0.035, WAIST - 0.03, 0.024, P('omaroon', 0.03, fabric=WOOL), rows=3, n=40, hull_from=WAIST + 0.1)] + \
            sleeves(gid, 'wrist', 0.016, sl, ease_end=0.07, rows=9)
    GARMENTS['order_%s_monk_robe' % sex] = ('torso', b, 'Monk\'s saffron robe', _orobe)

    # ---- the elder: maroon robe, saffron shawl over the left shoulder, the crested hat
    def _oelder(sex=sex):
        gid = 'order_%s_elder_robe' % sex
        robe = P('omaroon', 0.04, [B('top', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.0, 0.025, 'solid', 'osaffron')], fabric=WOOL)
        zen = P('osaffron', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'gold')], fabric=COTTON)
        sl = P('omaroon', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'osaffron')], fabric=WOOL)
        return [torso_tube(gid, TOP, ANKLE + 0.04, 0.012, robe, hang_from=WAIST - 0.03, flare=0.18, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                band(gid + '_zen', CROTCH + 0.02, SHOULDER + 0.05, 0.16, 0.03, zen, high=math.pi / 2, rows=5),
                torso_tube(gid + '_sash', WAIST + 0.035, WAIST - 0.03, 0.026, P('osaffron', 0.03, fabric=COTTON), rows=3, n=40, hull_from=WAIST + 0.1)] + \
            sleeves(gid, 'wrist', 0.018, sl, ease_end=0.08, rows=9)
    GARMENTS['order_%s_elder_robe' % sex] = ('torso', b, 'Elder\'s robe and shawl', _oelder)

    def _ohat(sex=sex):
        gid = 'order_%s_elder_hat' % sex
        a_, b_, up, bk, left = head_frame()
        c = a_ + (b_ - a_) * 1.0
        cap = P('osaffron', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'omaroon')], fabric=WOOL)
        # the crest: a curved ridge of fringe from the brow over the crown to the back (the pandit's hat)
        crest = horn(gid + '_crest', [c - bk * 0.1 + up * 0.0, c - bk * 0.05 + up * 0.07, c + bk * 0.03 + up * 0.1, c + bk * 0.1 + up * 0.06,
                                      c + bk * 0.14 + up * 0.0], 0.035, 0.012, P('osaffron', 0.06, [B('top', 0.0, 0.5, 'stripes', 'kesar', 'osaffron', 0.01)], fabric=WOOL),
                     n=12, rows=14)
        return [head_rings(gid, 0.5, 1.0, 0.03, cap, n=34, rows=7, apex=True), crest]
    GARMENTS['order_%s_elder_hat' % sex] = ('head', b, 'Elder\'s crested hat', _ohat)

    # ---- the field agent: the Order's blue, for the road
    def _oagent(sex=sex):
        gid = 'order_%s_agent_coat' % sex
        coat = P('orderblue', 0.05, [B('top', 0.0, 0.02, 'solid', 'omaroon'), B('bottom', 0.0, 0.025, 'solid', 'omaroon')],
                 [PN(0.0, 1.0, 'quilt', 'indigo', 'orderblue', 0.12)], fabric=WOOL)
        sl = P('orderblue', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'omaroon')], [PN(0.0, 1.0, 'quilt', 'indigo', 'orderblue', 0.1)], fabric=WOOL)
        return [torso_tube(gid, TOP, KNEE + 0.02, 0.016, coat, hang_from=WAIST - 0.03, flare=0.12, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                torso_tube(gid + '_collar', TOP + 0.05, TOP, 0.02, P('omaroon', 0.03, fabric=WOOL), n=32, rows=3, ease_bottom=0.03),
                torso_tube(gid + '_sash', WAIST + 0.04, WAIST - 0.03, 0.03, P('omaroon', 0.03, [B('top', 0.0, 0.01, 'solid', 'osaffron')], fabric=WOOL),
                           rows=3, n=40, hull_from=WAIST + 0.1)] + sleeves(gid, 'wrist', 0.02, sl, ease_end=0.03, rows=9)
    GARMENTS['order_%s_agent_coat' % sex] = ('torso', b, 'Field agent\'s quilted coat', _oagent)

    def _otrou(sex=sex):
        return trousers('order_%s_agent_trousers' % sex, P('yakbrown', 0.06, fabric=WOOL), ease=0.012, ease_end=0.018)
    GARMENTS['order_%s_agent_trousers' % sex] = ('legs', b, 'Field agent\'s trousers', _otrou)

    def _oboots(sex=sex):
        return boots('order_%s_agent_boots' % sex, P('earth', 0.1), P('leather', 0.06, [B('top', 0.0, 0.03, 'solid', 'omaroon')]), top=0.5, ease_top=0.04)
    GARMENTS['order_%s_agent_boots' % sex] = ('feet', b, 'Field agent\'s boots', _oboots)


# ---------------------------------------------------------------------------------------------------------------
# Xanadu (the Sultanate; the owner, 2026-10-19): Persian, Indian and Tibetan dress mixed. Two sets, the tiers of the people
# 'xanadu' (data/peoples.json):
#   TOWNIE   a man's knee-length kurta, a woman's Tibetan chuba with the striped apron (pangden); loose trousers gathered
#            at the ankle; Tibetan felt boots in colour; a man's round cap
#   RICH     the Persian jama: a long coat flaring from a high waist, in silk, bands of gold, a kesar sash; silk trousers;
#            gilded slippers; and the great wrapped turban (the owner's references, about a third of their size)
for b, sex in (('male', 'm'), ('female', 'f')):
    def _xtop(sex=sex):
        gid = 'xan_%s_town_tunic' % sex
        if sex == 'm':
            p = P('kesar', 0.05, [B('top', 0.0, 0.02, 'solid', 'peacock'), B('bottom', 0.0, 0.02, 'solid', 'peacock'),
                                 B('bottom', 0.025, 0.06, 'diamonds', 'peacock', 'kesar', 0.05)], fabric=COTTON)
            sl = P('kesar', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'peacock')], fabric=COTTON)
            return [torso_tube(gid, TOP, KNEE + 0.06, 0.013, p, hang_from=WAIST - 0.03, flare=0.12, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)] + \
                sleeves(gid, 'wrist', 0.015, sl, ease_end=0.03, rows=9)
        p = P('yakbrown', 0.05, [B('top', 0.0, 0.02, 'solid', 'lacrose'), B('bottom', 0.0, 0.03, 'solid', 'lacrose')],
              [PN(0.40, 0.60, 'stripes', 'lacrose', 'peacock', 0.03)], fabric=WOOL)
        sl = P('cream', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'lacrose')], fabric=COTTON)
        return [torso_tube(gid, TOP, ANKLE + 0.06, 0.012, p, hang_from=WAIST - 0.03, flare=0.14, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                torso_tube(gid + '_sash', WAIST + 0.03, WAIST - 0.03, 0.024, P('lacrose', 0.03, fabric=WOOL), rows=3, n=40, hull_from=WAIST + 0.1)] + \
            sleeves(gid, 'wrist', 0.016, sl, ease_end=0.04, rows=9)
    GARMENTS['xan_%s_town_tunic' % sex] = ('torso', b, 'Xanadui kurta' if sex == 'm' else 'Xanadui chuba and apron', _xtop)

    def _xtrou(sex=sex):
        return trousers('xan_%s_town_trousers' % sex, P('cream', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'peacock')], fabric=COTTON), ease=0.009, ease_end=0.012)
    GARMENTS['xan_%s_town_trousers' % sex] = ('legs', b, 'Loose trousers', _xtrou)

    def _xboots(sex=sex):
        return boots('xan_%s_town_boots' % sex, P('earth', 0.1), P('pomegranate', 0.05, [B('top', 0.0, 0.05, 'stripes', 'peacock', 'kesar', 0.012)]),
                     top=0.55, ease_top=0.035)
    GARMENTS['xan_%s_town_boots' % sex] = ('feet', b, 'Felt boots', _xboots)

    if sex == 'm':
        def _xcap(sex=sex):
            return [head_rings('xan_m_town_cap', 0.62, 1.0, 0.013, P('peacock', 0.04, [B('bottom', 0.0, 0.03, 'diamonds', 'gold', 'peacock', 0.04)], fabric=WOOL),
                               n=32, rows=5, apex=True)]
        GARMENTS['xan_m_town_cap'] = ('head', b, 'Round cap', _xcap)

    def _xjama(sex=sex):
        gid = 'xan_%s_rich_jama' % sex
        p = P('violet', 0.03, [B('top', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'gold'),
                               B('bottom', 0.025, 0.08, 'diamonds', 'gold', 'violet', 0.06), B('bottom', 0.085, 0.095, 'solid', 'gold')])
        sl = P('violet', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'gold')])
        return [torso_tube(gid, TOP, ANKLE + 0.16, 0.012, p, hang_from=WAIST + 0.02, flare=0.24, group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
                torso_tube(gid + '_sash', WAIST + 0.04, WAIST - 0.035, 0.026, P('kesar', 0.03, [B('top', 0.0, 0.012, 'solid', 'gold'), B('bottom', 0.0, 0.012, 'solid', 'gold')]),
                           rows=3, n=40, hull_from=WAIST + 0.1),
                collar_disc(gid + '_collar', 0.05, P('gold', 0.02, [B('top', 0.0, 0.5, 'beads', 'pomegranate', 'gold', 0.02)]), drop=0.02, scallop=0.0, rows=2)] + \
            sleeves(gid, 'wrist', 0.015, sl, ease_end=0.03, rows=9)
    GARMENTS['xan_%s_rich_jama' % sex] = ('torso', b, 'Silk jama and sash', _xjama)

    def _xstrou(sex=sex):
        return trousers('xan_%s_rich_trousers' % sex, P('peacock', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), ease=0.01, ease_end=0.012)
    GARMENTS['xan_%s_rich_trousers' % sex] = ('legs', b, 'Silk trousers', _xstrou)

    def _xslip(sex=sex):
        return boots('xan_%s_rich_slippers' % sex, P('earth', 0.08), P('gold', 0.03, [B('top', 0.0, 0.3, 'diamonds', 'pomegranate', 'gold', 0.02)]),
                     top=0.14, ease_top=0.02)
    GARMENTS['xan_%s_rich_slippers' % sex] = ('feet', b, 'Gilded slippers', _xslip)

    def _xturban(sex=sex):
        return turban('xan_%s_rich_turban' % sex, P('kesar', 0.06, [B('bottom', 0.0, 0.5, 'stripes', 'saffron', 'kesar', 0.02)]),
                      P('violet' if sex == 'm' else 'mongolblue', 0.04), P('silver', 0.02), size=1.0 if sex == 'm' else 0.85)
    GARMENTS['xan_%s_rich_turban' % sex] = ('head', b, 'Great turban', _xturban)


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
    TIERS = ('noble', 'trade', 'novice', 'monk', 'elder', 'agent', 'town', 'rich')
    tier = lambda g: g.split('_')[0] + '_' + next((t for t in TIERS if '_' + t + '_' in g or g.endswith('_' + t)), 'peasant')
    for t in sorted({tier(g) for g in made}):
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
