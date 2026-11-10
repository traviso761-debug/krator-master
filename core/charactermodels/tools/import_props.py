#!/usr/bin/env python3
"""Meshy weapon models as hand-held props (data/props.json, pieces/props/<id>.glb), in the grip frame make_props.py
describes: origin where the closed hand holds it, +Y along the handle toward the business end, +Z the way the fingers
point (a blade's edge, an axe's bit), +X out of the palm; metres.

  python3 tools/import_props.py [<dir with the Meshy downloads>]      # default: ~/Downloads

A Meshy model comes centred in a 2-unit box with its long axis up and no scale, so each one is given a real length
(PROPS), its handle is found from the radius profile along the shaft (a sword's guard is the widest band and the grip
lies just below it; an axe's, a spear's and a staff's widest band is the head, at the far end from the hand), the
blade's wide axis is turned to Z and its edge to +Z (a scimitar's edge is on the convex side of its curve, an axe's bit
is the side its head stands out on), a shield's board is put in the YZ plane with its boss out past the back of the
hand (-X, as make_props.py's shield). Textures are re-encoded as JPEG (base colour 1024 px, the rest 512) so a prop
weighs a few hundred kB rather than thirty MB. The entries are added to data/props.json (make_props.py keeps them when
it rewrites the file: they carry 'src') and the ids to the clips in data/clips.json that hold the prop they follow
(a scimitar wherever a sword is held, the staff of power wherever a spear or a mace is).
"""
import glob, io, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glbio

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'pieces', 'props')

# id: the Meshy file's name stem (glob), label, hand, kind, real length (m), what it follows in the clips, who it is for
PROPS = [
    ('tz_scepter', 'Meshy_AI_Sunforged_Scepter_*', "Sunforged Scepter (Tzintzun's staff of power)", 'R', 'staff', 1.70, ('spear', 'mace')),
    ('tz_scimitar', 'Meshy_AI_Curved_Scimitar_*', "Tzintzun's scimitar", 'R', 'scimitar', 0.95, ('sword',)),
    ('tz_sword', 'Meshy_AI_Straight_Sword_*', "Tzintzun's straight sword", 'R', 'sword', 1.05, ('sword',)),
    ('tz_axe', 'Meshy_AI_Battle_Axe_*', "Tzintzun's battle axe", 'R', 'axe', 1.00, ('axe',)),
    ('tz_spear', 'Meshy_AI_Spear_*', "Tzintzun's spear", 'R', 'spear', 2.10, ('spear',)),
    ('tz_shield', 'Meshy_AI_Shield_*', "Tzintzun's shield", 'L', 'shield', 0.95, ('shield',)),
]
PEOPLE, OWNER = 'chichani', 'tzintzun'
BIN = 0.015          # the radius profile's step along the length


def profile(P):
    """per band of BIN along Y: the band's own width across (the larger of its X and Z extents; 0 where it is empty),
    and the band centres. Not the distance from the axis: a curved blade's tip lies far off it and outdid the guard"""
    y0, y1 = P[:, 1].min(), P[:, 1].max()
    n = max(2, int(np.ceil((y1 - y0) / BIN)))
    k = np.minimum(((P[:, 1] - y0) / BIN).astype(int), n - 1)
    prof = np.zeros(n)
    for i in range(n):
        m = k == i
        if m.any():
            prof[i] = max(np.ptp(P[m, 0]), np.ptp(P[m, 2]))
    return prof, y0 + (np.arange(n) + 0.5) * BIN


def rot_y(deg):
    a = np.radians(deg)
    return np.array([[np.cos(a), 0, np.sin(a)], [0, 1, 0], [-np.sin(a), 0, np.cos(a)]])


FLIP = np.diag([1.0, -1.0, -1.0])      # end for end: a half turn about X (a turn about Y cannot flip Y)


