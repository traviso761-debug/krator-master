"""Millipede: decimate, cut into head / segments / leg pairs, rig, animate (perch + walk with planted feet). Usage: mbuild.py <target tris> <out.glb>"""
import sys, json, struct; sys.path.insert(0, '.')
import numpy as np, trimesh, fast_simplification
from common import *
TARGET = int(sys.argv[1]); out = sys.argv[2]
J, BIN, P, N, UV, F = load('milli.glb'); W = weld_ids(P)
SEGZ = np.array([0.575, 0.485, 0.405, 0.325, 0.235, 0.145, 0.065, -0.005, -0.095, -0.185, -0.265, -0.355, -0.425, -0.535, -0.615, -0.715, -0.795])   # front to back
NS = len(SEGZ); BND = (SEGZ[:-1] + SEGZ[1:]) / 2; HEADZ = SEGZ[0] + (SEGZ[0] - SEGZ[1]) / 2
LEGY = -0.045
# ---- 1. decimate
_, first, inv = np.unique(np.round(P, 4), axis=0, return_index=True, return_inverse=True); inv = inv.reshape(-1)
WF = inv[F]; WF = WF[(WF[:, 0] != WF[:, 1]) & (WF[:, 1] != WF[:, 2]) & (WF[:, 0] != WF[:, 2])]
used = np.unique(WF); m = -np.ones(len(first), int); m[used] = np.arange(len(used))
V2, F2 = fast_simplification.simplify(P[first][used].astype(np.float64), m[WF].astype(np.int64), target_count=TARGET, agg=5)[:2]
_wid = np.unique(np.round(V2, 5), axis=0, return_inverse=True)[1].reshape(-1); _lab = face_components(F2, np.ones(len(F2), bool), _wid)
_keep = np.bincount(_lab)[_lab] >= 40; print('decimated', len(F2), 'dropped', int((~_keep).sum())); F2 = F2[_keep]
# ---- 2. UV + normal from the original
OM = trimesh.Trimesh(P, F, process=False)
_, isl = connected_components(coo_matrix((np.ones(len(F) * 3), (np.r_[F[:, 0], F[:, 1], F[:, 2]], np.r_[F[:, 1], F[:, 2], F[:, 0]])), shape=(len(P),) * 2), directed=False)
fisl = isl[F[:, 0]]; cen = V2[F2].mean(1); _, _, tid = trimesh.proximity.closest_point(OM, cen); face_isl = fisl[tid]
corner = V2[F2].reshape(-1, 3); cuv = np.zeros((len(corner), 2)); cn = np.zeros((len(corner), 3)); cisl = np.repeat(face_isl, 3)
for k in np.unique(cisl):
    sel = np.where(cisl == k)[0]; sub = trimesh.Trimesh(P, F[fisl == k], process=False); fid = np.where(fisl == k)[0]
    cp, _, t = trimesh.proximity.closest_point(sub, corner[sel]); tri = F[fid[t]]; bc = trimesh.triangles.points_to_barycentric(P[tri], cp)
    cuv[sel] = (UV[tri] * bc[:, :, None]).sum(1); cn[sel] = (N[tri] * bc[:, :, None]).sum(1)
cn /= np.linalg.norm(cn, axis=1, keepdims=True) + 1e-9
# ---- 3. parts
C2 = V2[F2].mean(1); seg = np.searchsorted(-BND, -C2[:, 2])      # 0 front .. NS-1 rear
part = np.empty(len(F2), dtype=object)
for i in range(len(F2)):
    x, y, z = C2[i]
    if z > HEADZ: part[i] = 'head'
    elif y < LEGY and abs(x) > 0.06: part[i] = 'leg%d' % (2 * seg[i] + (0 if x > 0 else 1))      # the kit's order: pairs front to back, left (+x) then right
    else: part[i] = 'seg%d' % seg[i]
