"""Clips made for the trades (ACTIVITIES-PLAN.md, stage 5), for work no library has a clip for: data/clips.json
derive {'trade': <kind>, 'from': <the base clip>}, read by make_pieces.derived_clips. Each kind is posed frame by frame
on its base clip's first frame (a standing idle, a chair or a stool), or on every frame of a walk, with make_pieces'
rig: the spine and head turned, the hands placed by the two-bone arm solve and turned by their grip frames, the legs
solved too where the figure kneels. Distances are a man's, in metres, in the figure's frame (+y up, +z forward; the
right side is _side(c) * x); the hips' height scales the work so it lands on every body. The props these work with (a
ladle, a broom, a saw, a quill, oars, a net) are still to make: the hands that would hold them close into fists (the
clip's 'fist'), and 'hold' names the prop where one exists."""
import math

import numpy as np

import make_pieces as mp


class _Pose:
    """a base clip's first frame (or frame f) and what every kind measures on it"""

    def __init__(self, c, clip, f=0):
        self.c, self.J, self.clip = c, c.J, clip
        self.rig = mp._Rig(c, clip, f)
        self.sd = mp._side(c)
        self.grips = mp._grips(c)
        _, P = self.rig.fk(list(self.rig.loc0))
        self.P0 = P
        self.hy = float(self.rig.hips[1])
        self.shR, self.shL = P[self.J['RightArm']], P[self.J['LeftArm']]
        self.chest = P[self.J['Spine2']]                       # seated work is placed from here, not from the feet

    def poleR(self, x=0.7, y=-1.0, z=-0.3):
        return np.array([self.sd * x, y, z])

    def poleL(self, x=0.7, y=-1.0, z=-0.3):
        return np.array([-self.sd * x, y, z])

    def reach(self, loc, S, T, pole):
        J = self.J
        self.rig.reach(loc, J[S + 'Arm'], J[S + 'ForeArm'], J[S + 'Hand'], np.asarray(T, float), pole)

    def grip(self, loc, S, T, Y, Z, pole):
        mp._grip_to(self.rig, loc, S, self.grips[S], np.asarray(T, float), np.asarray(Y, float), np.asarray(Z, float), pole)

    def flat(self, loc, S, T, pole):
        """hand S flat on a surface at T, the fingers forward and a little in, the palm down"""
        s = self.sd if S == 'Right' else -self.sd
        Z = np.array([-s * 0.3, -0.15, 1.0])
        X = np.array([0.0, -1.0, 0.0])
        self.grip(loc, S, T, np.cross(Z, X), Z, pole)

    def turn(self, loc, j, R):
        self.rig.turn(loc, self.J[j], R)


def _loop(cycle):
    return np.arange(0, cycle + 1e-6, 1.0 / mp.FPS)


def _done(p, times, out, hips=None):
    h = np.repeat(p.clip[2][:1], len(times), 0) if hips is None else np.array(hips)
    return times, {nm: np.array(v) for nm, v in out.items()}, h


def _k(keys, t):
    return mp._ease([(a, np.atleast_1d(np.asarray(v, float)), e) for a, v, e in keys], t)


def cook(c, clip, cycle=2.4):
    """stirring a pot on the hearth: bent over a pot at the waist, the right hand turning a ladle round it twice a
    cycle (the ladle's bowl down), the left hand on the pot's rim"""
    p = _Pose(c, clip)
    sd, hy = p.sd, p.hy
    pot = np.array([p.shR[0] * 0.25, hy - 0.06, 0.40])
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        a = 2 * math.pi * 2 * t / cycle
        p.turn(loc, 'Spine', mp._Rx(0.12) @ mp._Ry(0.04 * math.sin(a)))
        p.turn(loc, 'Spine1', mp._Rx(0.08))
        p.turn(loc, 'Head', mp._Rx(0.38))
        tip = pot + np.array([0.07 * math.cos(a), 0.15, 0.07 * math.sin(a)])
        p.grip(loc, 'Right', tip, [0.0, -1.0, 0.12], [-sd * 0.3, 0.0, 1.0], p.poleR())
        p.flat(loc, 'Left', pot + np.array([-sd * 0.17, 0.03, -0.03]), p.poleL())
        p.rig.quats(loc, out)
    return _done(p, times, out)


