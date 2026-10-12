#!/usr/bin/env python3
"""Scale model 4.21: the river valleys audited and the rivers designated, with their flow and size (the owner, Oct 2026:
"make sure they make sense (nothing flowing uphill) and designate them on the map, with estimated flow/size, so they can
be placed when the open world is built").

    python3 tools/scale-model/edit_rivers.py <4.20 page.html> <regions.json> <settlements.json> <out page.html>

Reads the page as saved (Artifact read) and the two collections (one JSON list each), writes the new page, and beside it
<out>.report.json (the audit) and <out>.rivers.png (the network over the relief map). Deterministic. Steps:

1. THE WATER. Rain (DATA.p) and the mean temperature (DATA.tm) on the height grid give each cell's runoff and open water's
   evaporation (hydro.runoff, Turc). Ground above the air (the rim, where the page reads no temperature) gives nothing;
   ground frozen all year (mean under ICE_T) carries ice, not rivers.
2. THE ROUTING (hydro.route). The sea (the Ring Sea's level, -1,500 m, and the oceans at the map's edge) and the edge end
   flow. A lake the model draws below its own spill (a closed lake) ends flow as drawn. Every other hollow and lake fills
   and spills, unless what reaches it is less than its full lake would lose: then it is endorheic and its lake is drawn
   where the two balance. A hollow whose only way out is over frozen ground is closed (module doc of hydro.py).
3. THE AUDIT. The network is traced into rivers (discharge at least Q_RIVER, liquid ground) and dry valleys (wadis:
   a catchment of at least A_WADI km2 that carries less). Each course's surface is walked downstream: wherever it rises
   (outside a lake) it crosses a hollow the 4 km grid holds and a river cannot. A hollow no deeper than BREACH_M is the
   grid's (a gorge narrower than a cell): the course is cut through it, falling all the way. A deeper one would hold a
   lake: reported, not edited. The model's lakes are checked against their water (a closed lake that gains water would
   rise; a lake standing over its own shore), and the Yuni river's drawn course is checked to fall.
4. THE CHECK. The routing runs again on the cut heights; every designated course must fall (or run level on a lake)
   from its source to its mouth, or the script stops.
5. THE DATA. DATA.rivers: every river and wadi, each with its course (map px, one vertex per height cell), the bed and
   the mean discharge at each vertex, its width and depth (hydraulic geometry: w = 4.5 Q^0.5, d = 0.35 Q^0.38, mean flow),
   Strahler order, length, catchment, where it ends, and the settlements within SETTLE_KM of it. The Yuni river keeps its
   drawn course and gains the rest. DATA.basins: the endorheic lakes (level, area, the water they balance). DATA.hydro:
   the method and the thresholds. The page's hover readout gains a 'river' row.
6. THE PAINT. Rivers drawn on the satellite and relief maps (st, t), wider with flow; dry valleys are not painted.
"""
import io, json, math, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import LO, HI, load, raster, b64, chaikin, meander   # noqa: E402
from edit_dams import set_data   # noqa: E402
import hydro   # noqa: E402

VERSION = '4.21'
IMPORT_KM = 300.0      # km: the rain this near the ocean at the map's edge is the crater's only outside water
ICE_T = -10.0          # deg C: ground with a colder annual mean is frozen all year
CLOSED_M = 25.0        # m: a drawn lake whose spill stands this far over its level is closed (ends flow as drawn)
Q_RIVER = 10.0         # m3/s mean flow: a river
A_WADI = 2500.0        # km2: a dry valley's catchment, when it carries less than Q_RIVER
MIN_CELLS = 6          # a course shorter than this many height cells (~24 km) is not listed, unless it carries Q_KEEP
Q_KEEP = 100.0
BREACH_M = 150.0       # m: a hollow on a course no deeper than this is the grid's, and is cut through
SETTLE_KM = 12.0       # a settlement this near a course is listed on it
TOOL_REGIONS = re.compile(r'^(little demo|big demo|passage|east rim|region \d+|dam( 2)?)$', re.I)
RIVER_RGB = (63, 111, 134)
# 4.21, the owner: the river basin in Beast Riders lay partly below the Ring Sea it opens onto (dry valley floors at
# -2,000 to -2,250 m beside water at -1,500 m, and the sea itself reaching up its valleys in narrow branching arms: a
# half-drowned ria); rendered fully as river instead. The sea's arms narrower than ARM_R cells (water a disc of that
# radius does not fit in, in pieces of at least ARM_MIN cells) become land, and every dry cell of the region below the
# sea's level and joined to it is raised to `sea` + `lift` + `grade` m per km of its distance up
# the valley from the shore, so the floors run down to the sea; the painted maps take the colour of the land beside them.
GRADE = {'Beast Riders': dict(sea=-1500.0, lift=5.0, grade=3.0)}
ARM_R, ARM_MIN = 2, 4     # the Yuni river's colour on the painted maps (4.19)

# the readout row and its lookup (a coarse grid of the courses' vertices, the nearest within 3 map px)
UI_ROW = ('    <span>wind</span><span id="rWind">—</span>\n',
          '    <span>wind</span><span id="rWind">—</span>\n    <span>river</span><span id="rRiver">—</span>\n')
UI_HOVER = ("    rWind.textContent = WDEAD[wi] ? '— (airless)' : wv.toFixed(1)+' m/s · '+Math.round(wq/10)*10+' W/m² · '+wclass;\n",
            "    rWind.textContent = WDEAD[wi] ? '— (airless)' : wv.toFixed(1)+' m/s · '+Math.round(wq/10)*10+' W/m² · '+wclass;\n"
            "    rRiver.textContent=riverAt(u*(OW-1),v*(OH-1));\n")
