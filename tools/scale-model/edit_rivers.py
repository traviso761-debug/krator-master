#!/usr/bin/env python3
"""Scale model 4.21: the river valleys audited and the rivers designated, with their flow and size (the owner, Oct 2026:
"make sure they make sense (nothing flowing uphill) and designate them on the map, with estimated flow/size, so they can
be placed when the open world is built").

    python3 tools/scale-model/edit_rivers.py <4.20 page.html> <regions.json> <settlements.json> <out page.html> [--rain <page>]

--rain takes the rain the routing runs on from an earlier output (the climate recomputed on its heights, step 7): run
once, then again with --rain <the first run's page>, so the rivers run on the rain of the land they cut.

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
7. THE CLIMATE. Wherever the ground or a water surface moved, the temperatures lapse with it (6.5 C per km) and the
   rain, climate class and zone are recomputed from the unchanged land most like each cell (edit_heights.reclimate, as
   4.18-4.20 did; the abyss's rebuilt floor takes 4.20's own lake effect over today's lakes, lake_rain); the rain and
   climate maps are re-lit and repainted.
"""
import heapq, io, json, math, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import LO, HI, load, raster, b64, chaikin, meander, reclimate, repaint, ramp   # noqa: E402
from edit_dams import set_data   # noqa: E402
import hydro   # noqa: E402

VERSION = '4.21'
BARRIER_M = 5000.0     # m: moist air does not cross ground this high; it walls the sealed basins
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
# 4.21, the owner: regions brought down to the abyss's level, their edges smoothed into the land round them. The level is
# the `floor_q` percentile of the region's floor (its ground under -1,400 m); every cell over it goes down to it, keeping
# `relief` of its height above it, and the land outside eases down to it over `feather` cells (a smoothstep), the band
# blurred so no step is left. Nothing is raised.
# 4.21, the owner: the lakes of these regions all look alike, with their rim: today's water there (the Bowl's lakes grew
# and joined, and laid new arms) is painted as the region's own lakes were in 4.20, an ochre salt rim inside the shore,
# a teal core and a pale salt flat round it (lake_style), on the satellite and relief maps
LAKE_STYLE = ('The Bowl',)
# 4.21, the owner (the region's note and the README's to-do, 2026-10-18): lakes carved as features.py carved the Bay of
# Voth, in a region's outline, at the land's level there (the water it opens into, the nearest water body: the lowest
# shore, so it holds): the bed `shore` m under that level at the outline and `depth` m under it in the middle, the banks
# outside easing down to 25 m over it within `bank` px. The Lake
# of Shim: the Shim river widened where Shim stands (its east shore, px 382,788), ~32 by 12 km, the river entering from
# the SW lowlands' lake to the south and leaving north down the lake's outlet gorge
CARVE = {'Lake of Shim': dict(shore=3.0, depth=25.0, bank=2.0)}
LOWER = {'Region 65': dict(floor_q=50.0, relief=0.04, feather=4.0, blur=1.2)}
ARM_R, ARM_MIN = 2, 4
# the lakes the model draws at 0 m in the north basin and the trough below it (the owner: the dams there held lakes at
# distinctly different heights; the east dam burst first and broke the west one; today they are not joined, and a river
# runs down each breach channel). Each one's drawn water is taken away and the land routed again: it stands where its
# own water settles, in its own basin (east lobe 'dam 2', west lobe 'dam', the long-lake trough).
SETTLE = {'east lake (dam 2)': (599, 110), 'west lake (dam)': (447, 90), 'long-lake trough': (399, 218),
          # drained to the Ring Sea through OUTLETS: each stands at its outlet and runs out down it
          'western lake (Ancient\'s Valley)': (164, 605), 'western lake (SW lowlands)': (294, 787),
          'NW lowlands lake': (160, 391),
          # the Hyperjungle's lake (px 739, 635): drawn at -1,160 m over 8,053 km2 with no shore on its west, straight
          # over the salt lake's depression on the Iziz plain (2,435 m lower); its water settles with the depression's
          # as one lake at its outlet to the Ring Sea (OUTLETS). SHALLOWS then makes it smaller
          'Hyperjungle lake': (739, 635)}
# 4.21, the owner: the Hyperjungle's lake smaller, off the Empire of Iziz's core (Iziz, Fridon, Fort Vaklu and Port
# Tobin stand on the plain round it): after SETTLE, its bed under less than `shallow` m of water is raised to land,
# `bar` m over its level and rising inland, so only its deep water stays (it still spills to the Ring Sea)
SHALLOWS = {'Hyperjungle lake': dict(shallow=200.0, bar=10.0)}
# 4.21, the owner: the Iron Republic's lake back to its drawn size. The model draws it at 3,600 m, over almost all of its
# shore (149 of 156 shore cells lower, down to 2,175 m): the valley could never hold it there, and left to its water it
# shrinks to 2,880 km2 at its outlet (2,772 m). It is kept to its drawn outline at `level`: the bed under the outline is
# deepened below the level (a glacier-scoured basin, `depth` m under it at the shore and more toward the middle), and the
# few shore cells under the level are raised to it as rock bars (`bar` m over it). Its outlet is cut by OUTLETS: the
# hollow beside its lowest shore drains only over a pass at 2,772 m, so a sill there would leave the lake closed.
RESHAPE = {'Iron Republic lake': dict(px=(323, 445), level=2400.0, depth=40.0, bar=20.0)}
NOT_JOINED = ('east lake (dam 2)', 'west lake (dam)', 'long-lake trough')
# 4.21, the owner: the western ring's two great lakes drain to the Ring Sea. The western ring catches the ocean's
# moisture and is closed below 957 m; each lake gets an outlet gorge, the course to the Ring Sea (or to a lake that
# already drains to it) that cuts the least ground, its bed falling from the lake's level all the way, the cells beside
# it eased half way down as its walls. In order: the SW lowlands' lake first, then Ancient's Valley's, whose gorge may end in
# the first (without one it rises to ~870 m: no lower pass leads out of its basin).
OUTLETS = [('western lake (SW lowlands)', (294, 787)), ('western lake (Ancient\'s Valley)', (164, 605)),
           ('Iron Republic lake', (323, 445)),
           # the owner: the NW lowlands' lake does not rise and drown the river valley north-west of it; its outlet
           # runs north-west to the ocean at the map's edge (to the Ring Sea or the Ancient's Valley lake it would cut
           # through the north basin's rims or join the two lakes). Drawn at the ocean's own level, a gorge from it would
           # be an arm of the sea: the lake stands at 50 m (its hollow holds 28,762 km2 there against 28,345 at 0 m) and
           # the bed falls evenly from it to the coast, never under the ocean's level, so the valley stays a river
           ('NW lowlands lake', (160, 391), 'ocean', 50.0),
           # the owner: the Hyperjungle's lake smaller (SETTLE, SHALLOWS). Settled with the salt lake's depression
           # beside it, it would stand at their pass (-1,393 m), over Iziz (-1,423 m): an outlet at -1,495 m holds it
           # just over the Ring Sea, and runs to the sea itself, round the depression (dry ground under the sea's level)
           ('Hyperjungle lake', (739, 635), 'Ring Sea', -1495.0)]
# 4.21, the owner: the north abyss lake (at px 1043, 497) fed again. The two lakes 4.21 found on the floor just south of
# the Region 62 saddle (4.17) gathered its water; a gorge through the saddle from their hollow's floor lets it run north
# into the lake. (name, near the hollow's floor, the lake it runs to; map px)
BREACHES = []      # 4.21 had the Region 62 saddle gorge to the north abyss lake; ABYSS_LAKES rebuilt that floor
# 4.21, the owner: the rivers west of the abyss run on into it; a closed hollow on the plateau within ABYSS_WEST_KM of
# the abyss's floor, west of it, is cut through to the floor (cut_channel from its floor)
ABYSS_WEST_KM = 300.0
# 4.21, the owner: the eastern abyss's floor rebuilt with scattered long, snaky lakes, about as much water as before.
# On the floor (the region's cells under `zone_m`, away from the lake round Locus by `keep_km`, which stays) the drawn
# lakes are taken away and the water routed: it settles in blobs and salt pans (endorheic, or full and overflowing).
# Each of those over `min_km2` is laid out again in the basin it lies in (the floor is a chain of pits between sills
# 1-3 km high), as a lake of its area x `spare` (so it still balances): along the basin's long axis (the cells within
# `span` m over its level), swinging across the basin's width in bends `bend` cells long (seeded, deterministic), as wide as it takes (`r` cells in
# radius, tapering at the ends), `gap` cells from the others (it may take in a smaller, higher lake's bed, never a lower
# one's); its bed cut `depth`
# m under the level, its walls kept `rim` m over it, the rest of the old lake's bed filled to just over the level,
# falling `slope` m a cell towards it. A lake with no room for a trough holding most of its water (a moat round a mound,
# a pit hemmed in) stays as it settles. `merge`: pairs of lakes (map px in each) made one at the higher one's level
# (the owner: old lake 18's moat round its island joined to the lake north of it), the lower one's basin and island
# filled over that level round it as it lies, within `merge_reach` cells, and a channel cut between. The filled beds are blended into the ground round them (`blend` cells), and
# repainted on the maps from the land round them. Then the water is routed again onto the new floor.
ABYSS_LAKES = dict(region='e abysss', zone_m=-1400.0, deep_m=-1900.0, keep=(987, 715), keep_km=24.0, seed=4021,
                   min_km2=40.0, spare=1.15, r=(1.2, 2.4), bend=(12, 20), gap=2, depth=120.0, rim=10.0, slope=3.0, span=400.0, blend=1.5,
                   merge=[((1041, 493), (1039, 465))], merge_reach=20,
                   # the owner: these regions lowered to shallow beds the lakes beside them spread over
                   beds={'lower': dict(shore=2.0, depth=15.0), 'lower2': dict(shore=2.0, depth=15.0)})
