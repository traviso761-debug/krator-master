"""parts.pkl + library wing card -> animated GLB: wing cards, two-bone legs with IK foot planting, clips flap/hover/perch/walk. Usage: rig3.py out.glb"""
import sys, json, struct, pickle, io; sys.path.insert(0, '.')
import numpy as np
from PIL import Image
from common import load
J, BIN, *_ = load('tex6.glb')
D = pickle.load(open('parts.pkl', 'rb')); V2, F2, cuv, cn, part = D['V2'], D['F2'], D['cuv'], D['cn'], D['part']
corner = V2[F2].reshape(-1, 3); r = np.hypot(V2[:, 0], V2[:, 1] - 0.03)
QI = np.array([0, 0, 0, 1.0])
def qm(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2, w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2, w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2, w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2])
def qa(axis, a): q = np.zeros(4); q[:3] = np.asarray(axis) * np.sin(a / 2); q[3] = np.cos(a / 2); return q
def ax(i, a): e = np.zeros(3); e[i] = 1; return qa(e, a)
def Rax(u, a):
    u = np.asarray(u, float); u = u / np.linalg.norm(u); K = np.array([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K

# ---------------------------------------------------------------- pivots, the body chain
PIV = {'thorax': np.zeros(3), 'head': np.array([0, 0.07, 0.285]), 'abd': np.array([0, 0.04, -0.045]), 'abd2': np.array([0, 0.03, -0.38])}
PARENT = {'head': 'thorax', 'abd': 'thorax', 'abd2': 'abd'}
FACES = {}          # node name -> face indices of V2/F2 (a leg's two halves overlap a little at the knee)
LEG = {}
for nm in sorted(set(part)):
    sel = np.where(part == nm)[0]
    if nm in ('thorax', 'head', 'abd', 'abd2'): FACES[nm] = sel
    elif nm.startswith('leg'):
        vi = np.unique(F2[sel]); pts = V2[vi]; rr = r[vi]
        hip = pts[rr <= np.quantile(rr, 0.08)].mean(0); rel = pts - hip
        tip = rel[np.argmax(np.hypot(rel[:, 0], rel[:, 2]) + np.abs(rel[:, 1]))]; L = np.linalg.norm(tip); td = tip / L
        s = rel @ td; lat = np.linalg.norm(rel - np.outer(s, td), axis=1)
        # the knee: the cross-section of the leg lying furthest from the straight hip-to-foot line
        bins = np.linspace(0.15 * L, 0.85 * L, 13); best, knee = -1, None
        for a, b in zip(bins[:-1], bins[1:]):
            m = (s >= a) & (s < b)
            if m.sum() < 6: continue
            c = rel[m].mean(0); dev = np.linalg.norm(c - (c @ td) * td)
            if dev > best: best, knee = dev, c
        straight = best < 0.03 or not (0.3 * L < knee @ td < 0.7 * L)
        if straight:
            m = (s >= 0.45 * L) & (s < 0.55 * L); knee = rel[m].mean(0)
        sk = knee @ td; fc = (corner.reshape(-1, 3, 3)[sel].mean(1) - hip) @ td
        PIV[nm] = hip; PARENT[nm] = 'thorax'; FACES[nm] = sel[fc < sk + 0.01]
        PIV[nm + 't'] = hip + knee; PARENT[nm + 't'] = nm; FACES[nm + 't'] = sel[fc > sk - 0.01]
        d = np.array([tip[0], 0, tip[2]]); a = np.array([-d[2], 0, d[0]]) / (np.linalg.norm(d) + 1e-9)
        if np.cross(a, tip)[1] < 0: a = -a                    # rotating about a raises the foot
        if straight: kd = -a                                   # hinge in the leg's vertical plane; bends down only (theta3 >= 0)
        else:
            kd = np.cross(knee, tip - knee); kd = kd / np.linalg.norm(kd)
        cr = corner.reshape(-1, 3, 3); vfem = cr[FACES[nm]].reshape(-1, 3) - hip; vtib = cr[FACES[nm + 't']].reshape(-1, 3) - hip
        contact = vtib[np.argmin(vtib[:, 1])]                    # the lowest point of the shin: what actually touches the ground
        if np.cross(kd, contact - knee)[1] > 0: kd = -kd         # +theta3 always folds the shin down (elbow up)
        LEG[nm] = dict(lift=a, kaxis=kd, straight=straight, vfem=vfem, vtib=vtib, c=contact, f=knee, t=tip, hip=hip, sx=np.sign(tip[0]) or 1.0)
ORDER = ['thorax', 'head', 'abd', 'abd2'] + sorted(n for n in PIV if n.startswith('leg')) + ['wingR', 'wingL', 'wing2R', 'wing2L']

# ---------------------------------------------------------------- wing cards (the library's wing.dragonfly, bounding-box mapped)
WCARD = {}
for nm in ('wingR', 'wingL', 'wing2R', 'wing2L'):
    vi = np.unique(F2[np.where(part == nm)[0]]); pts = V2[vi]; ox = np.abs(pts[:, 0])
    root = pts[ox < np.quantile(ox, 0.05)].mean(0); rel = pts - root
    PIV[nm] = root; PARENT[nm] = 'thorax'
    zz = (-0.22, 0.12) if not nm.startswith('wing2') else (-0.20, 0.11)
    WCARD[nm] = dict(span=np.abs(rel[:, 0]).max(), z0=zz[0], z1=zz[1], side=1 if nm.endswith('R') else -1, fore=not nm.startswith('wing2'))
    print(nm, 'card', {k: round(float(v), 3) for k, v in WCARD[nm].items()})

def card(w, nu=10, nv=5):
    """a flat quad grid root->tip; the leading edge forward; a little sweep and a drooping tip. UV: u root->tip, v leading edge->trailing edge"""
    sp, z0, z1, sd = w['span'], w['z0'], w['z1'], w['side']; sweep = 0.10 if w['fore'] else -0.07
    P, U = [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            u, v = i / nu, j / nv
            P.append([sd * sp * u, -0.03 * u * u, z1 - (z1 - z0) * v + sweep * u * sp * 1.0]); U.append([u, v])
    I = []
    for j in range(nv):
        for i in range(nu):
            a = j * (nu + 1) + i; b, c, d = a + 1, a + nu + 1, a + nu + 2
            I += [[a, c, b], [b, c, d]] if sd > 0 else [[a, b, c], [b, d, c]]
    P = np.array(P); n = np.tile([0, 1.0, 0], (len(P), 1))
    return P, np.array(U), n, np.array(I)

# the library card, made see-through between the veins
wimg = Image.open('/home/user/krator-master/core/materials/library/wing.dragonfly/albedo.png').convert('RGBA'); wa = np.array(wimg).astype(float)
lum = wa[..., :3].mean(2) / 255; wa[..., 3] = wa[..., 3] * np.clip(0.32 + (0.86 - lum) * 1.0, 0.32, 1.0) / 255 * 255
buf = io.BytesIO(); Image.fromarray(wa.astype(np.uint8)).save(buf, 'PNG'); WPNG = buf.getvalue()

# ---------------------------------------------------------------- glTF assembly
blob = bytearray(); BV = []; AC = []
def add_bv(data, target=None):
    while len(blob) % 4: blob.append(0)
    bv = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(data)}
    if target: bv['target'] = target
    blob.extend(data); BV.append(bv); return len(BV) - 1
def add_acc(arr, typ, ct, target, mm=False):
    a = {'bufferView': add_bv(arr.tobytes(), target), 'componentType': ct, 'count': len(arr), 'type': typ}
    if mm: a['min'] = np.atleast_1d(arr.min(0)).tolist(); a['max'] = np.atleast_1d(arr.max(0)).tolist()
    AC.append(a); return len(AC) - 1
imgs = []
for im in J['images']:
    v = J['bufferViews'][im['bufferView']]; imgs.append({'mimeType': im['mimeType'], 'bufferView': add_bv(BIN[v['byteOffset']:v['byteOffset'] + v['byteLength']])})
imgs.append({'mimeType': 'image/png', 'bufferView': add_bv(WPNG)})
textures = J['textures'] + [{'sampler': 0, 'source': len(imgs) - 1}]
materials = J['materials'] + [{'name': 'wing', 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'baseColorTexture': {'index': len(textures) - 1}, 'metallicFactor': 0.0, 'roughnessFactor': 0.3},
                               'alphaMode': 'BLEND', 'doubleSided': True}]
meshes, nodes, idx = [], [], {}
def add_mesh(nm, pos, uv, nrm, ind, mat):
    key = np.round(np.c_[pos, uv, nrm], 5); _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True); inv = inv.reshape(-1)
    if ind is not None: raise SystemExit
    pa = add_acc(pos[first].astype('<f4'), 'VEC3', 5126, 34962, True); na = add_acc(nrm[first].astype('<f4'), 'VEC3', 5126, 34962)
    ua = add_acc(uv[first].astype('<f4'), 'VEC2', 5126, 34962); ia = add_acc(inv.astype('<u4'), 'SCALAR', 5125, 34963)
    meshes.append({'name': nm, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'TEXCOORD_0': ua}, 'indices': ia, 'mode': 4, 'material': mat}]})
