"""A tentative draft of the Ancients' highway network on the Krator Scale Model (openworld/ANCIENT-ROADS.md).

    python3 tools/scale-model/ancient_roads.py <page.html> <regions dir> <settlements dir> <out dir>

Least cost on the model's own height grid (~4 km cells) with the Ancient profile (a 4 % ruling grade, tunnels where a
climb would cost more, the airless rim only in tunnel, bridges and causeways over water); the nodes are every arcology,
ruined arcology, ruin and Ancient cavern in the settlements collection, and the cities on Ancient ground (EXTRA). The
network is a relative-neighbourhood graph over the route costs, with the owner's rules (Xanadu's line ends at
Strongbow). Each vertex is given its upkeep from the political polygons. Writes ancient-roads-draft.json and
ancient-roads-draft.jpg in <out dir>. Deterministic. A draft for the owner: the settlements are to be reworked first.
<regions dir> and <settlements dir> are as extract_region.py's (a folder of one JSON file per document)."""
import sys, json, glob, io, base64, math, os
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra, minimum_spanning_tree, connected_components
from PIL import Image, ImageDraw, ImageFont
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_region import load_page, raster

if len(sys.argv) != 5:
    sys.exit(__doc__)
PAGE, RDIR, SDIR, OUT = sys.argv[1:]
os.makedirs(OUT, exist_ok=True)
D = load_page(PAGE)
OW, OH, VW, VH, lo, hi = D['fullW'], D['fullH'], D['w'], D['hh'], D['lo'], D['hi']
h = raster(D, 'h')
E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535 * (hi - lo)
W = h[..., 2] > 127
su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
CELL = 2.0 / su            # km per height cell (~4 km)

# ---- the cost of a step (the Ancient profile)
G, TUN, WATER = 0.04, 6.0, 8.0
idx = np.arange(VW * VH).reshape(VH, VW)
rows, cols, cost = [], [], []
for dj, di in ((0, 1), (1, 0), (1, 1), (1, -1)):
    a = idx[max(0, -dj):VH - max(0, dj), max(0, -di):VW - max(0, di)]
    b = idx[max(0, dj):VH + min(0, dj) or None, max(0, di):VW + min(0, di) or None]
    ea, eb = E.flat[a.ravel()], E.flat[b.ravel()]
    wa, wb = W.flat[a.ravel()], W.flat[b.ravel()]
    d = CELL * math.hypot(dj, di)
    g = np.abs(eb - ea) / (d * 1000)
    surf = d * (1 + 0.5 * (g / G) ** 2)
    surf[(ea > 9000) | (eb > 9000)] = np.inf          # nothing breathes on the airless rim: only in tunnel
    tun = np.full_like(surf, d * TUN)
    c = np.minimum(surf, tun)
    wat = wa | wb
    c[wat] = d * WATER                                  # a bridge or causeway
    rows += [a.ravel(), b.ravel()]; cols += [b.ravel(), a.ravel()]; cost += [c, c]
