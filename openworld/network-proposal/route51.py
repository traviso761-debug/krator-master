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
from scipy.ndimage import label as _label
PALEO = np.zeros_like(W2)
_yy0, _xx0 = np.mgrid[0:H2, 0:W2w]
for _L in json.load(open('model/data/palaeolakes.json', encoding='utf8')):
    _sx, _sy = map(int, map(round, _L['seed_px'])); _rad = 1.6 * math.sqrt(_L['km2'] / math.pi) / 2.0
    _lab, _ = _label((E2 < _L['level_m']) & ((_xx0 - _sx) ** 2 + (_yy0 - _sy) ** 2 < _rad ** 2))
    if _lab[_sy, _sx]: PALEO |= _lab == _lab[_sy, _sx]
PALEO_F = PALEO[::F, ::F]
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
    surf = surf * (1 + np.maximum(0, np.maximum(ea, eb) - 1500) / 2500)   # the lowland path
    surf[(ea > AIR) | (eb > AIR)] = np.inf
    c = np.minimum(surf, d * TUN)
    c[wa | wb] = d * WATER
    c[(PALEO_F.flat[a.ravel()] | PALEO_F.flat[b.ravel()]) & ~(wa | wb)] = d * 20.0   # under the old lakes: the Ancients went round
    rows += [a.ravel(), b.ravel()]; cols += [b.ravel(), a.ravel()]; cost += [c, c]
GR = coo_matrix((np.concatenate(cost), (np.concatenate(rows), np.concatenate(cols))), shape=(VW * VH, VW * VH)).tocsr()
def cellof(px, py): return int(round(py / F)) * VW + int(round(px / F))
def pxof(c): return [(c % VW) * F, (c // VW) * F]

# ---- nodes (the owner, 2026-11-11)
S = {s['name']: s for s in json.load(open(SP + '/setts.json', encoding='utf8'))}
# Strongbow stands on the Xanadu-Oidong scarp (the owner, 2026-11-11: "right on the xanadu-oidong border - the same cliff the cataract is
# on - so that it offers a real advantage to anyone using its elevator"): its top on the Oidong lip (S['Strongbow'], about 1,400 m), its foot
# on the Xanadu floor about 3,100 m below. A route from Xanadu's side ends at the FOOT; the Oidong Valley road ends at the top
STRONGBOW_FOOT = [991, 1596]
FOOT_NOTE = "ends at Strongbow's foot on the Xanadu floor; the arcology's elevator climbs about 3,100 m to the Oidong lip"
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
nodes.pop("Noa's Regret", None)
for n, px, t in (('Wheel', (406, 886), 'ruined arcology'), ('Thera', (526, 955), 'ruin')):
    nodes[n] = {'id': 'valley.' + n.lower(), 'name': n, 'type': t, 'px': list(px), 'kind': 'site', 'note': 'in the valley plan, not yet on the model'}
# ---- the owner, later on 2026-11-11
FORT_STOPS = ('Fort Kalor', 'Fort Kreia', 'Fort Ordo')      # built by Iziz beside the way: stops on it
for n in FORT_STOPS:
    s = S[n]; nodes[n] = {'id': s['id'], 'name': n, 'type': 'fort', 'px': [s['px'], s['py']], 'kind': 'site', 'note': 'built by Iziz beside the Ancient way'}
nodes['Farport'] = {'id': S['Farport']['id'], 'name': 'Farport', 'type': 'city', 'px': [S['Farport']['px'], S['Farport']['py']], 'kind': 'site',
                    'note': 'an Ancient node (the owner): part of its plateau hollowed out as an Ancient storage depot; the Ancient port it served long since washed away'}
nodes['Quintagon'] = {'id': 'new.quintagon', 'name': 'Quintagon', 'type': 'arcology', 'px': [1349, 830], 'kind': 'site', 'note': 'new (the owner): NE of Verge in the eastern badlands; 2,320 m, 14 degC'}
nodes['Bowl arcology'] = {'id': 'tbd.bowl', 'name': 'Parabola', 'type': 'arcology', 'px': [970, 1186], 'kind': 'site',
                          'note': "Parabola (the owner chose design A, 2026-11-11): the Bowl's arcology, a terraced solar dish on three piers; the Bowl's most temperate ground near the Godsgate: 15 degC, 1,716 m, 314 mm"}
_R = {r['name']: r for r in json.load(open(SP + '/regions.json', encoding='utf8'))}
def _mask(n):
    im = Image.new('L', (W2w, H2), 0); ImageDraw.Draw(im).polygon([tuple(q) for q in _R[n]['points']], fill=1); return np.array(im).astype(bool)
_tm = raster(D, 'tm', 'L').astype(float) - 90
_gy, _gx = np.gradient(E2); _sl = np.hypot(_gx, _gy) / 2000
_yy, _xx = np.mgrid[0:H2, 0:W2w]
_km = _mask('Korona / NE') & ~_mask('Tiers') & ~_mask('The Tiers') & ~W2 & (_sl < 0.02) & (_xx < 1150)
_s = np.where(_km, np.abs(_tm - 12) + np.hypot(_xx - 1090, _yy - 520) / 40, 1e9); _j, _i = np.unravel_index(_s.argmin(), _s.shape)
RV = {r['id']: r for r in json.load(open('model/data/rivers.json', encoding='utf8'))}
_dq = min(RV['r034']['px'], key=lambda q: abs(q[0] - 705))
nodes['Driyan'] = {'id': 'new.driyan', 'name': 'Driyan', 'type': 'city', 'px': [int(round(_dq[0])), int(round(_dq[1]))], 'kind': 'site',
                   'note': 'proposed place (the owner: east of Shim, up along the river): on the Sharf Rivrh (r034), the old Shumari city, Vothic now, on the Ancient highway'}
nodes['Korona site'] = {'id': 'tbd.korona', 'name': 'the Pit', 'type': 'ruin', 'px': [int(_i), int(_j)], 'kind': 'site',
                        'note': 'the Pit (the owner, 2026-11-11), the Ancient facility in Korona; proposed place: level ground beyond the Tiers, %d m, %d degC' % (E2[_j, _i], _tm[_j, _i])}
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
            ('Cube', 'Theodiga'), ('Theodiga', 'Strongbow'), ('Theodiga', 'Stair', 'bore')]),
  ('rift.twenny', [('Twenny junction', 'Loj Twenny', 'bore')]),
  ('innerwall', [('Drum', 'Cascade', 'bore'), ('Cascade', 'Babel', 'bore')]),
  ('span', [('Dalab', 'Span'), ('Span', 'Thera')]),
  ('rift.bowl', [('Stair', 'Bowl arcology')]),
]
pinned = set()
for rid, legs in AUTH:
    for leg in legs:
        if leg[0] in ix and leg[1] in ix: pinned.add(tuple(sorted((ix[leg[0]], ix[leg[1]]))))
