#!/usr/bin/env python3
"""Cut a Meshy standing animal (a quadruped, or a two-legged hen) into parts, decimate, rig and animate it.

    python3 qmodel.py <animal> <meshy.glb> <out.glb> [--debug cls.png]

Models face +z, y up, +x the animal's left (the kit's frame). Parts: torso, head (with the neck), tail, and per leg a thigh
(`leg<n><L|R>`), shin (`...t`) and foot (`...f`). Leg order is the kit's: leg0L leg0R (front pair), leg1L leg1R (hind pair);
a hen has leg0L leg0R only. Clips: perch (idle), graze (head down / a hen pecking), walk (a trot, or alternate legs for the
hen, each foot planted on the ground while in stance by two-bone IK, verified by verify_farm.py).
Needs numpy, scipy, trimesh, fast-simplification. Per-animal cuts are in CFG (face centroids in the model's own units)."""
import sys, json, struct, argparse
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import numpy as np, trimesh, fast_simplification
from scipy.spatial import cKDTree
from common import load, weld_ids, face_components, coo_matrix, connected_components

# belly: y below which a face is leg; legx: |x| a leg face must exceed; head: (z, y) the head/neck cut; tail: (z, ymin); zmid: front/hind split
# stride: walk stride (model units); tris: decimation target; kneefrac: knee height as a fraction down the leg
CFG = {
 'cow':   dict(belly=-0.26, legx=0.06, head=(0.58, 0.02), tail=(-0.86, -0.7), zmid=-0.05, stride=0.30, tris=8000),
 'ox':    dict(tymax=-0.02, belly=-0.20, legx=0.03, head=(0.60, 0.00), tail=(-0.86, -0.7), zmid=-0.05, stride=0.28, tris=8000),
 'pig':   dict(belly=-0.18, legx=0.03, head=(0.58, -0.12), tail=(-0.88, -0.2), zmid=0.0, stride=0.22, tris=7000),
 'sheep': dict(belly=-0.28, legx=0.03, head=(0.50, 0.20), tail=(-0.78, -0.4), zmid=0.0, stride=0.24, tris=8000),
 'goat':  dict(belly=-0.30, legx=0.03, head=(0.52, 0.25), tail=(-0.86, -0.4), zmid=0.0, stride=0.26, tris=7000),
 'dog':   dict(tymax=0.02, belly=-0.24, legx=0.03, head=(0.58, 0.15), tail=(-0.62, -0.6), zmid=0.0, stride=0.30, tris=7000),
 'cat':   dict(tymax=0.0, belly=-0.16, legx=0.07, head=(0.52, 0.05), tail=(-0.62, -0.7), zmid=0.0, stride=0.24, tris=7000),
 'hen':   dict(belly=-0.46, legx=0.03, head=(0.18, 0.38), tail=(-0.42, -0.10), zmid=None, stride=0.20, tris=7000, foot_h=0.12),
}


