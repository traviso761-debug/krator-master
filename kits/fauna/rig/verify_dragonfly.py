"""Independent check: evaluate the exported GLB's walk clip and measure how far each foot slides on the ground while in stance."""
import json, struct, sys, numpy as np
b = open(sys.argv[1], 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); BIN = b[20 + n + 8:]
def acc(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; c = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dt = {5126: '<f4', 5125: '<u4'}[a['componentType']]; return np.frombuffer(BIN, dt, a['count'] * c, v['byteOffset']).reshape(-1, c)
def qmat(q):
    x, y, z, w = q; return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
nodes = J['nodes']; parent = {}
for i, nd in enumerate(nodes):
    for c in nd.get('children', []): parent[c] = i
walk = [a for a in J['animations'] if a['name'] == 'walk'][0]; ex = walk['extras']; ch = {}
for c in walk['channels']:
    s = walk['samplers'][c['sampler']]; ch[(c['target']['node'], c['target']['path'])] = (acc(s['input']).reshape(-1), acc(s['output']))
T = ch[(1, 'rotation')][0] if (1, 'rotation') in ch else list(ch.values())[0][0]; nk = len(T)
def world(i, k):
    M = np.eye(4); chain = []
    while i is not None: chain.append(i); i = parent.get(i)
    for j in reversed(chain):
        nd = nodes[j]; t = np.array(nd.get('translation', [0, 0, 0]), float); R = np.eye(3)
        if (j, 'translation') in ch: t = ch[(j, 'translation')][1][k].astype(float)
        if (j, 'rotation') in ch: R = qmat(ch[(j, 'rotation')][1][k].astype(float))
        L = np.eye(4); L[:3, :3] = R; L[:3, 3] = t; M = M @ L
    return M
names = {nd['name']: i for i, nd in enumerate(nodes)}
worst = 0.0
for leg in ('leg0R', 'leg0L', 'leg1R', 'leg1L', 'leg2R', 'leg2L'):
    ti = names[leg + 't']; pa = J['meshes'][nodes[ti]['mesh']]['primitives'][0]['attributes']['POSITION']; P = acc(pa)
    tip = P[np.argmax(np.linalg.norm(P, axis=1))].astype(float)
    pts = []
    for k in range(nk - 1):
        w = world(ti, k) @ np.r_[tip, 1]; pts.append([w[0], w[1], w[2] + ex['speed'] * T[k]])   # ground-fixed z = body z + speed * t
    pts = np.array(pts); stance = pts[:, 1] < ex['ground'] + ex['legOffset'][leg] + 0.003
    per = ex['speed'] * (T[-1] - T[0]); z = pts[:, 2].copy(); z[stance] = np.unwrap(z[stance], period=per) if stance.any() else z[stance]; pts[:, 2] = z
    sp = pts[stance]; drift = np.ptp(sp[:, 2]) if len(sp) else 0; worst = max(worst, drift)
    if not len(sp): print(leg, 'NEVER TOUCHES THE GROUND'); continue
    print('%s: %2d of %d frames on the ground, slide %.4f units (x %.4f, y %.4f)' % (leg, stance.sum(), nk - 1, drift, np.ptp(sp[:, 0]), np.ptp(sp[:, 1])))
print('worst slide', round(worst, 4), 'units = %.1f%% of a stride' % (100 * worst / ex['stride']))

# ---- penetration: the lowest vertex of each leg (both halves) over the whole clip, against the ground plane
print('--- lowest point of each leg vs ground (ground y = %.4f); negative = through the floor' % ex['ground'])
for leg in ('leg0R', 'leg0L', 'leg1R', 'leg1L', 'leg2R', 'leg2L'):
    lo = 9.0
    for nm in (leg, leg + 't'):
        ni = names[nm]; P = acc(J['meshes'][nodes[ni]['mesh']]['primitives'][0]['attributes']['POSITION']).astype(float); Ph = np.c_[P, np.ones(len(P))]
        for k in range(nk - 1): lo = min(lo, (Ph @ world(ni, k).T)[:, 1].min())
    print('%s: lowest %.4f  -> %.4f below the ground' % (leg, lo, ex['ground'] - lo) if lo < ex['ground'] else '%s: lowest %.4f  ok' % (leg, lo))