def walk_sack(c, clip):
    """walking with a sack on the right shoulder: the walk's legs and left arm, the right hand up at the shoulder
    holding the sack's neck behind it, the body leaning a little forward and away from the load"""
    times, rots, hips = clip
    out = {nm: [] for nm in rots}
    for f in range(len(times)):
        p = _Pose(c, clip, f)
        loc = list(p.rig.loc0)
        p.turn(loc, 'Spine', mp._Rx(0.08))
        p.turn(loc, 'Head', mp._Ry(p.sd * 0.15))
        _, P = p.rig.fk(loc)
        sh = P[p.J['RightArm']]
        p.reach(loc, 'Right', sh + np.array([p.sd * 0.06, 0.15, -0.01]), np.array([p.sd * 0.8, -0.3, 1.0]))
        p.rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def _offer(c, clip, both, cycle=2.6, take=False):
    p = _Pose(c, clip)
    sd = p.sd
    _, P = p.rig.fk(list(p.rig.loc0))
    restR, restL = P[p.J['RightHand']], P[p.J['LeftHand']]
    outR = np.array([p.shR[0] * 0.55, p.shR[1] - 0.24, 0.44])
    outL = np.array([p.shL[0] * 0.55, p.shL[1] - 0.24, 0.44])
    chest = np.array([0.0, p.shR[1] - 0.30, 0.22])
    # out: the hand reaches out palm up; take: both hands reach out and draw the thing back to the chest
    w = [(0.0, 0.0, ''), (cycle * 0.28, 1.0, 'io'), (cycle * 0.52, 1.0, ''), (cycle, 0.0, 'io')]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        k = float(_k(w, t)[0])
        back = take and t > cycle * 0.52
        p.turn(loc, 'Head', mp._Rx(0.18 * k))
        p.turn(loc, 'Spine', mp._Rx(0.06 * k))
        for S, rest, far in (('Right', restR, outR), ('Left', restL, outL)):
            if S == 'Left' and not both:
                continue
            s = sd if S == 'Right' else -sd
            dest = chest + np.array([s * 0.10, 0, 0]) if back else far
            T = rest + (dest - rest) * (k if not back else 1.0) if not back else far + (dest - far) * (1 - k)
            pole = p.poleR() if S == 'Right' else p.poleL()
            loc_a = list(loc)
            p.reach(loc_a, S, T, pole)
            loc_b = list(loc_a)
            # palm up: the grip's +Y out to the side, the fingers forward
            p.grip(loc_b, S, T, [s, 0.0, 0.25], [0.0, 0.0, 1.0], pole)
            j = p.J[S + 'Hand']
            qa, qb = np.array(mp.glbio.mat_quat(loc_a[j])), np.array(mp.glbio.mat_quat(loc_b[j]))
            loc[p.J[S + 'Arm']], loc[p.J[S + 'ForeArm']] = loc_b[p.J[S + 'Arm']], loc_b[p.J[S + 'ForeArm']]
            loc[j] = mp._qm(mp._slerp(qa, qb, min(1.0, k * 1.4)))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def give(c, clip):
    """handing something over: the right hand out at the chest, palm up, held, and back (one-shot)"""
    return _offer(c, clip, False)


def take(c, clip):
    """receiving something: both hands out palm up, then drawn back to the chest holding it (one-shot)"""
    return _offer(c, clip, True, take=True)