def classify(C, c):
    x, y, z = C[:, 0], C[:, 1], C[:, 2]; n = len(C)
    part = np.full(n, 'torso', dtype=object)
    hz, hy = c['head']; part[(z > hz) & (y > hy)] = 'head'
    xc = float(np.median(x[(y > c['belly']) & (np.abs(z) < 0.4)]))
    tz, tymin = c['tail']; part[(z < tz) & (y > tymin) & (y < c.get('tymax', 9.0)) & (np.abs(x - xc) < 0.16) & (part == 'torso')] = 'tail'
    leg = (y < c['belly']) & (part == 'torso')
    gy = y[leg].min() if leg.any() else y.min(); fh = c.get('foot_h', 0.07)
    pairs = [np.ones(n, bool)] if c['zmid'] is None else [z > c['zmid'], z <= c['zmid']]
    for pi, pm in enumerate(pairs):
        low = leg & pm & (y < gy + 0.3 * (c['belly'] - gy))        # shins and feet: they separate cleanly in x
        xs = np.sort(x[low]); lo_c, hi_c = np.quantile(xs, 0.1), np.quantile(xs, 0.9)
        for _ in range(20):
            xb = (lo_c + hi_c) / 2; lo_c, hi_c = x[low & (x <= xb)].mean(), x[low & (x > xb)].mean()
        xb = (lo_c + hi_c) / 2
        for i in np.where(leg & pm & (np.abs(x - xb) > c['legx']))[0]:
            side = 'L' if x[i] > xb else 'R'; kind = 'f' if y[i] < gy + fh else ('t' if y[i] < (c['belly'] + gy) / 2 else '')
            part[i] = 'leg%d%s%s' % (pi, side, kind)
    return part


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('animal'); ap.add_argument('glb'); ap.add_argument('out'); ap.add_argument('--debug')
    a = ap.parse_args(); c = CFG[a.animal]
    J, BIN, P, N, UV, F = load(a.glb)
    # ---- decimate in one pass
    _, first, inv = np.unique(np.round(P, 4), axis=0, return_index=True, return_inverse=True); inv = inv.reshape(-1)
    WF = inv[F]; WF = WF[(WF[:, 0] != WF[:, 1]) & (WF[:, 1] != WF[:, 2]) & (WF[:, 0] != WF[:, 2])]
    used = np.unique(WF); m = -np.ones(len(first), int); m[used] = np.arange(len(used))
    V2, F2 = fast_simplification.simplify(P[first][used].astype(np.float64), m[WF].astype(np.int64), target_count=c['tris'], agg=5)[:2]
    wid = np.unique(np.round(V2, 5), axis=0, return_inverse=True)[1].reshape(-1); lab = face_components(F2, np.ones(len(F2), bool), wid)
    F2 = F2[np.bincount(lab)[lab] >= 40]
    # ---- uv and normals carried from the original, inside the uv island of the nearest face
    OM = trimesh.Trimesh(P, F, process=False)
    _, isl = connected_components(coo_matrix((np.ones(len(F) * 3), (np.r_[F[:, 0], F[:, 1], F[:, 2]], np.r_[F[:, 1], F[:, 2], F[:, 0]])), shape=(len(P),) * 2), directed=False)
    fisl = isl[F[:, 0]]; cen = V2[F2].mean(1); _, _, tid = trimesh.proximity.closest_point(OM, cen); face_isl = fisl[tid]
    corner = V2[F2].reshape(-1, 3); cuv = np.zeros((len(corner), 2)); cn = np.zeros((len(corner), 3)); cisl = np.repeat(face_isl, 3)
    for k in np.unique(cisl):
        sel = np.where(cisl == k)[0]; sub = trimesh.Trimesh(P, F[fisl == k], process=False); fid = np.where(fisl == k)[0]
        cp, _, t = trimesh.proximity.closest_point(sub, corner[sel]); tri = F[fid[t]]; bc = trimesh.triangles.points_to_barycentric(P[tri], cp)
        cuv[sel] = (UV[tri] * bc[:, :, None]).sum(1); cn[sel] = (N[tri] * bc[:, :, None]).sum(1)
    cn /= np.linalg.norm(cn, axis=1, keepdims=True) + 1e-9
    cr = corner.reshape(-1, 3, 3); Cc = cr.mean(1)
    part = classify(Cc, c)
    # slivers from decimation, long and thin
    e = np.stack([np.linalg.norm(cr[:, 0] - cr[:, 1], axis=1), np.linalg.norm(cr[:, 1] - cr[:, 2], axis=1), np.linalg.norm(cr[:, 2] - cr[:, 0], axis=1)], 1).max(1)
    A = 0.5 * np.linalg.norm(np.cross(cr[:, 1] - cr[:, 0], cr[:, 2] - cr[:, 0]), axis=1); sliver = (e > 0.1) & (e * e / (2 * A + 1e-12) > 14)
    part[sliver] = 'drop'
    names = sorted(set(part) - {'drop'})
    import collections; print(dict(collections.Counter(part)))
    if a.debug:
        import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
        cm = plt.get_cmap('tab20'); col = {n: cm(i % 20) for i, n in enumerate(names)}
        fig, ax = plt.subplots(1, 2, figsize=(18, 7)); s = np.arange(0, len(Cc), 1)
        for k, (i, j) in enumerate(((2, 1), (0, 2))):
            ax[k].scatter(Cc[s, i], Cc[s, j], s=3, c=[col.get(part[q], (0, 0, 0, 1)) for q in s]); ax[k].set_aspect('equal'); ax[k].grid(alpha=.3)
        for n in names: ax[0].scatter([], [], c=[col[n]], label=n)
        ax[0].legend(fontsize=6, ncol=2); plt.tight_layout(); plt.savefig(a.debug, dpi=45)
    FACES = {n: np.where(part == n)[0] for n in names}
    legs = sorted({n[:5] for n in names if n.startswith('leg')})
    need = 2 if c['zmid'] is None else 4
    assert len(legs) == need, 'found legs %s' % legs
    Z = np.zeros(3)
    def vp(n): return V2[np.unique(F2[FACES[n]])]
    # ---- pivots
    Ct = vp('torso').mean(0); PIV = {'torso': np.array([0.0, Ct[1], Ct[2]])}; PAR = {}
    ground = max(vp(l + 'f')[:, 1].min() for l in legs)      # the shortest leg decides the ground height
    LEG = {}; GY = {}
    for l in legs:
        up, sh, ft = vp(l), vp(l + 't'), vp(l + 'f')
        top = up[up[:, 1] >= np.quantile(up[:, 1], 0.9)]; hip = top.mean(0); hip[1] += 0.06
        kn = np.array([sh[:, 0].mean(), sh[sh[:, 1] >= np.quantile(sh[:, 1], 0.9)][:, 1].mean(), sh[:, 2].mean()])
        an = np.array([ft[:, 0].mean(), ft[ft[:, 1] >= np.quantile(ft[:, 1], 0.9)][:, 1].mean(), ft[:, 2].mean()])
        PIV[l] = hip; PIV[l + 't'] = kn; PIV[l + 'f'] = an; PAR[l] = 'torso'; PAR[l + 't'] = l; PAR[l + 'f'] = l + 't'
        sole = ft[np.argmin(ft[:, 1])]; GY[l] = float(sole[1])      # this leg's own ground: Meshy draws the four feet a little differently
        LEG[l] = dict(gy=GY[l], hip=hip, f=kn - hip, a=an - hip, cf=sole - an, vf=np.vstack([V2[F2[FACES[l]]].reshape(-1, 3)]) - hip,
                      vt=V2[F2[FACES[l + 't']]].reshape(-1, 3) - hip, vo=V2[F2[FACES[l + 'f']]].reshape(-1, 3) - hip)
    if 'head' in FACES:
        h = vp('head'); PIV['head'] = h[h[:, 2] <= np.quantile(h[:, 2], 0.06)].mean(0); PAR['head'] = 'torso'
    if 'tail' in FACES:
        t_ = vp('tail'); PIV['tail'] = t_[t_[:, 2] >= np.quantile(t_[:, 2], 0.94)].mean(0); PAR['tail'] = 'torso'
    # ---- overlap the joins: a band of each neighbour's faces is carried in the part so no seam opens when a joint turns
    SNAP = {k: v.copy() for k, v in FACES.items()}; ADD = {}
    def overlap(p, q, band):
        if p not in SNAP or q not in SNAP: return
        fp, fq = SNAP[p], SNAP[q]; tp, tq = cKDTree(Cc[fp]), cKDTree(Cc[fq])
        ADD.setdefault(q, []).append(fp[tq.query(Cc[fp])[0] < band]); ADD.setdefault(p, []).append(fq[tp.query(Cc[fq])[0] < band])
    for l in legs: overlap('torso', l, 0.035); overlap(l, l + 't', 0.03); overlap(l + 't', l + 'f', 0.025)
    overlap('torso', 'head', 0.03); overlap('torso', 'tail', 0.03)
    for k, v in ADD.items(): FACES[k] = np.unique(np.concatenate([FACES[k]] + v))
    ORDER = ['torso'] + [n for n in ('head', 'tail') if n in FACES] + [x for l in legs for x in (l, l + 't', l + 'f')]
    # the head's own yaw: Meshy often turns it a little; the clips carry the correction so it faces +z at rest
    HEADYAW = 0.0
    if 'head' in PIV:
        hv = vp('head'); hc = hv[hv[:, 2] >= np.quantile(hv[:, 2], 0.8)].mean(0) - PIV['head']
        HEADYAW = float(np.clip(-np.arctan2(hc[0], hc[2]), -0.6, 0.6)); print('head yaw correction %.2f rad' % HEADYAW)
    # ---- IK
    X = np.array([1., 0, 0]); Zv = np.array([0, 0, 1.])
    def Rax(u, ang):
        u = np.asarray(u, float); u = u / np.linalg.norm(u); K = np.array([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]]); return np.eye(3) + np.sin(ang) * K + (1 - np.cos(ang)) * K @ K
    def fk(g, th): return Rax(X, th[0]) @ Rax(Zv, th[1]) @ (g['f'] + Rax(X, th[2]) @ (g['a'] - g['f']))
    LO, HI = np.array([-0.7, -0.3, -0.05]), np.array([0.7, 0.3, 2.0])
    def solve1(g, tgt, th):
        for _ in range(40):
            err = tgt - fk(g, th)
            if np.linalg.norm(err) < 1e-6: break
            Jm = np.zeros((3, 3))
            for k in range(3): d = th.copy(); d[k] += 1e-4; Jm[:, k] = (fk(g, d) - fk(g, th)) / 1e-4
            th = np.clip(th + Jm.T @ np.linalg.solve(Jm @ Jm.T + 1e-4 * np.eye(3), err), LO, HI)
        return th, np.linalg.norm(tgt - fk(g, th))
    def solve(g, tgt, th):
        cand = [solve1(g, tgt, s0) for s0 in (th, np.array([th[0], 0, 0.1]), np.array([th[0], 0, 0.4]), np.array([th[0], 0, 0.8]))]
        ok = [q for q in cand if q[1] < 1e-3]
        return min(ok, key=lambda q: np.linalg.norm(q[0] - th)) if ok else min(cand, key=lambda q: q[1])
    N_WALK, DUTY = 36, 0.6
    LIFT = 0.1 * float(np.mean([np.linalg.norm(g['a']) for g in LEG.values()]))      # a hoof clears the ground by about a tenth of the leg
    T_WALK = 1.6 if need == 4 else 1.0
    BOB = lambda ph: 0.004 * np.sin(2 * ph)
    GROUP_B = {l for l in legs if (l[3] == 'L') == (l[4] == 'R')}   # a trot: front-left with hind-right, front-right with hind-left (hen: L with R alternate)
    if need == 2: GROUP_B = {l for l in legs if l.endswith('R')}
    else: GROUP_B = {l for l in legs if (l[3] == '0') == (l[4] == 'R') or (l[3] == '1') == (l[4] == 'L') and False}
    if need == 4: GROUP_B = {'leg0L', 'leg1R'}
    def foot_path(g, u, pull, stride, off):
        f0 = g['hip'] + g['a'] + g['cf']; f0 = np.array([f0[0], f0[1], f0[2] * pull + g['hip'][2] * (1 - pull)])
        gl = g['gy']
        if u < DUTY: z = f0[2] + stride / 2 - stride * (u / DUTY); y = gl + off
        else: sw = (u - DUTY) / (1 - DUTY); z = f0[2] - stride / 2 + stride * (0.5 - 0.5 * np.cos(np.pi * sw)); y = gl + off + LIFT * np.sin(np.pi * sw)
        return np.array([f0[0], y, z])
    def lowest(g, th, crouch, ph):
        R12 = Rax(X, th[0]) @ Rax(Zv, th[1]); R3 = Rax(X, th[2]); ank = fk(g, th)
        loc = np.vstack([(R12 @ g['vf'].T).T, (R12 @ (g['f'] + (R3 @ (g['vt'] - g['f']).T).T).T).T, ank + (g['vo'] - g['a'])]) + g['hip']
        return float(loc[:, 1].min() + BOB(ph) - crouch)
    def run(l, g, crouch, stride, pull):
        th = np.zeros(3); res = {}; worst = 0.0
        for rep in range(2):
            for k in range(N_WALK):
                ph = 2 * np.pi * k / N_WALK; u = (k / N_WALK + (0.5 if l in GROUP_B else 0)) % 1.0
                W = foot_path(g, u, pull, stride, 0.0); local = W - np.array([0, BOB(ph) - crouch, 0]) - g['hip'] - g['cf']; th, err = solve(g, local, th)
                if rep == 1: res[k] = th.copy(); worst = max(worst, err)
        return res, worst
    for l, g in LEG.items(): print('  %s hip %s knee %s ankle %s sole %s' % (l, np.round(g['hip'], 2).tolist(), np.round(g['f'], 2).tolist(), np.round(g['a'], 2).tolist(), np.round(g['cf'], 2).tolist()))
    leglen = np.mean([np.linalg.norm(g['f']) + np.linalg.norm(g['a'] - g['f']) for g in LEG.values()])
    WALK = None
    for mult in (1.0, 0.8, 0.6, 0.45, 0.3, 0.2):
        stride = c['stride'] * mult
        for crouch in np.linspace(0.0, 0.3, 9) * leglen:
            tmp = {}; ok = True
            for l, g in LEG.items():
                for pull in (1.0, 0.9, 0.8):
                    res, worst = run(l, g, crouch, stride, pull)
                    pen = max(0.0, g['gy'] - min(lowest(g, res[k], crouch, 2 * np.pi * k / N_WALK) for k in range(N_WALK)))
                    if worst < 0.004 and pen < 0.0005: break
                else:
                    if mult == 1.0 and crouch == 0.0: print('   fail', l, 'worst %.3f pen %.4f' % (worst, pen))
                    ok = False; break
                if worst >= 0.004 or pen >= 0.0005: ok = False; break
                tmp[l] = res
            if ok: WALK = tmp; CROUCH = crouch; STRIDE = stride; break
        if WALK: break
    if not WALK:
        for l, g in LEG.items():
            for crouch in (0.0, 0.03, 0.06):
                res, worst = run(l, g, crouch, c['stride'] * 0.2, 1.0)
                pen = max(0.0, g['gy'] - min(lowest(g, res[k], crouch, 2 * np.pi * k / N_WALK) for k in range(N_WALK)))
                print('   diag', l, 'crouch', crouch, 'worst %.4f pen %.4f' % (worst, pen))
        g0 = LEG[legs[0]]
        for dy in (0.0, 0.03, 0.06, 0.1):
            for dz in (-0.1, 0.0, 0.1):
                tg = g0['a'] + np.array([0, dy, dz]); th, er = solve(g0, tg, np.zeros(3)); print('   target raise', dy, 'dz', dz, 'err %.4f' % er, 'theta', np.round(th, 2).tolist())
        l = legs[0]; g = LEG[l]
        for st in (0.05, 0.15):
            for cr_ in (0.0, 0.05, 0.1):
                res, worst = run(l, g, cr_, st, 1.0); print('   probe stride', st, 'crouch', cr_, 'worst', round(worst, 4), 'lift', round(LIFT, 3))
    assert WALK, 'no stride plants every foot'
    SPEED = STRIDE / (DUTY * T_WALK); print('walk: ground %.3f stride %.3f (of %.3f) crouch %.4f speed %.3f' % (ground, STRIDE, c['stride'], CROUCH, SPEED))
    # ---- glTF
    blob = bytearray(); BV = []; AC = []
    def add_bv(data, target=None):
        while len(blob) % 4: blob.append(0)
        bv = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(data)}
        if target: bv['target'] = target
        blob.extend(data); BV.append(bv); return len(BV) - 1
    def add_acc(arr, typ, ct, target, mm=False):
        ac = {'bufferView': add_bv(arr.tobytes(), target), 'componentType': ct, 'count': len(arr), 'type': typ}
        if mm: ac['min'] = np.atleast_1d(arr.min(0)).tolist(); ac['max'] = np.atleast_1d(arr.max(0)).tolist()
        AC.append(ac); return len(AC) - 1
    imgs = []
    for im in J['images']:
        v = J['bufferViews'][im['bufferView']]; imgs.append({'mimeType': im['mimeType'], 'bufferView': add_bv(BIN[v['byteOffset']:v['byteOffset'] + v['byteLength']])})
    meshes, nodes, idx = [], [{'name': 'creature', 'children': [1]}, {'name': 'rig', 'children': []}], {'rig': 1}
    for n in ORDER:
        ci = np.concatenate([np.arange(f * 3, f * 3 + 3) for f in FACES[n]]); pos = corner[ci] - PIV[n]; nrm = cn[ci]; uv = cuv[ci]
        key = np.round(np.c_[pos, uv, nrm], 5); _, fi, iv = np.unique(key, axis=0, return_index=True, return_inverse=True); iv = iv.reshape(-1)
        pa = add_acc(pos[fi].astype('<f4'), 'VEC3', 5126, 34962, True); na = add_acc(nrm[fi].astype('<f4'), 'VEC3', 5126, 34962)
        ua = add_acc(uv[fi].astype('<f4'), 'VEC2', 5126, 34962); ia = add_acc(iv.astype('<u4'), 'SCALAR', 5125, 34963)
        meshes.append({'name': n, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'TEXCOORD_0': ua}, 'indices': ia, 'mode': 4, 'material': 0}]})
        par = PAR.get(n, 'rig'); idx[n] = len(nodes); base = PIV[par] if par in PIV else np.zeros(3)
        nodes.append({'name': n, 'mesh': len(meshes) - 1, 'translation': [float(q) for q in (PIV[n] - base)]})
    kids = {}
    for n in ORDER: kids.setdefault(PAR.get(n, 'rig'), []).append(idx[n])
    for p, ks in kids.items(): nodes[idx[p]]['children'] = ks
    # the torso hangs off rig at its own pivot (rig is at the origin), so a translation on rig bobs everything
    QI = np.array([0, 0, 0, 1.0])
    def qm(p, q):
        x1, y1, z1, w1 = p; x2, y2, z2, w2 = q
        return np.array([w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2, w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2, w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2, w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2])
    def qa(ax, ang): q = np.zeros(4); q[:3] = np.asarray(ax, float) * np.sin(ang / 2); q[3] = np.cos(ang / 2); return q
    def clip(nm, T, fn, n=24, rigT=None, extras=None):
        t = (np.arange(n + 1) / n * T).astype('<f4'); sam, ch = [], []
        for k_ in ORDER:
            q = np.array([fn(k_, 2 * np.pi * k / n) for k in range(n + 1)], '<f4')
            if np.allclose(q, QI, atol=1e-6): continue
            ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(q, 'VEC4', 5126, None)
            sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[k_], 'path': 'rotation'}})
        if rigT is not None:
            tr = np.array([rigT(2 * np.pi * k / n) for k in range(n + 1)], '<f4'); ti = add_acc(t, 'SCALAR', 5126, None, True); qi = add_acc(tr, 'VEC3', 5126, None)
            sam.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx['rig'], 'path': 'translation'}})
        d = {'name': nm, 'samplers': sam, 'channels': ch}
        if extras: d['extras'] = extras
        return d
    def perch(nm, ph):
        if nm == 'head': return qm(qa([0, 1, 0], HEADYAW + 0.05 * np.sin(ph * 0.5 + 0.7)), qa(X, 0.03 * np.sin(ph)))
        if nm == 'tail': return qa([0, 1, 0], 0.12 * np.sin(ph + 1))
        return QI
    def graze(nm, ph):
        if nm == 'head': return qm(qa([0, 1, 0], HEADYAW), qa(X, (0.7 + 0.1 * np.sin(2 * ph)) if need == 4 else 0.55 * max(0.0, np.sin(2 * ph))))
        if nm == 'tail': return qa([0, 1, 0], 0.15 * np.sin(ph + 1))
        return QI
    def walk(nm, ph):
        k = int(round(ph / (2 * np.pi) * N_WALK)) % N_WALK
        if nm.startswith('leg') and nm.endswith('f'):
            th = WALK[nm[:5]][k]; qt = qm(qm(qa(X, th[0]), qa(Zv, th[1])), qa(X, th[2])); return np.array([-qt[0], -qt[1], -qt[2], qt[3]])
        if nm.startswith('leg') and nm.endswith('t'): return qa(X, WALK[nm[:5]][k][2])
        if nm.startswith('leg'): th = WALK[nm][k]; return qm(qa(X, th[0]), qa(Zv, th[1]))
        if nm == 'head': return qm(qa([0, 1, 0], HEADYAW), qa(X, (0.05 if need == 4 else 0.12) * np.sin(2 * ph)))
        if nm == 'tail': return qa([0, 1, 0], 0.18 * np.sin(ph - 0.5))
        return QI
    anims = [clip('perch', 4.0, perch), clip('graze', 3.0, graze),
             clip('walk', T_WALK, walk, n=N_WALK, rigT=lambda ph: [0.0, BOB(ph) - CROUCH, 0.0],
                  extras={'speed': SPEED, 'stride': STRIDE, 'duty': DUTY, 'ground': float(ground), 'legGround': {k: v for k, v in GY.items()}, 'crouch': float(CROUCH), 'note': 'walk in place; drive the root forward at "speed" units per second'})]
    tris = sum(len(FACES[n]) for n in ORDER)
    out = {'asset': {'version': '2.0', 'generator': 'meshy + qmodel.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': nodes, 'meshes': meshes, 'materials': J['materials'],
           'textures': J['textures'], 'images': imgs, 'samplers': J['samplers'], 'bufferViews': BV, 'accessors': AC, 'animations': anims, 'buffers': [{'byteLength': len(blob)}]}
    js = json.dumps(out, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    while len(blob) % 4: blob.append(0)
    open(a.out, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob))
    print('wrote', a.out, tris, 'tris')


if __name__ == '__main__':
    main()