rows = np.concatenate(rows); cols = np.concatenate(cols); cost = np.concatenate(cost)
GR = coo_matrix((cost, (rows, cols)), shape=(VW * VH, VW * VH)).tocsr()
def step_kind(p, q):
    ea, eb = E.flat[p], E.flat[q]
    if W.flat[p] or W.flat[q]:
        return 2
    d = CELL * math.hypot((q % VW) - (p % VW), (q // VW) - (p // VW))
    surf = d * (1 + 0.5 * ((abs(eb - ea) / (d * 1000)) / G) ** 2)
    if ea > 9000 or eb > 9000 or d * TUN < surf:
        return 1
    return 0

# ---- nodes
S = [json.load(open(f, encoding='utf8')) for f in glob.glob(os.path.join(SDIR, '*.json'))]
ANC_TYPES = ('arcology', 'ruined arcology', 'ruin', 'cavern')
EXTRA = ('Hook', 'Iziz', 'Yuni', 'Ys', 'Dalab', 'Roketstad', 'Verge')
SKIP = ('Dhelv',)          # the Zeijani's carved city, not an Ancient site
nodes = [s for s in S if (s['type'] in ANC_TYPES or s['name'] in EXTRA) and s['name'] not in SKIP]
nodes.sort(key=lambda s: s['name'])
def cell(s):
    i, j = int(round(s['px'] * su)), int(round(s['py'] * sv))
    return j * VW + i
src = [cell(s) for s in nodes]
names = [s['name'] for s in nodes]
N = len(nodes)
print(N, 'nodes')

dist = dijkstra(GR, indices=src, directed=False)
C = dist[:, src]
# ---- the network: a relative-neighbourhood graph over the costs, Strongbow the end of Xanadu's line
SB = names.index('Strongbow')
edges = set()
for i in range(N):
    for j in range(i + 1, N):
        if SB in (i, j) or not np.isfinite(C[i, j]):
            continue
        if not any(max(C[i, k], C[k, j]) < C[i, j] for k in range(N) if k not in (i, j, SB)):
            edges.add((i, j))
others = [k for k in range(N) if k != SB]
xan = [names.index(n) for n in ('Erehwon', 'Theodiga') if n in names]
# Xanadu's short line ends at Strongbow: Strongbow joins Theodiga only, and nothing runs on east from Xanadu
edges.add(tuple(sorted((SB, names.index('Theodiga')))))
for ban in (('Stair', 'Theodiga'),):
    edges.discard(tuple(sorted((names.index(ban[0]), names.index(ban[1])))))
# connect anything left apart (minimum spanning tree over the components)
A = np.zeros((N, N))
for i, j in edges: A[i, j] = A[j, i] = 1
ncomp, lab = connected_components(A, directed=False)
if ncomp > 1:
    CC = np.where(np.isfinite(C), C, 0).copy()
    CC[SB, :] = 0; CC[:, SB] = 0                       # never through Strongbow
    ti, si = names.index('Theodiga'), names.index('Stair'); CC[ti, si] = CC[si, ti] = 0
    T = minimum_spanning_tree(CC).toarray()
    for i, j in zip(*np.nonzero(T)):
        if lab[i] != lab[j]:
            edges.add(tuple(sorted((int(i), int(j)))))

# ---- trace each edge's route
routes = []
for i, j in sorted(edges):
    d_, pred = dijkstra(GR, indices=src[i], directed=False, return_predecessors=True)
    path = [src[j]]
    while path[-1] != src[i] and pred[path[-1]] >= 0:
        path.append(int(pred[path[-1]]))
    path = path[::-1]
    segk = [step_kind(path[k], path[k + 1]) for k in range(len(path) - 1)]
    pts = [[(p % VW) / su, (p // VW) / sv] for p in path]
    L = sum(CELL * math.hypot((path[k + 1] % VW) - (path[k] % VW), (path[k + 1] // VW) - (path[k] // VW)) for k in range(len(path) - 1))
    tl = sum(CELL * math.hypot((path[k + 1] % VW) - (path[k] % VW), (path[k + 1] // VW) - (path[k] // VW)) for k in range(len(path) - 1) if segk[k] == 1)
    routes.append({'from': names[i], 'to': names[j], 'cost': float(C[i, j]), 'km': round(L), 'tunnel_km': round(tl), 'px': pts, 'seg': segk})

# ---- upkeep by sphere (the political polygons; the smallest that holds a point wins)
R = {}
for f in glob.glob(os.path.join(RDIR, '*.json')):
    d = json.load(open(f, encoding='utf8')); R[d['name']] = d
UPKEEP = {'Empire of Iziz': 'kept', 'Vothic Kingdom': 'kept', 'Iron Republic': 'kept', 'The Cut': 'kept', 'Eternal State': 'kept',
          'Yuni Emirate': 'partly', 'Xanadu Sultanate': 'partly',
          'Jimjam': 'lapsed', 'League of Amphitriton': 'lapsed', 'Scyvoi': 'lapsed', 'Beast Riders': 'lapsed', 'Dalab Council': 'lapsed',
          's highlands': 'lapsed', 'sw highlands': 'lapsed', 'e inner wall': 'lapsed'}
masks = []
for n, u in UPKEEP.items():
    if n not in R: print('no region', n); continue
    im = Image.new('L', (OW, OH), 0); ImageDraw.Draw(im).polygon([tuple(p) for p in R[n]['points']], fill=1)
    m = np.array(im).astype(bool); masks.append((int(m.sum()), u, m))
masks.sort(key=lambda t: t[0])
def upkeep(x, y):
    x, y = int(round(x)), int(round(y))
    for _, u, m in masks:
        if 0 <= y < OH and 0 <= x < OW and m[y, x]:
            return u
    return 'decayed'
for r in routes:
    r['upkeep'] = [upkeep(x, y) for x, y in r['px']]

json.dump({'nodes': [{'name': s['name'], 'type': s['type'], 'px': [s['px'], s['py']]} for s in nodes], 'routes': routes},
          open(os.path.join(OUT, 'ancient-roads-draft.json'), 'w', encoding='utf-8', newline='\n'), indent=0)

# ---- the picture
t = Image.open(io.BytesIO(base64.b64decode(D['t']))).convert('RGB').resize((OW, OH))
t = Image.blend(t, Image.new('RGB', t.size, (20, 20, 24)), 0.35)
dr = ImageDraw.Draw(t)
COL = {'kept': (60, 200, 90), 'partly': (230, 200, 60), 'lapsed': (240, 140, 40), 'decayed': (210, 60, 50)}
for r in routes:
    p = r['px']
    for k in range(len(p) - 1):
        a, b = tuple(p[k]), tuple(p[k + 1])
        if r['seg'][k] == 1:
            dr.line([a, b], fill=(190, 110, 255), width=5)
        elif r['seg'][k] == 2:
            dr.line([a, b], fill=(120, 200, 255), width=4)
        else:
            dr.line([a, b], fill=COL[r['upkeep'][k]], width=4)
try:
    font = ImageFont.truetype('arial.ttf', 15)
except Exception:
    font = None
for s in nodes:
    x, y = s['px'], s['py']
    r_ = 7 if s['type'] in ('arcology', 'city') else 5
    fill = (255, 255, 255) if s['type'] in ('arcology', 'city') else (200, 200, 200)
    dr.ellipse([x - r_, y - r_, x + r_, y + r_], fill=fill, outline=(0, 0, 0), width=2)
    dr.text((x + 9, y - 8), s['name'], fill=(255, 255, 255), font=font, stroke_width=2, stroke_fill=(0, 0, 0))
leg = [('kept up', COL['kept']), ('partly kept', COL['partly']), ('lapsed since the Empire', COL['lapsed']), ('badly decayed', COL['decayed']),
       ('tunnel', (190, 110, 255)), ('bridge / causeway', (120, 200, 255))]
y0 = OH - 30 * len(leg) - 20
dr.rectangle([10, y0 - 10, 330, OH - 10], fill=(20, 20, 24))
for k, (n, c) in enumerate(leg):
    dr.line([(25, y0 + 30 * k + 10), (75, y0 + 30 * k + 10)], fill=c, width=6)
    dr.text((90, y0 + 30 * k), n, fill=(255, 255, 255), font=font)
dr.text((12, 10), 'Ancient highways: a tentative draft (scale model 4.21, 2026-10-23)', fill=(255, 255, 255), font=font, stroke_width=2, stroke_fill=(0, 0, 0))
t.save(os.path.join(OUT, 'ancient-roads-draft.jpg'), quality=88)

tot = sum(r['km'] for r in routes); tt = sum(r['tunnel_km'] for r in routes)
print(f'{len(routes)} routes, {tot} km, {tt} km in tunnel')
for r in sorted(routes, key=lambda r: -r['tunnel_km'])[:12]:
    print(f"  {r['from']:>12} - {r['to']:<12} {r['km']:>5} km, tunnel {r['tunnel_km']:>4} km")
deg = {}
for r in routes:
    deg[r['from']] = deg.get(r['from'], 0) + 1; deg[r['to']] = deg.get(r['to'], 0) + 1
print('degree:', sorted(deg.items(), key=lambda x: -x[1])[:10])
for nm in ('Verge', 'Iziz', 'Hook', 'Ys', 'Yuni', 'Theodiga', 'Stair', 'Roketstad', 'Strongbow', 'Ledge', 'Dalab', 'Cube', 'Pluton', 'Babel', 'Dorado', 'Agropolis', 'Cascade'):
    print(' ', nm, [r['to'] if r['from'] == nm else r['from'] for r in routes if nm in (r['from'], r['to'])])
from collections import Counter
cnt = Counter(u for r in routes for u in r['upkeep'][:-1])
print('upkeep share of vertices:', {k: round(v / sum(cnt.values()), 2) for k, v in cnt.items()})
