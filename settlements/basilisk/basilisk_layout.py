#!/usr/bin/env python3
"""Basilisk, the Lizardmen's stone capital: the layout as data (PLAN.md sections 2-5).

Writes basilisk_plan.json, the manifest a later page builds from, and is imported by basilisk_blueprint.py, which
draws the sheets from the same numbers. Plain geometry and records, no three.js and no DOM: the [G data] fragment a
page makes from the JSON is that page's to write (as export_tempest.py hands tempest_plan.json on).

    python basilisk_layout.py            # writes basilisk_plan.json next to this file and prints the census

Frame: metres; u east, v north (a page's x = u, z = -v); y up from the sabkha (the scale model's -2,600 m floor).
Origin: the proposed pin, the door of the Hall of Intention, 5.1 px (PIN_PX). 2 km a model pixel.
The rules (kits/lizardmen/DESIGN.md 2.1-2.2; LORE.md 6.20): the squared spiral (leiwen) at every scale, its corners
75 and 105 degrees (a skew frame e1, e2 at 105 degrees), each winding 1.25 times the last; odd counts; one deliberate
flaw in every band; doors face in; bronze, never iron; no banners, drums or signal fires.
Everything here is *proposed* unless PLAN.md says the owner fixed it.
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
MODEL = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
OUT = os.path.join(HERE, 'basilisk_plan.json')

RATIO = 1.25
Q = RATIO ** 0.25                      # one quarter turn: four of them make a winding 1.25 times the last
SIN75 = math.sin(math.radians(75))
OLD_PIN_PX = (765, 1596)               # slrodrkrls "Sauropolis": a water cell of the eastern terminal sea
PIN_PX = (766.6, 1597.25)             # proposed: the sabkha at the sea's south-west shore, by Tlahn Gill's bay
RELIQ_PX = (790, 1578)                 # the east reliquary (PLAN-LIZARDMEN, proposed): the ley line's mark
M_PX = 2000.0

def px_uv(x, y):
    return ((x - PIN_PX[0]) * M_PX, (PIN_PX[1] - y) * M_PX)

def r1(x):
    return round(float(x), 1)

def P(pts):
    return [[r1(u), r1(v)] for u, v in pts]

def fnv(s):
    """A stable hash for the plan's own choices (the flaws). The page reads the choice from the manifest; it does not
    re-derive it, so this need not be core/rand's."""
    h = 2166136261
    for ch in s.encode('utf-8'):
        h = ((h ^ ch) * 16777619) & 0xffffffff
    return h

# ------------------------------------------------------------------------------------------------ the skew frame
TH1 = 0.0                              # e1 east, along the sea's south shore
TH2 = math.radians(105.0)              # e2 at 105 degrees: north-north-west; every corner 75 or 105
E1 = (math.cos(TH1), math.sin(TH1))
E2 = (math.cos(TH2), math.sin(TH2))
DET = E1[0] * E2[1] - E1[1] * E2[0]

def sk(a, b, o=(0.0, 0.0)):
    return (o[0] + a * E1[0] + b * E2[0], o[1] + a * E1[1] + b * E2[1])

def unsk(u, v, o=(0.0, 0.0)):
    u -= o[0]; v -= o[1]
    return ((u * E2[1] - v * E2[0]) / DET, (E1[0] * v - E1[1] * u) / DET)

def rect_sk(a0, a1, b0, b1, o=(0.0, 0.0)):
    return [sk(a0, b0, o), sk(a1, b0, o), sk(a1, b1, o), sk(a0, b1, o)]

def poly_area(pts):
    s = 0.0
    for i in range(len(pts)):
        x0, y0 = pts[i]; x1, y1 = pts[(i + 1) % len(pts)]
        s += x0 * y1 - x1 * y0
    return abs(s) / 2.0

def centroid(pts):
    return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))

def footprint(cx, cv, ang, w, d):
    """A building's footprint: w along its frontage, d deep, its front (+z in the kit's frame) facing ang (radians,
    measured from +u toward +v)."""
    fx, fv = math.cos(ang), math.sin(ang)            # the front's outward normal
    tx, tv = -fv, fx                                  # along the frontage
    out = []
    for sa, sb in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        out.append((cx + tx * sa * w / 2 + fx * sb * d / 2, cv + tv * sa * w / 2 + fv * sb * d / 2))
    return out

def seg_hits_corridor(pts, p0, d, half):
    """Whether a footprint (pts) comes within half of the ley line's ray from p0 along unit d."""
    nx, nv = -d[1], d[0]
    ss = [(p[0] - p0[0]) * nx + (p[1] - p0[1]) * nv for p in pts]
    ts = [(p[0] - p0[0]) * d[0] + (p[1] - p0[1]) * d[1] for p in pts]
    if max(ts) < 0: return False
    return not (min(ss) > half or max(ss) < -half)

