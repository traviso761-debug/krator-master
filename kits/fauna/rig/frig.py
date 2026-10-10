"""parts_<name>.pkl + the Meshy textures -> one animated GLB. Usage: frig.py <animal> <out.glb>   (run fbuild.py first; configs live in fbuild.CFG)"""
import sys, json, struct, pickle, re; sys.path.insert(0, '.')
import numpy as np
from common import load
import fcfg
name, out = sys.argv[1], sys.argv[2]
src = open('fbuild.py').read(); exec(src[src.index('CFG = {'):src.index("J, BIN, P, N, UV, F")].replace("name, out = sys.argv[1], sys.argv[2]", ""))
J, BIN, *_ = load(CFG['src']); D = pickle.load(open(f'parts_{name}.pkl', 'rb')); V2, F2, cuv, cn, part = D['V2'], D['F2'], D['cuv'], D['cn'], D['part']
corner = V2[F2].reshape(-1, 3); cr = corner.reshape(-1, 3, 3)
QI = np.array([0, 0, 0, 1.0])
def qm(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2, w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2, w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2, w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2])
def qa(axis, a): q = np.zeros(4); q[:3] = np.asarray(axis, float) * np.sin(a / 2); q[3] = np.cos(a / 2); return q
X, Y, Z = np.array([1., 0, 0]), np.array([0, 1., 0]), np.array([0, 0, 1.])
def Rax(u, a):
    u = np.asarray(u, float); u = u / np.linalg.norm(u); K = np.array([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K
FACES = {n: np.where(part == n)[0] for n in sorted(set(part))}
def verts(n): return np.unique(F2[FACES[n]]); 
def vp(n): return V2[verts(n)]
def nearest(pts, target, q=0.04):
    d = np.linalg.norm(pts - target, axis=1); return pts[d <= np.quantile(d, q)].mean(0)

# ---------------------------------------------------------------- pivots
PIV, PAR = {}, {}
Ct = vp('torso').mean(0); roots = {}
for s in 'RL':
    pts = vp('wing' + s); ox = np.abs(pts[:, 0]); roots[s] = pts[ox <= np.quantile(ox, 0.04)].mean(0)
S = (roots['R'] + roots['L']) / 2; S[0] = 0.0
ax_l, sg_l = CFG['lead']
for s in 'RL':
    PIV['wing' + s] = roots[s]
    po = vp('wingO' + s); ox = np.abs(po[:, 0]); sec = po[ox <= ox.min() + 0.03]; lead = sec[:, ax_l] * sg_l
    PIV['wingO' + s] = sec[lead >= np.quantile(lead, 0.9)].mean(0); PAR['wingO' + s] = 'wing' + s
    PIV['wingO' + s][0] = (1 if s == 'R' else -1) * CFG['split']      # the hinge sits on the cut, so the join turns in place
    if 'leg' + s in FACES:
        L = vp('leg' + s); LT = vp('legT' + s)
        PIV['leg' + s] = nearest(L, Ct); PIV['legT' + s] = nearest(LT, L.mean(0)); PAR['legT' + s] = 'leg' + s
        PIV['foot' + s] = nearest(vp('foot' + s), LT.mean(0)); PAR['foot' + s] = 'legT' + s
PIV['torso'] = S
if 'midsheet' in FACES: PIV['midsheet'] = vp('midsheet').mean(0); PAR['midsheet'] = 'rig'
for n, ref in (('neck', Ct), ('head', None), ('tail', Ct), ('tail2', None)):
    if n not in FACES: continue
    if n == 'head': ref = vp('neck').mean(0) if 'neck' in FACES else Ct
    if n == 'tail2': ref = vp('tail').mean(0)
    PIV[n] = nearest(vp(n), ref)
PAR.update({'head': 'neck' if 'neck' in FACES else 'torso', 'tail2': 'tail'})
for n in PIV:
    PAR.setdefault(n, 'rig' if n.startswith('wing') or n == 'torso' else 'torso')
for s in 'RL': PAR['wing' + s] = 'rig'
RIG = S.copy() if CFG['pitch'] == 'whole' else np.zeros(3)
ORDER = ['torso'] + [n for n in ('neck', 'head', 'tail', 'tail2') if n in FACES] + [n for n in sorted(FACES) if n.startswith('leg')] + [n for n in sorted(FACES) if n.startswith('foot')] + [n for n in sorted(FACES) if n.startswith('wing')] + (['midsheet'] if 'midsheet' in FACES else [])
print('pivots', {k: np.round(v, 3).tolist() for k, v in PIV.items()})

# ---------------------------------------------------------------- legs: IK data
KD = np.array([0, 0, -1.0]); LEG = {}
for s in 'RL':
    hip = PIV['leg' + s]; knee = PIV['legT' + s]; ank = PIV['foot' + s]
    vf = V2[F2[FACES['leg' + s]]].reshape(-1, 3) - hip; vt = V2[F2[FACES['legT' + s]]].reshape(-1, 3) - hip; vo = V2[F2[FACES['foot' + s]]].reshape(-1, 3) - hip
    f = knee - hip; a = ank - hip; cfoot = vo[np.argmin(vo[:, 1])] - a              # the sole's lowest point, relative to the ankle
    def off(sg, th=0.4):
        c2 = f + Rax(X, sg * th) @ (a - f); u = c2 / np.linalg.norm(c2); o = f - (f @ u) * u; return o @ KD
    sg = 1.0 if off(1.0) >= off(-1.0) else -1.0
    LEG[s] = dict(hip=hip, f=f, a=a, cf=cfoot, vf=vf, vt=vt, vo=vo, sg=sg)
    print('leg', s, 'upper %.3f lower %.3f foot %.3f knee sign %+d' % (np.linalg.norm(f), np.linalg.norm(a - f), np.linalg.norm(cfoot), sg))
def fk(g, th): return Rax(X, th[0]) @ Rax(Z, th[1]) @ (g['f'] + Rax(X, g['sg'] * th[2]) @ (g['a'] - g['f']))     # the ankle
LO, HI = np.array([-0.9, -0.5, -0.05]), np.array([0.9, 0.5, 2.3])
def solve1(g, tgt, th):
    for _ in range(40):
        e = tgt - fk(g, th)
        if np.linalg.norm(e) < 1e-6: break
        Jm = np.zeros((3, 3))
        for k in range(3): d = th.copy(); d[k] += 1e-4; Jm[:, k] = (fk(g, d) - fk(g, th)) / 1e-4
        th = np.clip(th + Jm.T @ np.linalg.solve(Jm @ Jm.T + 1e-4 * np.eye(3), e), LO, HI)
    return th, np.linalg.norm(tgt - fk(g, th))
def knee_ok(g, th):
    R12 = Rax(X, th[0]) @ Rax(Z, th[1]); foot = fk(g, th); u = foot / (np.linalg.norm(foot) + 1e-9); kf = R12 @ g['f']; o = kf - (kf @ u) * u
    return o @ (R12 @ KD) > -0.003
def solve(g, tgt, th):
    c = [solve1(g, tgt, s0) for s0 in (th, np.array([th[0], 0, 0.2]), np.array([th[0], 0, 0.6]), np.array([th[0], 0, 1.0]), np.array([th[0], 0, 1.5]))]
    ok = [x for x in c if x[1] < 1e-3 and knee_ok(g, x[0])]
    if ok: return min(ok, key=lambda x: np.linalg.norm(x[0] - th))
    return min(c, key=lambda x: x[1] + (0 if knee_ok(g, x[0]) else 1))

T_WALK, STRIDE, DUTY, LIFT, N_WALK = CFG['T_walk'], CFG['stride'], 0.6, CFG['lift'], 36
BOB = lambda ph: 0.004 * np.sin(2 * ph)
GROUND = float(np.mean([g['hip'][1] + g['a'][1] + g['cf'][1] for g in LEG.values()])); SPEED = STRIDE / (DUTY * T_WALK)
def foot_path(g, u, zc, off):
    f0 = g['hip'] + g['a'] + g['cf']
    if u < DUTY: z = f0[2] + STRIDE / 2 - STRIDE * (u / DUTY); y = GROUND + off
    else: sw = (u - DUTY) / (1 - DUTY); z = f0[2] - STRIDE / 2 + STRIDE * (0.5 - 0.5 * np.cos(np.pi * sw)); y = GROUND + off + LIFT * np.sin(np.pi * sw)
    return np.array([f0[0], y, z])
def lowest(g, th, ph, cr_):
    R12 = Rax(X, th[0]) @ Rax(Z, th[1]); R3 = Rax(X, g['sg'] * th[2])
    ank = fk(g, th); loc = np.vstack([(R12 @ g['vf'].T).T, (R12 @ (g['f'] + (R3 @ (g['vt'] - g['f']).T).T).T).T, ank + (g['vo'] - g['a'])]) + g['hip']
    return float(loc[:, 1].min() + BOB(ph) - cr_)
def run(s, g, crouch, off):
    th = np.zeros(3); res = {}; worst = 0.0
    for rep in range(2):
        for k in range(N_WALK):
            ph = 2 * np.pi * k / N_WALK; u = (k / N_WALK + (0.5 if s == 'L' else 0)) % 1.0
            W = foot_path(g, u, 0, off); local = W - np.array([0, BOB(ph) - crouch, 0]) - g['hip'] - g['cf']; th, e = solve(g, local, th)
            if rep == 1: res[k] = th.copy(); worst = max(worst, e)
    return res, worst
leglen = np.mean([np.linalg.norm(g['f']) + np.linalg.norm(g['a'] - g['f']) for g in LEG.values()])
WALK = {}; CROUCH = None; STRIDE0 = STRIDE
for mult in (1.0, 0.75, 0.55, 0.4, 0.3):
    STRIDE = STRIDE0 * mult; SPEED = STRIDE / (DUTY * T_WALK)
    for crouch in np.linspace(0.05, 0.5, 10) * leglen:
        ok = True; tmp = {}; offs = {}
        for s, g in LEG.items():
            off = 0.0
            for it in range(6):
                res, worst = run(s, g, crouch, off)
                pen = max(0.0, GROUND - min(lowest(g, res[k], 2 * np.pi * k / N_WALK, crouch) for k in range(N_WALK)))
                if pen < 0.0004: break
                off += pen + 0.0002
            if worst > 0.004 or pen >= 0.0004: ok = False; break
            tmp[s] = res; offs[s] = off
        if ok: WALK = tmp; CROUCH = crouch; OFFS = offs; break
    if CROUCH is not None: break
assert CROUCH is not None, 'no crouch height plants both feet'
print('walk: ground %.3f speed %.3f crouch %.3f (%.0f%% of leg)  offsets %s' % (GROUND, SPEED, CROUCH, 100 * CROUCH / leglen, {k: round(v, 4) for k, v in OFFS.items()}))

# ---------------------------------------------------------------- overlap the wing join
# each wing half also carries a band of the other half's faces across the cut, so the outer wing can swing without opening a gap
Cc = V2[F2].mean(1); SPL = CFG['split']; BAND = 0.07
for s_ in 'RL':
    a_, b_ = 'wing' + s_, 'wingO' + s_; fa, fb = FACES[a_], FACES[b_]
    ea = fa[np.abs(Cc[fa, 0]) > SPL - BAND]; eb = fb[np.abs(Cc[fb, 0]) < SPL + BAND]
    FACES[b_] = np.concatenate([fb, ea]); FACES[a_] = np.concatenate([fa, eb])
    print('wing join', s_, 'duplicated', len(ea), '+', len(eb), 'faces across the cut')
# the armpit: the same trick at the shoulder, between the inner wing and the torso
ARM = CFG.get('arm', 0.07); tf = FACES['torso']; extra_t = []
for s_ in 'RL':
    a_ = 'wing' + s_; rx, ry_, rz_ = roots[s_]; fa = FACES[a_]
    near_t = tf[(np.abs(Cc[tf, 0]) > abs(rx) - ARM) & (np.sign(Cc[tf, 0]) == (1 if s_ == 'R' else -1)) & (Cc[tf, 1] > ry_ - 0.14) & (np.abs(Cc[tf, 2] - rz_) < 0.25)]
    near_w = fa[np.abs(Cc[fa, 0]) < abs(rx) + ARM]
    FACES[a_] = np.concatenate([fa, near_t])
    if CFG.get('armpit_wing_to_torso', True): extra_t.append(near_w)
    print('armpit', s_, 'duplicated', len(near_t), 'torso faces into the wing and', len(near_w), 'wing faces into the torso')
FACES['torso'] = np.concatenate([tf] + extra_t)
# the back sheet stays level while the torso pitches: a static copy of the torso's upper skin goes into it, so the back is never open
if CFG.get('sheet_cap') is not None and 'midsheet' in FACES:
    _tf = FACES['torso']; _cap = _tf[Cc[_tf, 1] > CFG['sheet_cap']]; FACES['midsheet'] = np.concatenate([FACES['midsheet'], _cap]); print('sheet cap: +%d faces of the back' % len(_cap))
# the neck chain and the back sheet: the same overlap (a copy of each part's faces within a band of its neighbour, in the neighbour)
from scipy.spatial import cKDTree
_SNAP = {k: v.copy() for k, v in FACES.items()}; _ADD = {}
def _overlap(a_, b_, band, mode='both'):
    """mode 'both': each part also carries the neighbour's faces near the join; 'a>b': only a's faces are copied into b"""
    if a_ not in _SNAP or b_ not in _SNAP: return
    fa, fb = _SNAP[a_], _SNAP[b_]; ta, tb = cKDTree(Cc[fa]), cKDTree(Cc[fb])
    _ADD.setdefault(b_, []).append(fa[tb.query(Cc[fa])[0] < band])
    if mode == 'both': _ADD.setdefault(a_, []).append(fb[ta.query(Cc[fb])[0] < band])
for ov_ in CFG.get('overlaps', [('torso', 'neck', 0.03), ('neck', 'head', 0.025)] if 'neck' in FACES else [('torso', 'head', 0.03)]):
    _overlap(*ov_)
for k_, lst_ in _ADD.items(): FACES[k_] = np.unique(np.concatenate([FACES[k_]] + lst_)); print('overlap', k_, '+', len(FACES[k_]) - len(_SNAP[k_]), 'faces')
# decimation leaves a few long thin slivers stretched across gaps; folded, they hang as bars. Drop them (area is ~nothing)
_tot = 0
for k_ in list(FACES):
    tri_ = cr[FACES[k_]]; e_ = np.stack([np.linalg.norm(tri_[:, 0] - tri_[:, 1], axis=1), np.linalg.norm(tri_[:, 1] - tri_[:, 2], axis=1), np.linalg.norm(tri_[:, 2] - tri_[:, 0], axis=1)], 1)
    A_ = 0.5 * np.linalg.norm(np.cross(tri_[:, 1] - tri_[:, 0], tri_[:, 2] - tri_[:, 0]), axis=1); L_ = e_.max(1)
    strict = k_ == 'torso' and CFG.get('torso_spurs')
    bad_ = (L_ > (CFG.get('torso_spurs', (0, 0))[0] if strict else CFG.get('sliver_len', 0.08))) & (L_ * L_ / (2 * A_ + 1e-12) > (CFG['torso_spurs'][1] if strict else 12))
    _tot += int(bad_.sum()); FACES[k_] = FACES[k_][~bad_]
print('slivers removed:', _tot)
if CFG.get('torso_trim'):      # shoulder spurs: torso faces with a vertex out past the body's width (the wing covers beyond it)
    _x, _y = CFG['torso_trim']; _t = FACES['torso']; _tr = cr[_t]; _bad = (np.abs(_tr[:, :, 0]).max(1) > _x) & (_tr[:, :, 1].mean(1) > _y)
    FACES['torso'] = _t[~_bad]; print('spur faces trimmed:', int(_bad.sum()))
# small floating fragments (torn membrane flaps that read as spurs): components of under N faces inside a part
from common import face_components
_wid2 = np.unique(np.round(V2, 5), axis=0, return_inverse=True)[1].reshape(-1); _fr = 0
for k_ in list(FACES):
    f_ = FACES[k_]
    if len(f_) < 60: continue
    lab_ = face_components(F2[f_], np.ones(len(f_), bool), _wid2); keep_ = np.bincount(lab_)[lab_] >= CFG.get('frag', 45)
    _fr += int((~keep_).sum()); FACES[k_] = f_[keep_]
print('fragments removed:', _fr)
# ---------------------------------------------------------------- glTF
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
meshes, nodes, idx, tris = [], [], {}, {}
pivot = lambda n: PIV[n]
for n in ORDER:
    ci = np.concatenate([np.arange(f * 3, f * 3 + 3) for f in FACES[n]]); pos = corner[ci] - PIV[n]; nrm = cn[ci]; uv = cuv[ci]
    key = np.round(np.c_[pos, uv, nrm], 5); _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True); inv = inv.reshape(-1)
    pa = add_acc(pos[first].astype('<f4'), 'VEC3', 5126, 34962, True); na = add_acc(nrm[first].astype('<f4'), 'VEC3', 5126, 34962)
    ua = add_acc(uv[first].astype('<f4'), 'VEC2', 5126, 34962); ia = add_acc(inv.astype('<u4'), 'SCALAR', 5125, 34963)
    meshes.append({'name': n, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'TEXCOORD_0': ua}, 'indices': ia, 'mode': 4, 'material': 0}]})
    par = PAR[n]; base = RIG if par == 'rig' else PIV[par]
    idx[n] = len(nodes) + 1; tris[n] = len(FACES[n])
    nodes.append({'name': n, 'mesh': len(meshes) - 1, 'translation': [float(x) for x in (PIV[n] - base)]})