def write(c, clip, cycle=3.0):
    """writing at a desk, seated: the desk at the elbows' height, the right hand moving a quill along a line in short
    strokes and back to the line's start, the left hand flat on the page, the head down"""
    p = _Pose(c, clip)
    sd = p.sd
    desk = p.chest[1] - 0.22
    page = np.array([p.shR[0] * 0.35, desk + 0.02, p.chest[2] + 0.36])
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        p.turn(loc, 'Spine', mp._Rx(0.16))
        p.turn(loc, 'Spine1', mp._Rx(0.08))
        p.turn(loc, 'Head', mp._Rx(0.42))
        u = (t / cycle) % 1.0
        along = 0.16 * min(u / 0.85, 1.0) - 0.16 * max(0.0, (u - 0.85) / 0.15)      # along the line, then back
        tip = page + np.array([-sd * (along - 0.08), 0.012 * abs(math.sin(2 * math.pi * 9 * u)) + 0.01, 0.0])
        p.grip(loc, 'Right', tip + np.array([0, 0.09, -0.06]), [0.0, -0.8, 0.6], [-sd * 0.2, 0.6, 0.8], p.poleR(0.8, -1.0, -0.1))
        p.flat(loc, 'Left', page + np.array([-sd * 0.20, 0.0, 0.02]), p.poleL(0.8, -1.0, -0.1))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def read(c, clip, cycle=6.0):
    """reading a book held up before the chest, seated: both hands on its covers, the head down at it, a page turned
    once a cycle (the right hand crosses to the left and back)"""
    p = _Pose(c, clip)
    sd = p.sd
    book = np.array([0.0, p.chest[1] - 0.06, p.chest[2] + 0.30])
    turnk = [(0.0, 0.0, ''), (cycle * 0.70, 0.0, ''), (cycle * 0.78, 1.0, 'io'), (cycle * 0.86, 0.0, 'io'), (cycle, 0.0, '')]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        k = float(_k(turnk, t)[0])
        p.turn(loc, 'Spine', mp._Rx(0.10))
        p.turn(loc, 'Head', mp._Rx(0.48) @ mp._Ry(-sd * 0.05 * math.sin(2 * math.pi * t / cycle)))
        R = book + np.array([sd * 0.12 * (1 - 1.6 * k), 0.02 * k, 0.03 * k])
        p.reach(loc, 'Right', R, p.poleR(0.9, -1.0, -0.2))
        p.reach(loc, 'Left', book + np.array([-sd * 0.12, 0.0, 0.0]), p.poleL(0.9, -1.0, -0.2))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def kneel_pray(c, clip, cycle=4.0):
    """kneeling on both knees in prayer: the knees on the ground, the shins back along it, the body upright over the
    knees, the hands together before the chest, the head bowed and lifting a little with each breath"""
    p = _Pose(c, clip)
    J, sd = p.J, p.sd
    P0 = p.P0
    thigh = np.linalg.norm(P0[J['LeftLeg']] - P0[J['LeftUpLeg']])
    shin = np.linalg.norm(P0[J['LeftFoot']] - P0[J['LeftLeg']])
    hips0 = np.array(p.clip[2][0], float)
    knee_y = 0.06
    hy = knee_y + thigh * 0.96
    hips = hips0 + np.array([0.0, hy - hips0[1], -0.04])
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    hs = []
    for t in times:
        b = math.sin(2 * math.pi * t / cycle)
        p.rig.hips = hips + np.array([0.0, 0.004 * b, 0.0])
        loc = list(p.rig.loc0)
        _, P = p.rig.fk(loc)
        for S in ('Left', 'Right'):
            hip = P[J[S + 'UpLeg']]
            foot = np.array([hip[0], 0.10, hip[2] + 0.06 - shin * 0.95])
            p.rig.reach(loc, J[S + 'UpLeg'], J[S + 'Leg'], J[S + 'Foot'], foot, np.array([0.0, -0.4, 1.0]))
        p.turn(loc, 'Spine', mp._Rx(0.04))
        p.turn(loc, 'Head', mp._Rx(0.42 - 0.05 * b))
        _, P = p.rig.fk(loc)
        chest = np.array([0.0, P[J['RightArm']][1] - 0.26, P[J['Spine2']][2] + 0.22])
        p.reach(loc, 'Right', chest + np.array([sd * 0.015, 0, 0]), p.poleR(1.0, -1.0, -0.2))
        p.reach(loc, 'Left', chest + np.array([-sd * 0.015, 0, 0]), p.poleL(1.0, -1.0, -0.2))
        p.rig.quats(loc, out)
        hs.append(p.rig.hips.copy())
    return _done(p, times, out, hs)