# ------------------------------------------------------------------------------------------------ the kit's pieces
# w along the frontage, d deep, the people one holds (settlements/gila/PLAN.md section 3); 'owed' is the stone piece the
# capital wants and the kit lacks (PLAN.md section 7): a page draws 'key' until the kit has 'owed'.
KIT = {
  'lk-greathall': dict(w=22, d=30, name='Hall of Intention'),
  'lk-college':   dict(w=24, d=16, name="Interpreters' college", holds=39),
  'lk-nest':      dict(w=52, d=48, name='Stone nest hall'),
  'lk-warren':    dict(w=24, d=21, name='Stone cell-warren', holds=28, caste=1),
  'lk-longhouse': dict(w=22, d=11, name='Stone rib house', holds=33, caste=3),
  'lk-gate':      dict(w=22, d=12, name='Capital gate'),
  'lk-wall':      dict(w=22, d=17, name='Capital wall (a 20 m run)'),
  'lk-watchtower': dict(w=12, d=12, name='Stone watchtower'),
  'lk-makers':    dict(w=12, d=10, name="Stone Makers' house", holds=10, caste=2),
  'lk-tower':     dict(w=11, d=11, name="Stone Interpreters' house", holds=7, caste=5),
  'lk-lodge':     dict(w=15, d=21, name="Stone warriors' lodge", holds=30, caste=4),
  'lk-granary':   dict(w=15, d=12, name='Stone Allotment granary'),
  'lz-makers':    dict(w=11, d=9, name="Makers' quarters", holds=10, caste=2),
  'lz-tower':     dict(w=11, d=11, name="Interpreters' house", holds=7, caste=5),
  'lz-lodge':     dict(w=14, d=20, name="Warriors' lodge", holds=30, caste=4),
  'lz-hall-bronze': dict(w=19, d=13, name='Bronze and stone hall', holds=12),
  'lz-hall-bone': dict(w=19, d=14, name='Bone hall', holds=12),
  'lz-hall-reed': dict(w=19, d=13, name='Reed, weaving and lacquer hall', holds=12),
  'lz-bakehouse': dict(w=17, d=16, name='Earth-oven and yam bakehouse'),
  'lz-fermentery': dict(w=18, d=15, name='Spore and yam fermenting house'),
  'lz-granary':   dict(w=14, d=11, name='Granary'),
  'lz-warehouse': dict(w=17, d=13, name='Warehouse (the plunder)'),
  'lz-wayhalt':   dict(w=24, d=18, name='Coil Round staging halt'),
  'lz-waystone':  dict(w=8, d=7, name='Coil waystone and haul sledge'),
  'lz-barracks':  dict(w=21, d=14, name='Barracks'),
  'lz-muster':    dict(w=24, d=38, name='Mustering ground'),
  'lz-seer':      dict(w=15, d=13, name="Seer's hall"),
  'lz-medicine':  dict(w=9, d=8, name='Medicine hut'),
  'lz-cistern':   dict(w=12, d=12, name='Cistern'),
  'lz-bells':     dict(w=8, d=4, name='Bell rack (no clappers)'),
  'lz-stela-pair': dict(w=7, d=7, name='Stela pair'),
  'lz-stela-turned': dict(w=9, d=9, name='Turned stelae'),
  'lz-obelisk':   dict(w=4, d=4, name='Twisted obelisk'),
  'lz-ley':       dict(w=6, d=22, name='Ley line shrine'),
  'lz-circle':    dict(w=22, d=22, name='Stone circle'),
  'lz-weir':      dict(w=18, d=14, name='Fishing weir and drying racks'),
  'lz-lookout':   dict(w=9, d=9, name='Lookout'),
  'gl-well':      dict(w=6.5, d=6.5, name='Brick well (Gila\'s piece)'),
  'gl-tank':      dict(w=22, d=17, name='The Great Tank of the First Turn'),
  'gl-pans':      dict(w=60, d=60, name='Salt pans (Gila\'s piece)'),
  'gl-saltstore': dict(w=16, d=13, name='Salt store (Gila\'s piece)'),
  # built capital works & vessels (kits/lizardmen 63-lk-works.js and 59w-lz-works.js, 2026-11-17)
  'lk-bronzehall': dict(w=45, d=27, name='Great Bronze Hall', holds=60),
  'lk-dockstore': dict(w=33, d=21, name='Stone dock store', holds=30),
  'lk-boil':      dict(w=27, d=15, name='Salt boiling floor', holds=12),
  'lk-slot':      dict(w=20, d=12, name='Ley Slot wall wicket'),
  'lz-barge':     dict(w=5.4, d=21, name='Reed barge (eleven ribs)', cls='vessel',
                       tags=dict(types=['cargo', 'barge', 'ferry'], propulsion='paddles', hull='raft', wealth='middle', crew=6, role='barge', job='shipwrighting')),
  # site-scale civil basins & earthworks (stamped onto KDRAWN + WATER.still when the page builds)
  'lk-dock':      dict(w=36, d=175, name='The dock (after Lothal)', owed=True),
  'lk-mole':      dict(w=9, d=700, name='The ley mole', owed=True),
  'lk-reservoir': dict(w=1, d=1, name='Reservoir (after Dholavira)', owed=True),
  'lk-checkdam':  dict(w=1, d=1, name='Check dam and leat', owed=True),
  'lk-charcoal':  dict(w=40, d=30, name='Charcoal and ore yard', owed=True),
}
HOUSE = {1: 'lk-warren', 2: 'lk-makers', 3: 'lk-longhouse', 4: 'lk-lodge', 5: 'lk-tower', 6: 'lk-lodge'}
CASTE_NAME = {1: 'Tenders', 2: 'Makers', 3: 'Drovers', 4: 'Line warriors', 5: 'Interpreters', 6: 'Bulwarks'}
CASTE_H = {1: 1.22, 2: 1.53, 3: 1.92, 4: 2.41, 5: 3.03, 6: 3.80}

# ------------------------------------------------------------------------------------------------ the census
# 15,000 (the owner, 2026-11-16). The capital's shares (PLAN.md section 3): more Interpreters (the college) and Makers
# (the bronze hall, the stone, the salt), fewer Drovers (the grain comes from Iguana and the warrens).
CENSUS = {1: 3750, 2: 3750, 3: 3000, 4: 2250, 5: 750, 6: 1500}
PRECINCT_PEOPLE = {5: 130, 1: 140}
GATE_PEOPLE = {4: 750, 6: 600, 3: 450, 2: 300}
WORKS_PEOPLE = {2: 250}

# ------------------------------------------------------------------------------------------------ the Great Coil
R0 = 150.0             # the precinct's half size (skew), the Coil's first turn
D0 = 260.0             # the first winding's band, perpendicular metres; 1.25 times wider each winding
C_COIL = (D0 / SIN75) / (Q ** 4 - 1)
COIL_W = 14.0          # the Great Coil street (the processional way)
COIL_K = COIL_W / 2 + 1.5
BLOCKS = 8             # two windings: seven districts and the gate quarter

def rc(m):
    return R0 if m < 0 else R0 + C_COIL * (Q ** (m + 1) - 1)

def side_rect(s, rin, rout, tlo, thi):
    """A band's skew rectangle (a0, a1, b0, b1) on side s (0 south, 1 east, 2 north, 3 west; the Coil turns
    counter-clockwise), between radii rin and rout and from tlo to thi along the side."""
    if s == 0: return (tlo, thi, -rout, -rin)
    if s == 1: return (rin, rout, tlo, thi)
    if s == 2: return (-thi, -tlo, rin, rout)
    return (-rout, -rin, -thi, -tlo)

def coil_blocks():
    out = []
    for m in range(BLOCKS):
        s = m % 4
        kk = COIL_K / SIN75
        rin, rout = rc(m - 1) + kk, rc(m + 3) - kk
        # each band runs on through the turn after it (Gila's bands stop at the turn and leave a corner square): a cross
        # street (2 kerbs) parts it from the next band, the next district
        tlo, thi = -(rc(m - 2) if m >= 2 else R0) + kk, rc(m + 4) - kk
        out.append(dict(m=m, side=s, winding=m // 4, rect=side_rect(s, rin, rout, tlo, thi),
                        depth=(rc(m + 3) - rc(m - 1)) * SIN75))
    return out

def coil_corners(n=12):
    """The Great Coil street's centre line: corner points of one continuous squared spiral (Gila's construction)."""
    cur = [-R0, -R0]; pts = [tuple(cur)]
    for m in range(n):
        s = m % 4; rm = rc(m)
        if s == 0: cur = [rm, cur[1]]
        elif s == 1: cur = [cur[0], rm]
        elif s == 2: cur = [-rm, cur[1]]
        else: cur = [cur[0], -rm]
        pts.append(tuple(cur))
    return pts

def corner_court(m):
    """The square left at each turn of the Coil (between the band before the turn and the band after it)."""
    s = m % 4; lo, hi = rc(m - 2), rc(m + 2); i0, i1 = rc(m - 1), rc(m + 3)
    kk = COIL_K / SIN75
    if s == 0: return (-hi + kk, -lo - kk, -i1 + kk, -i0 - kk)
    if s == 1: return (i0 + kk, i1 - kk, -hi + kk, -lo - kk)
    if s == 2: return (lo + kk, hi - kk, i0 + kk, i1 - kk)
    return (-i1 + kk, -i0 - kk, lo + kk, hi - kk)

# ------------------------------------------------------------------------------------------------ a district's spiral
DIST_W = 7.0                               # a district's spiral street (Gila's)
DIST_K = DIST_W / 2 + 1.2
NEST_COURT = 38.0                          # the nest court's short half (skew): the stone nest hall is 52 x 48

