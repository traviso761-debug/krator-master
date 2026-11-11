"""The proposed Ancient network on scale model 5.1 (scratch, read-only on the model): the owner's answers of 2026-11-11.
python route51.py <scratchpad>   (run from tools/scale-model)"""
import sys, os, json, math
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra, minimum_spanning_tree, connected_components
from PIL import Image, ImageDraw
sys.path.insert(0, os.getcwd())
from smodel.page import load, heights, raster
SP = sys.argv[1]
D = load(); _e = heights(D); E2 = np.asarray(_e[0] if isinstance(_e, tuple) else _e, float)
W2 = raster(D, 'h')[..., 2] > 127
H2, W2w = E2.shape
# ---- a 4 km grid (every 2nd cell), as the drafts ran
F = 2
E = E2[::F, ::F]; W = W2[::F, ::F]; VH, VW = E.shape; CELL = 2.0 * F
G, TUN, WATER, AIR = 0.04, 6.0, 8.0, 8000.0
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
    surf[(ea > AIR) | (eb > AIR)] = np.inf
    c = np.minimum(surf, d * TUN)
    c[wa | wb] = d * WATER
    rows += [a.ravel(), b.ravel()]; cols += [b.ravel(), a.ravel()]; cost += [c, c]
GR = coo_matrix((np.concatenate(cost), (np.concatenate(rows), np.concatenate(cols))), shape=(VW * VH, VW * VH)).tocsr()
def cellof(px, py): return int(round(py / F)) * VW + int(round(px / F))
def pxof(c): return [(c % VW) * F, (c // VW) * F]

# ---- nodes (the owner, 2026-11-11)
S = {s['name']: s for s in json.load(open(SP + '/setts.json', encoding='utf8'))}
ANC = ('arcology', 'ruined arcology', 'ruin', 'cavern')
ZEIJ = tuple(n for n, s in S.items() if n == 'Dhelv' or (s['type'] == 'cavern' and 'Zeijani' in s['notes']))
FORTS = [n for n in S if n.startswith('Fort ')]
PORTS = ['Port  Tobin', 'Port Goto', 'Port Visas']
CITIES = ('Hook', 'Iziz', 'Yuni', 'Ys', 'Dalab', 'Roketstad', 'Verge', 'Nulab', 'Lux')
nodes = {}
for n, s in S.items():
    if n in ZEIJ or n in FORTS: continue
    if s['type'] in ANC or n in CITIES:
        nodes[n] = {'id': s['id'], 'name': 'the Pile' if n == 'Cube' else n, 'type': s['type'], 'px': [s['px'], s['py']], 'kind': 'site'}
for n, px, t in (('Wheel', (406, 886), 'ruined arcology'), ('Thera', (526, 955), 'ruin')):
    nodes[n] = {'id': 'valley.' + n.lower(), 'name': n, 'type': t, 'px': list(px), 'kind': 'site', 'note': 'in the valley plan, not yet on the model'}
# ---- the stranded Ancient ports on the dam lakes' former shores
pl = json.load(open('model/data/palaeolakes.json', encoding='utf8'))
from scipy.ndimage import label, binary_dilation
docks = []
for L in pl:
    sx, sy = map(int, map(round, L['seed_px']))
    yy, xx = np.mgrid[0:H2, 0:W2w]
    rad = 1.6 * math.sqrt(L['km2'] / math.pi) / 2.0          # px: the lake's own size, so the breach's cut does not leak it onto the crater floor
    disk = (xx - sx) ** 2 + (yy - sy) ** 2 < rad ** 2
    m = (E2 < L['level_m']) & disk
    lab, _ = label(m); k = lab[sy, sx]
    if k == 0: continue
    lake = lab == k
    shore = binary_dilation(lake, iterations=1) & ~lake & ((xx - sx) ** 2 + (yy - sy) ** 2 < (rad - 3) ** 2)
    ys, xs = np.nonzero(shore)
    # the shore cell nearest an Ancient node outside the lake
    best = None
    for n, nd in nodes.items():
        if nd['kind'] != 'site': continue
        x0, y0 = nd['px']
        if lake[y0, x0]: continue
        d = np.hypot(xs - x0, ys - y0); i = int(d.argmin())
        if best is None or d[i] < best[0]: best = (float(d[i]), int(xs[i]), int(ys[i]), n)
    name = 'Old port (' + ('east' if L['basin'] == 'dam 2' else 'west') + ' dam)'
    nodes[name] = {'id': 'dock.' + L['basin'].replace(' ', ''), 'name': name, 'type': 'stranded port', 'px': [best[1], best[2]], 'kind': 'dock',
                   'note': 'proposed: on the %s lake\'s former shore (%d m), %d km from %s' % (L['basin'], L['level_m'], 2 * best[0], best[3])}
    docks.append(name)
names = sorted(nodes); N = len(names); ix = {n: i for i, n in enumerate(names)}
src = [cellof(*nodes[n]['px']) for n in names]
dist = dijkstra(GR, indices=src, directed=False); C = dist[:, src]

# ---- the authored routes (pinned: the router does not choose them)
AUTH = [
  ('rift', [('Dalab', 'Shelf'), ('Shelf', 'Ledge', 'bore'), ('Ledge', 'Nulab', 'lift'), ('Nulab', 'Chimes'), ('Chimes', 'Cthonos'), ('Cthonos', 'The Tubes'), ('The Tubes', 'Cube'),
            ('Cube', 'Theodiga'), ('Theodiga', 'Strongbow'), ('Strongbow', 'Stair', 'bore')]),
  ('rift.twenny', [('Twenny junction', 'Loj Twenny', 'bore')]),
  ('innerwall', [('Drum', 'Cascade', 'bore'), ('Cascade', 'Babel', 'bore')]),
  ('span', [('Dalab', 'Span'), ('Span', 'Thera')]),
  ('stair', [('Arcbeam', 'Stair', 'bore')]),
]
pinned = set()
for rid, legs in AUTH:
    for leg in legs:
        if leg[0] in ix and leg[1] in ix: pinned.add(tuple(sorted((ix[leg[0]], ix[leg[1]]))))
NOT_RNG = {'Loj Twenny', 'Strongbow'}
SB = ix['Strongbow']
edges = set()
for i in range(N):
    for j in range(i + 1, N):
        if names[i] in NOT_RNG or names[j] in NOT_RNG or not np.isfinite(C[i, j]): continue
        if not any(max(C[i, k], C[k, j]) < C[i, j] for k in range(N) if k not in (i, j) and names[k] not in NOT_RNG):
            edges.add((i, j))
edges -= pinned
A = np.zeros((N, N))
for i, j in edges | pinned: A[i, j] = A[j, i] = 1
nc, lab_ = connected_components(A, directed=False)
if nc > 1:
    CC = np.where(np.isfinite(C), C, 0).copy()
    for n in NOT_RNG: CC[ix[n], :] = 0; CC[:, ix[n]] = 0
    T = minimum_spanning_tree(CC).toarray()
    for i, j in zip(*np.nonzero(T)):
        if lab_[i] != lab_[j]: edges.add(tuple(sorted((int(i), int(j)))))

# ---- tracing and forms
def trace(a_cell, b_cell):
    _, pred = dijkstra(GR, indices=a_cell, directed=False, return_predecessors=True)
    p = [b_cell]
    while p[-1] != a_cell and pred[p[-1]] >= 0: p.append(int(pred[p[-1]]))
    return [pxof(c) for c in p[::-1]]
def straight(a, b, step=1.0):
    L = math.hypot(b[0] - a[0], b[1] - a[1]); n = max(1, int(L / step))
    return [[a[0] + (b[0] - a[0]) * t / n, a[1] + (b[1] - a[1]) * t / n] for t in range(n + 1)]
def surf(p):
    i = min(max(int(round(p[0])), 0), W2w - 1); j = min(max(int(round(p[1])), 0), H2 - 1); return E2[j, i], W2[j, i]
def level_for(pts, km):
    """the bore level that gives about `km` of tunnel (the contiguous stretch over the level round the crest)"""
    e = np.array([surf(p)[0] for p in pts]); step = 2 * math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])
    for L in np.arange(e.max(), e.min(), -25):
        if (e > L).sum() * step >= km: return float(L)
    return float(e.min())