def row(c, clip, cycle=2.2):
    """rowing a pair of oars, seated on a thwart: the catch with the hands out over the knees and the body forward, the
    pull back to the chest with the body leaning back, the hands low over the knees on the way forward again"""
    p = _Pose(c, clip)
    sd = p.sd
    lap, z0 = p.chest[1] - 0.30, p.chest[2]
    keys = [(0.0, [z0 + 0.56, lap + 0.04, 0.35], ''), (cycle * 0.45, [z0 + 0.16, lap + 0.20, -0.18], 'io'),
            (cycle * 0.55, [z0 + 0.16, lap + 0.10, -0.18], ''), (cycle, [z0 + 0.56, lap + 0.04, 0.35], 'io')]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        z, y, lean = _k(keys, t)
        p.turn(loc, 'Spine', mp._Rx(lean * 0.6))
        p.turn(loc, 'Spine1', mp._Rx(lean * 0.4))
        p.turn(loc, 'Head', mp._Rx(-lean * 0.5))
        for S in ('Right', 'Left'):
            s = sd if S == 'Right' else -sd
            # each oar runs out over its side and down to the water, the fingers over the handle
            p.grip(loc, S, [s * 0.22, y, z], [s * 1.0, -0.35, 0.12], [0.0, -0.6, 1.0],
                   p.poleR(1.0, -0.6, -0.4) if S == 'Right' else p.poleL(1.0, -0.6, -0.4))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def paddle(c, clip, cycle=1.8):
    """paddling a canoe on the right side, seated: the lower (right) hand low on the shaft drawn back along the boat's
    side outside the gunwale, the upper (left) hand held well ahead of the chest pushing the T-grip forward, the body
    angled slightly toward the stroke side so the shaft clears the chest on every build"""
    p = _Pose(c, clip)
    sd = p.sd
    J = c.J
    armL = float(np.linalg.norm(c.jpos[J['LeftForeArm']] - c.jpos[J['LeftArm']])
                 + np.linalg.norm(c.jpos[J['LeftHand']] - c.jpos[J['LeftForeArm']]))
    k = armL / 0.537
    T = lambda f: f * cycle
    # [rz, ry, rx, lz, ly, lx, rot, lean]:
    # catch (0.0) -> deep power pull (0.28) -> stroke finish beside right hip (0.54) -> feathered lift & return (0.78)
    keys = [
        (0.0,     [0.52,  0.06, 0.36, 0.35, -0.01, 0.04, 0.10, 0.14], ''),
        (T(0.28), [0.30, -0.03, 0.40, 0.39, -0.05, 0.12, 0.18, 0.16], 'io'),
        (T(0.54), [0.08,  0.00, 0.42, 0.38, -0.08, 0.15, 0.25, 0.10], 'io'),
        (T(0.78), [0.32,  0.11, 0.39, 0.36,  0.03, 0.08, 0.16, 0.09], 'io'),
        (cycle,   [0.52,  0.06, 0.36, 0.35, -0.01, 0.04, 0.10, 0.14], 'io'),
    ]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        rz, ry, rx, lz, ly, lx, rot, lean = _k(keys, t)
        p.turn(loc, 'Spine', mp._Ry(sd * rot * 0.65) @ mp._Rx(lean * 0.6))
        p.turn(loc, 'Spine1', mp._Ry(sd * rot * 0.35) @ mp._Rx(lean * 0.4))
        p.turn(loc, 'Head', mp._Ry(-sd * rot * 0.7))
        _, P = p.rig.fk(loc)
        sp2, shL = P[J['Spine2']], P[J['LeftArm']]
        y_water = sp2[1] - 0.34 * k
        R = np.array([sd * rx * k, y_water + ry * k, sp2[2] + rz * k])
        L = np.array([sd * lx * k, shL[1] + ly * k, sp2[2] + lz * k])
        p.grip(loc, 'Right', R, L - R, [-sd * 1.0, 0.0, 0.3], p.poleR(1.0, -0.8, -0.3))   # the shaft up to the top hand
        p.reach(loc, 'Left', L, p.poleL(0.6, -1.0, 0.2))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def sweep(c, clip, cycle=1.6):
    """sweeping with a broom: both hands on the handle (the right low, the left high), the broom's head on the floor
    ahead swept side to side, the body turning with it and leaning over"""
    p = _Pose(c, clip)
    sd, hy = p.sd, p.hy
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        s = math.sin(2 * math.pi * t / cycle)
        p.turn(loc, 'Spine', mp._Rx(0.16) @ mp._Ry(-sd * 0.16 * s))
        p.turn(loc, 'Head', mp._Rx(0.35))
        R = np.array([sd * 0.18 - sd * 0.20 * s, hy - 0.02, 0.30])
        L = np.array([-sd * 0.02 - sd * 0.08 * s, p.shL[1] - 0.20, 0.18])
        p.grip(loc, 'Right', R, L - R, [0.0, -0.3, 1.0], p.poleR())          # the broom's handle up to the left hand
        p.reach(loc, 'Left', L, p.poleL())
        p.rig.quats(loc, out)
    return _done(p, times, out)