nodes.insert(0, {'name': 'rig', 'translation': [float(x) for x in RIG], 'children': []}); idx['rig'] = 0
kids = {}
for n in ORDER: kids.setdefault(PAR[n], []).append(idx[n])
for p, ks in kids.items(): nodes[idx[p]]['children'] = ks
nodes.insert(0, {'name': 'creature', 'children': [1]}); idx = {k: v + 1 for k, v in idx.items()}; idx['creature'] = 0
for nd in nodes[1:]: nd['children'] = [c + 1 for c in nd.get('children', [])] if 'children' in nd else None
for nd in nodes:
    if nd.get('children') is None: nd.pop('children', None)
nodes[0]['children'] = [1]
# the file keeps node 0 = creature (identity), node 1 = rig (translation RIG)

def clip(nm, T, fn, n=24, tfn=None, extras=None, ntr=None, scl=None):
    t = (np.arange(n + 1) / n * T).astype('<f4'); sam, ch = [], []
    for k_ in ['rig'] + ORDER:
        q = np.array([fn(k_, 2 * np.pi * k / n) for k in range(n + 1)], '<f4')
        if np.allclose(q, QI, atol=1e-6): continue
        ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(q, 'VEC4', 5126, None)
        sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[k_], 'path': 'rotation'}})
    if tfn is not None:
        tr = np.array([tfn(2 * np.pi * k / n) for k in range(n + 1)], '<f4'); ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(tr, 'VEC3', 5126, None)
        sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx['rig'], 'path': 'translation'}})
    for node_, v_ in (scl or {}).items():      # constant scale tracks (a folded wing is shorter along its span)
        tt = np.array([0.0, T], '<f4'); vv = np.array([v_, v_], '<f4'); ti = add_acc(tt, 'SCALAR', 5126, None, True); qi = add_acc(vv, 'VEC3', 5126, None)
        sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[node_], 'path': 'scale'}})
    for node_, f_ in (ntr or {}).items():
        tr = np.array([f_(2 * np.pi * k / n) for k in range(n + 1)], '<f4'); ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(tr, 'VEC3', 5126, None)
        sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[node_], 'path': 'translation'}})
    c = {'name': nm, 'samplers': sam, 'channels': ch}
    if extras: c['extras'] = extras
    return c