for nm in ORDER:
    if nm in WCARD:
        pos, uv, nrm, I = card(WCARD[nm])
        pa = add_acc(pos.astype('<f4'), 'VEC3', 5126, 34962, True); na = add_acc(nrm.astype('<f4'), 'VEC3', 5126, 34962)
        ua = add_acc(uv.astype('<f4'), 'VEC2', 5126, 34962); ia = add_acc(I.reshape(-1).astype('<u4'), 'SCALAR', 5125, 34963)
        meshes.append({'name': nm, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'TEXCOORD_0': ua}, 'indices': ia, 'mode': 4, 'material': len(materials) - 1}]})
        ntri = len(I)
    else:
        ci = np.concatenate([np.arange(f * 3, f * 3 + 3) for f in FACES[nm]])
        add_mesh(nm, corner[ci] - PIV[nm], cuv[ci], cn[ci], None, 0); ntri = len(FACES[nm])
    idx[nm] = len(nodes) + 1
    nodes.append({'name': nm, 'mesh': len(meshes) - 1, 'translation': [float(x) for x in (PIV[nm] - (PIV[PARENT[nm]] if nm in PARENT else 0))], '_t': ntri})
nodes.insert(0, {'name': 'dragonfly', 'children': []})
kids = {}
for nm in ORDER:
    if nm == 'thorax': nodes[0]['children'].append(idx[nm])
    else: kids.setdefault(PARENT[nm], []).append(idx[nm])