def saw(c, clip, cycle=1.0):
    """sawing a board on a trestle: the right hand driving the saw forward and back at the hips' height, the left hand
    holding the board down beside the cut, the body rocking with each stroke"""
    p = _Pose(c, clip)
    sd, hy = p.sd, p.hy
    board = hy - 0.14
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        s = math.sin(2 * math.pi * t / cycle)
        p.turn(loc, 'Spine', mp._Rx(0.26 + 0.05 * s))
        p.turn(loc, 'Spine1', mp._Rx(0.10))
        p.turn(loc, 'Head', mp._Rx(0.40))
        R = [sd * 0.12, board + 0.16 - 0.03 * s, 0.32 + 0.15 * s]
        p.grip(loc, 'Right', R, [0.0, -0.45, 1.0], [-sd * 0.2, -1.0, -0.4], p.poleR(0.9, -1.0, -0.4))
        p.flat(loc, 'Left', [-sd * 0.14, board + 0.02, 0.44], p.poleL())
        p.rig.quats(loc, out)
    return _done(p, times, out)


def weave(c, clip, cycle=3.2):
    """weaving at a loom, seated: the right hand throws the shuttle across to the left, both hands pull the beater to
    the cloth, the left hand throws it back, and the beater again"""
    p = _Pose(c, clip)
    sd = p.sd
    y = p.chest[1] - 0.10
    z0 = p.chest[2]
    far, bar, beat = z0 + 0.42, z0 + 0.42, z0 + 0.32
    T = lambda f: f * cycle
    keys = [(0.0, [0.30, 0.10, far, far], ''), (T(0.22), [-0.02, -0.30, far, far], 'io'), (T(0.30), [0.12, -0.12, bar, bar], 'io'),
            (T(0.38), [0.12, -0.12, beat, beat], 'io'), (T(0.46), [0.12, -0.12, bar, bar], 'io'),
            (T(0.72), [0.30, 0.10, far, far], 'io'), (T(0.80), [0.12, -0.12, bar, bar], 'io'), (T(0.88), [0.12, -0.12, beat, beat], 'io'),
            (cycle, [0.30, 0.10, far, far], 'io')]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        xr, xl, zr, zl = _k(keys, t)
        p.turn(loc, 'Spine', mp._Rx(0.10 + 0.4 * (far - zr)))
        p.turn(loc, 'Head', mp._Rx(0.30))
        p.reach(loc, 'Right', [sd * xr, y, zr], p.poleR(0.9, -1.0, -0.3))
        p.reach(loc, 'Left', [sd * xl, y, zl], p.poleL(0.9, -1.0, -0.3))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def cast_net(c, clip, cycle=3.4):
    """casting a net (one-shot): the net gathered at the right hip, the body wound back to the right, swung through
    with both arms flung out forward and up as the net whips upward and billows open, then hauled back hand over hand"""
    p = _Pose(c, clip)
    sd, hy = p.sd, p.hy
    T = lambda f: f * cycle
    keys = [
        (0.0,     [ 0.24,  0.06,  0.12,  0.10, 0.10, 0.20,  0.00], ''),
        (T(0.30), [ 0.34, -0.02, -0.08,  0.18, 0.08, 0.04,  0.60], 'io'),
        (T(0.39), [ 0.16,  0.34,  0.44, -0.14, 0.28, 0.34, -0.08], 'in'),
        (T(0.47), [ 0.04,  0.62,  0.70, -0.32, 0.38, 0.42, -0.36], 'out'),
        (T(0.58), [ 0.06,  0.50,  0.64, -0.26, 0.32, 0.38, -0.24], 'io'),
        (T(0.80), [ 0.12,  0.18,  0.28, -0.05, 0.22, 0.34,  0.00], 'io'),
        (cycle,   [ 0.24,  0.06,  0.12,  0.10, 0.10, 0.20,  0.00], 'io'),
    ]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        rx, ry, rz, lx, ly, lz, rot = _k(keys, t)
        p.turn(loc, 'Spine', mp._Ry(sd * rot * 0.6) @ mp._Rx(0.08))
        p.turn(loc, 'Spine1', mp._Ry(sd * rot * 0.4))
        p.turn(loc, 'Head', mp._Ry(-sd * rot * 0.3))
        p.reach(loc, 'Right', [sd * rx, hy + ry, rz], p.poleR())
        p.reach(loc, 'Left', [sd * lx, hy + ly, lz], p.poleL())
        p.rig.quats(loc, out)
    return _done(p, times, out)