FA = np.array(CFG['flap_axis'], float); sd = lambda n: 1 if n.endswith('R') else -1
PN = {'whole': 'rig', 'torso': 'torso'}.get(CFG['pitch']); FP = CFG['fly_pitch']      # 'limbs': nothing pitches, the neck and legs swing
fold = CFG['fold']
def wing_pose(n, spread, flap_in=0.0, flap_out=0.0):
    """spread 1 = open, 0 = folded; flap angles added about the flap axis"""
    s = sd(n); inner = n.startswith('wing') and not n.startswith('wingO')
    rz, ry = fold['inner'] if inner else fold['outer']
    fl = flap_in if inner else flap_out
    foldq = qm(qa(Y, s * (1 - spread) * ry), qa(Z, s * (1 - spread) * rz))        # hang down, then sweep back
    return qm(qa(FA, s * fl), foldq)
def fly(nm, ph, T, mid=0.0, amp=None, spread=1.0, tuck=0.5):
    ai, ao = amp if amp else CFG['amp']
    if nm == PN: return qa(X, FP)
    if CFG['pitch'] == 'limbs':      # the torso stays with the wings and the membrane; the neck swings forward, the head levels, the hips swing the legs back
        if nm == 'neck': return qa(X, FP)
        if nm == 'head': return qa(X, -0.85 * FP + 0.04 * np.sin(ph))
        if nm in ('legL', 'legR'): return qa(X, 1.1)
    if nm.startswith('wingO'): return wing_pose(nm, spread, 0.0, mid + ao * np.sin(ph - CFG['lag']))
    if nm.startswith('wing'): return wing_pose(nm, spread, mid + ai * np.sin(ph), 0.0)
    if nm in ('neck',): return qa(X, -0.25 * FP)
    if nm == 'head': return qa(X, -0.75 * FP)
    if nm.startswith('legT'): return qa(X, LEG[nm[-1]]['sg'] * tuck)
    if nm.startswith('foot'): return qa(X, -LEG[nm[-1]]['sg'] * 0.3)
    if nm.startswith('leg'): return QI
    if nm == 'tail': return qm(qa(X, -CFG.get('tail_level', 0.0) * FP), qa(X, 0.08 * np.sin(ph + 1)))
    if nm == 'tail2': return qa(X, 0.1 * np.sin(ph + 0.4))
    return QI