import collections; cnt = collections.Counter(part); print(len(cnt), 'parts;', sum(1 for k in cnt if k.startswith('leg')), 'legs;', 'seg0', cnt['seg0'], 'leg0', cnt['leg0'], 'head', cnt['head'])
FACES = {n: np.where(part == n)[0] for n in sorted(cnt, key=lambda s: (s[:3] != 'hea', s))}
def vp(n): return V2[np.unique(F2[FACES[n]])]
# ---- 4. pivots, hierarchy
PIV, PAR = {'rig': np.zeros(3)}, {}
for i in range(NS):
    PIV['seg%d' % i] = np.array([0, 0, SEGZ[i]]); PAR['seg%d' % i] = 'rig'
PIV['head'] = np.array([0, 0, HEADZ]); PAR['head'] = 'rig'
GROUND0 = min(vp(n)[:, 1].min() for n in FACES if n.startswith('leg'))
LEG = {}
for n in FACES:
    if not n.startswith('leg'): continue
    k = int(n[3:]); i = k // 2; pts = vp(n); sx = 1 if k % 2 == 0 else -1; ox = np.abs(pts[:, 0])
    root = np.array([sx * np.quantile(ox, 0.05), pts[:, 1].max() - 0.004, pts[:, 2].mean()]); PIV[n] = root; PAR[n] = 'seg%d' % i
    rel = pts - root; xr = sx * rel[:, 0]; ty = GROUND0 - root[1]
    # lower the leg about the body axis until the lowest point of the whole leg is on the common ground (legs differ by a few mm)
    g_ = lambda ph: (xr * np.sin(ph) + rel[:, 1] * np.cos(ph)).min() - ty
    lo_, hi_ = -0.8, 0.5
    if g_(lo_) * g_(hi_) < 0:
        for _ in range(60):
            mid = 0.5 * (lo_ + hi_)
            if g_(lo_) * g_(mid) <= 0: hi_ = mid
            else: lo_ = mid
        phi0 = 0.5 * (lo_ + hi_)
    else: phi0 = 0.0
    ys = xr * np.sin(phi0) + rel[:, 1] * np.cos(phi0); j = np.argmin(ys); foot2 = np.array([rel[j, 0] * np.cos(sx * phi0) - rel[j, 1] * np.sin(sx * phi0), ys[j], rel[j, 2]])
    LEG[n] = dict(sx=sx, foot=foot2, phi0=phi0, i=i, k=k)
ORDER = ['head'] + ['seg%d' % i for i in range(NS)] + sorted((n for n in FACES if n.startswith('leg')), key=lambda s: int(s[3:]))
GROUND = min(vp(n)[:, 1].min() for n in FACES if n.startswith('leg')); print('ground', round(GROUND, 4), 'legs', len(LEG))
# ---- 5. glTF
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
meshes, nodes, idx, tris = [], [{'name': 'creature', 'children': [1]}, {'name': 'rig', 'children': []}], {'rig': 1}, {}
for n in ORDER:
    ci = np.concatenate([np.arange(f * 3, f * 3 + 3) for f in FACES[n]]); pos = corner[ci] - PIV[n]; nrm = cn[ci]; uv = cuv[ci]
    key = np.round(np.c_[pos, uv, nrm], 5); _, fi, iv = np.unique(key, axis=0, return_index=True, return_inverse=True); iv = iv.reshape(-1)
    pa = add_acc(pos[fi].astype('<f4'), 'VEC3', 5126, 34962, True); na = add_acc(nrm[fi].astype('<f4'), 'VEC3', 5126, 34962)
    ua = add_acc(uv[fi].astype('<f4'), 'VEC2', 5126, 34962); ia = add_acc(iv.astype('<u4'), 'SCALAR', 5125, 34963)
    meshes.append({'name': n, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'TEXCOORD_0': ua}, 'indices': ia, 'mode': 4, 'material': 0}]})
    par = PAR[n]; idx[n] = len(nodes); tris[n] = len(FACES[n])
    nodes.append({'name': n, 'mesh': len(meshes) - 1, 'translation': [float(x) for x in (PIV[n] - PIV[par])]})
