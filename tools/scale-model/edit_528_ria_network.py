#!/usr/bin/env python3
"""Scale model 5.1, edit 28 (2026-11-24): the Ria basin as one Mississippi/Missouri-like river system (the owner: "those
river changes look like squiggly lines, i wanted something more like an extended mississippi/missouri system"; scope "the
Ria basin"; the land: "lay valleys, but respect the climate variety topography edit from recently").

    python tools/scale-model/edit_528_ria_network.py [--dry]      # --dry: the report and a preview picture, nothing saved

The 30 rivers draining to the Rīwa-Wāta (9101) by their `to` chain (the Arcflow, 9107, and the north delta's reaches,
9103 and 9104, left out) came from continental-scope's Ria hydrology as ruled zig-zags (every course turning ~28 degrees
at nearly every step), their carved grooves beside them. Here:
1. **The old grooves filled**: within 10 px of an old course (not on water, not by another river) a grey closing of 9 px
   gives back the land the groove was cut from.
2. **Routed on the land**: each river from its own source, through its own waypoints (the towns on it, the canals' ends on
   it, and its old course every ~70 px, so its general line, its tributaries and the country it drains stay as the
   continental edit made them), to its parent's new course near its old junction: least-cost on the 8-neighbour grid,
   climbing dear, low ground cheap, a smooth wander field so a plain is not crossed in ruled lines. Parents first (the
   trunk, then down the tree; bigger first within a level).
3. **Meandered by its size**: a smooth course (Chaikin), then a wander whose amplitude grows with the flow (0.33 Q^0.25 px:
   the trunk ~2.7 px, a 100 m3/s tributary ~1 px) and whose wavelength and amplitude drift (irregular, not a saw), damped
   on steep reaches, faded at sources, mouths, towns and canal ends (so those stay on the river).
4. **Valleys laid** along each new course, never raising the land: a level floodplain 0.3 Q^0.33 px either side (the
   trunk ~5 px, 20 km across) at the river's graded floor (the running low of the filled land along it, falling to its
   parent's floor at the junction), walls rising 30 + 3000/(sqrt(Q)+10) m a px beyond it. Away from the courses the land
   (the Dome, the Compass Hills, Springhollows, Weeping Valley) is the continental edit's; the water's shores are kept.
5. **The records**: px every 0.6 px, bed_m (the floor less a channel of 3 + 1.2 Q^0.3 m), q_m3s growing down the course
   with each tributary at its junction, `to.at_px` the junction on the parent's new course, lengths, source and mouth.
6. **The rasters**: heights; temperatures lapsed; rain, class and zone re-derived where the land moved (`reclimate`); the
   paint relit; the old courses' painted threads taken out of the satellite and relief maps and the new ones painted.
Refuses to run twice (9101's `net528`). Writes edit_528_ria_network.report.json and edit_528_preview.png.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from scipy.spatial import cKDTree
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import dijkstra
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C, smodel.geom as G   # noqa: E402

SEED = 52801
TRUNK = '9101'
EXCL = {'9107', '9103', '9104'}
WIN = (585, 0, 1425, 306)          # x0, y0, x1, y1: the routing window (map px)
GORGE_RIVERS = {'9102'}              # rivers kept in the gorges carved for them (9102 Hām-Tsēk, the Web-Cleaver Gorge)
EVERY = 70.0                       # px between the old course's guide points
STEP = 0.6                          # px between the new course's points
RIVER_RGB = (63, 111, 134)


def pid(r):
    t = r.get('to') or {}
    if t.get('kind') == 'river' and t.get('id') is not None:
        return str(t['id'])
    if t.get('river') is not None:
        return str(t['river'])
    return None


def basin(by):
    def ok(k, seen=()):
        if k == TRUNK:
            return True
        if k in EXCL or k in seen or k not in by:
            return False
        p = pid(by[k])
        return p is not None and ok(p, seen + (k,))
    return [k for k in by if ok(k)]


def polyline_mask(lines, shape, r):
    """cells within r px of any of the polylines (map px)"""
    im = Image.new('L', (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(im)
    for pts in lines:
        d.line([tuple(p) for p in pts], fill=1, width=1)
    m = np.array(im).astype(bool)
    return nd.distance_transform_edt(~m) <= r


def bil(A, x, y):
    x = np.clip(x, 0, A.shape[1] - 1.001); y = np.clip(y, 0, A.shape[0] - 1.001)
    i, j = np.floor(x).astype(int), np.floor(y).astype(int); fx, fy = x - i, y - j
    return A[j, i] * (1 - fx) * (1 - fy) + A[j, i + 1] * fx * (1 - fy) + A[j + 1, i] * (1 - fx) * fy + A[j + 1, i + 1] * fx * fy


def resample(pts, step):
    P_ = np.array(pts, float)
    seg = np.hypot(*np.diff(P_, axis=0).T)
    s = np.r_[0, np.cumsum(seg)]
    n = max(2, int(math.ceil(s[-1] / step)) + 1)
    t = np.linspace(0, s[-1], n)
    return np.stack([np.interp(t, s, P_[:, 0]), np.interp(t, s, P_[:, 1])], 1)


def smooth_noise(rng, n, scale):
    """a smooth series in [0, 1] over n samples, varying over ~scale samples"""
    m = max(4, int(n / max(scale, 1)) + 3)
    knots = rng.random(m)
    return np.interp(np.linspace(0, m - 1, n), np.arange(m), knots)


class Router:
    """least-cost routes on the window: climbing dear, low ground cheap, a smooth wander field"""

    def __init__(self, Ef, whas, wlev, rng):
        x0, y0, x1, y1 = WIN
        self.x0, self.y0 = x0, y0
        Ew = Ef[y0:y1, x0:x1].copy()        # not blurred: a blur hides the narrow gorges (the Web-Cleaver's) and a route crosses the hills
        wet = whas[y0:y1, x0:x1]
        sea = wet & (np.nan_to_num(wlev[y0:y1, x0:x1], nan=1e9) < 50)
        ny, nx = Ew.shape
        self.ny, self.nx = ny, nx
        n = nd.gaussian_filter(rng.standard_normal((ny, nx)), 14.0)
        wander = np.exp(0.5 * n / (n.std() + 1e-9))
        mult = wander * np.where(sea, 40.0, np.where(wet, 3.0, 1.0))
        idx = np.arange(ny * nx).reshape(ny, nx)
        rows, cols, data = [], [], []
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                if not dj and not di:
                    continue
                ja, jb = max(0, -dj), ny - max(0, dj)
                ia, ib = max(0, -di), nx - max(0, di)
                u = idx[ja:jb, ia:ib]; v = idx[ja + dj:jb + dj, ia + di:ib + di]
                Eu = Ew[ja:jb, ia:ib]; Ev = Ew[ja + dj:jb + dj, ia + di:ib + di]
                L = math.hypot(dj, di)
                c = L * (1 + np.maximum(0.0, Ev - Eu) / 15.0 + (Ev + 3000.0) / 4000.0) * mult[ja + dj:jb + dj, ia + di:ib + di]
                rows.append(u.ravel()); cols.append(v.ravel()); data.append(c.ravel())
        self.G = csr_matrix((np.concatenate(data), (np.concatenate(rows), np.concatenate(cols))), shape=(ny * nx, ny * nx))
        self.sea = sea

    def cell(self, p):
        i = int(round(p[0])) - self.x0; j = int(round(p[1])) - self.y0
        return int(np.clip(j, 0, self.ny - 1)) * self.nx + int(np.clip(i, 0, self.nx - 1))

    def blocked(self, block):
        """the graph with the `block` cells absorbing (no way out of them: a route that meets a river stops there)"""
        from scipy.sparse import diags
        keep = (~block.ravel()).astype(float)
        G2 = diags(keep) @ self.G
        G2.eliminate_zeros()
        return G2

    def search(self, a, G2):
        s = self.cell(a)
        dist, pred = dijkstra(G2, directed=True, indices=s, return_predecessors=True)
        return s, dist, pred

    def path(self, s, pred, g):
        path = [g]
        while path[-1] != s:
            path.append(pred[path[-1]])
        path.reverse()
        return [(int(c % self.nx) + self.x0, int(c // self.nx) + self.y0) for c in path]

    def win(self, pts, r=0):
        """the window's cells of a course (map px), made 4-connected (no diagonal slips across it), dilated by r"""
        m = np.zeros((self.ny, self.nx), bool)
        P_ = resample(pts, 0.3) if len(pts) > 1 else np.array(pts, float)
        i = np.clip(np.round(P_[:, 0]).astype(int) - self.x0, 0, self.nx - 1)
        j = np.clip(np.round(P_[:, 1]).astype(int) - self.y0, 0, self.ny - 1)
        m[j, i] = True
        m = nd.binary_dilation(m, structure=nd.generate_binary_structure(2, 1))
        if r:
            m = nd.binary_dilation(m, iterations=r)
        return m