def perch(nm, ph):
    if nm.startswith('wing'): return wing_pose(nm, 0.0)
    if nm == 'head': return qa(X, CFG.get('perch_head', 0.0) + 0.04 * np.sin(ph))
    if nm == 'tail2': return qa(X, 0.03 * np.sin(ph))
    return QI
def walk(nm, ph):
    k = int(round(ph / (2 * np.pi) * N_WALK)) % N_WALK
    if nm.startswith('foot'):
        th = WALK[nm[-1]][k]; q12 = qm(qa(X, th[0]), qa(Z, th[1])); qt = qm(q12, qa(X, LEG[nm[-1]]['sg'] * th[2])); return np.array([-qt[0], -qt[1], -qt[2], qt[3]])   # level sole
    if nm.startswith('legT'): return qa(X, LEG[nm[-1]]['sg'] * WALK[nm[-1]][k][2])
    if nm.startswith('leg'): th = WALK[nm[-1]][k]; return qm(qa(X, th[0]), qa(Z, th[1]))
    if nm.startswith('wing'): return wing_pose(nm, 0.0)
    if nm == 'head': return qa(X, 0.10 * np.sin(2 * ph))
    if nm == 'neck': return qa(X, 0.06 * np.sin(2 * ph + 0.5))
    if nm == 'tail': return qa(Y, 0.10 * np.sin(ph))
    if nm == 'tail2': return qa(Y, 0.12 * np.sin(ph - 0.5))
    return QI
