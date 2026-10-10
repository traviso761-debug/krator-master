"""Decimate the textured Meshy dragonfly and cut it into animatable parts. -> parts.pkl"""
import sys, pickle; sys.path.insert(0, '.')
import numpy as np, trimesh, fast_simplification
from common import *
TARGET = int(sys.argv[1]) if len(sys.argv) > 1 else 9000
J, BIN, P, N, UV, F = load('tex6.glb'); W = weld_ids(P)

# ---- 1. drop the rear (third) wing pair: wing faces, split by component and by angle where fore/mid/rear fuse
wing = (P[:, 1] > 0.075) & (np.abs(P[:, 0]) > 0.10); wingf = wing[F].all(1)
C = P[F].mean(1)
wi = np.where(wingf)[0]; lab = face_components(F, wingf, W)
drop = np.zeros(len(F), bool)
for l in np.unique(lab):
    f = wi[lab == l]
    if len(f) < 500: continue
    c = C[f]
    if len(f) > 3000 and abs(c[:, 2].mean()) < 0.2:   # middle + rear fused
        th = np.degrees(np.arctan2(c[:, 2] - 0.02, np.abs(c[:, 0]) - 0.05))
        drop[f[th < -14]] = True
    elif c[:, 2].mean() < -0.15: drop[f] = True
keepF = F[~drop]; print('faces', len(F), '-> without rear wings', len(keepF))
# the dropped wing's leftover sliver faces (wingish verts, no longer connected to anything): remove isolated tiny comps later

# ---- 2. decimate the welded mesh in two passes: the wings (flat sheets) on a small budget, the rest of the body on the remainder
WING_TRIS = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
_, first, inv = np.unique(np.round(P, 4), axis=0, return_index=True, return_inverse=True); inv = inv.reshape(-1)
wing_keep = (wingf & ~drop)[~drop]          # per face of keepF
def squash(faces, target):
    WF = inv[faces]; WF = WF[(WF[:, 0] != WF[:, 1]) & (WF[:, 1] != WF[:, 2]) & (WF[:, 0] != WF[:, 2])]
    used = np.unique(WF); m = -np.ones(len(first), int); m[used] = np.arange(len(used))
    V, Fq = fast_simplification.simplify(P[first][used].astype(np.float64), m[WF].astype(np.int64), target_count=target, agg=5)[:2]
    return V, Fq
Vb, Fb = squash(keepF[~wing_keep], TARGET - WING_TRIS)
Vw, Fw = squash(keepF[wing_keep], WING_TRIS)
V2 = np.vstack([Vb, Vw]); F2 = np.vstack([Fb, Fw + len(Vb)])
print('decimated: body', len(Fb), 'wings', len(Fw), 'total', len(F2), 'tris')

# ---- 3. UV + normal from the original: closest point on the original surface, within the UV island of the face
OM = trimesh.Trimesh(P, keepF, process=False)
_, isl = connected_components(coo_matrix((np.ones(len(keepF) * 3), (np.r_[keepF[:, 0], keepF[:, 1], keepF[:, 2]], np.r_[keepF[:, 1], keepF[:, 2], keepF[:, 0]])), shape=(len(P),) * 2), directed=False)
fisl = isl[keepF[:, 0]]
print('uv islands', len(np.unique(fisl)))
cen = V2[F2].mean(1)
_, _, tid = trimesh.proximity.closest_point(OM, cen); face_isl = fisl[tid]
corner = V2[F2].reshape(-1, 3); cuv = np.zeros((len(corner), 2)); cn = np.zeros((len(corner), 3))
cisl = np.repeat(face_isl, 3)
for k in np.unique(cisl):
    sel = np.where(cisl == k)[0]
    sub = trimesh.Trimesh(P, keepF[fisl == k], process=False); fid = np.where(fisl == k)[0]
    cp, _, t = trimesh.proximity.closest_point(sub, corner[sel]); tri = keepF[fid[t]]
    bc = trimesh.triangles.points_to_barycentric(P[tri], cp)
    cuv[sel] = (UV[tri] * bc[:, :, None]).sum(1); cn[sel] = (N[tri] * bc[:, :, None]).sum(1)
cn /= np.linalg.norm(cn, axis=1, keepdims=True) + 1e-9

# ---- 4. classify the decimated faces into parts
C2 = V2[F2].mean(1); r2 = np.hypot(C2[:, 0], C2[:, 1] - 0.03)
wing2 = (V2[:, 1] > 0.075) & (np.abs(V2[:, 0]) > 0.10); wf2 = wing2[F2].all(1)
part = np.array(['thorax'] * len(F2), dtype=object)
part[C2[:, 2] > 0.285] = 'head'; part[C2[:, 2] < -0.045] = 'abd'; part[C2[:, 2] < -0.38] = 'abd2'
WD = np.unique(np.round(V2, 5), axis=0, return_inverse=True)[1].reshape(-1)
# wings
wi2 = np.where(wf2)[0]; l2 = face_components(F2, wf2, WD)
wcs = []
for l in np.unique(l2):
    f = wi2[l2 == l]
    if len(f) < 40: part[f] = 'thorax'; continue
    wcs.append((l, f, C2[f][:, 0].mean(), C2[f][:, 2].mean()))
print('wing comps', [(len(f), round(float(x), 2), round(float(z), 2)) for _, f, x, z in wcs])
for side, sn in ((1, 'R'), (-1, 'L')):
    cs = sorted([c for c in wcs if np.sign(c[2]) == side], key=lambda c: -c[3]); assert len(cs) == 2, len(cs)
    part[cs[0][1]] = 'wing' + sn; part[cs[1][1]] = 'wing2' + sn
# legs
cand = (~wf2) & (r2 > 0.115) & (C2[:, 2] < 0.9) & (C2[:, 1] < 0.0)
ci = np.where(cand)[0]; cl = face_components(F2, cand, WD)
legs = []
for l in np.unique(cl):
    f = ci[cl == l]
    if len(f) >= 12: legs.append(f)
print('leg comps', [(len(f), C2[f][:, 0].mean().round(2), C2[f][:, 2].mean().round(2)) for f in legs])
assert len(legs) == 6, len(legs)
names = {}
for f in legs:
    x, z = C2[f][:, 0].mean(), C2[f][:, 2].mean()
    k = 0 if z > 0.3 else (1 if z > -0.15 else 2)       # front, middle, rear
    nm = 'leg%d%s' % (k, 'R' if x > 0 else 'L'); part[f] = nm
pickle.dump(dict(V2=V2, F2=F2, cuv=cuv, cn=cn, part=part, tgt=TARGET), open('parts.pkl', 'wb'))
import collections; print(collections.Counter(part))