ABYSS_CUT_M = 600.0     # m: a hollow whose way to the floor would cut more than this is left (reported; as deep as the western outlets)

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
    G = dict(su=su, sv=sv, h=h, E=E, water=water, whas=whas, wlev=wlev, P=P, T=T, P_drawn=P)
    G['evap_k'], G['books'], G['P'] = closed_books(G)
    return G


def closed_books(G):
    """the water books, one sealed basin at a time (the owner: a crater sealed by a mostly airless rim, the ocean to the
    north-west its only outside moisture; the eastern basins walled by airless mountains and very dry).

    The map is cut into basins along ground over BARRIER_M (moist air does not cross it). The basin that touches the
    ocean at the map's edge, the crater, imports the rain within IMPORT_KM of that ocean; evaporation is scaled (k,
    hydro.calibrate) until the rest of its books close. Every other basin is sealed: it can rain only what it evaporates.
    Where the model's rain there is more than that (its generator brought moisture over the rim), the rain the rivers
    run on is scaled down (s) until the basin's books close at the same k; it is never scaled up. The painted rain map
    is left as it is. Returns (k, books, the rain the rivers run on)."""
    E, whas, P, T, wlev = G['E'], G['whas'], G['P'], G['T'], G['wlev']
    air = T > -85
    lab, n = nd.label(whas, structure=np.ones((3, 3)))
    ocean = np.zeros(E.shape, bool)
    for k in range(1, n + 1):
        m = lab == k
        j, i = np.nonzero(m)
        if j.min() == 0 or i.min() == 0 or j.max() == E.shape[0] - 1 or i.max() == E.shape[1] - 1:
            ocean |= m
    S = np.where(whas, np.fmax(wlev, E), E)
    bl, bn = nd.label(air & (S < BARRIER_M), structure=np.ones((3, 3)))
    sizes = nd.sum(np.ones(E.shape), bl, range(1, bn + 1))
    big = [k + 1 for k in range(bn) if sizes[k] >= 50]
    keep = np.isin(bl, big)
    _, (iy, ix) = nd.distance_transform_edt(~keep, return_indices=True)
    basin = np.where(air, bl[iy, ix], 0)            # the high ground drains to the basin it stands over
    main = int(np.bincount(basin[nd.binary_dilation(ocean, iterations=2) & (basin > 0)]).argmax())
    inside = (basin == main) & ~ocean
    near = inside & (nd.distance_transform_edt(~ocean) * (2 / G['su']) < IMPORT_KM)
    imported = float(P[near].sum()) * 1e-3 * 16.04e6 / hydro.SEC_YR
    k = hydro.calibrate(P, T, inside, whas, imported)
    b0, b1 = hydro.budget(P, T, inside, whas, 1.0), hydro.budget(P, T, inside, whas, k)
    books = {'barrier_m': BARRIER_M, 'import_km': IMPORT_KM, 'imported_m3s': round(imported), 'evap_k': round(k, 3),
             'crater': {'turc_alone_left': round(b0[3]), 'rain': round(b1[0]), 'land_evap': round(b1[1]),
                        'water_evap': round(b1[2]), 'left': round(b1[3])}, 'sealed': []}
    Pe = P.copy()
    for bk in big:
        if bk == main:
            continue
        m = basin == bk
        if m.sum() < 150:
            continue
        r0 = hydro.budget(P, T, m, whas, k)
        s_ = 1.0
        if r0[3] > 0:
            lo, hi = 0.0, 1.0
            for _ in range(40):
                s_ = (lo + hi) / 2
                if hydro.budget(P * s_, T, m, whas, k)[3] > 0:
                    hi = s_
                else:
                    lo = s_
            s_ = lo
            Pe[m] = P[m] * s_
        j, i = np.argwhere(m).mean(0)
        books['sealed'].append({'at_px': [round(i / G['su']), round(j / G['sv'])], 'km2': round(float(m.sum()) * 16.04),
                                'rain_mm': round(float(P[m].mean())), 'left_m3s': round(r0[3]), 'rain_scale': round(s_, 3)})
    books['sealed'].sort(key=lambda b: -b['km2'])
    return k, books, Pe


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


def body_at(lab, x, y, su, sv):
    """the labelled body nearest map px (x, y)"""
    j, i = int(round(y * sv)), int(round(x * su))
    ys, xs = np.nonzero(lab > 0)
    c = np.argmin((ys - j) ** 2 + (xs - i) ** 2)
    return lab == lab[ys[c], xs[c]]


def inpaint(arr, hole, src=None):
    """the pixels of `hole` painted from the picture round them: each from the nearest scale of a normalized blur
    that reaches enough of it (fine at the edges, broad inside), then blended in over a pixel; `src`: the pixels it may
    take colour from (all outside the hole by default)"""
    out = arr.astype(float).copy()
    valid = (~hole if src is None else ~hole & src).astype(float)
    done = np.zeros(hole.shape, bool)
    for sg in (1.5, 3.0, 6.0, 12.0, 24.0, 48.0):
        w = nd.gaussian_filter(valid, sg)
        ok = hole & ~done & (w > 0.15)
        if ok.any():
            for c in range(out.shape[2]):
                out[..., c][ok] = (nd.gaussian_filter(arr[..., c].astype(float) * valid, sg)[ok] / w[ok])
            done |= ok
    if (hole & ~done).any():
        _, (iy, ix) = nd.distance_transform_edt(valid < 0.5, return_indices=True)
        out[hole & ~done] = arr[iy, ix][hole & ~done]
    soft = np.clip(nd.gaussian_filter(hole.astype(float), 1.0) * 1.5, 0, 1)[..., None]
    return np.clip(arr * (1 - soft) + out * soft, 0, 255).astype(np.uint8)


def lake_rain(rain0, wet0, wet, zr, sig=6.0, bg_sig=15.0):
    """the abyss floor's rain from 4.20's own lake effect (its floor is wet beside its lakes, ~1,500 mm within 4 km, and
    dry far from them, ~200-450 mm): a dry background (4.20's rain on floor land far from its water, spread over the
    floor) times the ratio 4.20's floor land shows at each share of water round it (a gaussian of `sig` px), made
    monotone; applied to today's water `wet` over the floor `zr` (full-res masks). Returns (rain, the table)"""
    fr0 = nd.gaussian_filter(wet0.astype(float), sig)
    fr = nd.gaussian_filter(wet.astype(float), sig)
    land0 = zr & ~wet0
    far0 = land0 & (fr0 < 0.03)
    num = nd.gaussian_filter(np.where(far0, rain0, 0.0), bg_sig)
    den = nd.gaussian_filter(far0.astype(float), bg_sig)
    bg = np.where(den > 1e-3, num / np.maximum(den, 1e-6), np.median(rain0[far0]))
    edges = np.array([0, .02, .05, .1, .15, .2, .3, .4, .55, .7, 1.01])
    cent, med = [], []
    q = rain0 / np.maximum(bg, 50)
    for a, b in zip(edges[:-1], edges[1:]):
        m = land0 & (fr0 >= a) & (fr0 < b)
        if m.sum() > 30:
            cent.append(float(np.median(fr0[m])))
            med.append(float(np.median(q[m])))
    med = np.maximum.accumulate(np.array(med))
    med = med / med[0]
    return bg * np.interp(fr, cent, med), [[round(c, 3), round(float(m), 2)] for c, m in zip(cent, med)]


