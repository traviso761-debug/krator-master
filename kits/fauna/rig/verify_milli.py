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
        if (j, 'rotation') in ch: R = qmat(ch[(j, 'rotation')][1][k].astype(float))
        L = np.eye(4); L[:3, :3] = R; L[:3, 3] = t; M = M @ L
    return M
def mesh(nm): return acc(J['meshes'][nodes[names[nm]]['mesh']]['primitives'][0]['attributes']['POSITION']).astype(float)
G = ex['ground']; per = ex['speed'] * (T[-1] - T[0]); worst = 0.0; low = 9; res = []
for nm in sorted((x for x in names if x.startswith('leg')), key=lambda s: int(s[3:])):
    P = mesh(nm); Ph = np.c_[P, np.ones(len(P))]; ni = names[nm]
    ymin = [(Ph @ world(ni, k).T)[:, 1].min() for k in range(nk - 1)]; kst = int(np.argmin(ymin)); tip = P[np.argmin((Ph @ world(ni, kst).T)[:, 1])]   # the vertex that touches the floor
    pts = []; lo = 9
    for k in range(nk - 1):
        M = world(ni, k); w = M @ np.r_[tip, 1]; pts.append([w[0], w[1], w[2] + ex['speed'] * T[k]]); lo = min(lo, (Ph @ M.T)[:, 1].min())
    pts = np.array(pts); st = pts[:, 1] < G + 0.002; z = pts[:, 2].copy()
    if st.any(): z[st] = np.unwrap(z[st], period=per)
    d = np.ptp(z[st]) if st.any() else float('nan'); worst = max(worst, d); low = min(low, lo); res.append((nm, st.sum(), d))
print(sys.argv[1], 'legs', len(res), 'ground %.4f stride %.3f' % (G, ex['stride']))
print('  frames planted per leg: min %d max %d of %d' % (min(r[1] for r in res), max(r[1] for r in res), nk - 1))
print('  worst slide %.4f = %.1f%% of a stride; lowest vertex of any leg %.4f (%s)' % (worst, 100 * worst / ex['stride'], low, 'ok' if low >= G - 0.0006 else 'THROUGH THE FLOOR by %.4f' % (G - low)))