UI_LOOKUP = ("  function hover(e){\n",
             "  // the designated rivers (DATA.rivers, 4.21): the nearest course within 3 map px (6 km) of the pointer\n"
             "  const rRiver=document.getElementById('rRiver'), RIVG=new Map();\n"
             "  (DATA.rivers||[]).forEach((r,k)=>r.px.forEach((p,n)=>{const key=Math.floor(p[0]/8)+','+Math.floor(p[1]/8);let a=RIVG.get(key);if(!a)RIVG.set(key,a=[]);a.push(k,n);}));\n"
             "  function riverAt(x,y){ let best=null,bd=9;\n"
             "    for(let gx=Math.floor(x/8)-1;gx<=Math.floor(x/8)+1;gx++)for(let gy=Math.floor(y/8)-1;gy<=Math.floor(y/8)+1;gy++){const a=RIVG.get(gx+','+gy);if(!a)continue;\n"
             "      for(let i=0;i<a.length;i+=2){const r=DATA.rivers[a[i]],p=r.px[a[i+1]],d=(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y);if(d<bd){bd=d;best=[r,a[i+1]];}}}\n"
             "    if(!best) return '—'; const [r,n]=best, q=r.q_m3s?r.q_m3s[Math.min(n,r.q_m3s.length-1)]:null;\n"
             "    return r.name+' · '+(r.kind==='wadi'?'dry valley, '+Math.round(r.catchment_km2/100)*100+' km²':(q<10?q.toFixed(1):Math.round(q))+' m³/s · ~'+Math.round(r.width_m)+' m wide'); }\n"
             "  function hover(e){\n")


def grid_fields(D):
    VW, VH, OW, OH = D['w'], D['hh'], D['fullW'], D['fullH']
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    h = raster(D, 'h').astype(np.int64)
    wl = raster(D, 'wl').astype(np.int64)
    E = LO + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (HI - LO)
    water = h[..., 2] > 127
    whas = wl[..., 2] > 127
    wlev = np.where(whas, LO + ((wl[..., 0] << 8) | wl[..., 1]) / 65535 * (HI - LO), np.nan)
    ny, nx = E.shape
    gx = np.clip(np.round(np.arange(nx) / su).astype(int), 0, OW - 1)
    gy = np.clip(np.round(np.arange(ny) / sv).astype(int), 0, OH - 1)
    P = (raster(D, 'p', 'L').astype(float) / 255 * 4000)[np.ix_(gy, gx)]
    T = (raster(D, 'tm', 'L').astype(float) - 90)[np.ix_(gy, gx)]
    G = dict(su=su, sv=sv, h=h, E=E, water=water, whas=whas, wlev=wlev, P=P, T=T)
    G['evap_k'], G['books'] = closed_books(G)
    return G


def closed_books(G):
    """the crater's water books (hydro.calibrate): its only outside water is what the ocean at the map's edge brings,
    taken as all the rain within IMPORT_KM of that ocean; evaporation is scaled until the rest balances"""
    E, whas, P, T = G['E'], G['whas'], G['P'], G['T']
    air = T > -85
    lab, n = nd.label(whas, structure=np.ones((3, 3)))
    ocean = np.zeros(E.shape, bool)
    for k in range(1, n + 1):
        m = lab == k
        j, i = np.nonzero(m)
        if j.min() == 0 or i.min() == 0 or j.max() == E.shape[0] - 1 or i.max() == E.shape[1] - 1:
            ocean |= m
    inside = air & ~ocean
    near = inside & (nd.distance_transform_edt(~ocean) * (2 / G['su']) < IMPORT_KM)
    imported = float(P[near].sum()) * 1e-3 * 16.04e6 / hydro.SEC_YR
    k = hydro.calibrate(P, T, inside, whas, imported)
    b0, b1 = hydro.budget(P, T, inside, whas, 1.0), hydro.budget(P, T, inside, whas, k)
    books = {'import_km': IMPORT_KM, 'imported_m3s': round(imported), 'evap_k': round(k, 3),
             'turc_alone': {'rain': round(b0[0]), 'land_evap': round(b0[1]), 'water_evap': round(b0[2]), 'left': round(b0[3])},
             'closed': {'rain': round(b1[0]), 'land_evap': round(b1[1]), 'water_evap': round(b1[2]), 'left': round(b1[3])}}
    return k, books


def setup(G):
    E, whas, wlev, P, T = G['E'], G['whas'], G['wlev'], G['P'], G['T']
    ny, nx = E.shape
    R, L = hydro.runoff(P, T, G.get('evap_k', 1.0))
    air = T > -85                         # the page shows the airless rim as -90
    R[~air] = 0.0
    PL = np.where(air, P - L, 0.0)
    S = np.where(whas, np.fmax(wlev, E), E)
    lab, n = nd.label(whas, structure=np.ones((3, 3)))
    sea = np.zeros(E.shape, bool)
    for k in range(1, n + 1):
        m = lab == k
        lv = float(np.nanmedian(wlev[m]))
        j, i = np.nonzero(m)
        at_edge = j.min() == 0 or i.min() == 0 or j.max() == ny - 1 or i.max() == nx - 1
        if abs(lv + 1500) < 1 or (at_edge and abs(lv) < 1):
            sea |= m
    term = sea.copy()
    term[0, :] = term[-1, :] = term[:, 0] = term[:, -1] = True
    F0, _ = hydro.fill(S, term)
    bl, bn = nd.label(whas & ~sea, structure=np.ones((3, 3)))
    closed = np.zeros(E.shape, bool)
    bodies = []
    for k in range(1, bn + 1):
        m = bl == k
        lv, sp = float(np.median(S[m])), float(F0[m].max())
        if sp - lv > CLOSED_M:
            closed |= m
        bodies.append(dict(cells=m, level=lv, spill=sp, closed=sp - lv > CLOSED_M))
    return dict(R=R, L=L, PL=PL, air=air, S=S, sea=sea, term=term | closed, lake=whas & ~sea, bodies=bodies,
                frozen=(T < ICE_T) & air | ~air)


