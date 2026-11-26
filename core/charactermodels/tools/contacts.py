#!/usr/bin/env python3
"""The moments of touch in the strike and throw clips (data/clips.json `contact`; ACTIVITIES-PLAN.md section 5).

  python3 tools/contacts.py <anims.glb> [--write]     # report each clip's contacts; --write puts them in data/clips.json

A clip in a contact group (unarmed; the hits are reactions, not strikes; the guards, steps and blocks have none) gets `contact: [[t, end, target],
...]`: t in clip seconds, end the striking joint (LeftHand, RightHand, LeftFoot, RightFoot, or an elbow or knee:
LeftForeArm, RightForeArm, LeftLeg, RightLeg), target the joint of the other party it meets (Head, Spine2, Hips or a
leg, by the end's height at that moment). Found by forward kinematics over the clip (the canonical skeleton's rest,
the clip's rotations and hips track): the striking ends' (STRIKES) reach ahead of the chest, its peaks past REACH that
shoot out PROM from where the end was and come back. A clip whose entry
already has a `contact` keeps it (a hand-set one wins); --write only fills the missing ones. The figure calls
onContact (50-figure.js) and emits `contact` (kchar_figure.gd) as the clip passes each."""
import json, os, struct, sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUPS = {'unarmed'}
SKIP = {'unarmed_guard', 'fight_step_l', 'fight_step_r', 'taunt_chest', 'guard_block_1', 'guard_block_2', 'guard_block_3'}
ENDS = ('LeftHand', 'RightHand', 'LeftFoot', 'RightFoot', 'LeftForeArm', 'RightForeArm', 'LeftLeg', 'RightLeg')
HANDS, FEET = ('LeftHand', 'RightHand'), ('LeftFoot', 'RightFoot')
# which ends strike in a clip (the hands unless named): an elbow is its ForeArm joint, a knee its Leg joint
STRIKES = {'kick_front': FEET, 'kick_roundhouse': FEET, 'leg_sweep': FEET, 'elbow_strike': ('LeftForeArm', 'RightForeArm'),
           'knee_strike': ('LeftLeg', 'RightLeg'), 'dodge_counter': HANDS + FEET, 'counterstrike': HANDS + FEET}
# a single strike keeps one contact: the named end's furthest reach (None: whichever end reaches furthest); the rest
# of the clip is the guard and the recovery. A throw keeps its first (the grip): what follows is the throw itself
SINGLE = {'jab_l': 'LeftHand', 'jab_r': 'RightHand', 'hook_l': 'LeftHand', 'hook_l_short': 'LeftHand', 'uppercut_r': 'RightHand',
          'uppercut_l': 'LeftHand', 'hook_r_upper': 'RightHand', 'ual_jab': 'LeftHand', 'ual_cross': 'RightHand',
          'kick_front': None, 'kick_roundhouse': None, 'knee_strike': None, 'leg_sweep': None}
REACH = 0.25          # metres ahead of the chest (forward, level) an end must pass to count as a strike
PROM = 0.18           # and how far it must shoot out from where it was, and come back, within WIN seconds either side
WIN = 0.5
GAP = 0.25            # seconds between two contacts of one end
FPS = 60


def glb(path):
    b = open(path, 'rb').read()
    n = struct.unpack('<I', b[12:16])[0]
    G = json.loads(b[20:20 + n])
    m = struct.unpack('<I', b[20 + n:24 + n])[0]
    return G, b[28 + n:28 + n + m]


def accessor(G, B, i):
    a = G['accessors'][i]
    v = G['bufferViews'][a['bufferView']]
    k = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']]
    o = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    return np.frombuffer(B, '<f4', a['count'] * k, o).reshape(a['count'], k) if k > 1 else \
        np.frombuffer(B, '<f4', a['count'], o)


def qmul(a, b):
    x1, y1, z1, w1 = np.moveaxis(a, -1, 0)
    x2, y2, z2, w2 = np.moveaxis(b, -1, 0)
    return np.stack([w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2, w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
                     w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2, w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2], -1)


def qrot(q, v):
    u, w = q[..., :3], q[..., 3:]
    t = 2 * np.cross(u, v)
    return v + w * t + np.cross(u, t)


def slerp_track(times, vals, t):
    """linear sampling of a rotation track (unit quaternions, shortest arc) at times t"""
    i = np.clip(np.searchsorted(times, t) - 1, 0, len(times) - 2) if len(times) > 1 else np.zeros(len(t), int)
    if len(times) < 2:
        return np.repeat(vals[:1], len(t), 0)
    f = np.clip((t - times[i]) / np.maximum(times[i + 1] - times[i], 1e-9), 0, 1)[:, None]
    a, b = vals[i], vals[i + 1].copy()
    b[(a * b).sum(-1) < 0] *= -1
    q = a * (1 - f) + b * f
    return q / np.linalg.norm(q, axis=-1, keepdims=True)


def lerp_track(times, vals, t):
    return np.stack([np.interp(t, times, vals[:, k]) for k in range(vals.shape[1])], -1)