def lake_style(arr, arr0, poly, wet0, wet, reach_in=8, reach_out=14):
    """the region's lakes painted as its own lakes were (the Bowl's: an ochre salt rim inside the shore, a teal core,
    a pale salt flat outside fading into the ground): the colour at each distance from the shore, inside and out, is
    sampled from the old picture `arr0` round the old water `wet0`, and laid over today's water `wet` and its shores
    (the rim narrowed on water too narrow for it), the picture's fine texture kept. Full-res masks; returns the picture"""
    w0 = wet0 & poly
    if w0.sum() < 50:
        return arr
    din0, dout0 = nd.distance_transform_edt(w0), nd.distance_transform_edt(~w0)
    a0 = arr0.astype(float)
    prof_in = []
    for d in range(1, reach_in + 1):
        m = w0 & (np.abs(din0 - d) < 0.5) if d < reach_in else w0 & (din0 >= reach_in - 0.5)
        prof_in.append(np.median(a0[m], 0) if m.sum() > 10 else (prof_in[-1] if prof_in else a0[w0].mean(0)))
    prof_out = []
    for d in range(1, reach_out + 1):
        m = poly & ~wet0 & (np.abs(dout0 - d) < 0.5)
        prof_out.append(np.median(a0[m], 0) if m.sum() > 10 else prof_out[-1])
    prof_in, prof_out = np.array(prof_in), np.array(prof_out)
    w = wet & poly
    din, dout = nd.distance_transform_edt(w), nd.distance_transform_edt(~w)
    # water narrower than the old lakes' rim and core: its distances stretched, so it keeps a core
    half = nd.maximum_filter(np.where(w, din, 0), size=9)
    din_eff = np.where(w, din / np.clip(half / reach_in, 0.35, 1.0), 0)
    a = arr.astype(float)
    col = np.zeros_like(a)
    ii = np.clip(np.round(din_eff).astype(int), 1, reach_in) - 1
    oo = np.clip(np.round(dout).astype(int), 1, reach_out) - 1
    col[w] = prof_in[ii[w]]
    shore = poly & ~w & (dout <= reach_out)
    col[shore] = prof_out[oo[shore]]
    wgt = np.where(w, 1.0, np.where(shore, np.clip(1 - (dout - 1) / reach_out, 0, 1), 0.0))
    wgt = nd.gaussian_filter(wgt, 0.8) * (nd.gaussian_filter(poly.astype(float), 2.0) > 0.5)
    detail = a - nd.gaussian_filter(a, (1.5, 1.5, 0))
    new = col + 0.6 * detail
    return np.clip(a * (1 - wgt[..., None]) + new * wgt[..., None], 0, 255).astype(np.uint8)


def biggest(m):
    """the largest 8-connected piece of a mask"""
    lab, n = nd.label(m, structure=np.ones((3, 3)))
    return lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1) if n > 1 else m


def snake_lakes(En, zone, w0, lv0, A_, KM2, merges=(), beds=()):
    """ABYSS_LAKES' layout: each lake of w0 (levels lv0) laid out again as a long, winding one in the basin it lies in.
    beds: (mask, shore m, depth m) regions lowered to shallow beds under the level of the lake beside them, which it
    may spread over (the bed `shore` m under the level at the outline, `depth` in the middle).
    merges: pairs of cells, one in each of two lakes to be made one, at the higher one's level: the lower one's basin
    (and any island in it) is filled over that level round the lake as it lies, and a channel joins them.
    Returns (En, rows (cells, not px), the troughs, the old beds filled, deepest cut, highest fill)."""
    E = En
    jj, ii = np.mgrid[0:E.shape[0], 0:E.shape[1]].astype(float)

    def lay(P, rad):
        """the cells within rad of the points P, and how near each is to the line (1 on it)"""
        m_, core_ = np.zeros(E.shape, bool), np.zeros(E.shape)
        for (y, x), r_ in zip(P, rad):
            y0_, y1_ = int(max(0, y - 4)), int(min(E.shape[0], y + 5))
            x0_, x1_ = int(max(0, x - 4)), int(min(E.shape[1], x + 5))
            d_ = np.hypot(jj[y0_:y1_, x0_:x1_] - y, ii[y0_:y1_, x0_:x1_] - x)
            m_[y0_:y1_, x0_:x1_] |= d_ <= r_
            core_[y0_:y1_, x0_:x1_] = np.maximum(core_[y0_:y1_, x0_:x1_], np.clip(1 - d_ / (r_ + 0.5), 0, 1))
        return m_, core_
    blab, bn = nd.label(w0, structure=np.ones((3, 3)))
    sizes = nd.sum(np.ones(E.shape), blab, range(1, bn + 1))
    rng = np.random.default_rng(A_['seed'])
    snakes = np.zeros(E.shape, bool)
    lvmap = np.full(E.shape, np.nan)                     # each lake's level on its cells
    taken = np.zeros(E.shape, bool)                      # old lake beds a trough has taken (its own, or crossed)
    rows, cut_most, fill_most, filled = [], 0.0, 0.0, np.zeros(E.shape, bool)
    for k in np.argsort(-sizes) + 1:
        b = (blab == k) & ~taken                          # what an earlier trough has not taken over
        if b.sum() * KM2 < A_['min_km2']:
            continue
        lv = float(np.median(lv0[blab == k]))
        others = nd.binary_dilation(snakes, iterations=A_['gap']) if snakes.any() else np.zeros(E.shape, bool)
        bo = b & ~others & ~nd.binary_dilation(w0 & (blab != k) & (lv0 < lv - 1.0) & ~taken, iterations=1)
        if not bo.any():
            continue                                         # all of it beside a trough: its bed is filled with the rest
        seed_ = tuple(np.argwhere(bo)[np.argmin(En[bo])])
        lower = nd.binary_dilation(w0 & (blab != k) & (lv0 < lv - 1.0) & ~taken, iterations=1)   # never into a lower lake
        rl, _ = nd.label(((zone & (En < lv + A_['span'])) | b) & ~others & ~lower, structure=np.ones((3, 3)))
        R = rl == rl[seed_]
        if R.sum() < 4:
            continue
        Q = np.argwhere(R).astype(float)
        c0 = Q.mean(0)
        w_, V = np.linalg.eigh(np.cov((Q - c0).T))
        u, v = V[:, 1], np.array([-V[1, 1], V[0, 1]])
        t, n = (Q - c0) @ u, (Q - c0) @ v
        ts = np.arange(np.percentile(t, 3) + 1.0, np.percentile(t, 97) - 1.0, 0.5)
        if len(ts) < 4:
            ts = np.array([0.0])
        mid, half = np.full(len(ts), np.nan), np.zeros(len(ts))
        for q, tq in enumerate(ts):
            sel = np.abs(t - tq) < 1.0
            if sel.any():
                mid[q], half[q] = 0.5 * (n[sel].min() + n[sel].max()), 0.5 * (n[sel].max() - n[sel].min())
        ok_ = ~np.isnan(mid)
        mid = np.interp(np.arange(len(ts)), np.nonzero(ok_)[0], mid[ok_]) if ok_.any() else np.zeros(len(ts))
        mid = nd.gaussian_filter1d(mid, 4.0) if len(ts) > 4 else mid
        half = nd.minimum_filter1d(half, 5) if len(ts) > 4 else half
        lam, ph = rng.uniform(*A_['bend']), rng.uniform(0, 2 * np.pi)
        want = b.sum() * A_['spare']
        for r_ in np.arange(A_['r'][0], A_['r'][1] + 1e-6, 0.2):
            amp = np.clip(half - r_ - 0.5, 0, 0.3 * lam)
            off = mid + amp * np.sin(2 * np.pi * ts / lam + ph)
            P = c0 + np.outer(ts, u) + np.outer(off, v)
            ins = np.array([0 <= y < E.shape[0] and 0 <= x < E.shape[1] and R[int(round(y)), int(round(x))] for y, x in P])
            # the unbroken stretch of the line inside the basin nearest the old lake's lowest point
            runs, a_ = [], None
            for q, f_ in enumerate(list(ins) + [False]):
                if f_ and a_ is None:
                    a_ = q
                elif not f_ and a_ is not None:
                    runs.append((a_, q))
                    a_ = None
            if runs:
                dq = np.hypot(P[:, 0] - seed_[0], P[:, 1] - seed_[1])
                a_, z_ = min(runs, key=lambda r: dq[r[0]:r[1]].min())
                P = P[a_:z_]
            else:
                P = np.array([[float(seed_[0]), float(seed_[1])]])
            fade = np.clip(np.minimum(np.arange(len(P)), np.arange(len(P))[::-1]) / 4.0, 0.45, 1.0)
            m, core = lay(P, r_ * fade)
            m = biggest(m & R)
            if m.sum() >= want:
                break
        if m.sum() > want * 1.2 and len(P) > 8:
            # longer than its water needs: the stretch round the old lake's lowest point that holds it
            q0 = int(np.argmin(np.hypot(P[:, 0] - seed_[0], P[:, 1] - seed_[1])))
            lo_, hi_ = 2, len(P)
            while hi_ - lo_ > 1:
                h_ = (lo_ + hi_) // 2
                a_, z_ = max(0, q0 - h_), min(len(P), q0 + h_ + 1)
                if z_ - a_ < 2 * h_ + 1:              # against one end: take the window from that end
                    a_, z_ = (0, min(len(P), 2 * h_ + 1)) if a_ == 0 else (max(0, len(P) - 2 * h_ - 1), len(P))
                Pw = P[a_:z_]
                fw = np.clip(np.minimum(np.arange(len(Pw)), np.arange(len(Pw))[::-1]) / 4.0, 0.45, 1.0)
                mw, cw = lay(Pw, r_ * fw)
                if (mw & R).sum() >= want:
                    hi_ = h_
                else:
                    lo_ = h_
            a_, z_ = max(0, q0 - hi_), min(len(P), q0 + hi_ + 1)
            if z_ - a_ < 2 * hi_ + 1:
                a_, z_ = (0, min(len(P), 2 * hi_ + 1)) if a_ == 0 else (max(0, len(P) - 2 * hi_ - 1), len(P))
            P = P[a_:z_]
            fade = np.clip(np.minimum(np.arange(len(P)), np.arange(len(P))[::-1]) / 4.0, 0.45, 1.0)
            m, core = lay(P, r_ * fade)
            m = biggest(m & R)
        seg = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))] if len(P) > 1 else np.zeros(1)
        if m.sum() < 0.85 * want:
            # no room for a trough (a moat round a mound, a pit hemmed in): the lake stays as its water settles
            taken |= b
            snakes |= b
            lvmap[b] = lv
            j, i = np.argwhere(b).mean(0)
            rows.append({'at_cell': (round(j), round(i)), 'was_cells': int(b.sum()), 'level_m': round(lv), 'cut_most_m': 0,
                         'filled_most_m': 0, 'cells': int(b.sum()), 'length_cells': 0.0, 'kept': True})
            continue
        bed = np.maximum(lv - A_['depth'] * (0.35 + 0.65 * core), LO + 5)
        cut_k = float((En - bed)[m].max())
        cut_most = max(cut_most, cut_k)
        En = np.where(m, np.minimum(En, bed), En)
        dsn = nd.distance_transform_edt(~m)
        fl = b & ~m                                      # the rest of its bed: just over the level, falling to it
        taken |= b | (m & w0)
        up = np.maximum(En, lv + A_['rim'] + A_['slope'] * dsn)
        if fl.any():
            fill_most = max(fill_most, float((up - En)[fl].max()))
        En = np.where(fl, up, En)
        filled |= fl
        ring = nd.binary_dilation(m, structure=np.ones((3, 3))) & ~m & ~b
        En = np.where(ring, np.maximum(En, lv + A_['rim']), En)
        snakes |= m
        lvmap[m] = lv
        j, i = np.argwhere(m).mean(0)
        rows.append({'at_cell': (round(j), round(i)), 'was_cells': int(b.sum()), 'level_m': round(lv),
                     'cut_most_m': round(cut_k), 'filled_most_m': round(float((up - E)[fl].max())) if fl.any() else 0,
                     'cells': int(m.sum()), 'length_cells': float(seg[-1])})
    # lakes made one (merges): at the higher one's level
    for ca, cb in merges:
        sl_, _ = nd.label(snakes, structure=np.ones((3, 3)))
        _, (iy, ix) = nd.distance_transform_edt(~snakes, return_indices=True)
        A = sl_ == sl_[iy[ca], ix[ca]]
        B = sl_ == sl_[iy[cb], ix[cb]]
        L = float(max(np.nanmax(lvmap[A]), np.nanmax(lvmap[B])))
        low = A if np.nanmax(lvmap[A]) < L else B
        both = A | B
        # the lower one's basin round it (and its island) filled over the level, falling towards the water
        near_low = nd.distance_transform_edt(~low) <= A_['merge_reach']
        others_ = nd.binary_dilation(snakes & ~both, iterations=A_['gap'])
        pl, _ = nd.label(((En < L + A_['rim']) & near_low & ~others_) | low, structure=np.ones((3, 3)))
        pit = np.isin(pl, np.unique(pl[low])) & (pl > 0)
        isle = nd.binary_fill_holes(low) & ~low
        rise = (pit | isle) & ~both
        dsn = nd.distance_transform_edt(~both)
        up = np.maximum(En, L + A_['rim'] + A_['slope'] * dsn)
        if rise.any():
            fill_most = max(fill_most, float((up - En)[rise].max()))
        En = np.where(rise, up, En)
        filled |= rise
        # the channel between them, along the shortest way
        _, (by, bx) = nd.distance_transform_edt(~B, return_indices=True)
        pa = tuple(np.argwhere(A)[np.argmin(np.where(A, nd.distance_transform_edt(~B), np.inf)[A])])
        pb = (by[pa], bx[pa])
        nst = int(max(abs(pb[0] - pa[0]), abs(pb[1] - pa[1]))) * 2 + 1
        P = np.stack([np.linspace(pa[0], pb[0], nst), np.linspace(pa[1], pb[1], nst)], 1)
        ch, core = lay(P, np.full(len(P), A_['r'][0]))
        ch &= ~both
        bed = L - A_['depth'] * (0.35 + 0.65 * core)
        cut_ch = float((En - bed)[ch].max()) if ch.any() else 0.0
        cut_most = max(cut_most, cut_ch)
        En = np.where(ch, np.minimum(En, bed), En)
        wall = nd.binary_dilation(ch | both, structure=np.ones((3, 3))) & ~(ch | both)
        En = np.where(wall, np.maximum(En, L + A_['rim']), En)
        snakes |= ch
        lvmap[ch | both] = L
        rows.append({'at_cell': tuple(int(v) for v in np.argwhere(both).mean(0).round()), 'was_cells': int(both.sum()),
                     'level_m': round(L), 'cut_most_m': round(cut_ch), 'filled_most_m': round(float((up - E)[rise].max())) if rise.any() else 0,
                     'cells': int((both | ch).sum()), 'length_cells': 0.0, 'merged': True})
    # the shallow beds (beds): each region under the level of the largest lake beside it
    for bm, sh_, dp_ in beds:
        sl_, _ = nd.label(snakes, structure=np.ones((3, 3)))
        near = nd.binary_dilation(bm, iterations=3) & snakes
        if not near.any():
            continue
        ks, cn = np.unique(sl_[near], return_counts=True)
        sizes_ = [(int((sl_ == k).sum()), k) for k in ks]
        lake_ = sl_ == max(sizes_)[1]
        L = float(np.nanmedian(lvmap[lake_]))
        dB = nd.distance_transform_edt(bm)
        bed = L - sh_ - (dp_ - sh_) * np.clip(dB / 2.0, 0, 1) ** 2 * (3 - 2 * np.clip(dB / 2.0, 0, 1))
        En = np.where(bm, np.minimum(En, bed), En)
        taken |= bm & w0
        snakes |= bm
        lvmap[bm] = L
        rows.append({'at_cell': tuple(int(v) for v in np.argwhere(bm).mean(0).round()), 'was_cells': 0, 'level_m': round(L),
                     'cut_most_m': 0, 'filled_most_m': 0, 'cells': int(bm.sum()), 'length_cells': 0.0, 'bed': True})
    # old beds no trough took (lakes too small, or the rest of one a trough crossed): filled over their level,
    # falling towards the nearest trough
    left = w0 & ~taken & ~snakes
    if left.any() and snakes.any():
        dsn = nd.distance_transform_edt(~snakes)
        up = np.maximum(En, lv0 + A_['rim'] + A_['slope'] * dsn)
        fill_most = max(fill_most, float((up - En)[left].max()))
        En = np.where(left, up, En)
        filled |= left
    if filled.any():
        # the filled beds blended into the ground round them (no old shoreline left as a step), the troughs and their
        # walls untouched; then every hollow the blending left in them filled again, so they still drain
        wall = nd.binary_dilation(snakes, structure=np.ones((3, 3)), iterations=1)
        wgt = np.clip(nd.gaussian_filter(filled.astype(float), A_['blend']) * 2.0, 0, 1) * ~wall
        En = En * (1 - wgt) + nd.gaussian_filter(En, A_['blend']) * wgt
        soft = (wgt > 0.01) & ~wall
        Fz, _ = hydro.fill(En, ~soft)
        En = np.where(soft, np.maximum(En, Fz), En)
    return En, rows, snakes, filled, cut_most, fill_most


