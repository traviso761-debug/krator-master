"""Cut a Meshy flyer into parts, decimate, rig and animate. Usage: fbuild.py <animal> <out.glb>"""
import sys, json, struct, pickle; sys.path.insert(0, '.')
import numpy as np, trimesh, fast_simplification
from common import *
import fcfg
name, out = sys.argv[1], sys.argv[2]
CFG = {
 'quetzal3': dict(split=0.47, armpit_wing_to_torso=False, tail_level=1.0, fold_scale=0.55, overlaps=[('torso', 'neck', 0.03), ('neck', 'head', 0.025), ('torso', 'midsheet', 0.03, 'a>b'), ('wingR', 'midsheet', 0.03), ('wingL', 'midsheet', 0.03)], src='img_quetzal3.glb', classify=fcfg.quetzal, total=9500, wings=3200, lead=(2, +1), flap_axis=(0, 0, 1), pitch='torso', fly_pitch=1.3, sheet_cap=-0.07,
                  T_flap=1.4, amp=(0.55, 0.32), lag=0.6, T_walk=1.6, stride=0.12, lift=0.03, fold=dict(inner=(-1.15, 0.45), outer=(2.6, 0.0))),
 'bat': dict(torso_trim=(0.22, 0.08), back_squash=(-0.04, 0.2, 0.2, -0.25), split=0.46, fold_scale=0.5, arm=0.1, armpit_wing_to_torso=False, perch_head=0.35, src='img_bat.glb', classify=fcfg.bat, total=9500, wings=3600, lead=(1, +1), flap_axis=(0, 1, 0), pitch='whole', fly_pitch=1.45,
             T_flap=0.5, amp=(0.55, 0.5), lag=1.0, T_walk=0.9, stride=0.10, lift=0.03, fold=dict(inner=(-1.4, -0.9), outer=(-0.15, -0.5))),
 'archaeopteryx': dict(split=0.50, src='img_archaeopteryx.glb', classify=fcfg.archaeopteryx, total=9500, wings=3200, lead=(2, +1), flap_axis=(0, 0, 1), pitch='torso', fly_pitch=0.6,
                       T_flap=0.35, amp=(0.6, 0.45), lag=0.8, T_walk=0.9, stride=0.14, lift=0.04, fold=dict(inner=(-1.2, 0.3), outer=(-0.3, 1.3))),
}[name]
J, BIN, P, N, UV, F = load(CFG['src']); W = weld_ids(P); C = P[F].mean(1)
def _fn(V, Fc):
    n = np.cross(V[Fc[:, 1]] - V[Fc[:, 0]], V[Fc[:, 2]] - V[Fc[:, 0]]); return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)
lab0 = CFG['classify'](C, None if CFG.get('no_sheet') else _fn(P, F)); isw = np.array([l.startswith('wing') for l in lab0])

# ---- 1. decimate: wings and body each on their own budget
_, first, inv = np.unique(np.round(P, 4), axis=0, return_index=True, return_inverse=True); inv = inv.reshape(-1)
def squash(faces, target):
    WF = inv[faces]; WF = WF[(WF[:, 0] != WF[:, 1]) & (WF[:, 1] != WF[:, 2]) & (WF[:, 0] != WF[:, 2])]
    used = np.unique(WF); m = -np.ones(len(first), int); m[used] = np.arange(len(used))
    V, Fq = fast_simplification.simplify(P[first][used].astype(np.float64), m[WF].astype(np.int64), target_count=target, agg=5)[:2]
    return V, Fq
# one pass over the whole welded mesh: two separate passes (wings, body) leave cracks where their edges meet at the shoulders
V2, F2 = squash(F, CFG['total']); print('decimated', len(F2), 'tris in one pass')

# drop disconnected debris (Meshy leaves a few shards)
_wid = np.unique(np.round(V2, 5), axis=0, return_inverse=True)[1].reshape(-1); _lab = face_components(F2, np.ones(len(F2), bool), _wid)
_sz = np.bincount(_lab); _keep = _sz[_lab] >= 40; print('dropped', int((~_keep).sum()), 'faces of loose debris'); F2 = F2[_keep]

# ---- 2. UV + normal from the original surface, inside the UV island of the nearest face
OM = trimesh.Trimesh(P, F, process=False)
_, isl = connected_components(coo_matrix((np.ones(len(F) * 3), (np.r_[F[:, 0], F[:, 1], F[:, 2]], np.r_[F[:, 1], F[:, 2], F[:, 0]])), shape=(len(P),) * 2), directed=False)
fisl = isl[F[:, 0]]; cen = V2[F2].mean(1)
_, _, tid = trimesh.proximity.closest_point(OM, cen); face_isl = fisl[tid]
corner = V2[F2].reshape(-1, 3); cuv = np.zeros((len(corner), 2)); cn = np.zeros((len(corner), 3)); cisl = np.repeat(face_isl, 3)
for k in np.unique(cisl):
    sel = np.where(cisl == k)[0]; sub = trimesh.Trimesh(P, F[fisl == k], process=False); fid = np.where(fisl == k)[0]
    cp, _, t = trimesh.proximity.closest_point(sub, corner[sel]); tri = F[fid[t]]; bc = trimesh.triangles.points_to_barycentric(P[tri], cp)
    cuv[sel] = (UV[tri] * bc[:, :, None]).sum(1); cn[sel] = (N[tri] * bc[:, :, None]).sum(1)
cn /= np.linalg.norm(cn, axis=1, keepdims=True) + 1e-9

# ---- 2b. close the cavity behind the body: the back wall stands ~0.06 behind the body shell; squash that depth (UVs already taken)
if CFG.get('back_squash'):
    z0, k, hw, ylo = CFG['back_squash']; m_ = (V2[:, 2] < z0) & (np.abs(V2[:, 0]) < hw) & (V2[:, 1] > ylo)
    w_ = np.clip(1 - (np.abs(V2[m_, 0]) - hw * 0.6) / (hw * 0.4), 0, 1)       # blend out toward the sides so nothing tears
    V2[m_, 2] = V2[m_, 2] * (1 - w_) + (z0 + (V2[m_, 2] - z0) * k) * w_
    print('back squash moved', int(m_.sum()), 'verts')
# ---- 3. parts of the decimated mesh
C2 = V2[F2].mean(1); part = CFG['classify'](C2, None if CFG.get('no_sheet') else _fn(V2, F2))
pickle.dump(dict(V2=V2, F2=F2, cuv=cuv, cn=cn, part=part), open(f'parts_{name}.pkl', 'wb'))
import collections; print(dict(collections.Counter(part)))