rigT = lambda dy: (lambda ph: [float(RIG[0]), float(RIG[1] + dy(ph)), float(RIG[2])])
Tf = CFG['T_flap']
FOLDSC = {n_: [CFG.get('fold_scale', 1.0), 1.0, 1.0] for n_ in ('wingR', 'wingL')} if CFG.get('fold_scale', 1.0) != 1.0 else None
NTR = None
if 'tail' in FACES and CFG.get('tail_level') and CFG['pitch'] == 'torso':
    # the tail grows from the pelvis: in flight, once the torso has pitched, it sits at the rump's end behind the shoulders, not above them
    old = PIV['tail'] - S; dyw, dzw = old[1], -0.17; c_, s_ = np.cos(FP), np.sin(FP)
    TAILFLY = [float(old[0]), float(dyw * c_ + dzw * s_), float(-dyw * s_ + dzw * c_)]; NTR = {'tail': lambda ph: TAILFLY}
anims = [clip('flap', Tf, lambda n, ph: fly(n, ph, Tf), ntr=NTR),
         clip('glide', 3.0, lambda n, ph: fly(n, ph, 3.0, mid=0.12, amp=(0.07, 0.10), tuck=0.2), ntr=NTR),
         clip('perch', 4.0, perch, scl=FOLDSC),
         clip('walk', T_WALK, walk, n=N_WALK, scl=FOLDSC, tfn=rigT(lambda ph: BOB(ph) - CROUCH),
              extras={'speed': SPEED, 'stride': STRIDE, 'duty': DUTY, 'ground': GROUND, 'crouch': CROUCH, 'legOffset': OFFS, 'note': 'walk in place; drive the root forward at "speed" units per second so planted feet do not slide'})]
tr = {k: v for k, v in tris.items()}
outj = {'asset': {'version': '2.0', 'generator': 'meshy + frig.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': nodes, 'meshes': meshes, 'materials': J['materials'], 'textures': J['textures'],
        'images': imgs, 'samplers': J['samplers'], 'bufferViews': BV, 'accessors': AC, 'animations': anims, 'buffers': [{'byteLength': len(blob)}]}
js = json.dumps(outj, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
while len(blob) % 4: blob.append(0)
open(out, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob))
print('wrote', out, 'tris', sum(tr.values()))