def cut_channel(En, src, lv, target, blocked, floor=None):
    """the channel from the cells `src` (water at level lv, or a hollow's floor) to any cell of `target`: the course that
    cuts the least ground over lv (Dijkstra), never through `blocked` water. Its sill stays at lv: up to the last ground
    over lv the bed falls 1 m a cell and a hollow on the way is left to fill; beyond it the bed follows the land down.
    The cells beside the cut are eased half way down as its walls. With `floor` (the level of the water it ends in) the
    bed falls evenly from lv to just over floor along the whole course instead, and never under it. Edits En in place;
    returns (path, end, cells cut, deepest cut)."""
    S0 = En
    dist = np.full(En.shape, np.inf)
    prev = {}
    pq = []
    for a, b in zip(*np.nonzero(src)):
        dist[a, b] = 0.0
        pq.append((0.0, a, b))
    heapq.heapify(pq)
    end = None
    while pq:
        d, a, b = heapq.heappop(pq)
        if d > dist[a, b]:
            continue
        if target[a, b] and not src[a, b]:
            end = (a, b)
            break
        for da in (-1, 0, 1):
            for db in (-1, 0, 1):
                c_, e_ = a + da, b + db
                if (da or db) and 0 <= c_ < En.shape[0] and 0 <= e_ < En.shape[1] and not blocked[c_, e_]:
                    nd_ = d + max(0.0, S0[c_, e_] - lv) * math.hypot(da, db) + 1.0
                    if nd_ < dist[c_, e_]:
                        dist[c_, e_] = nd_
                        prev[(c_, e_)] = (a, b)
                        heapq.heappush(pq, (nd_, c_, e_))
    if end is None:
        sys.exit('no channel from %s finds its target' % (tuple(np.argwhere(src)[0]),))
    path = [end]
    while path[-1] in prev:
        path.append(prev[path[-1]])
    path = [p_ for p_ in path[::-1] if not src[p_]]
    path = path[:next((n_ for n_, p_ in enumerate(path) if target[p_]), len(path))]
    ridge = max([n_ for n_, p_ in enumerate(path) if En[p_] > lv] + [-1])
    step = 1.0 if floor is None else (lv - floor - 1.0) / max(len(path), 1)
    bed, cut_most, over = lv - step, 0.0, 0
    for n_, c in enumerate(path):
        bed = bed - step if n_ <= ridge else min(En[c], bed - step)
        if floor is not None:
            bed = max(bed, floor + 1.0)
        if En[c] - bed > 0.5:
            over += 1
            cut_most = max(cut_most, En[c] - bed)
            for dj in (-1, 0, 1):
                for di in (-1, 0, 1):
                    a, b = c[0] + dj, c[1] + di
                    if (dj or di) and not blocked[a, b] and not target[a, b] and En[a, b] > bed:
                        En[a, b] = min(En[a, b], bed + (En[a, b] - bed) * .5)
            En[c] = bed
    return path, end, over, cut_most