def feed(c, clip, cycle=1.8):
    """scattering feed: the left hand holding the feed bag at the hip, the right hand dipping into it and flinging the
    feed out forward and to the right"""
    p = _Pose(c, clip)
    sd, hy = p.sd, p.hy
    bag = np.array([-sd * 0.16, hy - 0.04, 0.20])
    keys = [(0.0, bag + [sd * 0.06, 0.07, 0.0], ''), (cycle * 0.30, bag + [sd * 0.06, 0.05, 0.0], 'io'),
            (cycle * 0.50, [sd * 0.40, hy + 0.28, 0.42], 'out'), (cycle * 0.62, [sd * 0.42, hy + 0.24, 0.40], ''),
            (cycle, bag + [sd * 0.06, 0.07, 0.0], 'io')]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        R = _k(keys, t)
        k = max(0.0, (R[0] * sd - 0.0) / 0.42)
        p.turn(loc, 'Spine', mp._Rx(0.08) @ mp._Ry(-sd * 0.12 * k))
        p.turn(loc, 'Head', mp._Rx(0.25))
        p.reach(loc, 'Left', bag, p.poleL())
        p.reach(loc, 'Right', R, p.poleR())
        p.rig.quats(loc, out)
    return _done(p, times, out)


def walk_lead(c, clip):
    """leading a beast on a halter: the walk's legs and left arm, the right hand back by the hip holding the rope, the
    head turned now and then to look back at the animal"""
    times, rots, hips = clip
    out = {nm: [] for nm in rots}
    dur = float(times[-1]) or 1.0
    for f in range(len(times)):
        p = _Pose(c, clip, f)
        loc = list(p.rig.loc0)
        look = max(0.0, math.sin(2 * math.pi * times[f] / dur)) ** 2
        p.turn(loc, 'Head', mp._Ry(p.sd * 0.5 * look))
        _, P = p.rig.fk(loc)
        sh = P[p.J['RightArm']]
        p.reach(loc, 'Right', sh + np.array([p.sd * 0.10, -0.52, -0.22]), np.array([p.sd * 0.6, -0.2, 1.0]))
        p.rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def milk(c, clip, cycle=1.0):
    """milking, seated on a stool beside the beast: bent forward, the head turned to its flank, the hands under it at
    the knees' height pulling down in turn"""
    p = _Pose(c, clip)
    sd = p.sd
    y, z0 = p.chest[1] - 0.45, p.chest[2]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        a = 2 * math.pi * t / cycle
        p.turn(loc, 'Spine', mp._Rx(0.34))
        p.turn(loc, 'Spine1', mp._Rx(0.14))
        p.turn(loc, 'Head', mp._Rx(0.20) @ mp._Ry(-sd * 0.35))
        p.reach(loc, 'Right', [sd * 0.07, y - 0.05 * max(0.0, math.sin(a)), z0 + 0.46], p.poleR(0.9, -1.0, 0.0))
        p.reach(loc, 'Left', [-sd * 0.07, y - 0.05 * max(0.0, -math.sin(a)), z0 + 0.46], p.poleL(0.9, -1.0, 0.0))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def fish_rod(c, clip, cycle=4.0):
    """fishing with a rod from the bank: the rod held out forward and up in the right hand, bobbing a little, flicked
    up once a cycle to tease the line, the left hand at the hip, the eyes on the water"""
    p = _Pose(c, clip)
    sd, hy = p.sd, p.hy
    flick = [(0.0, 0.0, ''), (cycle * 0.68, 0.0, ''), (cycle * 0.74, 1.0, 'out'), (cycle * 0.86, 0.0, 'io'), (cycle, 0.0, '')]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        f = float(_k(flick, t)[0])
        a = 0.50 + 0.04 * math.sin(2 * math.pi * 2 * t / cycle) + 0.35 * f          # the rod's rise above level
        p.turn(loc, 'Head', mp._Rx(0.18 - 0.08 * f))
        R = np.array([sd * 0.16, hy + 0.12 + 0.05 * f, 0.30])
        p.grip(loc, 'Right', R, [0.0, math.sin(a), math.cos(a)], [-sd * 1.0, 0.0, 0.0], p.poleR(0.9, -1.0, -0.2))
        p.rig.quats(loc, out)
    return _done(p, times, out)