def axis_at(P, y, half=0.04):
    """the centre (x, z) of the shaft's cross-section at height y: the grip sits on the handle's own line, which lies
    off the box's centre on a curved blade or a single-bitted axe"""
    m = np.abs(P[:, 1] - y) <= half
    if not m.any():
        m = np.abs(P[:, 1] - y) <= 4 * half
    return float(P[m, 0].mean()), float(P[m, 2].mean())


def place(P, kind, length):
    """P centred, long axis Y, scaled to length. Returns the rotation, the grip point (in the scaled frame) and the
    prop's blade band along +Y (from, to) and support segment, as the frame make_props.py gives"""
    prof, yc = profile(P)
    top = int(prof.argmax())                       # the widest band: a guard, or a head
    L = P[:, 1].max() - P[:, 1].min()
    head_up = yc[top] > 0                          # the widest band is in the upper half
    if kind in ('sword', 'scimitar'):
        flip = head_up                             # the guard lies near the hand: the hand's end is the guard's
    elif kind == 'shield':
        flip = False
    else:
        flip = not head_up                         # the head is at the far end from the hand
    R = FLIP if flip else np.eye(3)
    P = P @ R.T
    prof, yc = profile(P)
    top = int(prof.argmax())
    ylo, yhi = P[:, 1].min(), P[:, 1].max()
    blade = support = None
    if kind in ('sword', 'scimitar'):
        # the guard's band: the widest; the grip centre 9 cm below the guard's lower edge (make_props.py's sword)
        g = top
        while g > 0 and prof[g - 1] > 0.5 * prof[top]:
            g -= 1
        guard_lo = yc[g] - BIN / 2
        gx, gz = axis_at(P, guard_lo - 0.09)
        grip = np.array([gx, guard_lo - 0.09, gz])
        # the blade above the guard: its wide axis (edge to edge) goes to Z
        above = P[P[:, 1] > yc[top] + BIN]
        if np.ptp(above[:, 0]) > np.ptp(above[:, 2]):
            R2 = rot_y(90); P = P @ R2.T; R = R2 @ R; grip = R2 @ grip
        if kind == 'scimitar':
            # the edge is on the convex side of the curve: the tip leans the other way
            tip = P[P[:, 1] > yhi - 0.12 * L][:, 2].mean() - grip[2]
            if tip > 0:
                R2 = rot_y(180); P = P @ R2.T; R = R2 @ R; grip = R2 @ grip
        blade = [float(yc[top] + BIN - grip[1]), float(yhi - grip[1])]
    elif kind == 'axe':
        # the head: the widest band and its neighbours over half as wide; the hand 17% up the haft from the butt
        gx, gz = axis_at(P, ylo + 0.17 * L)
        grip = np.array([gx, ylo + 0.17 * L, gz])
        lo = top
        while lo > 0 and prof[lo - 1] > 0.5 * prof[top]:
            lo -= 1
        hi = top
        while hi + 1 < len(prof) and prof[hi + 1] > 0.5 * prof[top]:
            hi += 1
        head = P[(P[:, 1] >= yc[lo] - BIN / 2) & (P[:, 1] <= yc[hi] + BIN / 2)]
        if np.ptp(head[:, 0]) > np.ptp(head[:, 2]):
            R2 = rot_y(90); P = P @ R2.T; R = R2 @ R; grip = R2 @ grip
            head = head @ R2.T
        if head[:, 2].mean() < grip[2]:            # the bit stands out on one side of the haft: that side is +Z
            R2 = rot_y(180); P = P @ R2.T; R = R2 @ R; grip = R2 @ grip
        blade = [float(yc[lo] - BIN / 2 - grip[1]), float(yc[hi] + BIN / 2 - grip[1])]
        support = [0, -0.12, 0, 0, float(yc[lo] - BIN - grip[1]) * 0.8, 0]
    elif kind == 'spear':
        gx, gz = axis_at(P, ylo + 0.35 * L)
        grip = np.array([gx, ylo + 0.35 * L, gz])
        lo = top
        while lo > 0 and prof[lo - 1] > 0.5 * prof[top]:
            lo -= 1
        blade = [float(yc[lo] - BIN / 2 - grip[1]), float(yhi - grip[1])]
        support = [0, 0.3, 0, 0, float(yc[lo] - BIN - grip[1]) * 0.85, 0]
    elif kind == 'staff':
        # held like a spear with the butt on the ground: the hand 44% up from the butt; the sun's disc faces forward
        gx, gz = axis_at(P, ylo + 0.44 * L)
        grip = np.array([gx, ylo + 0.44 * L, gz])
        lo = top
        while lo > 0 and prof[lo - 1] > 0.5 * prof[top]:
            lo -= 1
        head = P[P[:, 1] >= yc[lo] - BIN / 2]
        if np.ptp(head[:, 2]) > np.ptp(head[:, 0]):    # the disc is thin along Z: its face is to the front
            R2 = rot_y(90); P = P @ R2.T; R = R2 @ R; grip = R2 @ grip
        blade = [float(yc[lo] - BIN / 2 - grip[1]), float(yhi - grip[1])]
        support = [0, 0.2, 0, 0, float(yc[lo] - BIN - grip[1]) * 0.8, 0]
    elif kind == 'shield':
        # the board in the YZ plane: its thin axis is X, the boss (the side standing further off the board's plane) to -X
        thin = int(np.argmin([np.ptp(P[:, 0]), 1e9, np.ptp(P[:, 2])]))
        if thin == 2:
            R2 = rot_y(90); P = P @ R2.T; R = R2 @ R
        mid = np.median(P[:, 0])
        if (P[:, 0].max() - mid) > (mid - P[:, 0].min()):     # the boss stands out to +X: turn it to -X
            R2 = rot_y(180); P = P @ R2.T; R = R2 @ R
            mid = np.median(P[:, 0])
        # the hand 3.5 cm behind the back of the board, at its centre (make_props.py's shield)
        back = np.percentile(P[:, 0], 90)
        grip = np.array([back - 0.035, 0.5 * (P[:, 1].min() + P[:, 1].max()), 0.5 * (P[:, 2].min() + P[:, 2].max())])
    else:
        raise SystemExit('import_props.py: kind %s' % kind)
    return R, grip, blade, support