for p, ks in kids.items(): nodes[idx[p]]['children'] = ks

# ---------------------------------------------------------------- clips
def clip(name, T, fn, n=24, tfn=None, extras=None):
    t = (np.arange(n + 1) / n * T).astype('<f4'); sam, ch = [], []
    for nm in ORDER:
        q = np.array([fn(nm, 2 * np.pi * k / n) for k in range(n + 1)], '<f4')
        if np.allclose(q, QI, atol=1e-6): continue
        ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(q, 'VEC4', 5126, None)
        sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[nm], 'path': 'rotation'}})
    if tfn is not None:
        tr = np.array([tfn(2 * np.pi * k / n) for k in range(n + 1)], '<f4'); ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(tr, 'VEC3', 5126, None)
        sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx['thorax'], 'path': 'translation'}})
    c = {'name': name, 'samplers': sam, 'channels': ch}
    if extras: c['extras'] = extras
    return c

def wing_rot(nm, ph, amp, mid, twist):
    side = 1 if nm.endswith('R') else -1; p = ph + (0 if not nm.startswith('wing2') else np.pi)
    return qm(ax(2, side * (mid + amp * np.sin(p))), ax(0, side * twist * np.cos(p)))
def make(tuck, amp, mid, twist, abd_amp, leg_sway, head_amp):
    def fn(nm, ph):
        if nm.startswith('wing'): return wing_rot(nm, ph, amp, mid, twist)
        if nm.startswith('leg'):
            base = nm[:5]; a = tuck * (0.5 if base.startswith('leg0') else 0.7) + leg_sway * np.sin(ph + (sum(map(ord, base)) % 7)); side = 1 if base.endswith('R') else -1
            if nm.endswith('t'): return qa(LEG[base]['kaxis'], 0.9 * tuck)          # the shin folds under
            return ax(0, a) if base.startswith('leg0') else ax(1, side * a)
        if nm == 'abd': return ax(0, abd_amp * np.sin(2 * ph + 1.2))
        if nm == 'abd2': return ax(0, 0.8 * abd_amp * np.sin(2 * ph + 0.4))
        if nm == 'head': return ax(0, head_amp * np.sin(ph + 0.5))
        return QI
    return fn