def beat_rug(c, clip, cycle=1.2):
    """beating a rug hung on a line: the beater swung back over the right shoulder and brought down onto the rug at the
    shoulders' height in front, the body turning into each blow"""
    p = _Pose(c, clip)
    sd = p.sd
    sh = p.shR
    keys = [(0.0, [0.26, 0.22, -0.06, -1.6], ''), (cycle * 0.40, [0.18, -0.02, 0.44, 0.1], 'in'), (cycle * 0.50, [0.18, -0.06, 0.42, 0.25], 'out'),
            (cycle, [0.26, 0.22, -0.06, -1.6], 'io')]
    times, out = _loop(cycle), {nm: [] for nm in p.rig.names}
    for t in times:
        loc = list(p.rig.loc0)
        x, y, z, a = _k(keys, t)
        k = (z + 0.06) / 0.50
        p.turn(loc, 'Spine', mp._Ry(-sd * 0.20 * k) @ mp._Rx(0.06 * k))
        p.turn(loc, 'Head', mp._Rx(0.10))
        R = np.array([sd * x, sh[1] + y, z])
        p.grip(loc, 'Right', R, [0.0, -math.sin(a), math.cos(a)], [0.0, -math.cos(a), -math.sin(a)], p.poleR(1.0, -0.5, -0.4))
        p.rig.quats(loc, out)
    return _done(p, times, out)


KINDS = {'cook': cook, 'walk_sack': walk_sack, 'give': give, 'take': take, 'write': write, 'read': read,
         'kneel_pray': kneel_pray, 'row': row, 'paddle': paddle, 'sweep': sweep, 'saw': saw, 'weave': weave,
         'cast_net': cast_net, 'feed': feed, 'walk_lead': walk_lead, 'milk': milk, 'fish_rod': fish_rod, 'beat_rug': beat_rug}


def make(c, kind, clip):
    return KINDS[kind](c, clip)
