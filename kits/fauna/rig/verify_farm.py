"""Read a rigged farm-animal GLB and measure, over its walk clip, how far each foot slides while on the ground and whether any leg
vertex goes below the ground. Usage: verify_farm.py <glb>"""
import json, struct, sys, numpy as np
b = open(sys.argv[1], 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); BIN = b[20 + n + 8:]
def acc(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; c = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    return np.frombuffer(BIN, {5126: '<f4', 5125: '<u4'}[a['componentType']], a['count'] * c, v['byteOffset']).reshape(-1, c)
def qmat(q):
    x, y, z, w = q; return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
nodes = J['nodes']; parent = {c: i for i, nd in enumerate(nodes) for c in nd.get('children', [])}; names = {nd['name']: i for i, nd in enumerate(nodes)}
walk = [a for a in J['animations'] if a['name'] == 'walk'][0]; ex = walk['extras']; ch = {}
for c in walk['channels']:
    s = walk['samplers'][c['sampler']]; ch[(c['target']['node'], c['target']['path'])] = (acc(s['input']).reshape(-1), acc(s['output']))
T = list(ch.values())[0][0]; nk = len(T)
def world(i, k):
    chain = []
    while i is not None: chain.append(i); i = parent.get(i)
    M = np.eye(4)
    for j in reversed(chain):
        nd = nodes[j]; t = np.array(nd.get('translation', [0, 0, 0]), float); R = np.eye(3)
        if (j, 'translation') in ch: t = ch[(j, 'translation')][1][min(k, len(ch[(j, 'translation')][1]) - 1)].astype(float)
        if (j, 'rotation') in ch: R = qmat(ch[(j, 'rotation')][1][k].astype(float))
        L = np.eye(4); L[:3, :3] = R; L[:3, 3] = t; M = M @ L
    return M
def mesh(nm): return acc(J['meshes'][nodes[names[nm]]['mesh']]['primitives'][0]['attributes']['POSITION']).astype(float)
G = ex['ground']; per = ex['speed'] * (T[-1] - T[0]); worst = 0.0; low = 9; rows = []
legs = sorted(x[:5] for x in names if x.startswith('leg') and x.endswith('f'))
for l in legs:
    fo = mesh(l + 'f'); Ph = np.c_[fo, np.ones(len(fo))]; fi = names[l + 'f']
    ymin = [(Ph @ world(fi, k).T)[:, 1].min() for k in range(nk - 1)]; kk = int(np.argmin(ymin)); tip = fo[np.argmin((Ph @ world(fi, kk).T)[:, 1])]
    pts = np.array([(lambda w: [w[0], w[1], w[2] + ex['speed'] * T[k]])(world(fi, k) @ np.r_[tip, 1]) for k in range(nk - 1)])
    Gl = ex.get('legGround', {}).get(l, G); st = pts[:, 1] < Gl + 0.004; z = pts[:, 2].copy()
    if st.any(): z[st] = np.unwrap(z[st], period=per)
    d = np.ptp(z[st]) if st.any() else float('nan'); worst = max(worst, d if d == d else 9)
    lo = 9
    for nm in (l, l + 't', l + 'f'):
        P = mesh(nm); Pp = np.c_[P, np.ones(len(P))]
        for k in range(nk - 1): lo = min(lo, (Pp @ world(names[nm], k).T)[:, 1].min())
    low = min(low, lo - Gl); rows.append((l, int(st.sum()), d))
print(sys.argv[1], 'legs', len(legs), 'ground %.4f stride %.3f' % (G, ex['stride']))
for r in rows: print('  %s planted %2d/%d frames, slide %.4f' % (r[0], r[1], nk - 1, r[2]))
print('  worst slide %.4f = %.1f%% of a stride; lowest leg vertex %.4f below its own ground' % (worst, 100 * worst / ex['stride'], -low if low < 0 else 0.0))