def forms(pts, bore=False, level=None):
    """the Ancient profile: the ground smoothed over ~30 km, held to 4 % both ways; then each step's form.
    With `level`, a level bore wherever the ground stands over it (the approaches on the profile)."""
    if level is not None:
        s, f, fm = forms(pts)
        e = [surf(p)[0] for p in pts]
        return s, np.where(np.array(e) > level, level, f), ['tunnel' if e[k] > level else fm[k] for k in range(len(pts))]
    s = [0.0]
    for k in range(1, len(pts)): s.append(s[-1] + 2000 * math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
    e = np.array([surf(p)[0] for p in pts]); w = np.array([surf(p)[1] for p in pts]); s = np.array(s)
    if bore:   # a bore: level between the portals, graded straight end to end
        f = np.interp(s, [s[0], s[-1]], [e[0], e[-1]])
    else:
        win = 15000; f = np.array([e[(s > si - win) & (s < si + win)].mean() for si in s])
        f[0], f[-1] = e[0], e[-1]
        for _ in range(6):
            for k in range(1, len(f)): f[k] = min(max(f[k], f[k - 1] - G * (s[k] - s[k - 1])), f[k - 1] + G * (s[k] - s[k - 1]))
            for k in range(len(f) - 2, -1, -1): f[k] = min(max(f[k], f[k + 1] - G * (s[k + 1] - s[k])), f[k + 1] + G * (s[k + 1] - s[k]))
    out = []
    for k in range(len(pts)):
        over = e[k] - f[k]
        if w[k]: fm = 'causeway'
        elif e[k] > AIR or over > 60 or (bore and over > 30): fm = 'tunnel'
        elif over > 5: fm = 'cut'
        elif over < -30: fm = 'viaduct'
        elif over < -5: fm = 'fill'
        else: fm = 'open'
        out.append(fm)
    return s, f, out

# ---- upkeep by sphere
R = json.load(open(SP + '/regions.json', encoding='utf8'))
UP = {'Empire of Iziz': 'kept', 'Vothic Kingdom': 'kept', 'Iron Republic': 'kept', 'Eternal State': 'kept', 'Dilihan Province': 'kept',
      'Yuni Emirate': 'partly', 'Xanadu Sultanate': 'partly', 'Tungang Union': 'kept',
      'Jimjam': 'lapsed', 'League of Amphitriton': 'lapsed', 'Scyvoi': 'lapsed', 'Realm of Dalab': 'lapsed', 'Talovolci Chiefs': 'lapsed', 'Shell Province': 'lapsed'}
masks = []
for r in R:
    if r.get('kind') == 'political' and r['name'] in UP:
        im = Image.new('L', (W2w, H2), 0); ImageDraw.Draw(im).polygon([tuple(p) for p in r['points']], fill=1)
        m = np.array(im).astype(bool); masks.append((int(m.sum()), UP[r['name']], r['name'], m))
masks.sort(key=lambda t: t[0])
def upkeep(p):
    i, j = int(round(p[0])), int(round(p[1]))
    for _, u, n, m in masks:
        if 0 <= j < H2 and 0 <= i < W2w and m[j, i]: return u
    return 'decayed'

routes = []
def add(rid, cls, a, b, pts, bore=False, name=None, note=None, level=None):
    s, f, fm = forms(pts, bore, level)
    up = [upkeep(p) for p in pts]
    tun = sum(s[k + 1] - s[k] for k in range(len(pts) - 1) if fm[k] == 'tunnel') / 1000
    air = sum(s[k + 1] - s[k] for k in range(len(pts) - 1) if surf(pts[k])[0] > AIR and fm[k] != 'tunnel') / 1000
    routes.append({'id': rid, 'class': cls, 'from': a, 'to': b, 'name': name or (a + ' to ' + b), 'km': round(s[-1] / 1000), 'tunnel_km': round(tun),
                   'airless_open_km': round(air), 'px': [[round(x, 1), round(y, 1)] for x, y in pts], 'form': fm, 'up': up, 'note': note})
P = lambda n: nodes[n]['px'] if n in nodes else None
EXTRA_PTS = {'Twenny junction': [445, 1266], 'N portal': [458.2, 1158.6], 'S portal': [439.5, 1309.5]}
# the Rift line: the Line's survey alignment for the bore, the router for the open legs
leg_pts = []
seq = []
def routed(a, b): return trace(cellof(*P(a)), cellof(*P(b)))
rift_legs = [('Dalab', 'Shelf', routed('Dalab', 'Shelf'), False), ('Shelf', 'N portal', straight(P('Shelf'), EXTRA_PTS['N portal']), True),
             ('N portal', 'S portal', straight(EXTRA_PTS['N portal'], EXTRA_PTS['S portal']), True), ('S portal', 'Ledge', straight(EXTRA_PTS['S portal'], P('Ledge')), False),
             ('Ledge', 'Nulab', straight(P('Ledge'), P('Nulab')), False), ('Nulab', 'Chimes', routed('Nulab', 'Chimes'), False),
             ('Chimes', 'Cthonos', routed('Chimes', 'Cthonos'), False), ('Cthonos', 'The Tubes', routed('Cthonos', 'The Tubes'), False),
             ('The Tubes', 'the Pile', routed('The Tubes', 'Cube'), False), ('the Pile', 'Theodiga', routed('Cube', 'Theodiga'), False), ('Theodiga', 'Strongbow', routed('Theodiga', 'Strongbow'), False)]
# the Line session's station numbers (the owner, 2026-11-11: north to south; 10 on are that session's proposal)
NUM = {'Dalab': 1, 'Shelf': 2, 'Ledge': 4, 'Nulab': 5, 'Chimes': 6, 'Cthonos': 7, 'The Tubes': 8, 'the Pile': 9, 'Theodiga': 10, 'Strongbow': 11, 'Stair': 12}
for a, b, pts, bore in rift_legs:
    add('rift', 'line', a, b, pts, bore, name='The Rift line: ' + a + (' (%d)' % NUM[a] if a in NUM else '') + ' to ' + b + (' (%d)' % NUM[b] if b in NUM else ''),
        note='lifts down the cliff, 1.3 km' if (a, b) == ('Ledge', 'Nulab') else None)
add('rift.twenny', 'branch', 'Twenny junction', 'Loj Twenny', straight(EXTRA_PTS['Twenny junction'], P('Loj Twenny')), True, name='The Twenny gallery (bore km 218)')
IW = straight(P('Drum'), P('Cascade')) + straight(P('Cascade'), P('Babel'))[1:]
IWL = 2400.0
add('innerwall', 'line', 'Drum', 'Babel', IW, name='The Inner Wall tunnel: Drum, under Cascade (a shaft), to the Valley at Babel', level=IWL,
    note='level bore at %d m; Cascade stands %d m over it' % (IWL, surf(P('Cascade'))[0] - IWL))
add('span', 'trunk', 'Dalab', 'Span', routed('Dalab', 'Span'), name='Span trunk: Dalab and the Basin Tunnel to Span')
add('span', 'trunk', 'Span', 'Thera', routed('Span', 'Thera'), name='Span trunk: Span and the Valley Tunnel to Thera')
ST = straight(P('Arcbeam'), [1033, 1258]) + straight([1033, 1258], P('Stair'))[1:]
STL = level_for(ST, 180)
add('stair', 'line', 'Arcbeam', 'Stair', ST, name='The Stair line: the 180 km base tunnel by the Bab al-Hawa shaft (sealed halfway)', level=STL,
    note='level bore at %d m (seouterwall: 180 km)' % STL)
add('godsgate', 'trunk', 'Arcbeam', 'Stair', routed('Arcbeam', 'Stair'), name='The Godsgate highway, Arcbeam to Stair (the surviving way)')
pinned_names = {tuple(sorted(x)) for x in [('Dalab', 'Shelf'), ('Shelf', 'Ledge'), ('Ledge', 'Nulab'), ('Nulab', 'Chimes'), ('Chimes', 'Cthonos'), ('Cthonos', 'The Tubes'), ('The Tubes', 'Cube'),
                                           ('Cube', 'Theodiga'), ('Theodiga', 'Strongbow'), ('Strongbow', 'Stair'),
                                           ('Drum', 'Cascade'), ('Cascade', 'Babel'), ('Dalab', 'Span'), ('Span', 'Thera'), ('Arcbeam', 'Stair')]}
for i, j in sorted(edges):
    a, b = names[i], names[j]
    if tuple(sorted((a, b))) in pinned_names: continue
    na, nb = nodes[a]['name'], nodes[b]['name']
    add('r.%s.%s' % (nodes[a]['id'], nodes[b]['id']), 'trunk', na, nb, trace(src[i], src[j]))
# ---- the owner, 2026-11-11 (later): "the rail line might even extend from strongbow, to theodiga, to Stair, to an arcology TBD in the bowl"
bowl = [r for r in R if r['name'] == 'The Bowl'][0]
im = Image.new('L', (W2w, H2), 0); ImageDraw.Draw(im).polygon([tuple(p) for p in bowl['points']], fill=1); bm = np.array(im).astype(bool)
line = straight(P('Arcbeam'), [1033, 1258], 0.5)
inb = [p for p in line if bm[int(round(p[1])), int(round(p[0]))] and not W2[int(round(p[1])), int(round(p[0]))]]
bpt = inb[len(inb) // 2] if inb else [1096, 1156]
bpt = [round(bpt[0]), round(bpt[1])]
nodes['Bowl arcology'] = {'id': 'tbd.bowl', 'name': 'Bowl arcology (to be placed)', 'type': 'arcology', 'px': bpt, 'kind': 'tbd',
                         'note': 'provisional: on the Stair line where it crosses the Bowl, so the line goes on from Stair along the Stair line'}
SBS = straight(P('Strongbow'), P('Stair'))
add('rift.bowl', 'possible', 'Strongbow', 'Stair', SBS, name='Possible: the line on from Strongbow (11) to Stair (12) under the Catch\'s walls, then by the Stair line to the Bowl arcology (13)',
    level=level_for(SBS, 329), note='the Line session\'s straight bore, 329 km')
# ---- Iziz-built roads to the forts and the ports (not Ancient): to the nearest network node by the same cost
for n in FORTS + PORTS:
    if n not in S: continue
    s0 = S[n]; c0 = cellof(s0['px'], s0['py'])
    d0 = dijkstra(GR, indices=c0, directed=False, limit=4000)
    best = min(names, key=lambda m: d0[src[ix[m]]]);
    if not np.isfinite(d0[src[ix[best]]]): continue
    add('izani.' + s0['id'], 'izani', n.replace('  ', ' '), nodes[best]['name'], trace(c0, src[ix[best]]), name='Izani road: ' + n.replace('  ', ' ') + ' to ' + nodes[best]['name'])
# ---- extensions into the new west and north (lore to come)
EXT = [('north', 'the Ria valley', [950, 200]), ('west', 'Farport and the Crook', [294, 588]), ('southwest', 'the Silent Vales', [194, 982])]
for k, label_, pt in EXT:
    c0 = cellof(*pt); d0 = dijkstra(GR, indices=c0, directed=False)
    best = min((m for m in names if m not in NOT_RNG and nodes[m]['kind'] == 'site'), key=lambda m: d0[src[ix[m]]])
    add('ext.' + k, 'extension', nodes[best]['name'], label_, trace(src[ix[best]], c0), name='Extension (lore to come): ' + nodes[best]['name'] + ' toward ' + label_)
out = {'nodes': [dict(v) for v in nodes.values()], 'routes': routes, 'extra': EXTRA_PTS,
       'excluded': {'zeijani': list(ZEIJ), 'forts': FORTS, 'ports': PORTS}}
json.dump(out, open(SP + '/net51.json', 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
tot = {}
for r in routes: tot.setdefault(r['class'], [0, 0, 0]); t = tot[r['class']]; t[0] += 1; t[1] += r['km']; t[2] += r['tunnel_km']
print(N, 'nodes;', tot)
for r in routes:
    if r['class'] in ('line', 'branch') or r['airless_open_km']: print('  %-60s %5d km  tunnel %4d  airless-open %d' % (r['name'][:60], r['km'], r['tunnel_km'], r['airless_open_km']))
print('docks:', [(n, nodes[n]['px'], nodes[n]['note']) for n in docks])
print('trunks:', len([r for r in routes if r['class'] == 'trunk']))