def jpeg(img, px, q=88):
    img = img.convert('RGB')
    if max(img.size) > px:
        img = img.resize((px, px), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, 'JPEG', quality=q)
    return out.getvalue()


def write(path, pid, P, N, UV, T, rig):
    g = glbio.GlbWriter()
    g.j['asset']['generator'] = 'core/charactermodels/import_props.py'
    imgs, texs = [], []

    def tex(ti, px, q=88):
        imgs.append({'bufferView': g.view(jpeg(glbio.image(rig, ti), px, q)), 'mimeType': 'image/jpeg'})
        texs.append({'source': len(imgs) - 1, 'sampler': 0})
        return {'index': len(texs) - 1}
    src = rig.material
    pbr = src.get('pbrMetallicRoughness', {})
    m = {'name': 'prop.' + pid, 'pbrMetallicRoughness': {'metallicFactor': pbr.get('metallicFactor', 1.0),
                                                        'roughnessFactor': pbr.get('roughnessFactor', 1.0)}}
    if 'baseColorTexture' in pbr:
        m['pbrMetallicRoughness']['baseColorTexture'] = tex(pbr['baseColorTexture']['index'], 1024, 84)
    if 'metallicRoughnessTexture' in pbr:
        m['pbrMetallicRoughness']['metallicRoughnessTexture'] = tex(pbr['metallicRoughnessTexture']['index'], 256)
    if 'normalTexture' in src:
        m['normalTexture'] = tex(src['normalTexture']['index'], 512)
    if imgs:
        g.j['images'], g.j['textures'] = imgs, texs
        g.j['samplers'] = [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]
    g.j['materials'] = [m]
    prim = {'attributes': {'POSITION': g.acc(P.astype(np.float32), 'VEC3', 34962, minmax=True),
                           'NORMAL': g.acc(N.astype(np.float32), 'VEC3', 34962),
                           'TEXCOORD_0': g.acc(UV.astype(np.float32), 'VEC2', 34962)},
            'indices': g.acc(T.reshape(-1).astype(np.uint32), 'SCALAR', 34963), 'material': 0}
    g.j['meshes'] = [{'name': pid, 'primitives': [prim]}]
    g.j['nodes'] = [{'name': pid, 'mesh': 0}]
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(path, 'wb').write(g.bytes())