def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    page, rpath, spath, out = sys.argv[1:5]
    lines, li, D = load(page)
    p_drawn = D['p']                                     # the page's own rain (the climate step recomputes from it)
    if '--rain' in sys.argv:
        D = dict(D, p=load(sys.argv[sys.argv.index('--rain') + 1])[2]['p'])
    REG = [r for r in json.load(open(rpath, encoding='utf8')) if not TOOL_REGIONS.match(r.get('name', '').strip())]
    SET = json.load(open(spath, encoding='utf8'))
    G = grid_fields(D)
    su, sv, E = G['su'], G['sv'], G['E']
    whas0, wlev0 = G['whas'].copy(), G['wlev'].copy()
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
    print('the water books: in the crater Turc alone leaves %+d m3/s of rain with nowhere to go;' % G['books']['crater']['turc_alone_left'],
          'evaporation x %.2f closes them on %d m3/s from the ocean' % (G['evap_k'], G['books']['imported_m3s']))
    for b_ in G['books']['sealed']:
        print('  sealed basin at px %s, %d km2: rain %d mm leaves %+d m3/s; the rivers run on %.0f%% of it' % (
            b_['at_px'], b_['km2'], b_['rain_mm'], b_['left_m3s'], 100 * b_['rain_scale']))
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
    # the regions lowered to the abyss's level (LOWER)
    lowered_m = np.zeros(E.shape, bool)
    report['lowered'] = []
    for nm, l_ in LOWER.items():
        r_ = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name', '').strip() == nm), None)
        if r_ is None:
            sys.exit('no region named %r' % nm)
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in r_['points']], fill=1)
        inr = np.array(im).astype(bool)
        T = float(np.percentile(En[inr & (En < -1400)], l_['floor_q']))
        t_ = np.clip(1 - nd.distance_transform_edt(~inr) / l_['feather'], 0, 1)
        w_ = t_ * t_ * (3 - 2 * t_)
        tgt = T + l_['relief'] * (En - T)
        E2 = np.where(En > tgt, En * (1 - w_) + tgt * w_, En)
        band = nd.binary_dilation((w_ > 0) & (w_ < 1), iterations=1) | (inr & ~nd.binary_erosion(inr, iterations=1))
        E2 = np.where(band, np.minimum(E2, nd.gaussian_filter(E2, l_['blur'])), E2)
        dn = np.minimum(En, E2)
        m_ = dn < En - 10.0
        report['lowered'].append({'region': nm, 'level_m': round(T), 'cells': int(m_.sum()), 'km2': round(float(m_.sum() * KM2)),
                                  'lowered_most_m': round(float((En - dn)[m_].max())) if m_.any() else 0})
        print('lowered %s to the abyss level (%d m): %d km2, by up to %d m' % (nm, T, m_.sum() * KM2,
                                                                              (En - dn)[m_].max() if m_.any() else 0))
        En = dn
        lowered_m |= m_
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
    # the lakes kept to their drawn outline (RESHAPE)
    report['reshaped'] = []
    reshaped = np.zeros(E.shape, bool)
    reshaped_lv = np.zeros(E.shape)
    for nm, r_ in RESHAPE.items():
        bl_, _ = nd.label(G['whas'] & ~H['sea'], structure=np.ones((3, 3)))
        x, y = r_['px']
        j, i = int(round(y * sv)), int(round(x * su))
        ys, xs = np.nonzero(bl_ > 0)
        c = np.argmin((ys - j) ** 2 + (xs - i) ** 2)
        m = bl_ == bl_[ys[c], xs[c]]
        L = r_['level']
        inner = nd.distance_transform_edt(m)                 # cells from the shore, inside
        bed = L - r_['depth'] - 25.0 * (inner - 1)
        lowered = float(np.clip(En - bed, 0, None)[m].max())
        En = np.where(m, np.minimum(En, bed), En)
        ring = nd.binary_dilation(m, structure=np.ones((3, 3))) & ~m & ~G['whas']
        under = ring & (En < L)
        sill = None
        raised = float((L + r_['bar'] - En[under]).max()) if under.any() else 0.0
        En = np.where(under, L + r_['bar'], En)
        lv0 = float(np.nanmedian(G['wlev'][m]))
        G['wlev'] = np.where(m, L, G['wlev'])
        reshaped |= m
        reshaped_lv[m] = L
        report['reshaped'].append({'lake': nm, 'drawn_level_m': round(lv0),
                                   'level_m': L, 'km2': round(float(m.sum() * KM2)), 'bed_lowered_most_m': round(lowered),
                                   'bars': int(under.sum()) - (1 if sill else 0), 'bar_raised_most_m': round(raised),
                                   'sill_px': px(*sill) if sill else None})
        print('reshaped %s: %d km2 kept at %d m; bed lowered by up to %d m; %d shore cells raised as bars (by up to %d m), sill at px %s' % (
            nm, m.sum() * KM2, L, lowered, under.sum() - (1 if sill else 0), raised, px(*sill) if sill else None))
    # the settlements' cells (an outlet's gorge never runs through one)
    towns = np.zeros(E.shape, bool)
    for st_ in SET:
        towns[min(E.shape[0] - 1, int(round(st_['py'] * sv))), min(E.shape[1] - 1, int(round(st_['px'] * su)))] = True
    towns = nd.binary_dilation(towns, structure=np.ones((3, 3)))
    if RESHAPE:
        H = setup(dict(G, E=En))
    # the outlet gorges (OUTLETS)
    report['outlets'] = []
    gorges = []
    if OUTLETS:
        bl_, _ = nd.label(G['whas'] & ~H['sea'], structure=np.ones((3, 3)))
        target = H['sea'].copy()
        ends_in = {}
        for o_ in OUTLETS:
            nm, (x, y) = o_[0], o_[1]
            m = body_at(bl_, x, y, su, sv)
            lv = float(np.nanmedian(G['wlev'][m])) if len(o_) < 4 else float(o_[3])
            tgt, floor_ = target, None
            if len(o_) > 2 and isinstance(o_[2], tuple):     # to one lake, ending over its level
                tgt = body_at(bl_, o_[2][0], o_[2][1], su, sv)
                floor_ = float(np.nanmedian(G['wlev'][tgt]))
            elif len(o_) > 2 and o_[2] == 'Ring Sea':
                tgt = H['sea'] & (np.abs(G['wlev'] - GRADE['Beast Riders']['sea']) < 1)
                floor_ = GRADE['Beast Riders']['sea']
            elif len(o_) > 2 and o_[2] == 'ocean':
                sl_, sn_ = nd.label(H['sea'], structure=np.ones((3, 3)))
                tgt = np.zeros(E.shape, bool)
                for k_ in range(1, sn_ + 1):
                    mm_ = sl_ == k_
                    jj_, ii_ = np.nonzero(mm_)
                    if jj_.min() == 0 or ii_.min() == 0 or jj_.max() == E.shape[0] - 1 or ii_.max() == E.shape[1] - 1:
                        tgt |= mm_
                floor_ = float(np.nanmedian(G['wlev'][tgt]))
            blk = (G['whas'] & ~tgt & ~m) | towns                 # never through a settlement
            if len(o_) > 2 and o_[2] == 'Ring Sea':
                blk |= ~G['whas'] & (En < floor_)          # dry ground under the sea it ends in: never through it
            path, end, over, cut_most = cut_channel(En, m, lv, tgt, blk, floor_)
            if floor_ is not None:
                # the water it ends in may be drawn over ground higher than the water (the ocean's cell at the NW
                # gorge's mouth stands on 109 m): that ground would dam the gorge
                En[end] = min(En[end], floor_ - 1.0)
            to = ends_in.get(end, 'the lake at px %s' % (list(o_[2]),) if len(o_) > 2 and isinstance(o_[2], tuple) else 'the sea')
            target |= m                                   # a later lake may run to this one
            for c in zip(*np.nonzero(m)):
                ends_in[c] = nm
            gorges.append({'name': nm + ' outlet', 'from': nm, 'to': to, 'px': [px(*p_) for p_ in path],
                           'bed_m': [round(float(En[p_])) for p_ in path], 'lake_level_m': round(lv)})
            report['outlets'].append({'lake': nm, 'level_m': round(lv), 'to': to, 'length_km': round(len(path) * KM),
                                      'cut_km': round(over * KM), 'deepest_cut_m': round(cut_most)})
            print('outlet for %s (%d m): %d km to %s, cut through %d km, at most %d m deep' % (
                nm, lv, len(path) * KM, to, over * KM, cut_most))
    # the breaches (BREACHES): a hollow's floor cut through to the water named
    for nm, (fx, fy), (tx, ty) in BREACHES:
        bl_, _ = nd.label(G['whas'] & ~H['sea'], structure=np.ones((3, 3)))
        to_m = body_at(bl_, tx, ty, su, sv)
        j, i = int(round(fy * sv)), int(round(fx * su))
        win = np.zeros(E.shape, bool)
        win[max(0, j - 6):j + 7, max(0, i - 6):i + 7] = True
        floor = np.unravel_index(np.argmin(np.where(win & ~G['whas'], En, np.inf)), E.shape)
        src = np.zeros(E.shape, bool)
        src[floor] = True
        lv = float(En[floor])
        path, end, over, cut_most = cut_channel(En, src, lv, to_m, G['whas'] & ~to_m)
        gorges.append({'name': nm, 'from': px(*floor), 'to': px(*end), 'px': [px(*p_) for p_ in path],
                       'bed_m': [round(float(En[p_])) for p_ in path], 'floor_m': round(lv)})
        report['outlets'].append({'breach': nm, 'floor_m': round(lv), 'length_km': round(len(path) * KM),
                                  'cut_km': round(over * KM), 'deepest_cut_m': round(cut_most)})
        print('breach %s: from the hollow floor at %d m, %d km, cut through %d km, at most %d m deep' % (
            nm, lv, len(path) * KM, over * KM, cut_most))
    # the lakes carved in a region's outline (CARVE), before the lakes settle (the carved bed fills with them)
    report['carved'] = []
    sst = lambda a_, b_, x_: np.clip((x_ - a_) / (b_ - a_), 0, 1) ** 2 * (3 - 2 * np.clip((x_ - a_) / (b_ - a_), 0, 1))
    for nm, c_ in CARVE.items():
        r_ = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name', '').strip() == nm), None)
        if r_ is None:
            sys.exit('no region named %r' % nm)
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in r_['points']], fill=1)
        B = np.array(im).astype(bool)
        bl_, _ = nd.label(G['whas'] & ~H['sea'], structure=np.ones((3, 3)))
        near = nd.binary_dilation(B, iterations=4) & (bl_ > 0)
        ids, cnt = np.unique(bl_[near], return_counts=True)
        if not len(ids):
            sys.exit('%s: no water within 4 cells' % nm)
        into = bl_ == ids[np.argmax(cnt)]
        L = float(np.nanmedian(G['wlev'][into]))
        dB = nd.distance_transform_edt(B) / su                # px into the outline
        bed = L - c_['shore'] - (c_['depth'] - c_['shore']) * sst(0, 3, dB)
        dOut = nd.distance_transform_edt(~B) / su
        bank = L + 25 + (np.maximum(En, L + 25) - (L + 25)) * sst(0, c_['bank'], dOut)
        E2 = np.where(B, np.minimum(En, bed), np.where(dOut <= c_['bank'], np.minimum(En, bank), En))
        cut = float((En - E2).max())
        report['carved'].append({'lake': nm, 'opens_into_level_m': round(L), 'cells': int(B.sum()), 'km2': round(float(B.sum() * KM2)),
                                 'bed_min_m': round(float(E2[B].min())), 'lowered_most_m': round(cut)})
        print('carved %s in its outline: %d km2 opening into the water at %d m, bed to %d m, lowered by up to %d m' % (
            nm, B.sum() * KM2, L, E2[B].min(), cut))
        En = E2
    if CARVE:
        H = setup(dict(G, E=En))
    # the lakes resettled where their water stands (SETTLE)
    dried = np.zeros(E.shape, bool)
    settled = np.zeros(E.shape, bool)
    settled_lv = np.zeros(E.shape)
    report['settled'] = []
    if SETTLE:
        bl_, _ = nd.label(G['whas'] & ~H['sea'], structure=np.ones((3, 3)))
        flag, picks = np.zeros(E.shape, bool), []
        for nm, (x, y) in SETTLE.items():
            j, i = int(round(y * sv)), int(round(x * su))
            ys, xs = np.nonzero(bl_ > 0)
            c = np.argmin((ys - j) ** 2 + (xs - i) ** 2)
            m = bl_ == bl_[ys[c], xs[c]]
            flag |= m
            picks.append((nm, m))
        Gx = dict(G, E=En, whas=G['whas'] & ~flag, wlev=np.where(flag, np.nan, G['wlev']))
        Hx = setup(Gx)
        print('settling %d lakes' % len(picks))
        rx = hydro.route(Hx['S'], Hx['term'], Hx['R'], Hx['PL'], Hx['lake'], Hx['frozen'], log=lambda *a: None)
        for nm, m in picks:
            new = np.zeros(E.shape, bool)
            lv = None
            for e in rx['ends']:
                if (e['cells'] & nd.binary_dilation(m, iterations=1)).any():
                    new |= e['cells'] & ~Gx['whas']
                    lv = e['level']
            for u in set(np.unique(rx['unit'][m & (rx['unit'] > 0)])):
                full = (rx['unit'] == u) & (rx['F'] - rx['S'] > 0.5) & ~Gx['whas']
                if full.any() and not (full & new).any():
                    new |= full
                    lv = float(rx['F'][full].max())
            lab_, _ = nd.label(new | m, structure=np.ones((3, 3)))
            new &= np.isin(lab_, np.unique(lab_[m]))
            settled |= new
            if lv is not None:
                settled_lv[new] = lv
            j, i = np.argwhere(m).mean(0)
            report['settled'].append({'lake': nm, 'at_px': px(round(j), round(i)), 'drawn_level_m': round(float(np.nanmedian(G['wlev'][m]))),
                                      'drawn_km2': round(float(m.sum() * KM2)), 'level_m': round(lv) if lv is not None else None,
                                      'km2': round(float(new.sum() * KM2))})
            print('  %s: drawn at %d m over %d km2, settles at %s m over %d km2' % (
                nm, report['settled'][-1]['drawn_level_m'], m.sum() * KM2, report['settled'][-1]['level_m'], new.sum() * KM2))
        joined = nd.label(settled, structure=np.ones((3, 3)))[0]
        ids = [set(np.unique(joined[settled & nd.binary_dilation(m, iterations=1)])) - {0} for nm_, m in picks if nm_ in NOT_JOINED]
        assert all(not (a & b) for n_, a in enumerate(ids) for b in ids[n_ + 1:]), 'two settled lakes are joined'
        dried = flag & ~settled
        G['whas'] = (G['whas'] & ~flag) | settled
        G['wlev'] = np.where(settled, settled_lv, np.where(flag, np.nan, G['wlev']))
        G['water'] = G['water'] & ~dried
        # the settled lakes made smaller (SHALLOWS): the bed under their shallow water raised to land
        for nm, r_ in SHALLOWS.items():
            m0 = next(m for nm_, m in picks if nm_ == nm)
            sl_, _ = nd.label(settled, structure=np.ones((3, 3)))
            body = np.isin(sl_, np.unique(sl_[settled & nd.binary_dilation(m0, iterations=1)])) & (sl_ > 0)
            L = float(np.median(settled_lv[body]))
            dep = L - En
            off = body & (dep < r_['shallow'])
            up = float((L + r_['bar'] + 0.25 * np.clip(r_['shallow'] - dep, 0, None) - En)[off].max()) if off.any() else 0.0
            En = np.where(off, np.maximum(En, L + r_['bar'] + 0.25 * np.clip(r_['shallow'] - dep, 0, None)), En)
            settled &= ~off
            dried |= off
            G['whas'] &= ~off
            G['wlev'] = np.where(off, np.nan, G['wlev'])
            G['water'] &= ~off
            rec_ = next(x for x in report['settled'] if x['lake'] == nm)
            rec_['shallows_raised_km2'] = round(float(off.sum() * KM2))
            rec_['km2'] = round(float((body & ~off).sum() * KM2))
            print('  %s: its bed under less than %d m of water raised to land (%d km2, by up to %d m): %d km2 left at %d m' % (
                nm, r_['shallow'], off.sum() * KM2, up, (body & ~off).sum() * KM2, L))
        H = setup(G)
    # the closed hollows west of the abyss, cut through to its floor (ABYSS_WEST_KM)
    report['abyss_breaches'] = []
    if ABYSS_WEST_KM:
        ab = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name', '').strip() == 'e abysss'), None)
        if ab is None:
            sys.exit("no region named 'e abysss'")
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in ab['points']], fill=1)
        near = nd.binary_dilation(np.array(im).astype(bool), iterations=4)
        Sa = np.where(G['whas'], np.fmax(G['wlev'], En), En)
        floor = near & (Sa < -900)
        dfl = nd.distance_transform_edt(~floor) * KM
        rows = {j: np.nonzero(floor[j])[0].mean() for j in range(E.shape[0]) if floor[j].any()}
        Ha = setup(dict(G, E=En))
        print('finding the closed hollows west of the abyss')
        ra = hydro.route(Ha['S'], Ha['term'], Ha['R'], Ha['PL'], Ha['lake'], Ha['frozen'], log=lambda *a: None)
        area_a = hydro.accumulate_area(ra['order'], ra['rec'], np.where(ra['term'], 0.0, KM2))
        report['abyss_left'] = []
        for e in ra['ends']:
            cells = e['cells'] & ~G['whas']
            if not cells.any():
                continue
            j, i = np.argwhere(cells).mean(0)
            jr = min(rows, key=lambda r: abs(r - j)) if rows else None
            if jr is None or i >= rows[jr] or dfl[cells].min() > ABYSS_WEST_KM or (Sa[cells] < -900).any():
                continue
            # only where a course ends: a river or a dry valley's catchment (A_WADI) reaches the hollow
            if area_a[nd.binary_dilation(e['cells'], structure=np.ones((3, 3)))].max() < A_WADI:
                continue
            src = np.zeros(E.shape, bool)
            lo = np.unravel_index(np.argmin(np.where(cells, En, np.inf)), E.shape)
            src[lo] = True
            trial = En.copy()
            _, _, _, need = cut_channel(trial, src, float(En[lo]), floor, G['whas'] & ~floor)
            if need > ABYSS_CUT_M:
                report['abyss_left'].append({'hollow_px': px(*lo), 'floor_m': round(float(En[lo])), 'cut_needed_m': round(need)})
                continue
            path, end, over, cut_most = cut_channel(En, src, float(En[lo]), floor, G['whas'] & ~floor)
            gorges.append({'name': 'breach to the abyss', 'from': px(*lo), 'to': 'the abyss floor', 'px': [px(*p_) for p_ in path],
                           'bed_m': [round(float(En[p_])) for p_ in path], 'floor_m': round(float(En[lo]))})
            report['abyss_breaches'].append({'hollow_px': px(*lo), 'floor_m': round(float(En[lo])), 'km2': round(float(cells.sum() * KM2)),
                                             'length_km': round(len(path) * KM), 'cut_km': round(over * KM), 'deepest_cut_m': round(cut_most)})
        if report['abyss_breaches']:
            b_ = report['abyss_breaches']
            print('cut %d hollows west of the abyss through to its floor: %d km cut, deepest %d m; %d left (deeper than %d m)' % (
                len(b_), sum(x['cut_km'] for x in b_), max(x['deepest_cut_m'] for x in b_), len(report['abyss_left']), ABYSS_CUT_M))
    # the abyss's floor rebuilt with long, snaky lakes (ABYSS_LAKES)
    report['abyss_lakes'] = None
    abyss_beds = np.zeros(E.shape, bool)
    abyss_zone = np.zeros(E.shape, bool)
    if ABYSS_LAKES:
        A_ = ABYSS_LAKES
        ab = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name', '').strip() == A_['region']), None)
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in ab['points']], fill=1)
        near = nd.binary_dilation(np.array(im).astype(bool), iterations=4)
        bl_, _ = nd.label(G['whas'] & ~H['sea'], structure=np.ones((3, 3)))
        kept = body_at(bl_, A_['keep'][0], A_['keep'][1], su, sv)
        keepz = nd.distance_transform_edt(~kept) * KM <= A_['keep_km']
        zone = near & (En < A_['zone_m']) & ~keepz & ~H['sea']
        flag = np.isin(bl_, np.unique(bl_[zone & G['whas']])) & (bl_ > 0) & ~kept
        before_km2 = float((flag & zone).sum() * KM2)

        def settle_zone(En_):
            """the zone's water routed with its drawn lakes taken away: (water cells, level per cell)"""
            Gx = dict(G, E=En_, whas=G['whas'] & ~flag, wlev=np.where(flag, np.nan, G['wlev']))
            Hx = setup(Gx)
            rx = hydro.route(Hx['S'], Hx['term'], Hx['R'], Hx['PL'], Hx['lake'], Hx['frozen'], log=lambda *a: None)
            w_, lv_ = np.zeros(E.shape, bool), np.zeros(E.shape)
            zd = zone
            for e in rx['ends']:
                c_ = e['cells'] & ~Gx['whas'] & zd
                if c_.any():
                    w_ |= c_
                    lv_[c_] = e['level']
            for u in set(np.unique(rx['unit'][zone & (rx['unit'] > 0)])):
                if ((rx['unit'] == u) & w_).any():
                    continue                                 # endorheic: its lake balances under the brim
                full = (rx['unit'] == u) & (rx['F'] - rx['S'] > 0.5) & ~Gx['whas'] & zd
                if full.any():
                    w_ |= full
                    lv_[full] = float(rx['F'][full].max())
            # joined water stands at one level: a lake the routing grew as two units takes the higher one's level,
            # with the ground under it that joins it
            wl_, wn_ = nd.label(w_, structure=np.ones((3, 3)))
            for k_ in range(1, wn_ + 1):
                c_ = wl_ == k_
                if np.ptp(lv_[c_]) > 1.0:
                    Lm = float(lv_[c_].max())
                    gl_, _ = nd.label(((En_ < Lm) & zd) | c_, structure=np.ones((3, 3)))
                    reg = np.isin(gl_, np.unique(gl_[c_])) & (gl_ > 0)
                    w_ |= reg
                    lv_[reg] = Lm
            return w_, lv_
        print('abyss floor: where its water settles as the floor stands')
        w0, lv0 = settle_zone(En)
        # each of those lakes laid out again as a long, winding one of about its area (so it still balances), in the
        # basin it lies in (the floor is a chain of pits between sills 1-3 km high): a centreline along the basin's
        # long axis, swinging across its width, the lake as wide as it takes to hold the area; its bed cut `depth` m
        # under its level and walled over it, the rest of its old bed filled to just over the level, falling to it
        cell = lambda x, y: (int(round(y * sv)), int(round(x * su)))

        def region_mask(nm_):
            r_ = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name', '').strip() == nm_), None)
            if r_ is None:
                sys.exit('no region named %r' % nm_)
            im_ = Image.new('L', (E.shape[1], E.shape[0]), 0)
            ImageDraw.Draw(im_).polygon([(a * su, b * sv) for a, b in r_['points']], fill=1)
            return np.array(im_).astype(bool)
        En, rows, snakes, filled, cut_most, fill_most = snake_lakes(
            En, zone, w0, lv0, A_, KM2, [(cell(*a), cell(*b)) for a, b in A_.get('merge', ())],
            [(region_mask(nm_), b_['shore'], b_['depth']) for nm_, b_ in A_.get('beds', {}).items()])
        abyss_beds = filled | (flag & ~snakes)
        abyss_zone = zone
        for r_ in rows:
            r_['at_px'] = px(*r_.pop('at_cell'))
            r_['trough_km2'] = round(r_.pop('cells') * KM2)
            r_['was_km2'] = round(r_.pop('was_cells') * KM2)
            r_['length_km'] = round(r_.pop('length_cells') * KM)
        print('abyss floor: %d lakes laid out as troughs, cut up to %d m; %d km2 of their old beds filled (up to %d m); routing' % (
            len(rows), cut_most, filled.sum() * KM2, fill_most))
        neww, lvw = settle_zone(En)
        settled_lv[neww] = lvw[neww]
        outside = neww & ~nd.binary_dilation(snakes, iterations=1)
        report['abyss_lakes'] = {'drawn_km2': round(before_km2), 'settled_before_km2': round(float(w0.sum() * KM2)),
                                 'troughs': len(rows), 'trough_km2': round(float(snakes.sum() * KM2)),
                                 'water_km2': round(float(neww.sum() * KM2)), 'water_off_troughs_km2': round(float(outside.sum() * KM2)),
                                 'trough_cut_most_m': round(cut_most), 'filled_km2': round(float(filled.sum() * KM2)),
                                 'filled_most_m': round(fill_most), 'lakes': rows}
        print('abyss floor: %d km2 drawn, %d km2 where its water settled, %d km2 now in %d troughs (%d km2 off them)' % (
            before_km2, w0.sum() * KM2, neww.sum() * KM2, len(rows), outside.sum() * KM2))
        for r_ in rows:
            print('  lake at px %s (%d m): was %d km2, trough %d km long, %d km2; cut up to %d m, old bed filled up to %d m' % (
                r_['at_px'], r_['level_m'], r_['was_km2'], r_['length_km'], r_['trough_km2'], r_['cut_most_m'], r_['filled_most_m']))
        settled |= neww
        dried |= flag & ~neww
        G['whas'] = (G['whas'] & ~flag) | neww
        G['wlev'] = np.where(neww, settled_lv, np.where(flag, np.nan, G['wlev']))
        G['water'] = G['water'] & ~(flag & ~neww)
        H = setup(G)
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
    cut = np.where(graded | reshaped, 0.0, E - En)
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
    if (np.abs(En - E) > 0.05).any() or arms.any() or dried.any():
        h2 = G['h'].copy()
        enc = np.round(np.clip((En - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
        q_ = np.where(np.abs(En - E) > 0.05, enc, (h2[..., 0] << 8) | h2[..., 1])
        h2[..., 0], h2[..., 1] = q_ >> 8, q_ & 255
        h2[..., 2] = np.where(arms | dried, 0, h2[..., 2])
        h2[..., 2] = np.where(G['whas'] | newlake, 255, h2[..., 2])     # the water flag follows the water (extract_region reads it)
        rep['h'] = b64(Image.fromarray(h2.astype(np.uint8), 'RGB'), optimize=True)
    if newlake.any() or arms.any() or settled.any() or reshaped.any():
        wl = raster(D, 'wl').astype(np.int64)
        wl[..., 2] = np.where(arms | dried, 0, wl[..., 2])
        encs = np.round(np.clip((settled_lv - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
        wl[..., 0] = np.where(settled, encs >> 8, wl[..., 0])
        wl[..., 1] = np.where(settled, encs & 255, wl[..., 1])
        wl[..., 2] = np.where(settled, 255, wl[..., 2])
        encr = np.round(np.clip((reshaped_lv - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
        wl[..., 0] = np.where(reshaped, encr >> 8, wl[..., 0])
        wl[..., 1] = np.where(reshaped, encr & 255, wl[..., 1])
        encw = np.round(np.clip((newlv - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
        add = newlake & ~G['whas']
        wl[..., 0] = np.where(add, encw >> 8, wl[..., 0])
        wl[..., 1] = np.where(add, encw & 255, wl[..., 1])
        wl[..., 2] = np.where(add, 255, wl[..., 2])
        rep['wl'] = b64(Image.fromarray(wl.astype(np.uint8), 'RGB'), optimize=True)
        report['new_water'] = {'cells': int(add.sum()), 'km2': round(float(add.sum() * KM2))}
    gF = nd.zoom(graded.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=1)[:OH, :OW] > .35
    gF = nd.binary_dilation(gF, iterations=1)
    if graded.any():
        # the raised floors were painted as the deep basin they were: they take the land beside them (nearest pixel
        # outside the valleys and off the water), and the temperatures lapse with the new ground (6.5 C per km)
        wF = nd.zoom(G['whas'].astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5
        _, (iy, ix) = nd.distance_transform_edt(gF | wF, return_indices=True)
    # 7. the climate where the ground or a water surface moved: the temperatures lapse with it, then the rain, class
    # and zone are recomputed (edit_heights.reclimate), and the rain and climate maps re-lit and repainted
    surf = lambda Ex, wh, wl: np.where(wh, np.fmax(Ex, wl), Ex)
    DS = nd.zoom(surf(En, G['whas'], G['wlev']) - surf(E, whas0, wlev0), (OH / E.shape[0], OW / E.shape[1]), order=1)[:OH, :OW]
    for k in ['tm', 'th', 'tl', 'tw', 'tc']:
        v = raster(D, k, 'L').astype(float) - 90
        ok = (v > -89) & (np.abs(DS) > 1)
        v2 = np.where(ok, np.round(v - 6.5 * DS / 1000), v)
        rep[k] = b64(Image.fromarray(np.clip(v2 + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    DC = dict(D, p=p_drawn, **{k: rep[k] for k in ['tm', 'th', 'tl', 'tw', 'tc']})
    rain0 = raster(DC, 'p', 'L').astype(float) / 255 * 4000
    # the abyss's rebuilt floor takes its rain from 4.20's own lake effect over today's lakes (lake_rain): a filled pit
    # is still the abyss floor, not the land of its new height (its look-alikes elsewhere swung the rain with where the
    # lakes were laid), and the floor beside the new lakes is as wet as 4.20's was beside its own (the owner: desert
    # spits between the lakes)
    kz = np.clip(nd.gaussian_filter(nd.zoom(abyss_zone.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW], 2.0) * 2, 0, 1)
    zr = kz > 0
    upF = lambda a: nd.zoom(a.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5
    floor_rain, report['abyss_lake_rain'] = lake_rain(rain0, upF(whas0), upF(G['whas'] | newlake), zr)
    rain2, cls2, zon2, _, report['climate'] = reclimate(DC, E, En, G['whas'], np.zeros((OH, OW), bool), None,
                                                         (floor_rain, kz) if abyss_zone.any() else None)
    if abyss_zone.any():
        rain2 = rain2 * (1 - kz) + floor_rain * kz          # on the water too (reclimate leaves water's rain)
    print('climate:', report['climate'])
    pal = np.array([[int(c['color'][i:i + 2], 16) for i in (1, 3, 5)] for c in D['climate']['classes']], float)
    c0 = raster(D, 'c', 'L')
    from edit_heights import relight as relight_
    lit, _, _ = relight_(D, E, En, keys=('rt', 'ct'))
    rep['ct'] = repaint(dict(D, ct=lit['ct']), 'ct', pal[c0], pal[cls2], cls2 != c0)
    rep['rt'] = repaint(dict(D, rt=lit['rt']), 'rt', ramp(rain0), ramp(rain2), np.abs(rain2 - rain0) > 15)
    rep['p'] = b64(Image.fromarray(np.clip(np.round(rain2 / 4000 * 255), 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep['c'] = b64(Image.fromarray(cls2, 'L'), optimize=True)
    rep['z'] = b64(Image.fromarray(zon2, 'L'), optimize=True)
    if '--rain' in sys.argv:
        # how far the rain the rivers ran on is from the rain recomputed now (0 when the two passes agree)
        Pin = raster(D, 'p', 'L').astype(float) / 255 * 4000
        report['climate']['rain_in_vs_now_mm'] = {'mean_abs': round(float(np.abs(Pin - rain2).mean()), 2),
                                                  'max_abs': round(float(np.abs(Pin - rain2).max()))}
        print('rain the rivers ran on vs recomputed now:', report['climate']['rain_in_vs_now_mm'])
    DP = D
    if gorges:
        from edit_heights import relight
        imgs, _, _ = relight(D, E, np.where(graded, E, En), keys=('st', 't'))   # the gorges shaded into the maps
        DP = dict(D, **imgs)
    # the old lakes' beds that are land now (dried, the abyss's filled floor) and the lowered regions: painted from the
    # land round them, so no old shoreline or wall shows on the maps
    old = (dried | abyss_beds | lowered_m) & ~G['whas']
    oF = nd.zoom(old.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=1)[:OH, :OW] > .35
    wetF_ = nd.zoom((G['whas'] | newlake).astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5
    oF = nd.binary_dilation(oF, iterations=1) & ~wetF_
    # and any water paint left on dry ground where 4.21 changed the land or its water (the satellite's blue over red)
    edited = nd.binary_dilation(lowered_m | dried | abyss_beds | (np.abs(En - E) > 1) | (whas0 & ~G['whas']), iterations=3)
    st0_ = np.array(Image.open(io.BytesIO(__import__('base64').b64decode(D['st']))).convert('RGB')).astype(float)
    wpaint = (st0_[..., 2] - st0_[..., 0] > 35) & ~nd.binary_dilation(wetF_, iterations=2) & \
        (nd.zoom(edited.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5)
    oF |= nd.binary_dilation(wpaint, iterations=1) & ~wetF_
    # the sea's arms made land (GRADE) were painted as sea
    oF |= nd.binary_dilation(nd.zoom(arms.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5,
                             iterations=1) & ~wetF_
    # colour only from dry land that is not painted as water
    land_src = ~nd.binary_dilation(wetF_, iterations=1) & ~((st0_[..., 2] - st0_[..., 0] > 35) & (st0_[..., 1] > st0_[..., 0] + 20))
    # the other way: water where the map paints land (lakes settled, grown or laid out anew) takes the colour of the
    # lake paint round it, so the satellite with the water layer off shows today's shores
    wpaint_all = (st0_[..., 2] - st0_[..., 0] > 35) & (st0_[..., 1] > st0_[..., 0] + 20)
    nF = wetF_ & ~wpaint_all & (nd.zoom(((G['whas'] | newlake) & ~whas0).astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5)
    water_src = wetF_ & wpaint_all
    if not water_src.any():
        nF[:] = False
    report['water_painted_px'] = int(nF.sum())
    report['repainted_px'] = int(oF.sum())
    for key in ('st', 't'):
        src = Image.open(io.BytesIO(__import__('base64').b64decode(DP[key])))
        if graded.any() or oF.any() or nF.any() or LAKE_STYLE:
            arr = np.array(src.convert('RGB'))
            if graded.any():
                land = arr[iy, ix]
                soft = nd.gaussian_filter(gF.astype(float), 1.0)[..., None]
                arr = np.clip(arr * (1 - soft) + land * soft, 0, 255).astype(np.uint8)
            if oF.any():
                arr = inpaint(arr, oF, land_src)
            if nF.any():
                arr = inpaint(arr, nF, water_src)
            # the regions whose lakes keep their own look (LAKE_STYLE): today's water painted as their old lakes were
            for nm_ in LAKE_STYLE:
                r_ = next((r for r in json.load(open(rpath, encoding='utf8')) if r.get('name', '').strip() == nm_), None)
                if r_ is None:
                    sys.exit('no region named %r' % nm_)
                pim = Image.new('L', (OW, OH), 0)
                ImageDraw.Draw(pim).polygon([tuple(p_) for p_ in r_['points']], fill=1)
                arr0_ = np.array(Image.open(io.BytesIO(__import__('base64').b64decode(D[key]))).convert('RGB'))
                arr = lake_style(arr, arr0_, np.array(pim).astype(bool),
                                 nd.zoom(whas0.astype(float), (OH / E.shape[0], OW / E.shape[1]), order=0)[:OH, :OW] > .5, wetF_)
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
    if gorges:
        s = set_data(s, 'outlets', gorges)
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