kids = {}
for n in ORDER: kids.setdefault(PAR[n], []).append(idx[n])
for p, ks in kids.items(): nodes[idx[p]]['children'] = ks
QI = np.array([0, 0, 0, 1.0])
def qm(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2, w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2, w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2, w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2])
def qa(axis, a): q = np.zeros(4); q[:3] = np.asarray(axis, float) * np.sin(a / 2); q[3] = np.cos(a / 2); return q
Y = [0, 1, 0]; Z = [0, 0, 1]
def clip(nm, T, fn, n=36, extras=None):
    t = (np.arange(n + 1) / n * T).astype('<f4'); sam, ch = [], []
    for k_ in ORDER:
        q = np.array([fn(k_, k / n) for k in range(n + 1)], '<f4')
        if np.allclose(q, QI, atol=1e-6): continue
        ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(q, 'VEC4', 5126, None)
        sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[k_], 'path': 'rotation'}})
    c = {'name': nm, 'samplers': sam, 'channels': ch}
    if extras: c['extras'] = extras
    return c
T_WALK, DUTY, LAG, LIFT = 1.0, 0.65, 0.085, 0.30
def leg_pose(g, u):
    """stance: the foot moves back along a straight line at constant speed (planted); swing: it returns, lifted"""
    sx = g['sx']; dx, dz0 = abs(g['foot'][0]), g['foot'][2]; r = np.hypot(dx, dz0); psi0 = np.arctan2(dz0, dx)
    half = 0.5 * STRIDE
    if u < DUTY: z = dz0 + half * (1 - 2 * u / DUTY); lift = 0.0
    else: s = (u - DUTY) / (1 - DUTY); e = 0.5 - 0.5 * np.cos(np.pi * s); z = dz0 - half + STRIDE * e; lift = LIFT * np.sin(np.pi * s)
    th = psi0 - np.arcsin(np.clip(z / r, -1, 1))           # yaw that puts the foot at z (left legs; right legs mirror)
    return qm(qa(Y, sx * th), qa(Z, sx * (g['phi0'] + lift)))
STRIDE = 0.10
def walk(nm, ph):
    if nm in LEG:
        g = LEG[nm]; u = (ph - g['i'] * LAG + (0.5 if g['sx'] < 0 else 0)) % 1.0; return leg_pose(g, u)
    if nm.startswith('seg'): i = int(nm[3:]); return qa(Y, 0.025 * np.sin(2 * np.pi * (ph - i * LAG * 1.5)))
    if nm == 'head': return qa(Y, 0.05 * np.sin(2 * np.pi * (ph + 0.2)))
    return QI
def idle(nm, ph):
    if nm.startswith('seg'): i = int(nm[3:]); return qa(Y, 0.01 * np.sin(2 * np.pi * (ph - i * 0.06)))
    if nm == 'head': return qa(Y, 0.06 * np.sin(2 * np.pi * ph))
    return QI
SPEED = STRIDE / (DUTY * T_WALK)
anims = [clip('perch', 4.0, idle, n=24), clip('walk', T_WALK, walk, n=36, extras={'speed': SPEED, 'stride': STRIDE, 'duty': DUTY, 'ground': float(GROUND), 'note': 'walk in place; drive the root forward at "speed" units per second so planted feet do not slide'})]
outj = {'asset': {'version': '2.0', 'generator': 'meshy + mbuild.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': nodes, 'meshes': meshes, 'materials': J['materials'], 'textures': J['textures'],
        'images': imgs, 'samplers': J['samplers'], 'bufferViews': BV, 'accessors': AC, 'animations': anims, 'buffers': [{'byteLength': len(blob)}]}
js = json.dumps(outj, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
while len(blob) % 4: blob.append(0)
open(out, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob))
print('wrote', out, 'tris', sum(tris.values()), 'speed %.3f' % SPEED)