# ---- walk: a tripod gait with each foot planted on the ground while it is in stance (two-bone IK per leg)
T_WALK, STRIDE, DUTY, LIFT, N_WALK = 0.9, 0.12, 0.6, 0.05, 36
GROUND = float(np.mean([LEG[l]['hip'][1] + LEG[l]['c'][1] for l in LEG]))
SPEED = STRIDE / (DUTY * T_WALK)
GROUP_B = {'leg0L', 'leg1R', 'leg2L'}
BOB = lambda ph: 0.006 * np.sin(2 * ph); ROLL = lambda ph: 0.03 * np.sin(ph)
def fk(g, th):
    return Rax([0, 1, 0], th[0]) @ Rax(g['lift'], th[1]) @ (g['f'] + Rax(g['kaxis'], th[2]) @ (g['c'] - g['f']))
def solve1(g, target, th):
    for _ in range(40):
        e = target - fk(g, th)
        if np.linalg.norm(e) < 1e-6: break
        Jm = np.zeros((3, 3))
        for k in range(3):
            d = th.copy(); d[k] += 1e-4; Jm[:, k] = (fk(g, d) - fk(g, th)) / 1e-4
        th = th + Jm.T @ np.linalg.solve(Jm @ Jm.T + 1e-4 * np.eye(3), e)
        th = np.clip(th, [-0.9, -0.9, -0.05], [0.9, 1.2, 1.9])
    return th, np.linalg.norm(target - fk(g, th))
def elbow_up(g, th):
    R12 = Rax([0, 1, 0], th[0]) @ Rax(g['lift'], th[1]); return (R12 @ g['f'])[1] - fk(g, th)[1] > 0.01
def solve(g, target, th):
    """several starting poses; of the ones that reach the target with the knee above the foot, the one nearest the previous frame (no flips)"""
    c = [solve1(g, target, s0) for s0 in (th, np.array([th[0], 0.3, 0.6]), np.array([th[0], 0.0, 1.0]), np.array([th[0], 0.5, 0.3]), np.array([th[0], 0.6, 1.2]), np.array([th[0], 0.2, 0.2]))]
    ok = [x for x in c if x[1] < 1e-3 and elbow_up(g, x[0])]
    if ok: return min(ok, key=lambda x: np.linalg.norm(x[0] - th))
    return min(c, key=lambda x: x[1] + (0.0 if elbow_up(g, x[0]) else 1.0))
OFF = {l: 0.0 for l in LEG}
def foot_path(l, g, u, pull):
    h = g['hip']; foot0 = h + np.array([g['c'][0] * pull, 0, g['c'][2] * pull])
    if u < DUTY: sd = u / DUTY; z = foot0[2] + STRIDE / 2 - STRIDE * sd; y = GROUND + OFF[l]
    else: sw = (u - DUTY) / (1 - DUTY); z = foot0[2] - STRIDE / 2 + STRIDE * (0.5 - 0.5 * np.cos(np.pi * sw)); y = GROUND + OFF[l] + LIFT * np.sin(np.pi * sw)
    return np.array([foot0[0], y, z])
def run_leg(l, g, pull):
    th = np.zeros(3); out = {}; worst = 0.0
    for rep in range(2):
        for k in range(N_WALK):
            ph = 2 * np.pi * k / N_WALK; u = (k / N_WALK + (0.5 if l in GROUP_B else 0)) % 1.0
            W = foot_path(l, g, u, pull); local = Rax([0, 0, 1], -ROLL(ph)) @ (W - np.array([0, BOB(ph), 0])) - g['hip']
            th, err = solve(g, local, th)
            if rep == 1: out[k] = th.copy(); worst = max(worst, err)
    return out, worst
def lowest(l, g, th, ph):
    """world y of the lowest vertex of the whole leg at this pose"""
    R12 = Rax([0, 1, 0], th[0]) @ Rax(g['lift'], th[1]); R3 = Rax(g['kaxis'], th[2])
    pf = (R12 @ g['vfem'].T).T; pt = (R12 @ (g['f'] + (R3 @ (g['vtib'] - g['f']).T).T).T).T
    loc = np.vstack([pf, pt]) + g['hip']; Rr = Rax([0, 0, 1], ROLL(ph))
    return float(((Rr @ loc.T).T[:, 1] + BOB(ph)).min())