def crosses(a, b, skip_tail=0, eps=0.15):
    """does polyline a cross polyline b (its last skip_tail points left out: the junction)"""
    A = np.asarray(a, float)
    if skip_tail:
        A = A[:-skip_tail]
    B_ = np.asarray(b, float)
    if len(A) < 2 or len(B_) < 2:
        return False
    tb = cKDTree((B_[:-1] + B_[1:]) / 2)
    for i in range(len(A) - 1):
        p, q = A[i], A[i + 1]
        for j in tb.query_ball_point((p + q) / 2, 1.2):
            r_, s_ = B_[j], B_[j + 1]
            d1 = np.cross(q - p, r_ - p); d2 = np.cross(q - p, s_ - p)
            d3 = np.cross(s_ - r_, p - r_); d4 = np.cross(s_ - r_, q - r_)
            if d1 * d2 < -eps and d3 * d4 < -eps:
                return True
    return False


def main():
    dry = '--dry' in sys.argv
    rng = np.random.default_rng(SEED)
    D = P.load()
    R = D['rivers']
    by = {str(r['id']): r for r in R}
    if by[TRUNK].get('net528'):
        sys.exit('edit_528_ria_network has run already (9101 carries net528)')
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    B = basin(by)
    old = {k: [tuple(p) for p in by[k]['px']] for k in B}
    rep = {'edit': '5.1 edit 28: the Ria basin as one river system', 'date': '2026-11-24', 'rivers': len(B)}

    # ---- 1. the old grooves filled
    others = [r['px'] for r in R if str(r['id']) not in B and r.get('px')]
    near_old = polyline_mask(old.values(), E0.shape, 8)
    near_other = polyline_mask(others, E0.shape, 3)
    Ec = nd.grey_closing(E0, size=(7, 7))
    fillm = near_old & ~near_other & ~whas0 & (Ec - E0 > 10) & (Ec - E0 < 120)   # a groove, not a gorge (the Web-Cleaver's stays)
    Ef = E0.copy(); Ef[fillm] = Ec[fillm]
    rep['grooves_filled_cells'] = int(fillm.sum())
    rep['grooves_filled_m_median'] = round(float(np.median((Ec - E0)[fillm])), 1) if fillm.any() else 0

    # ---- waypoints: the towns and the canals' ends on each river, its old course every EVERY px
    S = P.settlements()
    canal_ends = []
    CN = D.get('canals')
    for c in (CN.get('canals', []) if isinstance(CN, dict) else (CN or [])):
        cp = c.get('px') or c.get('points') or []
        canal_ends += [tuple(cp[0]), tuple(cp[-1])] if cp else []
    fixed_all = [(s['px'], s['py'], 'pin', s['name']) for s in S] + [(p[0], p[1], 'canal', 'canal end') for p in canal_ends]
    WP, FIXED = {}, {}
    # the old courses ran over the upland the Dome's shield now stands on (edit 28a, run first): their guide points on
    # it are dropped, so a river finds its own way off the shield instead of being led over the summit
    dome_r = next((r_ for r_ in P.regions() if r_.get('id') == 'rmweubdnyts8y'), None)
    on_dome = (nd.binary_dilation(G.poly([tuple(p) for p in dome_r['points']], 1.0, 1.0, E0.shape), iterations=3)
               if dome_r else np.zeros(E0.shape, bool))
    # the gorges a river was carved into keep it (the owner, 2026-11-25: "ham tsek river fell out of the canyon carved
    # for it"; the Web-Cleaver Gorge, 1.2-1.85 km deep, is 9102's): where the old course runs over 300 m under the land
    # round it (a grey closing over 21 px) for 8 points or more, that stretch is LOCKED: its ends become fixed points of
    # the route and the stretch itself is spliced back into the new course as it was, unmeandered
    Ec21 = nd.grey_closing(E0, size=(21, 21))
    LOCK = {}
    # a river rising on the shield rises on its flank facing the way it goes (its old mouth), halfway up, so it runs
    # down off the volcano instead of across it (its old source, on the far flank, left it crossing the summit)
    SRC = {}
    if dome_r:
        dpoly = G.poly([tuple(p) for p in dome_r['points']], 1.0, 1.0, E0.shape)
        dcy, dcx = [float(v.mean()) for v in np.nonzero(dpoly)]
        dpts = np.array(dome_r['points'], float)
        dR = float(np.mean(np.hypot(dpts[:, 0] - dcx, dpts[:, 1] - dcy)))
        for k in B:
            s0 = old[k][0]
            if dpoly[int(round(s0[1])), int(round(s0[0]))]:
                mo = old[k][-1]
                ux_, uy_ = mo[0] - dcx, mo[1] - dcy
                nn = math.hypot(ux_, uy_) or 1.0
                SRC[k] = (round(dcx + 0.5 * dR * ux_ / nn, 2), round(dcy + 0.5 * dR * uy_ / nn, 2))
    rep['sources_moved_on_the_dome'] = {k: {'was': list(old[k][0]), 'now': list(v)} for k, v in SRC.items()}
    for k in B:
        o = np.array(old[k])
        jo = np.clip(np.round(o[:, 1]).astype(int), 0, E0.shape[0] - 1); io = np.clip(np.round(o[:, 0]).astype(int), 0, E0.shape[1] - 1)
        if k not in GORGE_RIVERS:
            continue
        g_ = (Ec21[jo, io] - E0[jo, io] > 300) & ~whas0[jo, io]
        g_ = nd.binary_closing(np.r_[False, g_, False], structure=np.ones(7))[1:-1]
        lab_, n_ = nd.label(g_)
        segs = []
        for l_ in range(1, n_ + 1):
            ix_ = np.nonzero(lab_ == l_)[0]
            if len(ix_) >= 8 and ix_[0] > 1 and ix_[-1] < len(o) - 2:
                segs.append((int(ix_[0]), int(ix_[-1])))
        if segs:
            LOCK[k] = segs
    rep['gorges_locked'] = {k: [[round(float(old[k][a][0]), 1), round(float(old[k][a][1]), 1), round(float(old[k][b][0]), 1), round(float(old[k][b][1]), 1)]
                                for a, b in v] for k, v in LOCK.items()}
    for k in B:
        o = np.array(old[k]); so = np.r_[0, np.cumsum(np.hypot(*np.diff(o, axis=0).T))]
        cand = []
        for a_, b_ in LOCK.get(k, []):
            cand.append((so[a_], (float(o[a_, 0]), float(o[a_, 1])), True, 'gorge head'))
            cand.append((so[b_], (float(o[b_, 0]), float(o[b_, 1])), True, 'gorge foot'))
        for (x, y, kind, nm) in fixed_all:
            d = np.hypot(o[:, 0] - x, o[:, 1] - y); i = int(d.argmin())
            lim = 4.0 if kind == 'pin' else 3.0
            if d[i] <= lim and 3 < so[i] < so[-1] - 3:
                cand.append((so[i], (float(x), float(y)), True, nm))
        every = EVERY if (by[k].get('q_mouth_m3s') or 0) >= 400 else 2 * EVERY
        for t in np.arange(every, so[-1] - every * .5, every):
            i = int(np.searchsorted(so, t))
            if on_dome[int(round(o[i, 1])), int(round(o[i, 0]))]:
                continue
            if all(abs(t - c[0]) > EVERY * .4 for c in cand if c[2]):
                cand.append((t, (float(o[i, 0]), float(o[i, 1])), False, None))
        cand.sort()
        WP[k] = [c[1] for c in cand]
        FIXED[k] = [(c[1], c[3]) for c in cand if c[2]]

    # ---- 2-3. routed and meandered, parents first
    router = Router(Ef, whas0, wlev0, rng)
    level = {TRUNK: 0}
    def lv(k):
        if k not in level:
            level[k] = lv(pid(by[k])) + 1
        return level[k]
    order = sorted(B, key=lambda k: (lv(k), -(by[k].get('q_mouth_m3s') or 0)))
    new = {}
    rep['joined_elsewhere'] = []; rep['fixed_skipped'] = []
    for k in order:
        r = by[k]
        src = SRC.get(k, tuple(old[k][0]))
        # every course laid so far stops a route (a stream meeting a river joins it; it never crosses one)
        R_ = np.zeros((router.ny, router.nx), bool)
        for o_ in new.values():
            R_ |= router.win(o_['pts'], 2)       # ~3 px either side: a stream that close to a river joins it, not runs beside it
        sc = router.cell(src); sj, si = divmod(sc, router.nx)
        R_[max(0, sj - 1):sj + 2, max(0, si - 1):si + 2] = False
        G2 = router.blocked(R_) if new else router.G
        Rcells = np.nonzero(R_.ravel())[0]
        cells, joined = [src], None
        for b in WP[k]:
            s, dist, pred = router.search(cells[-1], G2)
            gb = router.cell(b)
            if np.isfinite(dist[gb]) and not R_.ravel()[gb]:
                cells += router.path(s, pred, gb)[1:]
                continue
            if any(math.hypot(b[0] - f[0][0], b[1] - f[0][1]) < 0.01 for f in FIXED[k]):
                rep['fixed_skipped'].append({'river': k, 'px': [round(b[0], 1), round(b[1], 1)]})
            if len(Rcells) and np.isfinite(dist[Rcells]).any():   # behind a river: it joins the river it meets
                g = Rcells[np.argmin(dist[Rcells])]
                cells += router.path(s, pred, g)[1:]
                joined = True
                break
        if k == TRUNK:
            s, dist, pred = router.search(cells[-1], G2)
            cells += router.path(s, pred, router.cell(old[k][-1]))[1:]
            end_pt = tuple(old[k][-1]); parent = None
        else:
            if not joined:
                s, dist, pred = router.search(cells[-1], G2)
                par = new[pid(r)]
                mo = np.array(old[k][-1])
                near = np.asarray(sorted({router.cell(p) for p in par['pts'] if math.hypot(p[0] - mo[0], p[1] - mo[1]) <= 40}), int)
                near = near[np.isfinite(dist[near])] if len(near) else near
                g = near[np.argmin(dist[near])] if len(near) else Rcells[np.argmin(dist[Rcells])]
                cells += router.path(s, pred, g)[1:]
            # the river it met: the nearest laid course to where it stopped
            e = np.array(cells[-1], float); best = None
            for pk, o_ in new.items():
                pp = np.array(o_['pts']); jn = int(np.hypot(pp[:, 0] - e[0], pp[:, 1] - e[1]).argmin())
                dd = math.hypot(pp[jn, 0] - e[0], pp[jn, 1] - e[1])
                if best is None or dd < best[0]:
                    best = (dd, pk, tuple(pp[jn]))
            parent, end_pt = best[1], best[2]
            if parent != pid(r):
                rep['joined_elsewhere'].append({'river': k, 'name': r['name'], 'was': pid(r), 'joins': parent})
        line = [tuple(map(float, c)) for c in cells]
        line[0] = src; line[-1] = end_pt
        sm = G.chaikin(line, 4)
        pts = resample(sm, STEP)
        # the route's stair steps smoothed out (a running mean over ~5 px, the ends and the fixed points held)
        keep = np.zeros(len(pts), bool); keep[[0, -1]] = True
        for (fp, _) in FIXED[k]:
            keep[int(np.hypot(pts[:, 0] - fp[0], pts[:, 1] - fp[1]).argmin())] = True
        sm2 = np.stack([nd.uniform_filter1d(pts[:, c], 9, mode='nearest') for c in (0, 1)], 1)
        w_ = np.ones(len(pts))
        for i in np.nonzero(keep)[0]:
            w_ = np.minimum(w_, np.clip(np.abs(np.arange(len(pts)) - i) / 8.0, 0, 1))
        pts = pts * (1 - w_[:, None]) + sm2 * w_[:, None]
        q = float(r.get('q_mouth_m3s') or r.get('q_mouth') or 50.0)
        A0 = 0.33 * q ** 0.25
        s = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
        z0 = bil(Ef, pts[:, 0], pts[:, 1])
        slope = np.abs(np.gradient(nd.uniform_filter1d(z0, 15), s))
        flat = np.clip(1.2 - slope / 40.0, 0.25, 1.0)
        n = len(pts)
        # two scales: the long bends of the valley (the river's sweep across its plain) and the fine meanders inside it
        lam1 = (20.0 + 14.0 * A0) * (0.75 + 0.5 * smooth_noise(rng, n, 2 * (20 + 14 * A0) / STEP))
        amp1 = 2.0 * A0 * flat * (0.45 + 1.0 * smooth_noise(rng, n, 3 * (20 + 14 * A0) / STEP))
        lam2 = (4.0 + 2.5 * A0) * (0.7 + 0.6 * smooth_noise(rng, n, 3 * (4 + 2.5 * A0) / STEP))
        amp2 = 0.3 * A0 * flat * (0.3 + 1.0 * smooth_noise(rng, n, 4 * (4 + 2.5 * A0) / STEP))
        ds = np.r_[0, np.diff(s)]
        ph1 = 2 * math.pi * np.cumsum(ds / lam1) + rng.random() * 6.28
        ph2 = 2 * math.pi * np.cumsum(ds / lam2) + rng.random() * 6.28
        off = amp1 * np.sin(ph1) + amp2 * np.sin(ph2)
        fade = np.clip(np.minimum(s, s[-1] - s) / 4.0, 0, 1)
        for (fp, _) in FIXED[k]:
            dfx = np.hypot(pts[:, 0] - fp[0], pts[:, 1] - fp[1])
            fade = np.minimum(fade, np.clip((dfx - 0.5) / 3.0, 0, 1))
        tg = np.gradient(pts, axis=0)
        nrm = np.stack([-tg[:, 1], tg[:, 0]], 1) / (np.hypot(tg[:, 0], tg[:, 1])[:, None] + 1e-9)
        raw = resample(G.chaikin(line, 2), STEP / 2)
        tree_raw = cKDTree(raw)
        # the course: meandered at full swing, else half, else none, else the bare route, whichever first crosses no
        # course laid before it (its last 8 points, the junction, left out)
        for scale in (1.0, 0.5, 0.0, None):
            if scale is None:
                mp = resample(raw, STEP); mp[0] = src; mp[-1] = end_pt
                new_pull = 0
            else:
                mp = pts + nrm * (off * fade * scale)[:, None]
                jj = np.clip(np.round(mp[:, 1]).astype(int), 0, E0.shape[0] - 1); ii = np.clip(np.round(mp[:, 0]).astype(int), 0, E0.shape[1] - 1)
                j0 = np.clip(np.round(pts[:, 1]).astype(int), 0, E0.shape[0] - 1); i0 = np.clip(np.round(pts[:, 0]).astype(int), 0, E0.shape[1] - 1)
                bad = whas0[jj, ii] & ~whas0[j0, i0]
                mp[bad] = pts[bad]
                mp = np.array(G.chaikin([tuple(p) for p in mp], 1))
                mp[0] = src; mp[-1] = end_pt
                mp = resample(mp, STEP)
                # confined reaches (a gorge, a karst slot): where the smoothed course stands over 80 m above the routed
                # one beside it, it is pulled back onto the route (eased over 5 points), so no channel cuts a valley's wall
                dr_, ir_ = tree_raw.query(mp)
                hi_ = bil(Ef, mp[:, 0], mp[:, 1]) > bil(Ef, raw[ir_, 0], raw[ir_, 1]) + 80
                if hi_.any():
                    wgt = np.clip(nd.uniform_filter1d(hi_.astype(float), 11) * 3, 0, 1)
                    wgt[hi_] = 1.0
                    mp = mp * (1 - wgt[:, None]) + raw[ir_] * wgt[:, None]
                    mp = resample(mp, STEP)
                new_pull = int(hi_.sum())
            if not any(crosses(mp, o_['pts'], skip_tail=8) for o_ in new.values()):
                break
        if scale != 1.0:
            rep.setdefault('meander_reduced', []).append({'river': k, 'scale': scale})
        # the locked gorges spliced back in as they were
        for a_, b_ in LOCK.get(k, []):
            o = np.array(old[k])
            ia = int(np.hypot(mp[:, 0] - o[a_, 0], mp[:, 1] - o[a_, 1]).argmin())
            ib = int(np.hypot(mp[:, 0] - o[b_, 0], mp[:, 1] - o[b_, 1]).argmin())
            if ib > ia:
                mp = resample(np.vstack([mp[:ia], o[a_:b_ + 1], mp[ib + 1:]]), STEP)
                mp[0] = src; mp[-1] = end_pt
        new[k] = {'pts': [tuple(p) for p in mp], 'q': q, 'A0': A0, 'pulled': new_pull, 'parent': parent}

    # ---- the old courses' deep grooves (over 120 m: left for the routing in case a new course took one) filled where no
    # new course runs within 3 px, so the uplands do not keep the old zig-zag canyons
    near_new = polyline_mask([new[k]['pts'] for k in B], E0.shape, 3)
    fill2 = near_old & ~near_other & ~whas0 & ~near_new & (Ec - E0 >= 120)
    Ef[fill2] = Ec[fill2]
    rep['deep_grooves_filled_cells'] = int(fill2.sum())

    # ---- 4. floors and valleys
    land_lv = np.where(whas0, np.nan_to_num(wlev0, nan=0.0), np.nan)
    floors = {}
    for k in order:
        pts = np.array(new[k]['pts'])
        z = bil(Ef, pts[:, 0], pts[:, 1])
        jj = np.clip(np.round(pts[:, 1]).astype(int), 0, E0.shape[0] - 1); ii = np.clip(np.round(pts[:, 0]).astype(int), 0, E0.shape[1] - 1)
        wet = whas0[jj, ii]
        z[wet] = land_lv[jj[wet], ii[wet]]
        z = np.minimum.accumulate(z)
        for i in range(1, len(z)):
            if not (wet[i] and wet[i - 1]):
                z[i] = min(z[i], z[i - 1] - 0.15)
        if k != TRUNK:
            pz = floors[new[k]['parent']]
            pp = np.array(new[new[k]['parent']]['pts'])
            jn = int(np.hypot(pp[:, 0] - pts[-1, 0], pp[:, 1] - pts[-1, 1]).argmin())
            zj = pz[jn]
            z = np.maximum(z, zj)
            z[-1] = zj
        floors[k] = np.maximum(z, D['lo'] + 5)
    Ecarve = np.full(E0.shape, np.inf)
    for k in order:
        pts = np.array(new[k]['pts']); q = new[k]['q']
        Wf = max(0.9, 0.3 * q ** 0.33); kk = 30.0 + 3000.0 / (math.sqrt(q) + 10.0)
        reach = Wf + 6
        cap = 250.0 if q >= 1000 else 120.0      # the valley laid in the land, not a mountainside cut away
        xa, xb = int(max(0, pts[:, 0].min() - reach)), int(min(E0.shape[1] - 1, pts[:, 0].max() + reach))
        ya, yb = int(max(0, pts[:, 1].min() - reach)), int(min(E0.shape[0] - 1, pts[:, 1].max() + reach))
        yy, xx = np.mgrid[ya:yb + 1, xa:xb + 1]
        d, ix = cKDTree(pts).query(np.stack([xx.ravel(), yy.ravel()], 1), distance_upper_bound=reach)
        okm = np.isfinite(d)
        surf = np.full(d.shape, np.inf)
        surf[okm] = floors[k][ix[okm]] + kk * np.maximum(0.0, d[okm] - Wf)
        # the channel (0.8 px) always at the floor; the floodplain and its walls at most `cap` under the land, so a plain
        # opens where the land is low and an upland (the Dome, the karst) keeps its shape round a narrow cut
        surf = np.where(d <= 0.8, surf, np.maximum(surf, Ef[ya:yb + 1, xa:xb + 1].ravel() - cap))
        sub = Ecarve[ya:yb + 1, xa:xb + 1]
        Ecarve[ya:yb + 1, xa:xb + 1] = np.minimum(sub, surf.reshape(sub.shape))
    En = np.where(whas0, E0, np.minimum(Ef, Ecarve))
    # the shores kept: no land within 2 px of water below its level plus a metre
    dw, (wy, wx) = nd.distance_transform_edt(~whas0, return_indices=True)
    wl_near = np.nan_to_num(wlev0, nan=-9e9)[wy, wx]
    shore = (~whas0) & (dw <= 2)
    En[shore] = np.maximum(En[shore], np.minimum(np.maximum(Ef[shore], E0[shore]), wl_near[shore] + 1.0))
    # every course on the finished land: its floor the running low of the ground under it (a neighbour's valley may have cut
    # lower near a junction), its land cells cut to that floor; repeated so the junctions settle. The bed follows it.
    for _ in range(4):
        for k in order:
            pts = np.round(np.array(new[k]['pts']), 2)       # the cells the stored points (2 decimals) fall in
            jj = np.clip(np.round(pts[:, 1]).astype(int), 0, E0.shape[0] - 1); ii = np.clip(np.round(pts[:, 0]).astype(int), 0, E0.shape[1] - 1)
            land = ~whas0[jj, ii]
            e = En[jj, ii].astype(float)
            f = np.empty(len(e)); cur = np.inf
            for i in range(len(e)):
                if land[i]:
                    cur = min(cur, e[i])
                f[i] = cur if np.isfinite(cur) else floors[k][i]
            f = np.minimum(f, floors[k])
            for i in np.nonzero(land)[0]:
                En[jj[i], ii[i]] = min(En[jj[i], ii[i]], f[i])
            floors[k] = np.minimum.accumulate(f)
    moved = np.abs(En - E0) > 1
    rep['land_moved_cells'] = int(moved.sum())
    rep['lowered_cells'] = int((En < E0 - 1).sum()); rep['raised_cells'] = int((En > E0 + 1).sum())
    rep['lowered_m_median'] = round(float(np.median((E0 - En)[En < E0 - 1])), 1) if (En < E0 - 1).any() else 0
    rep['lowered_m_max'] = round(float((E0 - En).max()), 1)

    # ---- 5. the records
    kids = {k: [] for k in B}
    for k in B:
        if k != TRUNK:
            pp = np.array(new[new[k]['parent']]['pts']); e = np.array(new[k]['pts'][-1])
            kids[new[k]['parent']].append((int(np.hypot(pp[:, 0] - e[0], pp[:, 1] - e[1]).argmin()), k))
    depth = {TRUNK: 0}
    def nlv(k):
        if k not in depth:
            depth[k] = nlv(new[k]['parent']) + 1
        return depth[k]
    qm = {}
    for k in sorted(B, key=lambda k: -nlv(k)):
        r = by[k]; n = len(new[k]['pts'])
        q_src = float((r.get('q_m3s') or [new[k]['q'] * .1])[0])
        trib = sorted(kids[k])
        tsum = sum(qm[c] for _, c in trib)
        q_mouth = max(float(r.get('q_mouth_m3s') or new[k]['q']), q_src + tsum)
        local = q_mouth - q_src - tsum
        qs = q_src + local * np.linspace(0, 1, n)
        for i, c in trib:
            qs[i:] += qm[c]
        qm[k] = q_mouth
        new[k]['qs'] = qs
    for k in B:
        r = by[k]; pts = np.array(new[k]['pts']); q = new[k]['q']
        dch = 3.0 + 1.2 * q ** 0.3
        bed = np.minimum.accumulate(floors[k] - dch)
        L = float(np.hypot(*np.diff(pts, axis=0).T).sum()) * 2.0
        r['px'] = [[round(float(x), 2), round(float(y), 2)] for x, y in pts]
        r['bed_m'] = [float(v) for v in np.minimum.accumulate(np.round(bed, 1))]
        r['q_m3s'] = [round(float(v), 1) for v in new[k]['qs']]
        for f in ('len_km', 'length_km'):
            r[f] = round(L, 1)
        for f in ('q_mouth', 'q_mouth_m3s', 'mouth_m3s'):
            if f in r or f == 'q_mouth_m3s':
                r[f] = round(float(qm[k]), 1)
        r['source_m'] = round(float(bed[0]), 1); r['mouth_m'] = round(float(bed[-1]), 1)
        if k == TRUNK:
            r['to'] = dict(r['to'], at_px=[round(float(pts[-1, 0]), 2), round(float(pts[-1, 1]), 2)])
            r['net528'] = True
        else:
            t = dict(r['to']); t['at_px'] = [round(float(pts[-1, 0]), 2), round(float(pts[-1, 1]), 2)]
            pk = new[k]['parent']
            if 'id' in t or t.get('kind') == 'river':
                t['kind'] = 'river'; t['id'] = by[pk]['id']
            else:
                t['river'] = by[pk]['id']
            t['name'] = by[pk]['name']
            r['to'] = t
    # the towns and the canals' ends: how far the new courses pass from them
    allp = np.array([p for k in B for p in new[k]['pts']]); allk = [k for k in B for p in new[k]['pts']]
    tree = cKDTree(allp)
    rep['fixed_points'] = []
    for k in B:
        for (fp, nm) in FIXED[k]:
            d, i = tree.query(fp)
            rep['fixed_points'].append({'river': k, 'what': nm, 'px': [round(fp[0], 1), round(fp[1], 1)], 'from_new_course_px': round(float(d), 2)})
    rep['junctions_px_off'] = max(float(np.hypot(*(np.array(new[k]['pts'][-1]) - np.array(new[new[k]['parent']]['pts'])).T).min()) for k in B if k != TRUNK)
    rep['crossings_left'] = [(a, b) for a in B for b in B if a < b and crosses(new[a]['pts'], new[b]['pts'], skip_tail=8)
                             and crosses(new[b]['pts'], new[a]['pts'], skip_tail=8)]
    sinu = {}
    for k in B:
        p = np.array(new[k]['pts']); Lp = np.hypot(*np.diff(p, axis=0).T).sum(); d = math.hypot(*(p[-1] - p[0])) or 1
        tv = np.diff(np.unwrap(np.arctan2(*np.diff(p, axis=0).T[::-1])))
        sinu[k] = {'name': by[k]['name'], 'km': round(Lp * 2), 'sinuosity': round(Lp / d, 2), 'q': round(float(qm[k]))}
    rep['courses'] = sinu

    # the preview: the new courses (thick by flow) over the new relief, the old ones faint
    X0, Y0, X1, Y1, Sc = 380, 0, 1430, 330, 2
    sub = En[Y0:Y1, X0:X1]
    lo, hi = np.percentile(sub, 2), np.percentile(sub, 98)
    g = np.clip((sub - lo) / (hi - lo), 0, 1)
    gy, gx = np.gradient(sub); shade = np.clip(0.75 + (gx - gy) / 400.0, 0.4, 1.1)
    rgb = np.stack([90 + 120 * g, 100 + 110 * g, 80 + 90 * g], -1) * shade[..., None]
    rgb[whas0[Y0:Y1, X0:X1]] = [70, 110, 160]
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).resize(((X1 - X0) * Sc, (Y1 - Y0) * Sc), Image.BILINEAR)
    dr = ImageDraw.Draw(im)
    for k in B:
        dr.line([((x - X0) * Sc, (y - Y0) * Sc) for x, y in old[k]], fill=(150, 150, 150), width=1)
    for k in B:
        q = qm[k]; w = 5 if q > 1500 else 4 if q > 400 else 3 if q > 100 else 2
        dr.line([((x - X0) * Sc, (y - Y0) * Sc) for x, y in new[k]['pts']], fill=(40, 120, 230), width=w, joint='curve')
    for s_ in S:
        if X0 <= s_['px'] < X1 and Y0 <= s_['py'] < Y1:
            cx, cy = (s_['px'] - X0) * Sc, (s_['py'] - Y0) * Sc
            dr.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(250, 240, 200))
    im.save(os.path.join(HERE, 'edit_528_preview.png'))
    json.dump(rep, open(os.path.join(HERE, 'edit_528_ria_network.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(json.dumps({k: v for k, v in rep.items() if k not in ('courses', 'fixed_points')}, ensure_ascii=False, indent=1))
    print('fixed points off their river (px):', sorted(round(f['from_new_course_px'], 1) for f in rep['fixed_points'])[-6:])
    if dry:
        return

    # ---- 6. the rasters
    raw0 = {k: P.raster(D, k, 'L') for k in ('p', 'c', 'z')}
    D['h'] = P.encode_heights(D, En, W0)
    lap = C.lapse(D, E0, En, whas0, wlev0)
    for k in C.TEMPS:
        D[k] = lap[k]
    rain2, cls2, zon2, _, crep = C.reclimate(D, E0, En, whas0, whas0.copy())
    rep['reclimate'] = crep
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    hexrgb = lambda h: tuple(int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    relit, _, _ = PA.relight(D, E0, En)
    for k, v in relit.items():
        D[k] = v
    # the painted threads: the old courses' out, the new in
    band = polyline_mask(old.values(), E0.shape, 4) & ~whas0
    rep['threads_removed_px'] = {}
    for key in ('st', 't'):
        arr = P.raster(D, key)
        a = arr.astype(float)
        med = np.stack([nd.median_filter(a[..., c], 7) for c in range(3)], -1)
        lum, mlum = a.mean(-1), med.mean(-1)
        thread = band & ((a[..., 2] - a[..., 0]) - (med[..., 2] - med[..., 0]) > 6) & (lum - mlum < -5)
        hole = nd.binary_dilation(thread, iterations=1) & band
        rep['threads_removed_px'][key] = int(hole.sum())
        arr = PA.inpaint(arr, hole)
        im = Image.fromarray(arr).convert('RGBA')
        over = Image.new('RGBA', im.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(over)
        for k in B:
            q = qm[k]; w = 1 if q < 100 else 2 if q < 800 else 3
            dr.line([tuple(p) for p in new[k]['pts']], fill=RIVER_RGB + (205,), width=w, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(.6))
        arr = np.array(Image.alpha_composite(im, over).convert('RGB'))
        D[key] = P.jpeg_like(D, key, arr)
    D['h'] = P.encode_heights(D, En, W0)
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_528_ria_network.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('saved')


if __name__ == '__main__':
    main()