def qcells(acc):
    return acc * 1e-3 * 16.04e6 / hydro.SEC_YR   # mm/yr x 4 km cells -> m3/s


def trace(rt, chan, key):
    """courses on the channel cells: each mouth's main stem traced upstream by the larger `key`, every other branch a
    course of its own that ends where it joins. Returns [(cells downstream-ordered, mouth receiver or None)]"""
    rec = rt['rec']
    ny, nx = chan.shape
    ups = {}
    for j, i in zip(*np.nonzero(chan)):
        a, b = rec[j, i]
        if a >= 0 and chan[a, b]:
            ups.setdefault((a, b), []).append((j, i))
    mouths = [(j, i) for j, i in zip(*np.nonzero(chan)) if rec[j, i][0] < 0 or not chan[tuple(rec[j, i])]]
    mouths.sort(key=lambda c: -key[c])
    out, todo = [], [(c, None) for c in mouths]
    while todo:
        c, joins = todo.pop(0)
        path = [c]
        while True:
            u = ups.get(path[-1], [])
            if not u:
                break
            u = sorted(u, key=lambda x: -key[x])
            for o in u[1:]:
                todo.append((o, path[-1]))
            path.append(u[0])
        path = path[::-1]
        mouth = joins if joins is not None else (tuple(rec[c]) if rec[c][0] >= 0 else None)
        out.append((path, mouth, joins is not None))
    return out