def district(block, j):
    """One district: its own rectangular leiwen wound in to its nest hall, in the band's skew rectangle. Returns the
    district record with its spiral street, its blocks, its placements (filled later) and its frame."""
    a0, a1, b0, b1 = block['rect']
    ac, bc = (a0 + a1) / 2, (b0 + b1) / 2
    hx, hy = (a1 - a0) / 2, (b1 - b0) / 2
    long_a = hx >= hy
    L, S = (hx, hy) if long_a else (hy, hx)
    E = L - S                               # the court is long by what the band is long
    cw = (j % 2 == 0)                        # paired chirality: the districts alternate ...
    if j == 6: cw = True                     # ... and the seventh breaks the pairing: the city's flaw (PLAN.md 4.3)
    # the last winding's widest side reaches rs(4n + 2): fit that inside the band, the first band at least 30 m deep
    avail = S - DIST_K / SIN75 - NEST_COURT
    n = 3
    while n > 1 and avail / (Q ** (4 * n + 3) - 1) * (Q ** 4 - 1) * SIN75 < 30.0:
        n -= 1
    cd = avail / (Q ** (4 * n + 3) - 1)
    def rs(m):                               # the short-axis radius at quarter turn m
        return NEST_COURT if m < 0 else NEST_COURT + cd * (Q ** (m + 1) - 1)
    def to_ab(x, y):                         # local (long, short) skew -> the city's skew (a, b)
        if not cw: x = -x
        return (ac + x, bc + y) if long_a else (ac + y, bc + x)
    def rad(m, s):                           # sides 0 and 2 run along the long axis, so their ends sit E further out
        return rs(m) + (E if s in (1, 3) else 0.0)
    # which local y side faces the precinct (the band's inner edge): the district's mouth opens there, onto the Coil
    inner_y = {0: 1, 1: -1, 2: -1, 3: 1}[block['side']]
    # the spiral's corners, Gila's construction with the long sides stretched; it ends on the inner side
    cur = [-rad(-1, 1), -rad(-1, 0)]; corners = [tuple(cur)]
    nseg = 4 * n + (3 if inner_y > 0 else 1)
    for m in range(nseg):
        s = m % 4
        if s == 0: cur = [rad(m, 1), cur[1]]
        elif s == 1: cur = [cur[0], rad(m, 0)]
        elif s == 2: cur = [-rad(m, 1), cur[1]]
        else: cur = [cur[0], -rad(m, 0)]
        corners.append(tuple(cur))
    corners.append((cur[0], inner_y * (S + DIST_K / SIN75)))      # the mouth, out to the Great Coil's kerb
    k = DIST_K / SIN75
    bands = []
    for w in range(n):
        for s in range(4):
            m = 4 * w + s
            rin, rout = rad(m - 1, s) + k, rad(m + 3, s) - k
            tlo = -(rad(m - 2, (s + 1) % 4) if m >= 2 else rad(-1, (s + 1) % 4)) + k
            thi = rad(m, (s + 1) % 4) - k
            x0, x1, y0, y1 = side_rect(s, rin, rout, tlo, thi)
            depth = (rout - rin) * SIN75
            if x1 - x0 < 8 or y1 - y0 < 8: continue
            bands.append(dict(w=w, s=s, local=(x0, x1, y0, y1), depth=depth))
    # into the city's frame
    def L2uv(x, y):
        a, b = to_ab(x, y); return sk(a, b)
    ck = NEST_COURT - DIST_K / SIN75
    cl = ck + E
    rec = dict(id='d%d' % (j + 1), j=j, block=block['m'], side=block['side'], winding=block['winding'],
               chirality='cw' if cw else 'ccw', windings=n, band0=r1(cd * (Q ** 4 - 1) * SIN75),
               centre=sk(ac, bc), court=[L2uv(*p) for p in [(-cl, -ck), (cl, -ck), (cl, ck), (-cl, ck)]],
               court_axis=[L2uv(-cl, 0), L2uv(cl, 0)], court_half=ck * SIN75,
               street=[L2uv(*p) for p in corners], mouth=L2uv(*corners[-1]), bands=[], outline=rect_sk(a0, a1, b0, b1),
               area=(a1 - a0) * (b1 - b0) * SIN75)
    for bd in bands:
        x0, x1, y0, y1 = bd['local']
        pts = [L2uv(x0, y0), L2uv(x1, y0), L2uv(x1, y1), L2uv(x0, y1)]
        # the inner edge (toward the nest) and the outer edge, in the city's frame
        s = bd['s']
        if s == 0:   ie, oe = ((x0, y1), (x1, y1)), ((x0, y0), (x1, y0))
        elif s == 1: ie, oe = ((x0, y0), (x0, y1)), ((x1, y0), (x1, y1))
        elif s == 2: ie, oe = ((x0, y0), (x1, y0)), ((x0, y1), (x1, y1))
        else:        ie, oe = ((x1, y0), (x1, y1)), ((x0, y0), (x0, y1))
        rec['bands'].append(dict(w=bd['w'], s=s, depth=bd['depth'], poly=pts,
                                 inner=[L2uv(*ie[0]), L2uv(*ie[1])], outer=[L2uv(*oe[0]), L2uv(*oe[1])]))
    rec['_nest_uv'] = rec['centre']
    return rec

# ------------------------------------------------------------------------------------------------ the site, read from the model
def model_reader():
    from PIL import Image
    h = Image.open(os.path.join(MODEL, 'h.png')).convert('RGB')
    W, H = h.size
    px = h.load()
    def cell(x, y):
        x = min(max(int(x), 0), W - 1); y = min(max(int(y), 0), H - 1)
        r, g, b = px[x, y]
        return (r * 256 + g) / 65535.0 * 29600.0 - 2600.0, 1.0 if b > 127 else 0.0
    def bil(x, y, k):
        x0, y0 = math.floor(x), math.floor(y); fx, fy = x - x0, y - y0
        a = cell(x0, y0)[k]; b = cell(x0 + 1, y0)[k]; c = cell(x0, y0 + 1)[k]; d = cell(x0 + 1, y0 + 1)[k]
        return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
    return cell, bil

def uv_px(u, v):
    return (PIN_PX[0] + u / M_PX, PIN_PX[1] - v / M_PX)

def contours(f, u0, u1, v0, v1, step, level):
    """Marching squares on f(u, v): the level's segments (a list of ((u, v), (u, v)))."""
    nu = int((u1 - u0) / step) + 1; nv = int((v1 - v0) / step) + 1
    G = [[f(u0 + i * step, v0 + k * step) for i in range(nu)] for k in range(nv)]
    segs = []
    def lerp(p, q, a, b):
        t = 0.5 if a == b else (level - a) / (b - a)
        return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)
    for k in range(nv - 1):
        for i in range(nu - 1):
            ps = [(u0 + i * step, v0 + k * step), (u0 + (i + 1) * step, v0 + k * step), (u0 + (i + 1) * step, v0 + (k + 1) * step), (u0 + i * step, v0 + (k + 1) * step)]
            vs = [G[k][i], G[k][i + 1], G[k + 1][i + 1], G[k + 1][i]]
            e = []
            for a in range(4):
                b = (a + 1) % 4
                if (vs[a] >= level) != (vs[b] >= level): e.append(lerp(ps[a], ps[b], vs[a], vs[b]))
            if len(e) == 2: segs.append((e[0], e[1]))
            elif len(e) == 4: segs.append((e[0], e[1])); segs.append((e[2], e[3]))
    return segs