NOT_RNG = {'Loj Twenny', 'Strongbow', "Trickster's House", 'Korona site'}
SB = ix['Strongbow']
edges = set()
for i in range(N):
    for j in range(i + 1, N):
        if names[i] in NOT_RNG or names[j] in NOT_RNG or not np.isfinite(C[i, j]): continue
        if not any(max(C[i, k], C[k, j]) < C[i, j] for k in range(N) if k not in (i, j) and names[k] not in NOT_RNG):
            edges.add((i, j))
edges -= pinned
BAN = {tuple(sorted((ix['Pluton'], ix['Theodiga'])))}
edges -= BAN
A = np.zeros((N, N))
for i, j in edges | pinned: A[i, j] = A[j, i] = 1
nc, lab_ = connected_components(A, directed=False)
if nc > 1:
    CC = np.where(np.isfinite(C), C, 0).copy()
    for n in NOT_RNG: CC[ix[n], :] = 0; CC[:, ix[n]] = 0
    for i_, j_ in BAN: CC[i_, j_] = CC[j_, i_] = 0
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
      'Jimjam': 'lapsed', 'League of Amphitriton': 'lapsed', 'Scyvoi': 'lapsed', 'Realm of Dalab': 'shoddy', 'Talovolci Chiefs': 'lapsed', 'Shell Province': 'lapsed'}
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
def add(rid, cls, a, b, pts, bore=False, name=None, note=None, level=None, force=None):
    s, f, fm = forms(pts, bore, level)
    if force: fm = [force if x not in ('causeway',) else x for x in fm]
    up = [upkeep(p) for p in pts]
    tun = sum(s[k + 1] - s[k] for k in range(len(pts) - 1) if fm[k] == 'tunnel') / 1000
    air = sum(s[k + 1] - s[k] for k in range(len(pts) - 1) if surf(pts[k])[0] > AIR and fm[k] != 'tunnel') / 1000
    routes.append({'id': rid, 'class': cls, 'from': a, 'to': b, 'name': name or (a + ' to ' + b), 'km': round(s[-1] / 1000), 'tunnel_km': round(tun),
                   'airless_open_km': round(air), 'px': [[round(x, 1), round(y, 1)] for x, y in pts], 'form': fm, 'up': up, 'note': note})
P = lambda n: nodes[n]['px'] if n in nodes else None
EXTRA_PTS = {'Twenny junction': [445, 1266], 'N portal': [458.2, 1158.6], 'S portal': [439.5, 1309.5], 'the Gate': [1438, 326]}
def routed(a, b): return trace(cellof(*(P(a) or a)), cellof(*(P(b) or b)))
def via(pts):
    out = []
    for a, b in zip(pts, pts[1:]):
        seg = trace(cellof(*a), cellof(*b)); out += seg if not out else seg[1:]
    return out
