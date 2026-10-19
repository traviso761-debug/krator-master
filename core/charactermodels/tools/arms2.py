"""Where a second pair of arms hangs (tools/mods.py makes them; tools/make_garments.py fits four-armed clothes to them).
numpy only, so Blender's Python can import it too.

The lower pair is the upper pair's joints copied drop() lower (DROP on the man, RIB on any body), INSET nearer the body's axis and fwd() forward, from Spine2,
and from the shoulder joint down turned HANG degrees steeper (toward the body), near the pose it is mostly in. All in
glTF space (y up, the figure facing +z); to_gl / from_gl convert Blender's (z up, facing -y)."""
import math

import numpy as np

DROP = 0.25            # metres below the upper pair, on the man's base (1.78 m)
RIB = 0.81             # on every body the lower shoulder sits this far from Spine up to Spine1 (the man's 0.25 m drop):
                       # it comes out of the lower ribs whatever the torso's length (the woman's is about 0.20 m)
INSET = 0.045          # toward the body's axis
FWD = 0.015            # forward: the lower pair comes out of the side of the ribs, a little ahead of the lats (the woman)
FWD_MAN = -0.015       # the man's, 3 cm further back: on his deeper chest at FWD the pair stood out in front
HANG = 30              # degrees steeper than the upper pair, at rest


def drop(y_arm, y_spine, y_spine1):
    """how far below its upper arm joint a body's lower one hangs (RIB); the man's is DROP exactly"""
    d = y_arm - (y_spine + RIB * (y_spine1 - y_spine))
    return DROP if abs(d - DROP) < 0.003 else d


def drop_of(bind, jidx):
    """drop() from a skin's bind matrices (glTF, y up) and joint index"""
    y = lambda n: bind[jidx[n]][1, 3]
    return drop(y('LeftArm'), y('Spine'), y('Spine1'))


def fwd(d):
    """how far forward a body's lower pair sits, from its drop (the man's is DROP exactly, drop())"""
    return FWD_MAN if d == DROP else FWD


def offset(sx, d=DROP, f=None):
    """the lower pair's shift on side sx (+1 left, -1 right), glTF, d below and f forward (fwd(d) by default)"""
    return np.array([-sx * INSET, -d, fwd(d) if f is None else f])


def turn(sx):
    """the rotation (3 x 3, glTF) that hangs the lower arm HANG steeper, about the forward axis"""
    a = -sx * math.radians(HANG)
    return np.array([[math.cos(a), -math.sin(a), 0], [math.sin(a), math.cos(a), 0], [0, 0, 1.0]])


def place(p, shoulder, sx, share=1.0, f=None):
    """point(s) p on the upper arm (glTF) where the lower copy has them: shifted, then turned about the lower
    shoulder joint (shoulder: the upper arm's joint, glTF) by share of HANG (1 for the arm, 0 for its root); f: how
    far forward (offset())"""
    p = np.atleast_2d(np.asarray(p, float)) + offset(sx, f=f)
    pv = np.asarray(shoulder, float) + offset(sx, f=f)
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