def ends_over(G, B, anim):
    """each end's world position (metres, the figure's frame: +Y up) at FPS over the clip, and the chest's"""
    nodes = G['nodes']
    name = [n.get('name') for n in nodes]
    parent = {c: i for i, n in enumerate(nodes) for c in n.get('children', [])}
    tracks = {}
    for ch in anim['channels']:
        s = anim['samplers'][ch['sampler']]
        tracks[(ch['target']['node'], ch['target']['path'])] = (accessor(G, B, s['input']), accessor(G, B, s['output']))
    dur = max(v[0][-1] for v in tracks.values())
    t = np.arange(0, dur + 1e-6, 1 / FPS)
    world = {}

    def at(i):
        if i in world:
            return world[i]
        n = nodes[i]
        r = tracks.get((i, 'rotation'))
        q = slerp_track(*r, t) if r else np.repeat([n.get('rotation', [0, 0, 0, 1])], len(t), 0)
        p = tracks.get((i, 'translation'))
        x = lerp_track(*p, t) if p else np.repeat([n.get('translation', [0, 0, 0])], len(t), 0)
        if i in parent:
            pq, px = at(parent[i])
            q, x = qmul(pq, q), px + qrot(pq, x)
        world[i] = (q, x)
        return world[i]
    return t, {e: at(name.index(e))[1] for e in ENDS + ('Spine2', 'Hips', 'LeftUpLeg', 'RightUpLeg')}, \
        {e: at(name.index(e))[0] for e in ('Hips',)}


def find(G, B, anim, ends=HANDS, key=''):
    t, P, Q = ends_over(G, B, anim)
    # the body's forward, level: the hips' +Z (the figure faces +Z) at each frame, flattened
    fwd = qrot(Q['Hips'], np.array([0.0, 0.0, 1.0]))
    fwd[:, 1] = 0
    fwd /= np.maximum(np.linalg.norm(fwd, axis=1, keepdims=True), 1e-9)
    base = fwd[0]
    chest, hips = P['Spine2'], P['Hips']
    out = []
    w = int(WIN * FPS)
    for e in ends:
        d = P[e] - chest
        reach = (d * base).sum(1)                       # ahead of the chest, along where the body faced at the start
        if e in ('LeftForeArm', 'RightForeArm', 'LeftLeg', 'RightLeg'):
            reach = reach + 0.25                        # an elbow or knee strikes closer in
        last = -9
        for k in range(1, len(t) - 1):
            prom = reach[k] - max(reach[max(0, k - w):k + 1].min(), reach[k:k + w + 1].min())
            if reach[k] > REACH and prom > PROM and reach[k] >= reach[k - 1] and reach[k] > reach[k + 1] and t[k] - last > GAP:
                y = P[e][k, 1] - (hips[k, 1] - 1.0)    # height as if the hips stood at 1 m
                tgt = 'Head' if y > 1.35 else 'Spine2' if y > 1.05 else 'Hips' if y > 0.7 else \
                    ('LeftLeg' if (P[e][k] - hips[k]) @ np.cross([0, 1, 0], base) > 0 else 'RightLeg')
                out.append([round(float(t[k]), 3), e, tgt, float(reach[k])])
                last = t[k]
    # an elbow and its hand peak together: keep the one reaching further, likewise a knee and its foot
    pair = {'LeftForeArm': 'LeftHand', 'RightForeArm': 'RightHand', 'LeftLeg': 'LeftFoot', 'RightLeg': 'RightFoot'}
    keep = []
    for c in sorted(out, key=lambda c: -c[3]):
        mates = {c[1], pair.get(c[1])} | {k for k, v in pair.items() if v == c[1]}
        if not any(abs(k[0] - c[0]) < GAP and k[1] in mates for k in keep):
            keep.append(c)
    if key in SINGLE:
        keep = sorted((c for c in keep if SINGLE[key] in (None, c[1])), key=lambda c: -c[3])[:1]
    if key.startswith('throw_'):
        keep = sorted(keep)[:1]
    return [c[:3] for c in sorted(keep)]


def main():
    G, B = glb(sys.argv[1])
    cp = os.path.join(HERE, 'data', 'clips.json')
    C = json.load(open(cp, encoding='utf-8'))
    anims = {a['name']: a for a in G['animations']}
    n = 0
    for c in C['clips']:
        if c.get('group') not in GROUPS or c['key'] in SKIP or c['key'] not in anims:
            continue
        found = find(G, B, anims[c['key']], STRIKES.get(c['key'], HANDS), c['key'])
        print('%-16s %s%s' % (c['key'], found, '  (kept: %s)' % c['contact'] if 'contact' in c else ''))
        if '--write' in sys.argv and 'contact' not in c and found:
            c['contact'] = found
            n += 1
    if '--write' in sys.argv:
        open(cp, 'w', encoding='utf-8', newline='\n').write(json.dumps(C, indent=1, ensure_ascii=False) + '\n')
        print('wrote %d contacts' % n)


if __name__ == '__main__':
    main()