def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    page, rpath, spath, out = sys.argv[1:5]
    lines, li, D = load(page)
    REG = [r for r in json.load(open(rpath, encoding='utf8')) if not TOOL_REGIONS.match(r.get('name', '').strip())]
    SET = json.load(open(spath, encoding='utf8'))
    G = grid_fields(D)
    su, sv, E = G['su'], G['sv'], G['E']
    OW, OH = D['fullW'], D['fullH']
    KM = 2 / su                          # one height cell, km
    KM2 = (2 / su) * (2 / sv)
    px = lambda j, i: [round(i / su, 1), round(j / sv, 1)]
    # the sea's narrow arms in the GRADE regions become land (before anything reads the water)
    arms = np.zeros(E.shape, bool)
    for nm, g in GRADE.items():
        r_ = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name') == nm), None)
        if r_ is None:
            sys.exit('no region named %r' % nm)
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in r_['points']], fill=1)
        inr = nd.binary_dilation(np.array(im).astype(bool), iterations=1)
        sea_ = G['whas'] & (np.abs(np.nan_to_num(G['wlev'], nan=1e9) - g['sea']) < 1)
        yy, xx = np.mgrid[-ARM_R:ARM_R + 1, -ARM_R:ARM_R + 1]
        nar = sea_ & ~nd.binary_opening(sea_, structure=(xx * xx + yy * yy) <= ARM_R * ARM_R) & inr
        lab, n = nd.label(nar, structure=np.ones((3, 3)))
        sz = nd.sum(nar, lab, range(1, n + 1))
        arms |= np.isin(lab, [k + 1 for k in range(n) if sz[k] >= ARM_MIN])
    G['whas'] = G['whas'] & ~arms
    G['water'] = G['water'] & ~arms
    G['wlev'] = np.where(arms, np.nan, G['wlev'])
    H = setup(G)
    print('the water books: Turc alone leaves %(left)+d m3/s of rain with nowhere to go;' % G['books']['turc_alone'],
          'evaporation x %.2f closes them on %d m3/s from the ocean' % (G['evap_k'], G['books']['imported_m3s']))
    report = {'version': VERSION, 'thresholds': {'ice_t': ICE_T, 'q_river_m3s': Q_RIVER, 'a_wadi_km2': A_WADI,
                                                 'min_km': round(MIN_CELLS * KM), 'breach_m': BREACH_M},
              'books': G['books']}

    liquid = ~H['frozen']

    def courses(rt, chan, key):
        return [c for c in trace(rt, chan, key) if len(c[0]) >= MIN_CELLS or (len(c[0]) >= 2 and key[c[0][-1]] >= Q_KEEP)]

    def network(G_, H_, extra_lake, extra_level):
        """route, then the courses: rivers by discharge, dry valleys by catchment"""
        S_ = np.where(extra_lake, extra_level, H_['S'])
        rt = hydro.route(S_, H_['term'], H_['R'], H_['PL'], H_['lake'] | extra_lake, H_['frozen'], force=force)
        Q = qcells(rt['acc'])
        area = hydro.accumulate_area(rt['order'], rt['rec'], np.where(rt['term'], 0.0, KM2))
        lake = G_['whas'] | extra_lake | rt['term']
        chan = (Q >= Q_RIVER) & liquid & ~lake
        wadi = (area >= A_WADI) & (Q < Q_RIVER) & liquid & ~lake & ~chan
        return rt, Q, area, lake, chan, courses(rt, chan, Q), courses(rt, wadi, area)

    def rises(path, S, water):
        """[(index, rise m)] where the surface climbs along a course (lakes run level)"""
        return [(n, float(S[path[n]] - S[path[n - 1]])) for n in range(1, len(path))
                if S[path[n]] > S[path[n - 1]] + 0.5 and not water[path[n]]]

    # ---- 3. the audit and the fix, in rounds: route; every hollow a course climbs out of is cut through (shallow) or
    # made a lake at its spill (deep: a river fills it and runs out over its lip); route again, until no course climbs
    En = E.copy()
    graded = np.zeros(E.shape, bool)
    report['graded'] = []
    for nm, g in GRADE.items():
        r_ = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name') == nm), None)
        if r_ is None:
            sys.exit('no region named %r' % nm)
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in r_['points']], fill=1)
        inr = np.array(im).astype(bool)
        sea_ = G['whas'] & (np.abs(np.nan_to_num(G['wlev'], nan=1e9) - g['sea']) < 1)
        low = ~G['whas'] & (E < g['sea'] + g['lift']) & nd.binary_dilation(inr, iterations=2)
        lab, n = nd.label(low, structure=np.ones((3, 3)))
        touch = set(np.unique(lab[nd.binary_dilation(sea_, structure=np.ones((3, 3))) & low])) - {0}
        keep = np.isin(lab, sorted(touch)) & (np.isin(lab, np.unique(lab[inr & low])))
        # distance up the valley from the shore, inside the low ground (cells)
        dist = np.full(E.shape, np.inf)
        front = list(zip(*np.nonzero(keep & nd.binary_dilation(sea_, structure=np.ones((3, 3))))))
        for c in front:
            dist[c] = 1.0
        import collections
        dq = collections.deque(front)
        while dq:
            j, i = dq.popleft()
            for dj in (-1, 0, 1):
                for di in (-1, 0, 1):
                    a, b = j + dj, i + di
                    if 0 <= a < E.shape[0] and 0 <= b < E.shape[1] and keep[a, b] and dist[a, b] > dist[j, i] + math.hypot(dj, di):
                        dist[a, b] = dist[j, i] + math.hypot(dj, di)
                        dq.append((a, b))
        tgt = g['sea'] + g['lift'] + g['grade'] * dist * KM
        up = keep & np.isfinite(dist) & (tgt > En)
        En[up] = tgt[up]
        graded |= up
        labk, nk = nd.label(up, structure=np.ones((3, 3)))
        for k in range(1, nk + 1):
            m = labk == k
            j, i = np.argwhere(m).mean(0)
            report['graded'].append({'region': nm, 'at_px': px(round(j), round(i)), 'cells': int(m.sum()),
                                     'km2': round(float(m.sum() * KM2)), 'floor_before_m': round(float(E[m].min())),
                                     'raised_most_m': round(float((En - E)[m].max())), 'up_valley_km': round(float(dist[m].max() * KM))})
        report['arms_to_land'] = {'cells': int(arms.sum()), 'km2': round(float(arms.sum() * KM2))}
        print("graded %s: %d cells of the sea's arms made land;" % (nm, int(arms.sum())), end=' ')
        print('graded %s: %d cells (%d valleys) raised to run down to the sea at %d m, by up to %d m' % (
            nm, int(up.sum()), nk, g['sea'], float((En - E)[up].max())))
    # the owner's river (the Yuni river, 4.19): its drawn course on the grid, 8-connected, down to the first water; the
    # bed under it falls all the way (cut only), and the routing follows it
    force = []
    yuni = next((r for r in D.get('rivers', []) if r['name'] == 'Yuni river'), None)
    if yuni:
        cells = []
        for x, y in yuni['px']:
            c = (int(round(y * sv)), int(round(x * su)))
            # the drawn line meanders about a km off the carved channel: snap to the lowest cell beside it
            c = min(((c[0] + dj, c[1] + di) for dj in (-1, 0, 1) for di in (-1, 0, 1)), key=lambda q: (En[q], q))
            while cells and max(abs(c[0] - cells[-1][0]), abs(c[1] - cells[-1][1])) > 1:   # fill a jump
                l_ = cells[-1]
                cells.append((l_[0] + int(np.sign(c[0] - l_[0])), l_[1] + int(np.sign(c[1] - l_[1]))))
            if not cells or c != cells[-1]:
                cells.append(c)
        k = next((n for n, c in enumerate(cells) if G['whas'][c]), None)
        if k is None:
            sys.exit('the Yuni river reaches no water')
        cells = cells[:k]
        # drop loops (a meander folding back onto a cell it has left)
        seen, path = {}, []
        for c in cells:
            if c in seen:
                path = path[:seen[c] + 1]
                seen = {q: n for n, q in enumerate(path)}
                continue
            seen[c] = len(path)
            path.append(c)
        before = [float(En[c]) for c in path]
        bed, most = None, 0.0
        for c in path:
            bed = En[c] if bed is None else min(En[c], bed - 1.0)
            most = max(most, En[c] - bed)
            En[c] = bed
        force = [path]
        climbs = [round(b - a) for a, b in zip(before[:-1], before[1:]) if b > a + 1]
        report['yuni_course'] = {'cells': len(path), 'cut_most_m': round(most, 1), 'climbs_on_4_20_m': climbs, 'source_m': round(float(En[path[0]])),
                                 'last_cell_m': round(float(En[path[-1]]))}
        print('Yuni river held to its drawn course: %d cells, its bed cut by up to %.0f m' % (len(path), most))
    through = np.zeros(E.shape, bool)           # the deep hollows' lakes
    through_lv = np.zeros(E.shape)
    hollows = []
    for rnd in range(1, 9):
        print('round %d: routing' % rnd)
        G2 = dict(G, E=En)
        H2 = setup(G2)
        rt, Q, area, lake, chan, riv, wad = network(G2, H2, through, through_lv)
        S0 = rt['S']
        water = G['whas'] | through
        found = {}
        # each hollow on its own: the cells under the filled surface, off the water (a unit of the routing can chain
        # several hollows and lakes together, and its spill is the highest of them)
        hol, _ = nd.label((rt['F'] - S0 > 0.5) & ~water, structure=np.ones((3, 3)))
        for kind, cs in (('river', riv), ('wadi', wad)):
            for path, mouth, _ in cs:
                for n, up in rises(path, S0, water):
                    k = hol[path[n - 1]] or hol[path[n]]
                    if k:
                        h = found.setdefault(k, dict(kind=kind, q=0.0))
                        h['q'] = max(h['q'], float(Q[path[n]]))
                        if kind == 'river':
                            h['kind'] = 'river'
                    else:
                        sys.exit('a course climbs outside any hollow at %s' % px(*path[n]))
        if not found:
            break
        boxes = nd.find_objects(hol)
        deep = set()
        for k, h in found.items():
            sl = boxes[k - 1]
            m = hol[sl] == k
            spill = float(rt['F'][sl][m].max())
            floor = float(S0[sl][m].min())
            j, i = np.argwhere(m)[np.argmin(S0[sl][m])]
            act = 'cut' if spill - floor <= BREACH_M else 'lake'
            if act == 'lake':
                deep.add(k)
                mm = np.zeros(E.shape, bool)
                mm[sl] = m
                through |= mm
                through_lv[mm] = spill
            hollows.append(dict(round=rnd, course=h['kind'], q_m3s=round(h['q'], 1), depth_m=round(spill - floor, 1),
                                spill_m=round(spill), floor_m=round(floor), cells=int(m.sum()),
                                at_px=px(j + sl[0].start, i + sl[1].start), action=act))
        # the cut: down each course the bed may not rise; where it would (a shallow hollow, or the ground past its lip
        # until the land falls below the bed), the ground under the course is lowered to 1 m under the cell before
        ncut = 0
        for path, mouth, _ in riv + wad:
            bed = None
            prev_u = 0
            for c in path:
                u = hol[c]
                if water[c] or rt['term'][c]:
                    bed, prev_u = S0[c], u
                    continue
                s_ = En[c]
                if bed is None or s_ <= bed + 0.5:
                    bed = s_ if bed is None else min(bed, s_)
                elif (u or prev_u) in deep or u in deep:
                    bed = s_                       # a deep hollow's lip: its lake runs level to it
                else:
                    bed -= 1.0
                    En[c] = bed
                    ncut += 1
                prev_u = u
        print('  %d hollows on courses: %d cut (%d cells lowered), %d made lakes' % (
            len(found), len(found) - len(deep), ncut, len(deep)))
    else:
        sys.exit('courses still climb after 8 rounds')
    cut = np.where(graded, 0.0, E - En)
    report['hollows'] = sorted(hollows, key=lambda h: -h['depth_m'])
    report['cuts'] = {'cells': int((cut > 0.05).sum()), 'deepest_m': round(float(cut.max()), 1),
                      'mean_m': round(float(cut[cut > 0.05].mean()), 1) if (cut > 0.05).any() else 0}
    print('cut: %(cells)d cells, deepest %(deepest_m)s m, mean %(mean_m)s m' % report['cuts'])
    # ---- 4. the check: on the final heights every course falls or runs level on water from source to mouth
    for kind, cs in (('river', riv), ('wadi', wad)):
        for path, mouth, _ in cs:
            r_ = rises(path, S0, water)
            assert not r_, '%s at %s still climbs %s m' % (kind, px(*path[r_[0][0]]), r_[0][1])
    print('check: every course falls to its mouth')
    rt2, Q2, area2, chan2, riv2, wad2 = rt, Q, area, chan, riv, wad
    # ---- the model's lakes and basins
    lakes = []
    for b in H2['bodies']:
        m = b['cells']
        j, i = np.argwhere(m).mean(0)
        ring = nd.binary_dilation(m, structure=np.ones((3, 3))) & ~G['whas']
        shore_min = float(En[ring].min()) if ring.any() else None
        # what reaches the lake: the flow of every cell draining into it from outside
        rec = rt2['rec']
        into = 0.0
        for jj, ii in zip(*np.nonzero(ring)):
            a, bb = rec[jj, ii]
            if a >= 0 and m[a, bb]:
                into += max(rt2['acc'][jj, ii], 0.0)
        bal = into + float(H2['PL'][m].sum())
        rec_ = dict(at_px=px(round(j), round(i)), km2=round(float(m.sum() * KM2)), level_m=round(b['level']),
                    spill_m=round(b['spill']), closed=b['closed'], inflow_m3s=round(float(qcells(into)), 1),
                    balance_m3s=round(float(qcells(bal)), 1))
        if b['closed'] and bal > 0:
            rec_['finding'] = 'closed lake gains %.0f m3/s: it would rise %d m to spill' % (qcells(bal), b['spill'] - b['level'])
        if shore_min is not None and shore_min < b['level'] - 100:
            rec_['finding'] = (rec_.get('finding', '') + '; ' if 'finding' in rec_ else '') + \
                'stands %d m over its lowest shore cell' % (b['level'] - shore_min)
        lakes.append(rec_)
    report['lakes'] = lakes
    basins = []
    CLS = raster(D, 'c', 'L')
    for e in rt2['ends']:
        m = e['cells'] & ~G['whas']
        if not m.any():
            continue
        j, i = np.argwhere(m).mean(0)
        km2 = float(m.sum() * KM2)
        if km2 < 30 and not e.get('shut'):
            continue
        cls = [D['climate']['classes'][int(CLS[int(round(j / sv)), int(round(i / su))])]['code']]
        basins.append(dict(at_px=px(round(j), round(i)), level_m=round(e['level']), km2=round(km2),
                           spill_m=round(e['spill']), climate=cls[0],
                           kind='unbalanced' if e.get('shut') and e.get('surplus', 0) > 0 else
                           ('salt lake' if cls[0].startswith(('B', 'X')) else 'lake'),
                           surplus_m3s=round(float(qcells(e.get('surplus', 0.0))), 1)))
    newlake = np.zeros(E.shape, bool)
    newlv = np.zeros(E.shape)
    for e, b in zip([e for e in rt2['ends'] if (e['cells'] & ~G['whas']).any() and
                     ((e['cells'] & ~G['whas']).sum() * KM2 >= 30 or e.get('shut'))], basins):
        if b['kind'] != 'unbalanced':
            m = e['cells'] & ~G['whas']
            newlake |= m
            newlv[m] = e['level']
    tl, tn = nd.label(through, structure=np.ones((3, 3)))
    for k in range(1, tn + 1):
        m = tl == k
        j, i = np.argwhere(m).mean(0)
        lv = float(through_lv[m].max())
        basins.append(dict(at_px=px(round(j), round(i)), level_m=round(lv), km2=round(float(m.sum() * KM2)),
                           depth_m=round(float((lv - En[m]).max())), kind='through lake',
                           climate=D['climate']['classes'][int(CLS[int(round(j / sv)), int(round(i / su))])]['code']))
        newlake |= m
        newlv[m] = lv
    basins.sort(key=lambda b: -b['km2'])
    report['basins'] = basins

    # ---- 5. the courses as data
    order = hydro.strahler(rt2['order'], rt2['rec'], chan2)
    regs = []
    for r in REG:
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in r['points']], fill=1)
        regs.append((r['name'].strip(), r.get('kind'), np.array(im).astype(bool)))

    def region_of(path):
        """the smallest region (any layer) holding at least half the course: the most particular name for it"""
        best = None
        for nm, kind, m in regs:
            share = sum(m[c] for c in path) / len(path)
            if share >= .5 and (best is None or m.sum() < best[0]):
                best = (m.sum(), nm)
        return best[1] if best else None

    setts = [s for s in SET if s.get('px') is not None]
    recs, idx = [], {}
    allc = [('river', c) for c in riv2] + [('wadi', c) for c in wad2]
    for kind, (path, mouth, joins) in allc:
        idx[path[-1]] = len(recs)
        recs.append(dict(kind=kind, path=path, mouth=mouth, joins=joins))
    # a tributary's mouth is a cell of its parent; a lake's or a basin's mouth is water
    cell_of = {}
    for k, r in enumerate(recs):
        for c in r['path']:
            cell_of.setdefault(c, k)
    names = {}
    yuni_k = None
    if yuni:
        fp = set(force[0])
        cand = [(sum(c in fp for c in r['path']), k) for k, r in enumerate(recs) if r['kind'] == 'river']
        best, yuni_k = max(cand)
        report['yuni_overlap_cells'] = int(best)
        if best < .8 * len(fp):
            sys.exit('the routing does not follow the Yuni river (%d of %d cells)' % (best, len(fp)))
    for k, r in sorted(enumerate(recs), key=lambda t: -(Q2[t[1]['path'][-1]] if t[1]['kind'] == 'river' else area2[t[1]['path'][-1]])):
        path = r['path']
        q = [float(Q2[c]) for c in path]
        bed = [float(rt2['S'][c]) for c in path]
        lenkm = sum(math.hypot(a[0] - b[0], a[1] - b[1]) for a, b in zip(path[:-1], path[1:])) * KM
        reg = region_of(path)
        if k == yuni_k:
            name = 'Yuni river'
        else:
            word = {'wadi': 'wadi'}.get(r['kind'], 'river' if q[-1] >= 50 else 'stream')
            base = '%s %s' % (reg or 'unnamed', word)
            names[base] = names.get(base, 0) + 1
            name = base if names[base] == 1 else '%s %d' % (base, names[base])
        mouth = r['mouth']
        if r['joins']:
            to = {'river': None, 'at_px': px(*mouth)}
            r['_to_cell'] = mouth
        elif mouth is None:
            to = {'edge': True}
        elif H2['sea'][mouth]:
            to = {'sea': 'Ring Sea' if abs(G['wlev'][mouth] + 1500) < 1 else 'ocean', 'at_px': px(*mouth)}
        elif G['whas'][mouth]:
            to = {'lake_m': round(float(G['wlev'][mouth])), 'at_px': px(*mouth)}
        elif through[mouth]:
            to = {'lake_m': round(float(through_lv[mouth])), 'through': True, 'at_px': px(*mouth)}
        elif rt2['term'][mouth]:
            to = {'basin_m': round(float(rt2['S'][mouth])), 'at_px': px(*mouth)}
        elif H2['frozen'][mouth]:
            to = {'ice': True, 'at_px': px(*mouth)}
        else:
            to = {'at_px': px(*mouth)}
        P_ = [px(*c) for c in path]
        near = []
        for s in setts:
            d = min(math.hypot(s['px'] - x, s['py'] - y) for x, y in P_) * 2
            if d <= SETTLE_KM:
                near.append(s['name'])
        rec = dict(id='r%03d' % k, name=name, kind=r['kind'], perennial=r['kind'] == 'river',
                   order=int(order[path[-1]]) if r['kind'] == 'river' else 0,
                   length_km=round(lenkm), catchment_km2=round(float(area2[path[-1]])),
                   q_mouth_m3s=round(q[-1], 1), source_m=round(bed[0]), mouth_m=round(bed[-1]),
                   region=reg, to=to, settlements=sorted(set(near)),
                   px=P_, bed_m=[round(v) for v in bed], q_m3s=[round(v, 1) for v in q])
        if r['kind'] == 'river':
            rec['width_m'] = round(4.5 * q[-1] ** .5)
            rec['depth_m'] = round(.35 * q[-1] ** .38, 1)
            rec['width_src_m'] = round(4.5 * q[0] ** .5)
        else:
            a_ = float(area2[path[-1]])
            rec['width_m'] = round(3 * a_ ** .35)      # a dry bed's flash-flood channel
            rec['depth_m'] = 0.0
        r['rec'] = rec
    for r in recs:
        if '_to_cell' in r:
            c = r['_to_cell']
            while c not in cell_of and c is not None:          # joins a stream too short to list: follow it down
                a, b = rt2['rec'][c]
                c = (a, b) if a >= 0 else None
            if c is None:
                r['rec']['to'] = {'at_px': r['rec']['to']['at_px']}
                continue
            p = recs[cell_of[c]]['rec']
            r['rec']['to'] = {'river': p['id'], 'name': p['name'], 'at_px': r['rec']['to']['at_px']}
    out_recs = [r['rec'] for r in recs]
    if yuni:
        y = next(r for r in out_recs if r['name'] == 'Yuni river')
        # the drawn course stays (the owner's), with the flow and size of the routed one
        ypx = yuni['px']
        yb = [float(nd.map_coordinates(En, [[p[1] * sv], [p[0] * su]], order=1)[0]) for p in ypx]
        ups = [round(b - a, 1) for a, b in zip(yb[:-1], yb[1:]) if b > a + 1]
        report['yuni'] = {'drawn_points': len(ypx), 'routed_cells': len(y['px']), 'rises_on_drawn_course': len(ups),
                          'largest_rise_m': max(ups) if ups else 0, 'source_m': round(yb[0]), 'mouth_m': round(yb[-1]),
                          'q_mouth_m3s': y['q_mouth_m3s']}
        y['drawn_px'] = ypx
        y['to'] = dict(y['to'], **({'named': yuni.get('to')} if yuni.get('to') else {}))
    out_recs.sort(key=lambda r: (r['kind'] != 'river', -(r['q_mouth_m3s'] if r['kind'] == 'river' else r['catchment_km2'])))
    print('designated: %d rivers (%d over 100 m3/s, %d over 1,000), %d dry valleys' % (
        sum(r['kind'] == 'river' for r in out_recs), sum(r['kind'] == 'river' and r['q_mouth_m3s'] >= 100 for r in out_recs),
        sum(r['kind'] == 'river' and r['q_mouth_m3s'] >= 1000 for r in out_recs), sum(r['kind'] == 'wadi' for r in out_recs)))

    # ---- 6. the page
    s = lines[li]
    rep = {}
    if (np.abs(En - E) > 0.05).any() or arms.any():
        h2 = G['h'].copy()
        enc = np.round(np.clip((En - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
        q_ = np.where(np.abs(En - E) > 0.05, enc, (h2[..., 0] << 8) | h2[..., 1])
        h2[..., 0], h2[..., 1] = q_ >> 8, q_ & 255
        h2[..., 2] = np.where(arms, 0, h2[..., 2])
        rep['h'] = b64(Image.fromarray(h2.astype(np.uint8), 'RGB'), optimize=True)
    if newlake.any() or arms.any():
        wl = raster(D, 'wl').astype(np.int64)
        wl[..., 2] = np.where(arms, 0, wl[..., 2])
        encw = np.round(np.clip((newlv - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
        add = newlake & ~G['whas']
        wl[..., 0] = np.where(add, encw >> 8, wl[..., 0])
        wl[..., 1] = np.where(add, encw & 255, wl[..., 1])
        wl[..., 2] = np.where(add, 255, wl[..., 2])
        rep['wl'] = b64(Image.fromarray(wl.astype(np.uint8), 'RGB'), optimize=True)
        report['new_water'] = {'cells': int(add.sum()), 'km2': round(float(add.sum() * KM2))}
    gF = nd.zoom(graded.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=1)[:OH, :OW] > .35
    gF = nd.binary_dilation(gF, iterations=1)
    dz = nd.zoom(En - E, (OH / E.shape[0], OW / E.shape[1]), order=1)[:OH, :OW] * graded.any()
    if graded.any():
        # the raised floors were painted as the deep basin they were: they take the land beside them (nearest pixel
        # outside the valleys and off the water), and the temperatures lapse with the new ground (6.5 C per km)
        wF = nd.zoom(G['whas'].astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5
        _, (iy, ix) = nd.distance_transform_edt(gF | wF, return_indices=True)
        for k in ['tm', 'th', 'tl', 'tw', 'tc']:
            a = raster(D, k, 'L').astype(float)
            ok = (a > 1) & gF
            a = np.where(ok, np.round(a - 6.5 * np.clip(dz, 0, None) / 1000), a)
            rep[k] = b64(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'L'), optimize=True)
    for key in ('st', 't'):
        src = Image.open(io.BytesIO(__import__('base64').b64decode(D[key])))
        if graded.any():
            arr = np.array(src.convert('RGB'))
            land = arr[iy, ix]
            soft = nd.gaussian_filter(gF.astype(float), 1.0)[..., None]
            arr = np.clip(arr * (1 - soft) + land * soft, 0, 255).astype(np.uint8)
            src2 = Image.fromarray(arr)
            src2.quantization = getattr(src, 'quantization', None)
            im = src2.convert('RGBA')
        else:
            im = src.convert('RGBA')
        over = Image.new('RGBA', im.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(over)
        for r in sorted(out_recs, key=lambda r: r['q_mouth_m3s']):
            if r['kind'] != 'river':
                continue
            pts = r['drawn_px'] if 'drawn_px' in r else meander(chaikin([tuple(p) for p in r['px']], 2), .35)
            qs = r['q_m3s']
            # in pieces, so the line widens downstream (1 px a stream, 2 a large river, 3 the largest)
            n = len(pts)
            for a in range(0, n - 1, 4):
                q = qs[min(len(qs) - 1, int(a / max(1, n - 1) * (len(qs) - 1)))]
                w = 1 if q < 100 else 2 if q < 800 else 3
                al = 150 if q < 50 else 205
                dr.line([tuple(p) for p in pts[a:a + 5]], fill=RIVER_RGB + (al,), width=w, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(.5))
        im = Image.alpha_composite(im, over).convert('RGB')
        qt = getattr(src, 'quantization', None)
        rep[key] = b64(im, 'JPEG', **({'qtables': qt, 'subsampling': 2} if qt else {'quality': 90}))
    for k, v in rep.items():
        key = '"%s": "' % k
        assert s.count(key) == 1, k
        a = s.index(key) + len(key)
        s = s[:a] + v + s[s.index('"', a):]
    s = set_data(s, 'rivers', out_recs)
    s = set_data(s, 'basins', basins)
    s = set_data(s, 'hydro', {
        'version': VERSION, 'grid_km': round(KM, 3), 'runoff': 'Turc: P - P/sqrt(0.9+(P/L)^2), L = 300+25T+0.05T^3 mm/yr',
        'lake_evaporation': 'L at the cell', 'evap_k': round(G['evap_k'], 3), 'books': G['books'], 'q': 'mean annual discharge, m3/s', 'width_depth': 'w = 4.5 Q^0.5, d = 0.35 Q^0.38 (m)',
        'wadi_width': '3 A^0.35 m (A km2), the flash-flood bed', 'thresholds': report['thresholds'],
        'note': 'px: one vertex per height cell (~4 km); bed_m the surface under each (a lake\'s level on water); the '
                'Yuni river keeps its drawn course as drawn_px'})
    lines[li] = s
    html = '\n'.join(lines)
    for a_, b_ in (UI_ROW, UI_HOVER, UI_LOOKUP):
        if html.count(a_) != 1:
            sys.exit('UI anchor not found once: ' + a_[:60])
        html = html.replace(a_, b_, 1)
    html, n = re.subn(r'scale model 4\.\d+ ·', 'scale model %s ·' % VERSION, html)
    assert n >= 1, 'version label not found'
    open(out, 'w', encoding='utf8').write(html)
    stem = os.path.splitext(out)[0]
    json.dump(report, open(stem + '.report.json', 'w', encoding='utf8'), indent=1)
    # the picture: the network over the relief map, rivers by flow, dry valleys pale, hollows cut red, deep ones ringed
    base = np.array(Image.open(io.BytesIO(__import__('base64').b64decode(rep['t']))).convert('RGB')).astype(float) * .8
    im = Image.fromarray(base.astype(np.uint8))
    dr = ImageDraw.Draw(im)
    for r in out_recs:
        if r['kind'] == 'wadi':
            dr.line([tuple(p) for p in r['px']], fill=(225, 190, 120), width=1)
    for r in out_recs:
        if r['kind'] == 'river':
            q = r['q_mouth_m3s']
            dr.line([tuple(p) for p in r['px']], fill=(20, 60, 200) if q >= 100 else (80, 150, 240), width=3 if q >= 1000 else 2 if q >= 100 else 1)
    for b in basins:
        x, y = b['at_px']
        rr = max(3, (b['km2'] / 3.14) ** .5 / 2)
        dr.ellipse([x - rr, y - rr, x + rr, y + rr], outline=(255, 0, 255) if b['kind'] == 'unbalanced' else (240, 130, 30), width=2)
    for h in report['hollows']:
        x, y = h['at_px']
        dr.ellipse([x - 4, y - 4, x + 4, y + 4], outline=(220, 30, 30) if h['action'] == 'cut' else (255, 255, 0), width=2)
    im.save(stem + '.rivers.png', optimize=True)
    print('wrote %s (%d bytes); report and picture beside it' % (out, len(html)))


if __name__ == '__main__':
    main()