def chain(segs, tol=1.0):
    """Join contour segments into polylines."""
    segs = [list(s) for s in segs]; lines = []
    def key(p): return (round(p[0] / tol), round(p[1] / tol))
    while segs:
        line = segs.pop()
        grown = True
        while grown:
            grown = False
            for i, s in enumerate(segs):
                if key(s[0]) == key(line[-1]): line.append(s[1]); segs.pop(i); grown = True; break
                if key(s[1]) == key(line[-1]): line.append(s[0]); segs.pop(i); grown = True; break
                if key(s[1]) == key(line[0]): line.insert(0, s[0]); segs.pop(i); grown = True; break
                if key(s[0]) == key(line[0]): line.insert(0, s[1]); segs.pop(i); grown = True; break
        lines.append(line)
    return lines

def rivers():
    with open(os.path.join(MODEL, 'rivers.json'), encoding='utf-8') as fh:
        R = json.load(fh)
    out = {}
    for r in R:
        if r.get('id') in ('r762', 'r249', 'r207'):
            pts = [px_uv(x, y) for x, y in r['px']]
            mouth = (r.get('to') or {}).get('at_px')
            if mouth: pts.append(px_uv(*mouth))          # the course in 'px' stops short; its mouth is 'to.at_px'
            out[r['id']] = dict(name=r['name'], kind=r['kind'], perennial=r['perennial'], q=r['q_mouth_m3s'], pts=pts)
    return out