# ---- the Rift line (the Line session's survey for the bore; the owner: underground through the Lizardmen's country)
# NO RIFT LINE IN THE OIDONG VALLEY (the owner, 2026-11-11: "there is no rift line in oidong valley, just a road"; "it goes to strongbow"):
# the Theodiga-Strongbow leg is traced with the valley's polygon ('Oidong Valley') at 1000x, but for the last 10 km round Strongbow,
# so the line comes to the cliff arcology from outside the valley
def OIDONG_OFF(a, b):
    m = _mask('Oidong Valley'); sb = P('Strongbow'); n = VW * VH
    xs = (np.arange(n) % VW) * F; ys = (np.arange(n) // VW) * F
    inside = m[np.clip(ys, 0, H2 - 1), np.clip(xs, 0, W2w - 1)] & (np.hypot(xs - sb[0], ys - sb[1]) > 5)
    G = GR.tocoo(); w = G.data * np.where(inside[G.row] | inside[G.col], 1000.0, 1.0)
    Go = coo_matrix((w, (G.row, G.col)), shape=G.shape).tocsr(); ca, cb = cellof(*P(a)), cellof(*(STRONGBOW_FOOT if b == 'Strongbow' else P(b)))
    _, pred = dijkstra(Go, indices=ca, directed=False, return_predecessors=True)
    q = [cb]
    while q[-1] != ca and pred[q[-1]] >= 0: q.append(int(pred[q[-1]]))
    return [pxof(c) for c in q[::-1]]
rift_legs = [('Dalab', 'Shelf', routed('Dalab', 'Shelf'), False, None), ('Shelf', 'N portal', straight(P('Shelf'), EXTRA_PTS['N portal']), True, None),
             ('N portal', 'S portal', straight(EXTRA_PTS['N portal'], EXTRA_PTS['S portal']), True, None), ('S portal', 'Ledge', straight(EXTRA_PTS['S portal'], P('Ledge')), False, None),
             ('Ledge', 'Nulab', straight(P('Ledge'), P('Nulab')), False, None), ('Nulab', 'Chimes', routed('Nulab', 'Chimes'), False, None),
             ('Chimes', 'Cthonos', routed('Chimes', 'Cthonos'), False, 'tunnel'), ('Cthonos', 'The Tubes', routed('Cthonos', 'The Tubes'), False, 'tunnel'),
             ('The Tubes', 'the Pile', routed('The Tubes', 'Cube'), False, 'tunnel'), ('the Pile', 'Theodiga', routed('Cube', 'Theodiga'), False, None),
             ('Theodiga', 'Strongbow', OIDONG_OFF('Theodiga', 'Strongbow'), False, None)]
NUM = {'Dalab': 1, 'Shelf': 2, 'Ledge': 4, 'Nulab': 5, 'Chimes': 6, 'Cthonos': 7, 'The Tubes': 8, 'the Pile': 9, 'Theodiga': 10, 'Strongbow': 11, 'Stair': 12, 'Bowl arcology': 13}
lab = lambda n: n + (' (%d)' % NUM[n] if n in NUM else '')
for a, b, pts, bore, force in rift_legs:
    add('rift', 'line', a, b, pts, bore, name='The Rift line: ' + lab(a) + ' to ' + lab(b), force=force,
        note='lifts down the cliff, 1.3 km' if (a, b) == ('Ledge', 'Nulab') else ('underground through the Lizardmen\'s country (the owner); surface where the tunnel wars broke it open, to be authored' if force else (FOOT_NOTE if b == 'Strongbow' else None)))
add('rift.twenny', 'branch', 'Twenny junction', 'Loj Twenny', straight(EXTRA_PTS['Twenny junction'], P('Loj Twenny')), True, name='The Twenny gallery (bore km 218)')
# Theodiga to Stair (the owner, 2026-11-11, with Strongbow moved to Oidong): a dead bore, a third way across, dark, with little food or
# water; the trains do not run there. Bored over most of its length
TSB = straight(P('Theodiga'), P('Stair')); _tl = sum(2 * math.hypot(TSB[k][0] - TSB[k - 1][0], TSB[k][1] - TSB[k - 1][1]) for k in range(1, len(TSB)))
add('rift.bowl', 'possible', 'Theodiga', 'Stair', TSB, level=level_for(TSB, 0.85 * _tl), name='Possible: the Rift line\'s dead bore from Theodiga (10) to Stair (12)',
    note='a third way across: dark, little food or water; no trains run in it')
add('rift.bowl', 'possible', 'Stair', 'Bowl arcology', routed('Stair', 'Bowl arcology'), name='Possible: the Rift line on from Stair (12) to Parabola (13), by the Godsgate')
# ---- the Inner Wall tunnel, bent under Cascade
IW = straight(P('Drum'), P('Cascade')) + straight(P('Cascade'), P('Babel'))[1:]
IWL = 2400.0
add('innerwall', 'line', 'Drum', 'Babel', IW, name='The Inner Wall tunnel: Drum, under Cascade (a shaft), to the Valley at Babel', level=IWL,
    note='level bore at %d m; Cascade stands %d m over it' % (IWL, surf(P('Cascade'))[0] - IWL))
# ---- the Span trunk
add('span', 'trunk', 'Dalab', 'Span', routed('Dalab', 'Span'), name='Span trunk: Dalab and the Basin Tunnel to Span')
add('span', 'trunk', 'Span', 'Thera', routed('Span', 'Thera'), name='Span trunk: Span and the Valley Tunnel to Thera')
# (no Stair tunnel: the owner dropped it, 2026-11-11)
# ---- the road to Trickster's House: east from Yuni, round through the Loom-Chasms and up the Great Chasm
TR = via([P('Yuni'), [1450, 1130], [1600, 1150], [1697, 1028], [1688, 920], [1680, 810], P("Trickster's House")])
add('trickster', 'trunk', 'Yuni', "Trickster's House", TR, name="The road to Trickster's House: Yuni, the Loom-Chasms, the Great Chasm")
# ---- the Outland Gate highway: the Outlands north through the Gate to the Ria valley; the branch through the Tiers to Korona
OG = via([P("Trickster's House"), EXTRA_PTS['the Gate'], [950, 200]])
add('outland', 'trunk', "Trickster's House", 'the Ria valley', OG, name='The Outland Gate highway: the Outlands, the Gate, the Ria valley (the north end: lore to come)')
OK = via([EXTRA_PTS['the Gate'], [1230, 470], P('Korona site')])
add('outland.korona', 'trunk', 'the Gate', 'Korona site', OK, name='The Outland Gate highway: the branch through the Tiers to the Korona site')
pinned_names = {tuple(sorted(x)) for x in [('Dalab', 'Shelf'), ('Shelf', 'Ledge'), ('Ledge', 'Nulab'), ('Nulab', 'Chimes'), ('Chimes', 'Cthonos'), ('Cthonos', 'The Tubes'), ('The Tubes', 'Cube'),
                                           ('Cube', 'Theodiga'), ('Theodiga', 'Strongbow'), ('Theodiga', 'Stair'), ('Stair', 'Bowl arcology'),
                                           ('Drum', 'Cascade'), ('Cascade', 'Babel'), ('Dalab', 'Span'), ('Span', 'Thera')]}
for i, j in sorted(edges):
    a, b = names[i], names[j]
    if tuple(sorted((a, b))) in pinned_names: continue
    na, nb = nodes[a]['name'], nodes[b]['name']
    add('r.%s.%s' % (nodes[a]['id'], nodes[b]['id']), 'trunk', na, nb, trace(src[i], src[j]))
# ---- Amaro, Shumar's capital, in Shumar, joined only by a dirt path; Driyan east of Shim up the river, on the Ancient highway
shm = _mask('Shumar')
anc_v = [(r, k, q) for r in routes if r['class'] in ('trunk', 'line') for k, q in enumerate(r['px']) if r['form'][min(k, len(r['form']) - 1)] != 'tunnel']
_av = np.array([q for r, k, q in anc_v])
_i, _j = 734, 1182   # the owner: Amaro back where it was, inside the polygon 'Shumar'
nodes['Amaro'] = {'id': 'new.amaro', 'name': 'Amaro', 'type': 'city', 'px': [int(_i), int(_j)], 'kind': 'town',
                  'note': "Shumar's capital, inside the polygon 'Shumar' (the owner: back where it was), %d m, %d degC; a dirt path to the Ancient highway" % (E2[_j, _i], _tm[_j, _i])}
# ---- the modern roads (not Ancient): built at 8 %, no tunnels, bridges where they must
def graph(Gm, tun, wat):
    rows, cols, cost = [], [], []
    for dj, di in ((0, 1), (1, 0), (1, 1), (1, -1)):
        a = idx[max(0, -dj):VH - max(0, dj), max(0, -di):VW - max(0, di)]
        b = idx[max(0, dj):VH + min(0, dj) or None, max(0, di):VW + min(0, di) or None]
        ea, eb = E.flat[a.ravel()], E.flat[b.ravel()]; wa, wb = W.flat[a.ravel()], W.flat[b.ravel()]
        d = CELL * math.hypot(dj, di); g = np.abs(eb - ea) / (d * 1000)
        c = np.minimum(d * (1 + 0.5 * (g / Gm) ** 2), d * tun)
        c = c * (1 + np.maximum(0, np.maximum(ea, eb) - 1500) / 2500)   # the lowland path
        c[(ea > AIR) | (eb > AIR)] = np.inf; c[wa | wb] = d * wat
        rows += [a.ravel(), b.ravel()]; cols += [b.ravel(), a.ravel()]; cost += [c, c]
    return coo_matrix((np.concatenate(cost), (np.concatenate(rows), np.concatenate(cols))), shape=(VW * VH, VW * VH)).tocsr()
GM = graph(0.08, 40.0, 40.0)
REDUNDANT = []
def mtrace(a_cell, b_cell):
    _, pred = dijkstra(GM, indices=a_cell, directed=False, return_predecessors=True)
    p = [b_cell]
    while p[-1] != a_cell and pred[p[-1]] >= 0: p.append(int(pred[p[-1]]))
    return [pxof(c) for c in p[::-1]]
# roads laid on a hand-drawn guide instead of the router's trace (5.1 px), so the network and the open world share one alignment:
# Longsong to Strongbow on the Oidong Valley floor: the oidong-highrift region's least-climb guide (2026-11-11), inside the valley's polygon
# and off the water; at 1:1 it lays as 452 km, never above 2,706 m, with 4 bridges
# pairs the owner dropped: Qiblai to Longsong ran beside the Strongbow-Longsong road down the Oidong Valley ("Drop it", 2026-11-11)
DROPPED = {tuple(sorted(('Qiblai', 'Longsong')))}
GUIDES = {('Longsong', 'Strongbow'): [[1226,1626],[1219,1626],[1213,1624],[1207,1623],[1201,1620],[1195,1618],[1189,1618],[1183,1615],[1177,1613],[1171,1613],[1165,1607],[1159,1605],[1153,1602],[1147,1603],[1135,1603],[1123,1603],[1111,1602],[1099,1602],[1093,1599],[1087,1598],[1081,1597],[1075,1595],[1063,1595],[1051,1595],[1045,1594],[1039,1592],[1033,1592],[1027,1590],[1021,1590],[1016,1593],[1010,1596],[1004,1596],[1001,1596]]}
def mesh(cls, members, prefix, label, k_near=2, skip_pairs=()):
    """a road network among `members` (names -> px): a relative-neighbourhood graph plus each member's k nearest (the owner:
    'their highway network would connect its nodes to multiple nearby cities'), minus pairs the Ancient trunks already join"""
    nm = list(members); cells = [cellof(*members[n]) for n in nm]
    Dm = dijkstra(GM, indices=cells, directed=False)[:, cells]
    es = set()
    for i in range(len(nm)):
        for j in range(i + 1, len(nm)):
            if np.isfinite(Dm[i, j]) and not any(max(Dm[i, q], Dm[q, j]) < Dm[i, j] for q in range(len(nm)) if q not in (i, j)): es.add((i, j))
        for j in np.argsort(Dm[i])[1:k_near + 1]:
            if np.isfinite(Dm[i, j]) and Dm[i, j] < 3 * np.median(Dm[i][np.isfinite(Dm[i])]): es.add(tuple(sorted((i, int(j)))))
    made = 0
    for i, j in sorted(es):
        if tuple(sorted((nm[i], nm[j]))) in skip_pairs or tuple(sorted((nm[i], nm[j]))) in DROPPED: continue
        g_ = GUIDES.get((nm[i], nm[j])) or (GUIDES.get((nm[j], nm[i])) or [])[::-1]
        foot_ = not g_ and 'Strongbow' in (nm[i], nm[j])
        ci_ = cellof(*STRONGBOW_FOOT) if foot_ and nm[i] == 'Strongbow' else cells[i]; cj_ = cellof(*STRONGBOW_FOOT) if foot_ and nm[j] == 'Strongbow' else cells[j]
        pts_ = [q for k, (u, v) in enumerate(zip(g_, g_[1:])) for q in straight(u, v, 2.0)[(1 if k else 0):]] if g_ else mtrace(ci_, cj_)
        av = np.array([q for r in routes if r['class'] in ('trunk', 'line') for k, q in enumerate(r['px']) if r['form'][min(k, len(r['form']) - 1)] != 'tunnel'])
        pa = np.array(pts_, float)
        near = np.array([np.hypot(av[:, 0] - x, av[:, 1] - y).min() <= 4 for x, y in pa]) if len(av) else np.zeros(len(pa), bool)
        if near.mean() > 0.5:
            REDUNDANT.append('%s: %s to %s (%d%% beside an Ancient road)' % (label, nm[i], nm[j], 100 * near.mean())); continue
        add('%s.%s.%s' % (prefix, i, j), cls, nm[i], nm[j], pts_, name='%s: %s to %s' % (label, nm[i], nm[j]), note=FOOT_NOTE if foot_ else None); made += 1
    return made
PXOF = lambda n: [S[n]['px'], S[n]['py']] if n in S else nodes[n]['px']
ancient_pairs = {tuple(sorted((r['from'], r['to']))) for r in routes if r['class'] in ('trunk', 'line')}
# Iziz: the Empire's towns, the towns it reached in its rule (the owner: Pinnacle Rock, Girder, the Hykkousoi cities, Shim, Kautoa, Nusidi),
# the forts off the way and the ports
emp = _mask('Empire of Iziz'); lea = _mask('League of Amphitriton')
IZM = {}
for n, s in S.items():
    if n in ZEIJ or n in ("Noa's Regret",): continue
    if emp[s['py'], s['px']] or (lea[s['py'], s['px']] and s['type'] in ('city', 'village', 'arcology')): IZM[n.replace('  ', ' ')] = [s['px'], s['py']]
for n in ('Pinnacle Rock', 'Girder', 'Kautoa', 'Nusidi', 'Fort Ebon', 'Port Goto', 'Port Visas', "Mav's Refuge"):
    IZM[n] = PXOF(n)
IZM['Spirladunon'] = PXOF('Spirladunon')
IZM['Talia'] = [1072, 936]
IZM = {('the Pile' if n == 'Cube' else n): p for n, p in IZM.items()}
NO_ROAD = {tuple(sorted(x)) for x in (('Tethis', 'Nereus'), ('Fort Ebon', 'Spirladunon'), ('Nereus', 'Fort Ebon'))}   # the owner, 2026-11-11   # the owner, 2026-11-11: no Tethis-Nereus road
n_iz = mesh('izani', IZM, 'izani', 'Izani highway', 2, ancient_pairs | NO_ROAD)
_ap = nodes['Amaro']['px']; _ak = int(np.hypot(_av[:, 0] - _ap[0], _av[:, 1] - _ap[1]).argmin())
add('dirt.amaro', 'dirt', 'Amaro', 'the Ancient highway', mtrace(cellof(*_ap), cellof(*[float(_av[_ak][0]), float(_av[_ak][1])])), name='Dirt path: Amaro (Shumar) to the Ancient highway')
for a_, b_ in (('Spirladunon', 'Torus'), ('Dilihan', 'Port Visas')):   # the owner, 2026-11-11
    add('izani.%s-%s' % (a_.lower(), b_.lower().replace(' ', '')), 'izani', a_, b_, mtrace(cellof(*PXOF(a_)), cellof(*PXOF(b_))), name='Izani highway: %s to %s' % (a_, b_))
_sh = PXOF('Shim')
if 'Driyan' in nodes:
    add('izani.shim.driyan', 'izani', 'Shim', 'Driyan', mtrace(cellof(*_sh), cellof(*nodes['Driyan']['px'])), name='Izani highway: Shim to Driyan')
_av = np.array([q for r in routes if r['class'] in ('trunk', 'line') for k, q in enumerate(r['px']) if r['form'][min(k, len(r['form']) - 1)] != 'tunnel'])
_k = int(np.hypot(_av[:, 0] - _sh[0], _av[:, 1] - _sh[1]).argmin())
add('izani.shim.ancient', 'izani', 'Shim', 'the Ancient highway', mtrace(cellof(*_sh), cellof(*[float(_av[_k][0]), float(_av[_k][1])])), name='Izani highway: Shim to the nearest Ancient road')
# the Iziz highway to Jimjam through Dilihan, then east into the anarchic frontier (less well kept)
for a, b in (('Iziz', 'Dilihan'), ('Dilihan', 'Jimjam')):
    add('izani.north.%s' % a.lower(), 'izani', a, b, mtrace(cellof(*PXOF(a)), cellof(*PXOF(b))), name='Izani highway north: %s to %s' % (a, b))
# the abandoned Ancient port on the east dam lake's old shore, where the frontier road passes (nearest the road's way north-east)
L2 = [L for L in pl if L['basin'] == 'dam 2'][0]
sx, sy = map(int, map(round, L2['seed_px'])); rad = 1.6 * math.sqrt(L2['km2'] / math.pi) / 2.0
disk = (_xx - sx) ** 2 + (_yy - sy) ** 2 < rad ** 2
lab2, _ = label((E2 < L2['level_m']) & disk); lake2 = lab2 == lab2[sy, sx]
sh = binary_dilation(lake2, iterations=1) & ~lake2 & ((_xx - sx) ** 2 + (_yy - sy) ** 2 < (rad - 3) ** 2)
ys_, xs_ = np.nonzero(sh); k_ = int(np.hypot(xs_ - 905, ys_ - 430).argmin()); NB = [int(xs_[k_]), int(ys_[k_])]
nodes['Old port (north basin)'] = {'id': 'dock.northbasin', 'name': 'Old port (north basin)', 'type': 'stranded port', 'px': NB, 'kind': 'dock',
                                   'note': "the owner: an abandoned Ancient port in the north basin, on the east dam lake's old shore (1,050 m), on the frontier road"}
# the Ancient highway of the north basin (the owner, 2026-11-11): the east dam's old port, the north basin's old port, then
# through northern Korona (bridges over the tepui and Arachnoid gorges) to the Pit; an Izani road leads from Jimjam to it
AN = via([nodes['Old port (east dam)']['px'], NB, [1000, 400], P('Korona site')])
add('ancient.northbasin', 'trunk', 'Old port (east dam)', 'the Pit', AN, name='The north basin highway: the east dam port, the north basin port, northern Korona, the Pit')
_an = np.array(AN, float); _jj = PXOF('Jimjam'); _k = int(np.hypot(_an[:, 0] - _jj[0], _an[:, 1] - _jj[1]).argmin())
add('izani.frontier', 'izani', 'Jimjam', 'the north basin highway', mtrace(cellof(*_jj), cellof(*[float(_an[_k][0]), float(_an[_k][1])])),
    name='Izani road: Jimjam to the north basin highway', note='the frontier: less well kept')
routes[-1]['up'] = ['lapsed' if u in ('kept', 'decayed') else u for u in routes[-1]['up']]
_wet = binary_dilation(W2, iterations=2) & ~W2
_sr = PXOF('Serai')
_cv = [q for r in routes if r['id'] in ('izani.frontier', 'ancient.northbasin') for q in r['px'] if _wet[int(q[1]), int(q[0])]]
if _cv:
    _q = min(_cv, key=lambda q: math.hypot(q[0] - _sr[0], q[1] - _sr[1]))
    SERAI_MOVE = {'name': 'Serai', 'px': _sr, 'to': [int(_q[0]), int(_q[1])], 'km': round(2 * math.hypot(_q[0] - _sr[0], _q[1] - _sr[1]), 1),
                  'why': 'the owner: Serai falls along the lake and on the highway'}
else:
    SERAI_MOVE = None
print('Serai move:', SERAI_MOVE)
# the trade highway from Jimjam to Lux (spottily kept)
add('trade.jimjam-lux', 'trade', 'Jimjam', 'Lux', mtrace(cellof(*PXOF('Jimjam')), cellof(*PXOF('Lux'))), name='Trade highway: Jimjam to Lux (spottily kept)')
# Yuni's road to Mungo
_ym = mtrace(cellof(*PXOF('Yuni')), cellof(*PXOF('Locus'))); _ym += mtrace(cellof(*PXOF('Locus')), cellof(*PXOF('Mungo')))[1:]
add('yuni.mungo', 'yuni', 'Yuni', 'Mungo', _ym, name="Yuni's road to Mungo, by Locus")
add('yuni.mantis', 'yuni', 'Yuni', 'Mantis', mtrace(cellof(*PXOF('Yuni')), cellof(*PXOF('Mantis'))), name="Yuni's highway to Mantis")
# Dalab's dirt roads between its settlements
# (no dirt roads: Dalab makes shoddy repairs to the Ancient roads instead, the owner 2026-11-11)
# Voth: new, less elaborate highways between its major settlements
vk = _mask('Vothic Kingdom')
VM = {n: [s['px'], s['py']] for n, s in S.items() if vk[s['py'], s['px']] and s['type'] in ('city', 'arcology')}
ISLE = ('Temora', "Zey'danin")
for n in ISLE: VM.pop(n, None)
n_vo = mesh('vothic', VM, 'voth', 'Vothic highway', 1, ancient_pairs)
XM = {n: PXOF(n) for n in ('Erehwon', 'Qiblai', 'Theodiga', 'Strongbow', 'Strongwall', 'Longsong')}
n_xa = mesh('xanadu', XM, 'xanadu', 'Xanadu road', 2, ancient_pairs)
ISL = mtrace(cellof(*PXOF('Temora')), cellof(*PXOF("Zey'danin")))
add('vothic.isle', 'vothic', 'Temora', "Zey'danin", ISL, name="Vothic highway on the Throne's shore: Temora to Zey'danin (not joined to the mainland)")
iv = np.array(ISL); nq = PXOF('Nereus'); kk = int(np.hypot(iv[:, 0] - nq[0], iv[:, 1] - nq[1]).argmin())
add('dirt.nereus', 'dirt', 'Nereus', 'the Temora highway', mtrace(cellof(*nq), cellof(*[int(iv[kk][0]), int(iv[kk][1])])), name='Dirt path: Nereus to the Temora-Zey\'danin highway')
# Izani highways to Cascade, from Drum and from Pontus
for a in ('Drum', 'Pontus'):
    add('izani.cascade.%s' % a.lower(), 'izani', a, 'Cascade', mtrace(cellof(*PXOF(a)), cellof(*PXOF('Cascade'))), name='Izani highway: %s to Cascade' % a)

print('redundant, dropped:', REDUNDANT)
print('izani', n_iz, 'vothic', n_vo, 'Voth members', sorted(VM), 'Izani members', len(IZM))
IZ = [n for n in IZM if n in S or n.replace(' ', '  ') in S]
IZ = [n if n in S else n.replace(' ', '  ') for n in IZ]
add('izani.mantis-bowl', 'izani', 'Mantis', nodes['Bowl arcology']['name'], mtrace(cellof(*PXOF('Mantis')), cellof(*P('Bowl arcology'))), name='Izani road: Mantis to the Bowl arcology')
add('dirt.coyote', 'dirt', 'Pinnacle Rock', 'Coyote Canyon', mtrace(cellof(*PXOF('Pinnacle Rock')), cellof(*PXOF('Coyote Canyon'))), name='Dirt road: Pinnacle Rock to Coyote Canyon, by the basin')
# ---- the Beast Riders' undergrowth trails between their sites, and from each to the nearest Ancient highway (the owner, 2026-11-11)
BR = {n: PXOF(n) for n in ("Mav's Refuge", 'Pinnacle Rock', 'Girder', 'Talon')}
n_tr = mesh('trail', BR, 'trail', 'Beast Rider trail', 1, ())
anc_pts = np.array([q for r in routes if r['class'] in ('trunk', 'line') for k, q in enumerate(r['px']) if r['form'][min(k, len(r['form']) - 1)] != 'tunnel'])
def spur(cls, name, q, limit_px, label):
    d = np.hypot(anc_pts[:, 0] - q[0], anc_pts[:, 1] - q[1]); k = int(d.argmin())
    if 1.5 < d[k] <= limit_px:
        tgt = [float(anc_pts[k][0]), float(anc_pts[k][1])]
        add('%s.spur.%s' % (cls, name.replace(' ', '').lower()), cls, name, 'the Ancient highway', mtrace(cellof(*q), cellof(*tgt)), name='%s: %s to the Ancient highway' % (label, name))
for n, q in BR.items(): spur('trail', n, q, 60, 'Beast Rider trail')
spur('dirt', 'Coyote Canyon', PXOF('Coyote Canyon'), 200, 'Dirt road')   # the owner, 2026-11-11
# two small Ring Islander villages (about 1,000 people each) on the Throne's coast, north-east and south-east of Zey'danin,
# joined to it by dirt paths (the owner, 2026-11-11): the coastal land cell nearest a bearing 30 to 60 px out
_zx, _zy = PXOF("Zey'danin")
_coast = binary_dilation(W2, iterations=1) & ~W2 & (E2 < 600)
_cy, _cx = np.nonzero(_coast)
for _nm, (_bx, _by) in (('Islander village (NE of Zey\'danin)', (0.7, -0.7)), ('Islander village (SE of Zey\'danin)', (0.7, 0.7))):
    _dx, _dy = _cx - _zx, _cy - _zy; _r = np.hypot(_dx, _dy)
    _ok = (_r > 12) & (_r < 70) & ((_dx * _bx + _dy * _by) / np.maximum(_r, 1e-6) > 0.8)
    if not _ok.any(): print('no coast for', _nm); continue
    _k = int(np.argmin(np.where(_ok, _r, 1e9))); _vp = [int(_cx[_k]), int(_cy[_k])]
    _id = 'new.islander.' + ('ne' if 'NE' in _nm else 'se')
    nodes[_nm] = {'id': _id, 'name': _nm, 'type': 'village', 'px': _vp, 'kind': 'town',
                  'note': "proposed (the owner, 2026-11-11): a small Ring Islander fishing village, about 1,000 people, on the Throne's coast; a dirt path to Zey'danin"}
    add('dirt.' + _id, 'dirt', "Zey'danin", _nm, mtrace(cellof(_zx, _zy), cellof(*_vp)), name="Dirt path: Zey'danin to the %s" % _nm.replace(' (', ', ').replace(')', ''))
    print('islander village', _nm, _vp, 'at', round(float(E2[_vp[1], _vp[0]])), 'm')
add('dirt.reed-mungo', 'dirt', 'Reed', 'Mungo', mtrace(cellof(*PXOF('Reed')), cellof(*PXOF('Mungo'))), name='Dirt path: Reed to Mungo')   # the owner, 2026-11-11
# ---- the owner: "if convenient, modern highways and trails should try to connect to the ancient network if it is not too far" (40 km)
done = set(BR) | {'Temora', "Zey'danin", 'the Temora highway'}
for r in list(routes):
    if r['class'] not in ('izani', 'vothic', 'trade', 'yuni', 'dalab', 'dirt', 'xanadu'): continue
    for nm, q in ((r['from'], r['px'][0]), (r['to'], r['px'][-1])):
        if nm in done or nm in {v['name'] for v in nodes.values()} or nm == 'the Ancient highway': continue
        done.add(nm); spur(r['class'], nm, q, 20, {'izani': 'Izani spur', 'vothic': 'Vothic spur', 'trade': 'Trade spur', 'yuni': 'Yuni spur', 'dalab': 'Dalab dirt road', 'dirt': 'Dirt path', 'xanadu': 'Xanadu spur'}[r['class']])
# ---- candidates to move onto the network (the owner: "in some cases, we might want to move the settlement onto an existing highway")
vt = np.array([p for r in routes if r['class'] in ('line', 'trunk') for k, p in enumerate(r['px']) if r['form'][min(k, len(r['form']) - 1)] != 'tunnel'])
moves = []
for n in IZ:
    if n in nodes or n.replace('  ', ' ') in ('Nusidi', 'the Pile'): continue
    s0 = S[n]; d = np.hypot(vt[:, 0] - s0['px'], vt[:, 1] - s0['py']); k = int(d.argmin())
    if 1.5 < d[k] <= 5: moves.append({'name': n.replace('  ', ' '), 'type': s0['type'], 'px': [s0['px'], s0['py']], 'to': [float(vt[k][0]), float(vt[k][1])], 'km': round(2 * float(d[k]), 1)})
moves.sort(key=lambda m: m['km'])
_rem = W2 & PALEO & (_xx > 760) & (_yy < 470)
_ry, _rx = np.nonzero(_rem)
_nbr = [r for r in routes if r['id'] in ('ancient.northbasin', 'izani.frontier')]
_cv = [min((q for r in _nbr for q in r['px']), key=lambda q: np.hypot(_rx - q[0], _ry - q[1]).min())] if len(_rx) else []
if _cv:
    _q = min(_cv, key=lambda q: math.hypot(q[0] - _sr[0], q[1] - _sr[1]))
    SERAI_MOVE = {'name': 'Serai', 'px': _sr, 'to': [int(_q[0]), int(_q[1])], 'km': round(2 * math.hypot(_q[0] - _sr[0], _q[1] - _sr[1]), 1),
                  'why': 'the owner: Serai sits in the northern basin, on that lake, on the highway (confirmed 2026-11-11)'}
print('Serai move (all Jimjam roads):', SERAI_MOVE)
if SERAI_MOVE: moves.append(dict(SERAI_MOVE, type='village'))
# ---- extensions into the new west (lore to come); the north is now the Outland Gate highway's
EXT = [('southwest', 'the Silent Vales', [194, 982])]
for k, label_, pt in EXT:
    c0 = cellof(*pt); d0 = dijkstra(GR, indices=c0, directed=False)
    best = min((m for m in names if m not in NOT_RNG and nodes[m]['kind'] == 'site'), key=lambda m: d0[src[ix[m]]])
    add('ext.' + k, 'extension', nodes[best]['name'], label_, trace(src[ix[best]], c0), name='Extension (lore to come): ' + nodes[best]['name'] + ' toward ' + label_)
for r in routes:
    r['from'] = 'the Pit' if r['from'] == 'Korona site' else r['from']; r['to'] = 'the Pit' if r['to'] == 'Korona site' else r['to']
    r['name'] = r['name'].replace('the Korona site', 'the Pit').replace('Korona site', 'the Pit')
# THE RIFT LINE TO STRONGBOW IS ABANDONED (the owner, 2026-11-11, in the Strongbow session; settlements/strongbow/PLAN.md on
# claude/keen-swanson-68a311): no upkeep on the Theodiga-Strongbow leg, the way broken near Strongbow, the terminus hall at the foot a ruin
# the town builds over
SB_ABANDONED = "abandoned (the owner, 2026-11-11): no upkeep; the way is broken near Strongbow, and the terminus hall at its foot is a ruin the town builds over"
for r in routes:
    if r['class'] == 'line' and (r['from'], r['to']) == ('Theodiga', 'Strongbow'):
        r['up'] = ['decayed'] * len(r['up']); r['note'] = SB_ABANDONED + ('; ' + r['note'] if r.get('note') else '')
# the last pass (legs51.py): and a unique id on every leg (`line` keeps the shared one)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import legs51
routes = legs51.finish(routes, {n: (s['px'], s['py']) for n, s in S.items()})
out = {'nodes': [dict(v) for v in nodes.values()], 'routes': routes, 'extra': EXTRA_PTS, 'move_candidates': moves,
       'excluded': {'zeijani': list(ZEIJ), 'forts_off_the_way': ['Fort Ebon', 'Fort Vaklu'], 'ports': PORTS}}
json.dump(out, open(SP + '/net51.json', 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
tot = {}
for r in routes: tot.setdefault(r['class'], [0, 0, 0]); t = tot[r['class']]; t[0] += 1; t[1] += r['km']; t[2] += r['tunnel_km']
print(N, 'nodes;', tot)
for r in routes:
    if r['class'] in ('line', 'branch', 'possible') or r['airless_open_km'] or r['id'] in ('trickster', 'outland', 'outland.korona'):
        print('  %-70s %5d km  tunnel %4d  airless-open %d' % (r['name'][:70], r['km'], r['tunnel_km'], r['airless_open_km']))
print('korona site:', nodes['Korona site'])
print('izani roads:', len([r for r in routes if r['class'] == 'izani']), 'move candidates:', moves)
