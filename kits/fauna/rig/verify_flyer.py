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
        if (j, 'translation') in ch: t = ch[(j, 'translation')][1][k].astype(float)
        if (j, 'rotation') in ch: R = qmat(ch[(j, 'rotation')][1][k].astype(float))
        L = np.eye(4); L[:3, :3] = R; L[:3, 3] = t; M = M @ L
    return M
def mesh(nm): return acc(J['meshes'][nodes[names[nm]]['mesh']]['primitives'][0]['attributes']['POSITION']).astype(float)
print(sys.argv[1], 'ground %.4f speed %.3f stride %.3f' % (ex['ground'], ex['speed'], ex['stride']))
worst = 0.0; lowest_all = 9
for s in 'RL':
    fo = mesh('foot' + s); tip = fo[np.argmin(fo[:, 1])]; fi = names['foot' + s]
    pts = np.array([(lambda w: [w[0], w[1], w[2] + ex['speed'] * T[k]])(world(fi, k) @ np.r_[tip, 1]) for k in range(nk - 1)])
    stance = pts[:, 1] < ex['ground'] + ex['legOffset'][s] + 0.003
    per = ex['speed'] * (T[-1] - T[0]); z = pts[:, 2].copy()
    if stance.any(): z[stance] = np.unwrap(z[stance], period=per)
    sp = np.c_[pts[:, :2], z][stance]; drift = np.ptp(sp[:, 2]) if len(sp) else float('nan'); worst = max(worst, drift)
    lo = 9.0
    for nm in ('leg' + s, 'legT' + s, 'foot' + s):
        P = mesh(nm); Ph = np.c_[P, np.ones(len(P))]; ni = names[nm]
        for k in range(nk - 1): lo = min(lo, (Ph @ world(ni, k).T)[:, 1].min())
    lowest_all = min(lowest_all, lo)
    print('  %s: %2d of %d frames planted, slide %.4f (x %.4f y %.4f); lowest vertex %.4f %s' % (s, stance.sum(), nk - 1, drift, np.ptp(sp[:, 0]), np.ptp(sp[:, 1]), lo, 'THROUGH THE FLOOR by %.4f' % (ex['ground'] - lo) if lo < ex['ground'] - 0.0005 else 'ok'))
print('  worst slide %.4f = %.1f%% of a stride' % (worst, 100 * worst / ex['stride']))