# ------------------------------------------------------------------------------------------------ build the plan
def build():
    cell, bil = model_reader()
    plan = dict(id='lz.basilisk', name='Basilisk', culture='lizardmen', people=15000,
                blueprint='settlements/basilisk/PLAN.md',
                frame='metres; u east, v north (a page: x = u, z = -v); origin the proposed pin, the door of the Hall of Intention',
                skew=dict(e1=[r1(E1[0] * 1000) / 1000, r1(E1[1] * 1000) / 1000], e2=[round(E2[0], 4), round(E2[1], 4)], corner_deg=[75, 105], ratio=RATIO))
    # ---- the site
    hs = [cell(*uv_px(u, v))[0] for u in (-800, 0, 800) for v in (-600, 0, 600)]
    plan['site'] = dict(pin_px=list(PIN_PX), old_pin_px=list(OLD_PIN_PX), old_pin_uv=P([px_uv(*OLD_PIN_PX)])[0],
                        reliquary_px=list(RELIQ_PX), ground_m=r1(min(hs)), ground_max_m=r1(max(hs)),
                        sea='the eastern terminal sea (9,272 km2, salt), its surface proposed at -2,600.5 m',
                        climate='XA hypertropic jungle: 36 C mean, ~1,850-2,086 mm, 2.21 atm')
    # the model's shore (the water mask bilinear at 0.5) and the ground's rise, round the city
    f_w = lambda u, v: bil(*uv_px(u, v), 1)
    f_h = lambda u, v: bil(*uv_px(u, v), 0)
    plan['site']['shore_model'] = [P(l) for l in chain(contours(f_w, -9000, 9000, -7000, 7000, 250, 0.5), 2)]
    plan['site']['contours'] = {str(lv): [P(l) for l in chain(contours(f_h, -16000, 12000, -26000, 9000, 400, -2600 + lv), 2)] for lv in (25, 100, 250, 500, 1000)}
    # how far south the floor runs flat before it rises (read due south of the pin)
    def south_to(lv):
        v = 0.0
        while v > -40000 and f_h(0, v) < -2600 + lv: v -= 100
        return r1(-v / 1000.0)
    plan['site']['flat_south_km'] = {str(lv): south_to(lv) for lv in (5, 25, 100, 250)}
    plan['site']['rivers'] = {k: dict(v, pts=P(v['pts'])) for k, v in rivers().items()}
    # ---- the Great Coil
    blocks = coil_blocks()
    coil = coil_corners(BLOCKS + 4)            # twelve segments; the thirteenth runs along the tongue's foot to the gate
    GATE_A = -rc(6) - 30.0 / SIN75
    coil.append((GATE_A, coil[-1][1]))
    plan['coil'] = dict(r0=R0, band0=D0, street_w=COIL_W, radii=[r1(rc(m)) for m in range(-1, BLOCKS + 4)],
                        street=P([sk(a, b) for a, b in coil]), segments=len(coil) - 1,
                        first_turn=P(rect_sk(*corner_court(0))))
    # the precinct: inside the first winding
    pr = (-rc(2) + COIL_K / SIN75, rc(0) - COIL_K / SIN75, -R0 + COIL_K / SIN75, rc(1) - COIL_K / SIN75)
    plan['precinct'] = dict(rect_skew=[r1(x) for x in pr], poly=P(rect_sk(*pr)))
    # ---- the ley line: from the Hall's court to the east reliquary
    ru, rv = px_uv(*RELIQ_PX); dist = math.hypot(ru, rv); LD = (ru / dist, rv / dist)
    bearing = math.degrees(math.atan2(LD[0], LD[1])) % 360
    plan['ley'] = dict(bearing_deg=r1(bearing), to_reliquary_km=r1(dist / 1000), dir=[round(LD[0], 4), round(LD[1], 4)], corridor_w=9.0)
    LEY0 = (0.0, 0.0)
    placed = []                                   # every placement: dict(key, at, ang, fp, where, ...)
    def put(key, at, ang, where, **kw):
        k = KIT[key]; fp = footprint(at[0], at[1], ang, k['w'], k['d'])
        rec = dict(key=key, at=at, ang=ang, fp=fp, where=where); rec.update(kw)
        placed.append(rec); return rec
    def on_ley(fp, pad=2.0):
        return seg_hits_corridor(fp, LEY0, LD, plan['ley']['corridor_w'] / 2 + pad)
    # ---- the districts (7) and the gate quarter (the eighth band, a spiral wound in to the mustering ground)
    dists = [district(b, j) for j, b in enumerate(blocks[:7])]
    gq = district(blocks[7], 7); gq['id'] = 'gq'; gq['chirality'] = 'ccw'
    # each district's share of the people goes by its frontage (the inner edges deep enough for a row), not its area
    def frontage(d):
        return sum(math.hypot(b['inner'][1][0] - b['inner'][0][0], b['inner'][1][1] - b['inner'][0][1]) - 16 for b in d['bands'] if b['depth'] >= 26)
    for d in dists: d['frontage'] = frontage(d)
    tot_area = sum(d['frontage'] for d in dists)
    dist_need = {c: CENSUS[c] - PRECINCT_PEOPLE.get(c, 0) - GATE_PEOPLE.get(c, 0) - WORKS_PEOPLE.get(c, 0) for c in CENSUS}
    for d in dists:
        share = d['frontage'] / tot_area
        d['need'] = {c: int(round(dist_need[c] * share)) for c in CENSUS}
    gq['need'] = {c: GATE_PEOPLE.get(c, 0) for c in CENSUS}

    def court_items(d, items):
        """Things in a district's court, in a row along its axis, centred, each facing across it toward the inner side
        (the Hall). items: [(key, priority)] in the row's order; the lowest priorities drop out until the row fits."""
        (x0, y0), (x1, y1) = d['court_axis']; L = math.hypot(x1 - x0, y1 - y0); t = ((x1 - x0) / L, (y1 - y0) / L)
        nrm = (-t[1], t[0])
        if nrm[0] * (0 - x0) + nrm[1] * (0 - y0) < 0: nrm = (-nrm[0], -nrm[1])     # toward the precinct
        ang = math.atan2(nrm[1], nrm[0])
        keep = [it for it in items if KIT[it[0]]['d'] <= 2 * d['court_half'] - 2]
        gap = 8.0
        while keep and sum(KIT[k]['w'] for k, _ in keep) + gap * (len(keep) + 1) > L:
            keep.remove(min(keep, key=lambda it: it[1]))
        span = sum(KIT[k]['w'] for k, _ in keep) + gap * (len(keep) - 1)
        pos = (L - span) / 2
        for key, _ in keep:
            w = KIT[key]['w']; f = pos + w / 2
            at = (x0 + t[0] * f, y0 + t[1] * f)
            pos += w + gap
            fp = footprint(at[0], at[1], ang, w, KIT[key]['d'])
            if on_ley(fp): continue
            put(key, at, ang, d['id'], role='court')

    def fill(d, order, house):
        """Front the bands on their inner edges, castes in order from the nest outward (Gila's rule), every door facing
        in; one band in the last winding fronted on its outer edge instead (the district's flaw)."""
        rem = {c: d['need'].get(c, 0) for c in order}
        if 4 in rem: rem[4] += d['need'].get(6, 0)
        last = [i for i, bd in enumerate(d['bands']) if bd['w'] == d['windings'] - 1]
        flaw = last[fnv(d['id'] + ':flaw') % len(last)] if last else -1
        d['flaw_band'] = flaw
        got = {c: 0 for c in rem}; ci = 0; wells = 0
        for bi, bd in enumerate(d['bands']):
            p0, p1 = bd['outer'] if bi == flaw else bd['inner']
            L = math.hypot(p1[0] - p0[0], p1[1] - p0[1]); t = ((p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L)
            cb = centroid(bd['poly']); nrm = (-t[1], t[0])
            if (cb[0] - p0[0]) * nrm[0] + (cb[1] - p0[1]) * nrm[1] < 0: nrm = (-nrm[0], -nrm[1])
            ang = math.atan2(-nrm[1], -nrm[0])            # the front faces the street on this edge
            pos = 8.0
            while ci < len(order):
                c = order[ci]
                if rem[c] <= 0: ci += 1; continue
                key = house[c]; k = KIT[key]
                if k['d'] + 4 > bd['depth']:
                    break
                if pos + k['w'] > L - 8.0: break
                at = (p0[0] + t[0] * (pos + k['w'] / 2) + nrm[0] * (1.5 + k['d'] / 2), p0[1] + t[1] * (pos + k['w'] / 2) + nrm[1] * (1.5 + k['d'] / 2))
                fp = footprint(at[0], at[1], ang, k['w'], k['d'])
                if on_ley(fp): pos += 6.0; continue
                put(key, at, ang, d['id'], caste=c, band=bi, flaw=(bi == flaw))
                rem[c] -= k['holds']; got[c] += k['holds']; pos += k['w'] + (7.0 if (got[c] // k['holds']) % 5 == 0 else 3.5)
            # the brick wells, in the yards behind the row (Gila's gl-well), one every ~90 m
            q0, q1 = bd['inner'] if bi == flaw else bd['outer']
            Lq = math.hypot(q1[0] - q0[0], q1[1] - q0[1])
            if bd['depth'] > 30:
                for kq in range(1, int(Lq // 90) + 1):
                    f = kq / (int(Lq // 90) + 1)
                    at = (q0[0] + (q1[0] - q0[0]) * f - nrm[0] * 6.0, q0[1] + (q1[1] - q0[1]) * f - nrm[1] * 6.0)
                    if (at[0] - cb[0]) * nrm[0] + (at[1] - cb[1]) * nrm[1] < 0:
                        at = (q0[0] + (q1[0] - q0[0]) * f + nrm[0] * 6.0, q0[1] + (q1[1] - q0[1]) * f + nrm[1] * 6.0)
                    fp = footprint(at[0], at[1], 0, 5, 5)
                    if on_ley(fp): continue
                    put('gl-well', at, 0.0, d['id'], role='yard'); wells += 1
        d['placed_people'] = got; d['short'] = {c: max(0, rem[c]) for c in rem}; d['wells'] = wells

    DIST_ROLES = [
        ('The Cord and Lacquer Ward', 'oxblood and black battery-strand lacquer, waterproofed reed cordage'),
        ('The Bell and Inlay Ward', 'clapperless bells, nested bronze portal frames, caste ornaments'),
        ('The Scribe and Mat Ward', 'spiral-script stela carving, reed screens, College attendants'),
        ('The Salt-Strand and Tanners Ward', 'boiling-floor salt crews, bay fish-curing, hide tanning'),
        ('The Leat and Gardeners Ward', 'keepers of the seven Dholavira reservoirs, bakehouses, southern taro gardens'),
        ('The Bay and Smelters Ward', 'Great Bronze Hall furnace crews, Lothal dockers, reed-bargewrights'),
        ('The Shore-Road and Masons Ward', 'Shore-Road sledge drovers, burden-beast yards, cyclopean wall masons'),
    ]
    order = [1, 5, 2, 3, 4]
    for d in dists:
        d['ward_name'], d['ward_focus'] = DIST_ROLES[d['j']]
        hall = ['lz-hall-reed', 'lz-hall-bronze', 'lz-hall-reed', 'lz-hall-bone', 'lz-hall-reed', 'lz-hall-bronze', 'lz-hall-reed'][d['j']]
        extra_food = [('lz-bakehouse', 3)] if d['j'] in (4, 6) else ([('lz-fermentery', 3)] if d['j'] == 5 else [])
        court_items(d, [('lz-medicine', 2), ('lz-cistern', 6), ('lz-obelisk', 3), ('lz-bells', 8), ('lk-nest', 10),
                        ('lz-stela-pair', 7), (hall, 5)] + extra_food + [('lz-cistern', 4), ('lz-stela-turned', 1)])
        fill(d, order, HOUSE)
    court_items(gq, [('lk-granary', 3), ('lk-granary', 3), ('lk-granary', 3), ('lz-warehouse', 6), ('lz-barracks', 8), ('lz-muster', 10),
                     ('lz-barracks', 8), ('lz-hall-bone', 7), ('lk-granary', 3), ('lk-granary', 3), ('lk-granary', 3), ('lk-granary', 2), ('lz-cistern', 4)])
    fill(gq, [2, 3, 4], {2: 'lk-makers', 3: 'lk-longhouse', 4: 'lk-lodge'})
    # the gate quarter's granaries: seven (odd), the Allotment's reserve, in its corner court at the gate end
    plan['districts'] = dists; plan['gate_quarter'] = gq

    # ---- the precinct (on the Mound, 12 m over the sabkha)
    LA = math.atan2(LD[1], LD[0])
    put('lk-greathall', (-LD[0] * 15, -LD[1] * 15), LA, 'precinct', role='the Hall of Intention: its door at the origin, its axis the ley line')
    court_ley = [(LD[0] * 6, LD[1] * 6), (LD[0] * 120, LD[1] * 120)]
    for i, f in enumerate([18, 34, 50, 66, 82, 98, 114]):
        side = 1 if i % 2 == 0 else -1
        put('lz-obelisk', (LD[0] * f - LD[1] * 22 * side, LD[1] * f + LD[0] * 22 * side), LA + (math.pi if i == 4 else 0), 'precinct',
            role='the seven obelisks of the Court of Intention' + ('; the fifth twists the other way (the flaw)' if i == 4 else ''), twist='ccw' if i == 4 else 'cw')
    put('lz-ley', (LD[0] * 58, LD[1] * 58), LA + math.pi, 'precinct', role='the ley stone, its spine on the line')
    put('lz-bells', (LD[0] * 4 - LD[1] * 16, LD[1] * 4 + LD[0] * 16), LA, 'precinct', role='the Hall\'s bells, no clappers')
    put('lz-stela-pair', (LD[0] * 4 + LD[1] * 16, LD[1] * 4 - LD[0] * 16), LA, 'precinct', role='mirrored chirality either side of the door')
    a0, a1, b0, b1 = pr
    put('lk-college', sk(a0 + 70, 40), 0.0, 'precinct', role='the college: its door east, toward the Hall')
    put('lz-seer', sk(a0 + 70, 128), 0.0, 'precinct', role='the model of the country: the Allotment remembered')
    put('lz-stela-turned', sk(a0 + 70, -45), 0.0, 'precinct', role='texts whose meaning changed retroactively')
    # the Great Tank of the First Turn, in corner_court(0) where the Great Coil begins
    ft0, ft1, ft2, ft3 = corner_court(0)
    put('gl-tank', sk((ft0 + ft1) / 2, (ft2 + ft3) / 2), math.pi / 2, 'first_turn', role='the Great Tank of the First Turn (after Mohenjo-daro): Interpreters and Drover convoy-leaders wash salt dust here')
    # thirteen Interpreters' towers in a little squared spiral round the college (13: odd)
    tw = []; cur = [0.0, 0.0]; step = 36.0; dirs = [(1, 0), (0, 1), (-1, 0), (0, -1)]; lens = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]
    ac0, bc0 = a0 + 70, 40
    for li, ln in enumerate(lens):
        for _ in range(ln):
            cur = [cur[0] + dirs[li % 4][0], cur[1] + dirs[li % 4][1]]
            if abs(cur[0]) < 1.5 and abs(cur[1]) < 1.5: continue
            tw.append((ac0 + cur[0] * step * 1.25, bc0 + cur[1] * step))
    tw = [p for p in tw if a0 + 8 < p[0] < a1 - 8 and b0 + 8 < p[1] < b1 - 8][:13]
    for i, (a, b) in enumerate(tw):
        put('lk-tower', sk(a, b), 0.0, 'precinct', caste=5, role='an Interpreters\' stone house')
    put('lk-nest', sk(a1 - 70, b1 - 60), math.pi, 'precinct', role='the Nest of Returns: where the Interpreters are reborn')
    for i in range(5):
        put('lk-warren', sk(-110 + i * 44, b0 + 22), math.pi / 2, 'precinct', caste=1, role='the Hall\'s Tenders')
    pp = {}
    for r in placed:
        if r['where'] == 'precinct' and 'holds' in KIT[r['key']] and r['key'] not in ('lk-nest',):
            c = r.get('caste', 5); pp[c] = pp.get(c, 0) + KIT[r['key']]['holds']
    plan['precinct'].update(court=P(footprint(LD[0] * 63, LD[1] * 63, LA, 92, 118)), placed_people=pp, mound_h=12.0,
                            court_ley=P(court_ley))

    # ---- the wall: it follows the city's outline, which is the Coil's own last winding run on into a tongue past the
    # south wall (the gate quarter's band, through its turn); the one gate at the tongue's foot, the Coil's mouth
    WO = COIL_W / 2 + 6.0                   # the wall's centre line, outside the outer street's kerb
    wk = WO / SIN75
    A_W, A_E, B_S, B_N, B_T = -rc(10) - wk, rc(8) + wk, -rc(7) - wk, rc(9) + wk, -rc(11) - wk
    A_TE = -rc(6) + 6.0 / SIN75             # the tongue's east side
    GW = 26.0 / SIN75                        # the opening the gate stands in
    wall_sk = [(GATE_A + GW / 2, B_T), (A_TE, B_T), (A_TE, B_S), (A_E, B_S), (A_E, B_N), (A_W, B_N), (A_W, B_T), (GATE_A - GW / 2, B_T)]
    wall = [sk(a, b) for a, b in wall_sk]
    runs = []
    for i in range(len(wall) - 1):
        runs.append(dict(i=i, a=P([wall[i]])[0], b=P([wall[i + 1]])[0], len=r1(math.hypot(wall[i + 1][0] - wall[i][0], wall[i + 1][1] - wall[i][1]))))
    # the gate (lk-gate) in the tongue's foot, facing south: the Coil's thirteenth segment ends in it
    gate_at = sk(GATE_A, B_T)
    put('lk-gate', gate_at, -math.pi / 2, 'wall', role='the one gate, at the Coil\'s mouth: the tongue\'s foot, facing south')
    # thirteen watchtowers: the corners, the Bent Way's end, spaced along the runs; the ninth set off its spacing (the flaw)
    total = sum(r['len'] for r in runs)
    towers = []
    for k in range(13):
        f = (k + 0.5) / 13.0
        if k == 8: f += 0.31 / 13.0
        dd = f * total
        for i, r in enumerate(runs):
            if dd <= r['len'] or i == len(runs) - 1:
                fr = min(dd / r['len'], 1.0); pa, pb = wall[i], wall[i + 1]
                towers.append((pa[0] + (pb[0] - pa[0]) * fr, pa[1] + (pb[1] - pa[1]) * fr, i)); break
            dd -= r['len']
    for k, (u, v, i) in enumerate(towers):
        pa, pb = wall[i], wall[i + 1]
        in_ang = math.atan2(-(pb[0] - pa[0]), pb[1] - pa[1])  # left of ccw wall run = inward toward the city
        put('lk-watchtower', (u, v), in_ang, 'wall', role='watchtower %d' % (k + 1) + (' (off its spacing: the wall\'s flaw)' if k == 8 else ''), run=i)
    # the Ley Slot: where the line crosses the east run (its 20 m wall wings sit flush in the east wall run)
    def cross(p0, d, a, b):
        ex, ev = b[0] - a[0], b[1] - a[1]
        den = d[0] * ev - d[1] * ex
        if abs(den) < 1e-9: return None
        tt = ((a[0] - p0[0]) * ev - (a[1] - p0[1]) * ex) / den
        ss = ((a[0] - p0[0]) * d[1] - (a[1] - p0[1]) * d[0]) / den
        return (tt, ss) if tt > 0 and 0 <= ss <= 1 else None
    slot = None
    for i in range(len(wall) - 1):
        c = cross(LEY0, LD, wall[i], wall[i + 1])
        if c: slot = (c[0], i); break
    slot_t = slot[0]
    pa_s, pb_s = wall[slot[1]], wall[slot[1] + 1]
    slot_out_ang = math.atan2(pb_s[0] - pa_s[0], -(pb_s[1] - pa_s[1]))
    put('lk-slot', (LD[0] * slot_t, LD[1] * slot_t), slot_out_ang, 'wall', role='the Ley Slot: a Tender\'s 1.2 m wicket through the wall, on the line', run=slot[1])
    plan['wall'] = dict(line=P(wall), runs=runs, height_walk=8.0, thickness=5.0, gate=P([gate_at])[0], gate_opening=r1(GW * SIN75),
                        slot_t=r1(slot_t), towers=13, length=r1(total), lk_wall_runs=int(total // 20),
                        rule='lk-wall runs of 20 m end to end; walls lean in on the outer face, out on the inner')
    # the Coil's crossings of the ley line: a twisted obelisk at each (counted below)
    coil_pts = [sk(a, b) for a, b in coil]
    crossings = []
    for i in range(len(coil_pts) - 1):
        c = cross(LEY0, LD, coil_pts[i], coil_pts[i + 1])
        if c and c[0] < slot_t: crossings.append(c[0])
    for tt in crossings:
        put('lz-obelisk', (LD[0] * tt - LD[1] * 12, LD[1] * tt + LD[0] * 12), LA, 'ley', role='where the line crosses the Great Coil')
    plan['ley'].update(crossings=[r1(x) for x in crossings], slot_t=r1(slot_t))

    # ---- the shore, as the plan proposes it to core/coast: the model's waterline, and the strand kept off the wall
    # (the model's shore at 2 km a pixel is +-1 km; the city asks for a strand at least 120 m wide: PLAN.md question 2)
    # ---- the ley mole: from the slot over the strand and 700 m into the sea; the barge stair at its end
    shore_t = None
    for tt in range(int(slot_t), int(slot_t) + 3000, 5):
        if f_w(LD[0] * tt, LD[1] * tt) >= 0.5: shore_t = tt; break
    mole0, mole1 = slot_t + 6, shore_t + 700
    plan['ley'].update(shore_t=shore_t, mole=[r1(mole0), r1(mole1)])
    put('lz-stela-pair', (LD[0] * (mole1 - 8), LD[1] * (mole1 - 8)), LA, 'ley', role='the barge stair at the mole\'s end: the Coil and fracture glyphs side by side')
    for i in range(3):
        put('lz-barge', (LD[0] * (mole1 - 40 - 30 * i) + LD[1] * 12, LD[1] * (mole1 - 40 - 30 * i) - LD[0] * 12), LA, 'ley', role='a reed barge moored to the mole')

    # ---- the works on the bay (outside the east run): the dock after Lothal, its store, the bronze hall, the yards
    se, ne = wall[3], wall[4]                       # the east run, south to north
    ev = ((ne[0] - se[0]), (ne[1] - se[1])); EL = math.hypot(*ev); et = (ev[0] / EL, ev[1] / EL)
    en = (et[1], -et[0])                            # outward (east)
    def east(f, off):
        return (se[0] + et[0] * EL * f + en[0] * off, se[1] + et[1] * EL * f + en[1] * off)
    EA = math.atan2(et[1], et[0])
    OUT_A = EA - math.pi / 2                        # facing out of the wall, toward the bay
    def shore_off(f):
        for off in range(0, 2500, 5):
            if f_w(*east(f, off)) >= 0.5: return float(off)
        return 2500.0
    so = shore_off(0.56)
    # the dock lies along the bay's bank, 25 m in from the model's waterline, its long side parallel to the wall; its
    # sluice (its +z end) to the north, where the bay opens to the sea
    put('lk-dock', east(0.56, so - 25 - 18), EA, 'works', role='the dock: a brick basin 175 x 36 m (five to one), its sluice at the north end; a terminal sea has no tide, so it shelters the barges from the wet season\'s swell')
    put('lk-dockstore', east(0.56, so - 25 - 36 - 12 - 10.5), OUT_A, 'works', role='the dock store on its podium (Lothal\'s warehouse): the Coil\'s loads by water', caste=2)
    # the works cluster on the bank by the dock: the warehouse behind the store, the bronze hall and its yard to the south
    put('lz-warehouse', east(0.56, so - 25 - 36 - 12 - 21 - 10 - 6.5), OUT_A, 'works', role="the dock's warehouse")
    sb = shore_off(0.44)
    put('lk-bronzehall', east(0.44, sb - 40 - 13.5), OUT_A, 'works', role="the bronze hall: Tuatara's copper and Komodo and Iguana's tin, nine to one; seven furnaces, outside the wall and by the water", caste=2)
    put('lk-charcoal', east(0.44, sb - 40 - 27 - 12 - 15), OUT_A, 'works', role='charcoal from the jungle, the ore heaps, the ingot store')
    for i in range(2):
        put('lz-barge', east(0.56 + (i - 0.5) * 0.024, so - 43 + (i - 0.5) * 14), EA, 'works', role='a reed barge loading Coil ingots and bay fish in the Lothal dock basin')
    put('lz-barge', east(0.62, so + 45), EA + math.pi, 'works', role='a reed barge entering Tlahn Gill bay from the eastern sea')
    for i in range(3):
        f = 0.78 + 0.07 * i
        put('lz-weir', east(f, shore_off(f) + 10), OUT_A, 'works', role='fishing weir and drying racks, standing in the bay')
    plan['works'] = dict(shore_off_at_dock=so, east_run=P([se, ne]))
    # ---- the salt: scaled back (the owner, 2026-11-17: 55 t/yr now that Skink carries the country) to three pan-spirals
    # on the strand west of the city, two wet-season boiling floors (lk-boil) and the salt store
    nw = wall[5]                                    # the north-west corner
    pans = []
    for i in range(3):
        c = (nw[0] - 160 - i * 96, nw[1] + 120 + (i % 2) * 10)
        if f_w(c[0], c[1] + 40) >= 0.5: c = (c[0], c[1] - 40)
        pans.append(c); put('gl-pans', c, 0.0, 'pans', role='a squared spiral of salt pans, the brine let in at its outer end')
    for i in range(2):
        put('lk-boil', (nw[0] - 190 - i * 150, nw[1] + 30), -math.pi / 2, 'pans', role='a salt boiling floor (brine boiled in crusted bronze pans over jungle charcoal; scaled back to 55 t/yr)', caste=2)
    put('gl-saltstore', (nw[0] - 60, nw[1] + 40), -math.pi / 2, 'pans', role='the salt store')

    # ---- water: the leat from a check dam on Tlahn Gill to seven reservoirs (after Dholavira), each 1.25 times the last
    ssw, sse = wall[2], wall[3]                     # the south run, west to east
    res = []; f = 0.40; size = 70.0
    for i in range(7):
        c = (ssw[0] + (sse[0] - ssw[0]) * f, ssw[1] + (sse[1] - ssw[1]) * f - 70 - size * 0.5)
        res.append(dict(i=i + 1, poly=P(rect_sk(-size * 0.7, size * 0.7, -size * 0.5, size * 0.5, c)), level_m=r1(4.0 - i * 0.4), area=r1(size * size * 1.4 * SIN75)))
        f += (size * 1.4 + 16) / math.hypot(sse[0] - ssw[0], sse[1] - ssw[1]) * 1.0
        size *= RATIO ** 0.5
    # the check dam stands on Tlahn Gill's course where it passes nearest the chain's last reservoir; the leat runs from
    # it to that reservoir's far corner
    tl = plan['site']['rivers']['r762']['pts']; tgt = res[-1]['poly'][1]; best = None
    for i in range(len(tl) - 1):
        (x0, y0), (x1, y1) = tl[i], tl[i + 1]; dx, dy = x1 - x0, y1 - y0
        t = max(0.0, min(1.0, ((tgt[0] - x0) * dx + (tgt[1] - y0) * dy) / ((dx * dx + dy * dy) or 1)))
        q = (x0 + dx * t, y0 + dy * t); dd = math.hypot(q[0] - tgt[0], q[1] - tgt[1])
        if best is None or dd < best[0]: best = (dd, q)
    dam = best[1]
    leat = [dam, (tgt[0] + 20, tgt[1] - 10)]
    plan['water'] = dict(reservoirs=res, check_dam=P([dam])[0], leat=P(leat),
                         leat_m=r1(math.hypot(leat[1][0] - leat[0][0], leat[1][1] - leat[0][1])),
                         note='Tlahn Gill (r762, a wadi, not perennial; the model gives 7.6 m3/s at its mouth) dammed where its course passes nearest the chain; the leat fills the chain in the wet season; every district a cistern, every yard a well (rain ~1,850-2,086 mm)')

    # ---- the country (sheet B0): the fields on the apron, the roads, the relic road
    # every road leaves from the one gate: out 300 m south of the tongue's foot, then each its own way (the north road
    # goes round the sea's west end: nothing goes straight but the ley line)
    gu, gv = gate_at; g0 = [(gu, gv - 20), (gu, gv - 300)]
    put('lz-wayhalt', (gu - 46, gv - 190), 0.0, 'gate_road', role='the Coil Round roadhead halt outside the South Gate: unyoking shed and tally store where the three trunk roads part')
    for sx, sy, ang, nm in [(-95, -310, math.pi, 'west-loop mile-0 waystone (Iguana road)'),
                            (-65, -265, 2.35, 'east-loop north-shore mile-0 waystone (Tuatara road)'),
                            (75, -310, 0.0, 'east-loop south-shore mile-0 waystone (Komodo road)')]:
        put('lz-waystone', (gu + sx, gv + sy), ang, 'gate_road', role=nm)
    plan['country'] = dict(
        fields=[P(rect_sk(-2600, -900, -2900, -1500)), P(rect_sk(-700, 1300, -3600, -2000)), P(rect_sk(-5200, -2900, -1400, 400))],
        roads=[dict(name='the Iguana road (west, up to the Pile\'s plateau; Iguana ~120 km as the crow flies)', pts=P(g0 + [(-3200, -1750), (-6200, -1300), (-9000, -600)])),
               dict(name='the shore road north (round the sea\'s west end: Tuatara 135 km, the east reliquary)', pts=P(g0 + [(-2400, -1500), (-5000, -300), (-7600, 4000), (-11600, 8000), (-15800, 12000)])),
               dict(name='the Komodo road (east along the south shore, 204 km)', pts=P(g0 + [(1500, -1900), (4500, -2400), (9000, -2300)]))],
        note='fields: bamboo rice, taro and shade-manioc in the wet (LIZARDMEN-SURVEY section 4, the shore list), ~800 ha near the city; the rest of the grain from Iguana and the warrens')

    # ---- the tallies
    people = {}
    for r in placed:
        k = KIT[r['key']]
        if 'holds' in k and r.get('caste'):
            people[r['caste']] = people.get(r['caste'], 0) + k['holds']
        elif 'holds' in k and r['key'] in ('lk-college',):
            people[5] = people.get(5, 0) + k['holds']
    # lodges hold castes 4 and 6 together; Makers built into the halls; the works' halls
    hall_people = sum(KIT[r['key']]['holds'] for r in placed if r['key'] in ('lz-hall-reed', 'lz-hall-bronze', 'lz-hall-bone'))
    plan['census'] = dict(target={CASTE_NAME[c]: CENSUS[c] for c in CENSUS}, housed_by_house={('Line warriors and Bulwarks (lodges)' if c == 4 else CASTE_NAME.get(c, c)): v for c, v in sorted(people.items())},
                          target_lodges=CENSUS[4] + CENSUS[6],
                          makers_in_halls=hall_people, total_housed=sum(people.values()) + hall_people,
                          rule='a lodge holds castes 4 and 6 together (Gila); a craft hall 12 Makers; the nest hall\'s hosts are residents mid-rebirth and not counted')
    for d in dists + [gq]:
        d.pop('_nest_uv', None)
    plan['placed'] = placed
    plan['_blocks'] = blocks
    plan['_LD'] = LD
    return plan

def export(plan):
    """The manifest: rounded, the private keys dropped, every placement with its key, owed piece, position, facing."""
    def clean(d):
        out = {}
        for k, v in d.items():
            if isinstance(k, str) and k.startswith('_'): continue
            if not isinstance(k, str): k = str(k)
            if isinstance(v, tuple) and len(v) == 2 and all(isinstance(x, (int, float)) for x in v): v = [r1(v[0]), r1(v[1])]
            elif isinstance(v, list) and v and isinstance(v[0], tuple): v = P(v)
            elif isinstance(v, float): v = round(v, 2)
            elif isinstance(v, dict): v = clean(v)
            elif isinstance(v, list) and v and isinstance(v[0], dict): v = [clean(x) for x in v]
            out[k] = v
        return out
    j = clean({k: v for k, v in plan.items() if k not in ('placed', 'districts', 'gate_quarter')})
    j['districts'] = [clean(d) for d in plan['districts']]
    j['gate_quarter'] = clean(plan['gate_quarter'])
    j['kit'] = {k: dict(v) for k, v in KIT.items()}
    j['placed'] = []
    for i, r in enumerate(plan['placed']):
        k = KIT[r['key']]
        e = dict(id='bs.%s.%d' % (r['where'], i), key=r['key'], cls=k.get('cls', 'building'),
                 at=[r1(r['at'][0]), r1(r['at'][1])],
                 ry=round(r['ang'] + math.pi / 2, 4), where=r['where'])
        if k.get('tags'): e['tags'] = dict(k['tags'])
        if k.get('owed'): e['owed'] = k['owed'] if isinstance(k['owed'], str) else True
        for kk in ('caste', 'band', 'flaw', 'role', 'run', 'twist'):
            if r.get(kk) is not None and r.get(kk) is not False: e[kk] = r[kk]
        j['placed'].append(e)
    j['ry_rule'] = 'ry turns the kit\'s +z front to face the placement\'s heading: a page at x = u, z = -v rotates the def by ry about y'
    return j

if __name__ == '__main__':
    p = build()
    for d in p['districts'] + [p['gate_quarter']]:
        print(d['id'], 'side', d['side'], d['chirality'], 'w', d['windings'], 'band0', d['band0'], 'area', int(d['area']),
              'need', sum(d['need'].values()), 'housed', sum(d['placed_people'].values()), 'short', {k: v for k, v in d['short'].items() if v > 0}, 'wells', d['wells'])
    print('precinct', p['precinct']['placed_people'])
    print('census', p['census'])
    print('ley', {k: v for k, v in p['ley'].items()})
    print('placed', len(p['placed']))
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(export(p), fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print('wrote', os.path.relpath(OUT, ROOT).replace(os.sep, '/'))