WALK = {}; WALK_ERR = 0.0; PEN = 0.0
for l, g in LEG.items():
    mesh_axis = g['kaxis'].copy(); plane_axis = -g['lift'] if np.cross(-g['lift'], g['c'] - g['f'])[1] < 0 else g['lift']
    best = None
    for axis_name, axis in (('mesh', mesh_axis), ('plane', plane_axis)):
        g['kaxis'] = axis; OFF[l] = 0.0
        for it in range(8):                  # raise the leg's ground until no vertex of it dips through the floor
            for pull in (1.0, 0.94, 0.88, 0.82, 0.76, 0.70, 0.64):
                res, worst = run_leg(l, g, pull)
                if worst < 0.004: break
            pen = max(0.0, GROUND - min(lowest(l, g, res[k], 2 * np.pi * k / N_WALK) for k in range(N_WALK)))
            if pen < 0.0005: break
            OFF[l] += pen + 0.0002
        cand = (worst >= 0.004 or pen >= 0.0005, pull, axis_name, axis.copy(), dict(res), worst, pen, OFF[l])
        if best is None or cand[:2] < best[:2]: best = cand
        if not cand[0]: break
    bad, pull, axis_name, axis, res, worst, pen, off = best; g['kaxis'] = axis; OFF[l] = off
    print('  %s knee axis %s, pull %.2f, foot error %.4f, ground offset %+.4f, penetration %.4f%s' % (l, axis_name, pull, worst, off, pen, '  <-- CHECK' if bad else ''))
    for k in range(N_WALK): WALK[(l, k)] = res[k]
    WALK_ERR = max(WALK_ERR, worst); PEN = max(PEN, pen)
print('walk: ground y %.3f, speed %.3f units/s, worst foot error %.5f' % (GROUND, SPEED, WALK_ERR))
def walk(nm, ph, k=[0]):
    kk = int(round(ph / (2 * np.pi) * N_WALK)) % N_WALK if True else 0
    if nm.startswith('leg'):
        base = nm[:5]; th = WALK[(base, kk)]
        return qa(LEG[base]['kaxis'], th[2]) if nm.endswith('t') else qm(ax(1, th[0]), qa(LEG[base]['lift'], th[1]))
    if nm.startswith('wing'): return wing_rot(nm, ph, 0.02, -0.03, 0.0)
    if nm == 'thorax': return ax(2, ROLL(ph))
    if nm == 'abd': return ax(1, 0.05 * np.sin(ph + np.pi))
    if nm == 'abd2': return ax(1, 0.05 * np.sin(ph + np.pi - 0.6))
    if nm == 'head': return ax(1, 0.04 * np.sin(ph))
    return QI

anims = [clip('flap', 0.22, make(0.7, 0.62, 0.05, 0.18, 0.05, 0.03, 0.03)),
         clip('hover', 0.35, make(0.4, 0.28, 0.0, 0.10, 0.04, 0.05, 0.03)),
         clip('perch', 4.0, make(0.0, 0.02, -0.03, 0.0, 0.015, 0.0, 0.03)),
         clip('walk', T_WALK, walk, n=N_WALK, tfn=lambda ph: [0.0, BOB(ph), 0.0], extras={'speed': SPEED, 'stride': STRIDE, 'duty': DUTY, 'ground': GROUND, 'legOffset': OFF, 'note': 'walk in place; the feet are planted while in stance, so drive the root forward at "speed" units per second'})]
tris = {n['name']: n.pop('_t') for n in nodes if '_t' in n}
out = {'asset': {'version': '2.0', 'generator': 'meshy + rig3.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': nodes, 'meshes': meshes,
       'materials': materials, 'textures': textures, 'images': imgs, 'samplers': J['samplers'], 'bufferViews': BV, 'accessors': AC, 'animations': anims, 'buffers': [{'byteLength': len(blob)}]}
js = json.dumps(out, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
while len(blob) % 4: blob.append(0)
open(sys.argv[1], 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob))
print('wrote', sys.argv[1], 'tris', sum(tris.values()), {k: v for k, v in tris.items()})
