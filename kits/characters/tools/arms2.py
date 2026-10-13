"""Where a second pair of arms hangs (tools/mods.py makes them; tools/make_garments.py fits four-armed clothes to them).
numpy only, so Blender's Python can import it too.

The lower pair is the upper pair's joints copied DROP lower, INSET nearer the body's axis and FWD forward, from Spine2,
and from the shoulder joint down turned HANG degrees steeper (toward the body), near the pose it is mostly in. All in
glTF space (y up, the figure facing +z); to_gl / from_gl convert Blender's (z up, facing -y)."""
import math

import numpy as np

DROP = 0.25            # metres below the upper pair, on the man's base (1.78 m)
INSET = 0.045          # toward the body's axis
FWD = 0.015            # forward: the lower pair comes out of the side of the ribs, a little ahead of the lats
HANG = 30              # degrees steeper than the upper pair, at rest


def offset(sx):
    """the lower pair's shift on side sx (+1 left, -1 right), glTF"""
    return np.array([-sx * INSET, -DROP, FWD])


def turn(sx):
    """the rotation (3 x 3, glTF) that hangs the lower arm HANG steeper, about the forward axis"""
    a = -sx * math.radians(HANG)
    return np.array([[math.cos(a), -math.sin(a), 0], [math.sin(a), math.cos(a), 0], [0, 0, 1.0]])


def place(p, shoulder, sx, share=1.0):
    """point(s) p on the upper arm (glTF) where the lower copy has them: shifted, then turned about the lower
    shoulder joint (shoulder: the upper arm's joint, glTF) by share of HANG (1 for the arm, 0 for its root)"""
    p = np.atleast_2d(np.asarray(p, float)) + offset(sx)
    pv = np.asarray(shoulder, float) + offset(sx)
    R = turn(sx)
    s = np.broadcast_to(np.atleast_1d(share), (len(p),))[:, None]
    return p + s * ((p - pv) @ R.T + pv - p)


def to_gl(p):
    p = np.atleast_2d(np.asarray(p, float))
    return np.stack([p[:, 0], p[:, 2], -p[:, 1]], 1)


def from_gl(g):
    g = np.atleast_2d(np.asarray(g, float))
    return np.stack([g[:, 0], -g[:, 2], g[:, 1]], 1)


def lower(n):
    """a joint's copy on the lower pair: LeftArm -> Left2Arm"""
    return n.replace('Left', 'Left2', 1) if n.startswith('Left') else n.replace('Right', 'Right2', 1)


def upper(n):
    """Left2Arm -> LeftArm"""
    return n.replace('Left2', 'Left', 1) if n.startswith('Left2') else n.replace('Right2', 'Right', 1)
