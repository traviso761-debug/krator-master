"""Where a tail hangs (tools/mods.py makes the piece; the figure drives it: 50-figure.js tail, kchar_figure.gd _tail).
numpy only, so Blender's Python can import it too.

Every body's skeleton carries a tail's joints (Tail1 ... Tail<N>, a chain under Hips), whether a mod uses them or not,
as it carries the lower arms': nothing is drawn on them until a tail is worn, and no clip moves them (each frame the
figure runs them as a spring chain). They come after the skeleton's other joints (skeleton.json), so no joint's index
moves. The root sits under the skin of the lower back, over the sacrum (ROOT_UP above the hip joint, ROOT_IN inside the
back's skin); from it the chain runs back and down in the body's middle plane, each segment SHRINK of the one before,
at the angles ANGLES below the level (degrees), LENGTH times the hip joint's height in all.

All in glTF space (y up, the figure facing +z), metres, at bind."""
import math

import numpy as np

N = 8                  # joints: Tail1 (on the sacrum) ... Tail8; the last segment runs from Tail8 to the tip
LENGTH = 1.05          # the whole tail, times the hip joint's height (about a metre on the man)
SHRINK = 0.9           # each segment this much of the one before
ANGLES = (34, 38, 40, 36, 28, 20, 12, 6)    # each segment's fall below the level, root to tip: down, then trailing level
ROOT_UP = 0.045        # the root above the hip joint (the sacrum)
ROOT_IN = 0.035        # and this far inside the back's skin, so the tail's root lies in the body
R0, R1 = 0.08, 0.008   # the tail's radius at the root and the tip, on the man (scaled by the hips' height)
TALL = 1.12            # its section is this much taller than wide
HIPS_REF = 1.004       # the man's hip joint height (a body's sizes scale by its own over this)


def names():
    return ['Tail%d' % (k + 1) for k in range(N)]


def lengths(hips_y):
    l0 = LENGTH * hips_y * (1 - SHRINK) / (1 - SHRINK ** N)
    return [l0 * SHRINK ** k for k in range(N)]


def direction(k):
    """segment k's direction at rest: back (-z) and down"""
    a = math.radians(ANGLES[k])
    return np.array([0.0, -math.sin(a), -math.cos(a)])


def root_at(P, T, hips):
    """the root (glTF): a ray from in front of the hips straight back through the body at ROOT_UP above the hip joint,
    its farthest hit on the skin (P, T: the base's skin) moved ROOT_IN back inside"""
    o = np.array([0.0, hips[1] + ROOT_UP, hips[2] + 0.3])
    d = np.array([0.0, 0.0, -1.0])
    a, b, c = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
    e1, e2 = b - a, c - a
    h = np.cross(d, e2)
    det = (e1 * h).sum(1)
    ok = np.abs(det) > 1e-12
    inv = np.where(ok, 1.0 / np.where(ok, det, 1), 0)
    s = o - a
    u = (s * h).sum(1) * inv
    q = np.cross(s, e1)
    v = (q * d).sum(1) * inv
    t = (e2 * q).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    back = o + t[hit].max() * d
    return back + np.array([0.0, 0.0, ROOT_IN])


def chain(root, hips_y):
    """the joints' rest positions (N x 3) and the tip, glTF"""
    pts = [np.asarray(root, float)]
    for k, l in enumerate(lengths(hips_y)):
        pts.append(pts[-1] + direction(k) * l)
    return np.array(pts[:-1]), pts[-1]


def radius(u, hips_y):
    """the tail's radius at u (0 the root, 1 the tip), scaled by the body: thick at the root, narrowing fast at first
    then slowly to a point"""
    k = hips_y / HIPS_REF
    return k * (R1 + (R0 - R1) * (1 - u) ** 1.35)


def skeleton_joints(start, hips_index, root, hips_y, hips_world):
    """the joints as skeleton.json rows ({name, parent, t, r}: t local, r identity, so each joint's frame is the
    hips'), appended at index start, given the Hips joint's index and its world matrix at bind (4 x 4)"""
    P, _ = chain(root, hips_y)
    Rh = hips_world[:3, :3] / np.linalg.norm(hips_world[:3, :3], axis=0)
    rows = []
    for k, p in enumerate(P):
        t = Rh.T @ (p - (hips_world[:3, 3] if k == 0 else P[k - 1]))
        rows.append({'name': 'Tail%d' % (k + 1), 'parent': hips_index if k == 0 else start + k - 1,
                     't': [round(float(x), 6) for x in t], 'r': [0.0, 0.0, 0.0, 1.0]})
    return rows


def joint_deltas(P, root, d_root, s):
    """per target, how far each tail joint's rest moves: with the skin at the root (d_root, targets x 3) and scaled
    about it by s (targets: the hip joint's height change over its height), so the tail grows with the legs"""
    P = np.asarray(P, float)
    return d_root[:, None, :] + s[:, None, None] * (P - root)[None, :, :]