def import_one(src, pid, label, hand, kind, length):
    r = glbio.read_mesh(src)
    P = r.pos - 0.5 * (r.pos.min(0) + r.pos.max(0))
    P *= length / (P[:, 1].max() - P[:, 1].min())
    R, grip, blade, support = place(P, kind, length)
    P = P @ R.T - grip
    N = r.nrm @ R.T
    if np.linalg.det(R) < 0:
        raise SystemExit('import_props.py: a reflection')
    write(os.path.join(OUT, pid + '.glb'), pid, P, N, r.uv, r.tri, r)
    e = {'id': pid, 'label': label, 'hand': hand, 'glb': 'pieces/props/%s.glb' % pid, 'grip': 'fist',
         'people': PEOPLE, 'owner': OWNER, 'src': os.path.basename(src)}
    if support:
        e['support'] = [round(float(x), 3) for x in support]
    if blade:
        e['blade'] = [round(float(x), 3) for x in blade]
    if kind == 'shield':
        e['low_turn'] = 90
    lo, hi = P.min(0), P.max(0)
    print('%-12s %-9s %5d tris  y %+.2f..%+.2f  x %+.2f..%+.2f  z %+.2f..%+.2f  %4d kB' % (
        pid, kind, len(r.tri), lo[1], hi[1], lo[0], hi[0], lo[2], hi[2], os.path.getsize(os.path.join(OUT, pid + '.glb')) // 1024))
    return e


def register(entries):
    pj = os.path.join(HERE, 'data', 'props.json')
    props = json.load(open(pj, encoding='utf-8'))
    ids = {e['id'] for e in entries}
    props['props'] = [p for p in props['props'] if p['id'] not in ids] + entries
    with open(pj, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(props, f, indent=1)
    cj = os.path.join(HERE, 'data', 'clips.json')
    clips = json.load(open(cj, encoding='utf-8'))
    added = 0
    follow = {pid: after for pid, _, _, _, _, _, after in PROPS if pid in ids}
    for c in clips['clips']:
        for side, lst in (c.get('hold') or {}).items():
            for pid, after in follow.items():
                for a in after:
                    if a in lst and pid not in lst:
                        lst.insert(lst.index(a) + 1, pid); added += 1
        th = c.get('two_hands')
        if th:
            for pid, after in follow.items():
                for a in after:
                    if a in th and pid not in th:
                        th.insert(th.index(a) + 1, pid)
    with open(cj, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(clips, f, indent=1)
    print('props.json: %d props; clips.json: %d holds added' % (len(props['props']), added))


def main():
    src_dir = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else os.path.join(os.path.expanduser('~'), 'Downloads')
    os.makedirs(OUT, exist_ok=True)
    entries = []
    for pid, pat, label, hand, kind, length, _ in PROPS:
        files = sorted(glob.glob(os.path.join(src_dir, pat + '.glb')))
        if not files:
            print('import_props.py: no %s in %s' % (pat, src_dir))
            continue
        entries.append(import_one(files[-1], pid, label, hand, kind, length))
    if entries:
        register(entries)


if __name__ == '__main__':
    main()
