#!/usr/bin/env python3
"""Generate Numenor, the whole island, as a city data file the OSM engine can read.

    python3 tools/make-numenor.py

Fan work from Tolkien, whose world belongs to the Tolkien Estate; nothing from any book, film or game is used.
The land is laid out from the published geography (the island's shape, its regions, its towns and rivers, as the
texts describe them) and every shape and number here is this project's own.

Numenor at its height, before the Shadow came to it: the Hallow on the Meneltarma open to the sky, the White Tree
in the King's court, the havens full of ships. A country, not a city, at true proportion, as Mordor is:

  the island is a five-pointed star: Mittalmar, the Inland, about four hundred kilometres across, and five
  promontories running out of it, each about a hundred and sixty kilometres long
    Forostar     the north: stony, heath and moor, rising to the cliffs of Sorontil
    Orrostar     the east: cooler, a land of grain
    Hyarrostar   the south-east: the great forests, the shipwrights' timber
    Hyarnustar   the south-west: mountains in its west with vines on them, and fertile land in its east
    Andustar     the west: fir-clad highlands in its north, falling to green land round the Bay of Eldanna
  the Meneltarma in the midst of Mittalmar, grass at its foot and steep above, its summit flat and open
  Armenelos, the City of Kings, east of the mountain on its hill; the Noirinan, the Valley of Tombs, at the
  mountain's foot; Romenna at the head of its firth in the east, with Tol Uinen in the firth; Andunie on the
  north-west coast; Eldalonde at the head of Eldanna among the Nisimaldar, the fragrant evergreen woods;
  Nindamos at the mouth of the Siril in the south; Ondosto in Forostar near its border with Orrostar
  the rivers: the Siril, south from the Meneltarma to the sea at Nindamos and its marshes; the Nunduine, west
  through the lake of Nisinen to Eldanna; and the streams of each promontory

Writes data/cities/numenor-osm.json (the map the engine reads), data/cities/numenor-land.json (the land cover,
the rivers and the coast, which src/numenor/nature.js reads) and data/cities/numenor.json (the city file).
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep, simplify

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "numenor-osm.json")
LANDF = os.path.join(ROOT, "data", "cities", "numenor-land.json")
CFG = os.path.join(ROOT, "data", "cities", "numenor.json")
R = random.Random(32)            # the year of the Second Age the Edain came over the sea

HX = 400000.0                    # the box: 800 km square, the island in the middle of it
STEP = 1000                      # the height grid, in metres
MLAT, MLON = 111132.0, 111320.0  # metres a degree, at an origin on the equator (the island's centre)

R0 = 195000.0                    # Mittalmar's radius
# the promontories: name, compass bearing (degrees from north, clockwise), length past R0, half-width at the root
# and at the tip, and what the land is like (used by the height and the land cover)
ARMS = [("Forostar", 4.0, 150000.0, 72000.0, 24000.0),
        ("Orrostar", 72.0, 150000.0, 64000.0, 24000.0),
        ("Hyarrostar", 146.0, 168000.0, 72000.0, 28000.0),
        ("Hyarnustar", 218.0, 164000.0, 72000.0, 26000.0),
        ("Andustar", 290.0, 158000.0, 66000.0, 24000.0)]
MENEL = (0.0, 0.0)               # the Meneltarma, in the midst of Mittalmar
MENEL_H = 3000.0                 # its height (no figure is given; this one is ours)
MENEL_R = 14000.0                # the radius of its foot
HALLOW_R = 650.0                 # the flat of its summit
ARMENELOS = (22000.0, -5000.0)   # east of the mountain, on a hill
NOIRINAN = (-8200.0, 8800.0)     # the Valley of Tombs, at the mountain's south-west foot


def bdir(deg):
    """A compass bearing as a unit (x east, z south) vector."""
    a = math.radians(deg)
    return (math.sin(a), -math.cos(a))


# ---------------------------------------------------------------- noise
_P = [R.random() for _ in range(4096)]


def _h(i, j, s):
    return _P[(i * 73 + j * 151 + s * 37) & 4095]


def vn(x, z, s=0):
    i, j = math.floor(x), math.floor(z)
    f, g = x - i, z - j
    f, g = f * f * (3 - 2 * f), g * g * (3 - 2 * g)
    a, b = _h(i, j, s), _h(i + 1, j, s)
    c, d = _h(i, j + 1, s), _h(i + 1, j + 1, s)
    return (a + (b - a) * f) * (1 - g) + (c + (d - c) * f) * g


def fbm(x, z, s=0, o=4):
    t, a, n = 0.0, 0.5, 0.0
    for k in range(o):
        t += a * vn(x, z, s + k * 7)
        n += a
        x, z, a = x * 2.03 + 17.1, z * 2.03 - 9.3, a * 0.5
    return t / n


def ridged(x, z, s=0, o=4):
    t, a, n = 0.0, 0.5, 0.0
    for k in range(o):
        v = 1 - abs(vn(x, z, s + k * 5) * 2 - 1)
        t += a * v * v
        n += a
        x, z, a = x * 2.1 + 3.3, z * 2.1 + 7.7, a * 0.5
    return t / n


def smin(a, b, k):
    h = max(0.0, min(1.0, 0.5 + 0.5 * (b - a) / k))
    return b + (a - b) * h - k * h * (1 - h)


def seg_dist(px, pz, ax, az, bx, bz):
    dx, dz = bx - ax, bz - az
    L = dx * dx + dz * dz
    t = 0.0 if L == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L))
    return math.hypot(px - ax - dx * t, pz - az - dz * t), t


def path_dist(x, z, pts):
    """(distance to the polyline, distance along it to the nearest point)."""
    best, at, run = 1e18, 0.0, 0.0
    for i in range(len(pts) - 1):
        (ax, az), (bx, bz) = pts[i], pts[i + 1]
        L = math.hypot(bx - ax, bz - az)
        d, t = seg_dist(x, z, ax, az, bx, bz)
        if d < best:
            best, at = d, run + t * L
        run += L
    return best, at


def path_len(pts):
    return sum(math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) for i in range(len(pts) - 1))


# ---------------------------------------------------------------- the island's shape
def arm_frame(x, z, arm):
    """(along, across) the arm's axis, across positive to the left of the outward direction."""
    _, deg, _, _, _ = arm
    ux, uz = bdir(deg)
    return x * ux + z * uz, x * uz - z * ux


def arm_width(s, arm):
    _, _, L, w0, w1 = arm
    t = max(0.0, min(1.0, (s - R0 * 0.55) / (R0 + L - R0 * 0.55)))
    return w0 + (w1 - w0) * t ** 0.8


def arm_sd(x, z, arm):
    s, c = arm_frame(x, z, arm)
    tip = R0 + arm[2]
    if s < 0:
        return math.hypot(s, c) - arm[3]
    if s > tip:
        return math.hypot(s - tip, c) - arm[4]
    return abs(c) - arm_width(s, arm)


# inlets and bays cut out of the land: (centre line, half-width at its start and its end)
FIRTH = None      # set in setup(): the Firth of Romenna
ANDUNIE_BAY = None
TOL_UINEN = None
TOWNS = {}


def raw_sd(x, z):
    """Signed distance to the coast before the inlets: negative on land."""
    r = math.hypot(x, z)
    d = r - R0 * (1 + 0.05 * (fbm(x / 90000, z / 90000, 3) - 0.5))
    for a in ARMS:
        d = smin(d, arm_sd(x, z, a), 28000.0)
    # the coast is not a drawing: bays, heads and coves at every scale
    d += (fbm(x / 70000, z / 70000, 11) - 0.5) * 26000 + (fbm(x / 16000, z / 16000, 23) - 0.5) * 7000 \
        + (fbm(x / 4200, z / 4200, 31) - 0.5) * 1900
    return d


def land_sd(x, z):
    d = raw_sd(x, z)
    if FIRTH:
        fd, at = path_dist(x, z, FIRTH)
        L = path_len(FIRTH)
        w = 4200 + 15000 * (at / L) ** 1.3 + (fbm(x / 9000, z / 9000, 41) - 0.5) * 3600
        d = max(d, w - fd)
    if ANDUNIE_BAY:
        bx, bz, br = ANDUNIE_BAY
        d = max(d, br - math.hypot(x - bx, (z - bz) * 1.3))
    if TOL_UINEN:
        tx, tz, tr = TOL_UINEN
        d = min(d, math.hypot(x - tx, (z - tz) * 1.4) - tr + (fbm(x / 1500, z / 1500, 7) - 0.5) * 900)
    return d


def coast_along(deg, r0=0.0, r1=HX, step=500.0):
    """The first point going out from the centre along a bearing where the sea begins."""
    ux, uz = bdir(deg)
    r = r0
    while r < r1:
        if raw_sd(ux * r, uz * r) > 0:
            return (ux * r, uz * r), r
        r += step
    return (ux * r1, uz * r1), r1


def coast_from(x, z, dx, dz, step=300.0, lim=120000.0):
    """The first point from (x, z) in a direction where the sea begins (after the inlets are cut)."""
    L = math.hypot(dx, dz)
    dx, dz = dx / L, dz / L
    t = 0.0
    while t < lim:
        if land_sd(x + dx * t, z + dz * t) > 0:
            return (x + dx * (t - step), z + dz * (t - step))
        t += step
    return (x + dx * lim, z + dz * lim)


def setup():
    """The inlets and the towns' places, which depend on where the coast fell."""
    global FIRTH, ANDUNIE_BAY, TOL_UINEN
    # The Firth of Romenna: from the bay between Orrostar and Hyarrostar in towards Armenelos
    (mx, mz), mr = coast_along(108.0)
    ux, uz = bdir(108.0)
    head = (ux * 112000, uz * 112000)
    FIRTH = [head]
    n = 14
    for k in range(1, n + 1):
        t = k / n
        r = 112000 + (mr + 25000 - 112000) * t
        wob = math.sin(t * 5.1) * 6000 * (1 - t)
        FIRTH.append((ux * r - uz * wob, uz * r + ux * wob))
    TOWNS["Romenna"] = (head[0] - ux * 5200, head[1] - uz * 5200)
    # Tol Uinen, in the firth two-thirds of the way out
    fx, fz = FIRTH[int(n * 0.62)]
    TOL_UINEN = (fx, fz, 3800.0)
    # Andunie: on the north side of Andustar, in a bay of its own
    arm = ARMS[4]
    ux, uz = bdir(arm[1])
    s = R0 + 58000
    px, pz = ux * s, uz * s
    nx, nz = -uz, ux                  # to the right of west-north-west: north-north-east
    cx, cz = coast_from(px, pz, nx, nz)
    ANDUNIE_BAY = (cx + nx * 2500, cz + nz * 2500, 7000.0)
    TOWNS["Andunie"] = coast_from(px, pz, nx, nz)
    # Eldalonde, at the head of Eldanna, between Andustar and Hyarnustar
    TOWNS["Eldalonde"] = coast_along(254.0)[0]
    TOWNS["Eldalonde"] = (TOWNS["Eldalonde"][0] * 0.985, TOWNS["Eldalonde"][1] * 0.985)
    # Nindamos, at the mouth of the Siril, in the bay between Hyarnustar and Hyarrostar
    TOWNS["Nindamos"] = coast_along(183.0)[0]
    TOWNS["Nindamos"] = (TOWNS["Nindamos"][0] * 0.99, TOWNS["Nindamos"][1] * 0.99)
    # Ondosto, in Forostar, near its border with Orrostar
    ux, uz = bdir(32.0)
    TOWNS["Ondosto"] = (ux * 168000, uz * 168000)
    TOWNS["Armenelos"] = ARMENELOS
    # Moriondë, the harbour of Orrostar's north coast (a name we give it), and Hyarastorni's shipyards in Hyarrostar
    a = ARMS[1]
    ux, uz = bdir(a[1])
    TOWNS["Moriondë"] = coast_from(ux * (R0 + 60000), uz * (R0 + 60000), uz, -ux)
    a = ARMS[2]
    ux, uz = bdir(a[1])
    TOWNS["Hyarastorni"] = coast_from(ux * (R0 + 70000), uz * (R0 + 70000), uz, -ux)


# ---------------------------------------------------------------- rivers
RIVERS = []        # [{"n", "pts", "w", "h0"}]
NISINEN = None     # (x, z, rx, rz, level)


def meander(a, b, n, amp, seed):
    pts = []
    dx, dz = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dz)
    nx, nz = -dz / L, dx / L
    for k in range(n + 1):
        t = k / n
        w = (fbm(t * 3.1, seed * 1.7, seed) - 0.5) * 2 * amp * math.sin(math.pi * t)
        w += (fbm(t * 11.0, seed * 2.3, seed + 3) - 0.5) * amp * 0.9 * math.sin(math.pi * t) ** 0.5
        w += math.sin(t * 23 + seed) * amp * 0.12 * math.sin(math.pi * t)
        pts.append((a[0] + dx * t + nx * w, a[1] + dz * t + nz * w))
    return pts


def setup_rivers():
    global NISINEN
    ni = TOWNS["Nindamos"]
    # the Siril: from the south foot of the Meneltarma down through Mittalmar to Nindamos
    siril = meander((1500.0, 15000.0), (ni[0] - 1500, ni[1] - 7000), 90, 16000, 3) + [ni]
    RIVERS.append({"n": "The Siril", "pts": siril, "w": 70.0})
    # the Nunduine: from the west foot, through the lake of Nisinen, to Eldanna at Eldalonde
    el = TOWNS["Eldalonde"]
    lake = (el[0] * 0.62, el[1] * 0.62 + 4000)
    NISINEN = (lake[0], lake[1], 7000.0, 3200.0, 0.0)
    a = meander((-15000.0, 2500.0), (lake[0] + 6500, lake[1]), 40, 5000, 5)
    b = meander((lake[0] - 6500, lake[1]), (el[0] + 1200, el[1]), 40, 5000, 6)
    RIVERS.append({"n": "The Nunduine", "pts": a + b, "w": 45.0})
    # the streams of the promontories, down their length to the sea, and a few off Mittalmar's own coast
    for i, arm in enumerate(ARMS):
        ux, uz = bdir(arm[1])
        for side in (-1, 1):
            s0 = R0 * 0.72
            off = side * arm[3] * 0.32
            a = (ux * s0 + uz * off, uz * s0 - ux * off)
            (tx, tz), _ = coast_along(arm[1] + side * 9, R0)
            pts = meander(a, (tx, tz), 60, 11000, 10 + i * 2 + (side > 0))
            RIVERS.append({"n": "", "pts": pts, "w": 22.0})
    for deg in (40, 110, 182 + 25, 255 + 20, 330):
        (tx, tz), r = coast_along(deg)
        ux, uz = bdir(deg)
        a = (ux * (MENEL_R + 14000), uz * (MENEL_R + 14000))
        RIVERS.append({"n": "", "pts": meander(a, (tx, tz), 60, 13000, deg), "w": 18.0})
    # clip each river where it first reaches the sea, and give it a profile: its source height falling to the mouth
    for rv in RIVERS:
        pts = []
        for p in rv["pts"]:
            pts.append(p)
            if land_sd(p[0], p[1]) > 0:
                break
        rv["pts"] = pts
        rv["L"] = path_len(pts)
        rv["h0"] = None


# ---------------------------------------------------------------- the height of the land
def region(x, z):
    """(name of the promontory the point is on or None for Mittalmar, how much it is on it 0..1, along, across)."""
    best = (None, 0.0, 0.0, 0.0)
    for a in ARMS:
        s, c = arm_frame(x, z, a)
        if s < R0 * 0.55:
            continue
        w = arm_width(s, a) * 1.25
        k = smoothstep(R0 * 0.62, R0 * 0.95, s) * max(0.0, 1 - (c / w) ** 2)
        if k > best[1]:
            best = (a[0], k, s, c / max(1.0, arm_width(s, a)))
    return best


def menel(x, z):
    d = math.hypot(x - MENEL[0], z - MENEL[1])
    if d >= MENEL_R:
        return 0.0
    if d < HALLOW_R:
        return MENEL_H
    t = (d - HALLOW_R) / (MENEL_R - HALLOW_R)
    # gentle and grassy at the foot, steeper as it climbs; buttresses round it
    a = math.atan2(z, x)
    k = 1 + 0.08 * math.sin(a * 7 + 1.3) * t + 0.05 * math.sin(a * 13) * t
    # a skirt of gentle grass for the outer fifth, then the mountain proper, steepening to the summit
    return MENEL_H * (0.82 * (1 - t) ** 1.5 + 0.18 * (1 - t) ** 6) * k


def land_height(x, z, d):
    depth = -d
    r = math.hypot(x, z)
    h = 6 + 150 * smoothstep(0, 45000, depth) + 70 * smoothstep(0, 9000, depth)
    # Mittalmar is the high land, rolling downs round the mountain
    mid = smoothstep(R0 * 1.05, R0 * 0.55, r)
    h += mid * (240 + 140 * fbm(x / 26000, z / 26000, 51) + 60 * fbm(x / 6000, z / 6000, 53))
    # the land in general: low hills everywhere
    h += 70 * fbm(x / 12000, z / 12000, 61) + 25 * fbm(x / 3000, z / 3000, 63)
    name, k, s, c = region(x, z)
    if name == "Forostar":
        # stony, rising northward to the cliffs; heather and moor
        rise = smoothstep(R0 * 0.8, R0 + 140000, s)
        h += k * (180 + 520 * rise + 380 * ridged(x / 14000, z / 14000, 71) * (0.4 + rise))
        h += k * rise * 520 * smoothstep(0, 1500, depth)          # the cliffs of Sorontil and the north coast
    elif name == "Andustar":
        north = smoothstep(-0.2, 0.7, -c)                        # c > 0 is the left of the way out: the south side
        h += k * (120 + north * (650 + 520 * ridged(x / 13000, z / 13000, 73)))
        h += k * north * 380 * smoothstep(0, 1200, depth)        # the north coast is cliff
    elif name == "Hyarnustar":
        west = smoothstep(0.0, 0.8, -c)                          # c < 0 is the right of the way out: the west side
        h += k * (80 + west * (480 + 620 * ridged(x / 12000, z / 12000, 77)))
    elif name == "Hyarrostar":
        h += k * (40 + 90 * fbm(x / 9000, z / 9000, 79))
    elif name == "Orrostar":
        h += k * (160 + 260 * fbm(x / 15000, z / 15000, 81) + 160 * ridged(x / 22000, z / 22000, 83))
    # Armenelos's hill
    ad = math.hypot(x - ARMENELOS[0], z - ARMENELOS[1])
    h += 90 * max(0.0, 1 - ad / 5000) ** 1.5
    # the Meneltarma rises out of all of it
    m = menel(x, z)
    return h + m


def river_cut(x, z, h):
    for rv in RIVERS:
        if not rv["pts"] or rv["L"] < 1000:
            continue
        # a cheap reject: the bounding box of the river, widened
        bb = rv.get("bb")
        if bb is None:
            xs = [p[0] for p in rv["pts"]]
            zs = [p[1] for p in rv["pts"]]
            bb = rv["bb"] = (min(xs) - 9000, min(zs) - 9000, max(xs) + 9000, max(zs) + 9000)
        if not (bb[0] < x < bb[2] and bb[1] < z < bb[3]):
            continue
        if "cut" not in rv:
            rv["cut"] = simplify(rv["pts"], 250.0)
            rv["L"] = path_len(rv["cut"])
        d, at = path_dist(x, z, rv["cut"])
        W = 1100 + rv["w"] * 28
        if d > W:
            continue
        hr = rv["h0"] * max(0.0, 1 - at / rv["L"]) ** 1.25 + 2 if rv["h0"] else 2
        if h > hr:
            h = hr + (h - hr) * smoothstep(rv["w"], W, d) ** 0.8
    if NISINEN:
        lx, lz, rx, rz, lv = NISINEN
        e = math.hypot((x - lx) / rx, (z - lz) / rz)
        if e < 1.6:
            floor = lv - 9
            h = min(h, floor + (h - floor) * smoothstep(0.9, 1.6, e)) if e > 0.9 else floor
    return h


def terrain_height(x, z):
    d = land_sd(x, z)
    if d > 0:
        # the sea: a shelf, then the deep
        if d < 14000:
            return -(3 + d * 0.012)
        return -min(2200.0, 171 + (d - 14000) * 0.06)
    h = land_height(x, z, d)
    # the land eases down to the sea over its last stretch: on a kilometre grid a cliff is only a long ramp from one
    # sea vertex to one land vertex, which reads as a strip of nothing along every shore
    t = min(1.0, -d / 1800.0)
    h = 1.5 + (h - 1.5) * t * t * (3 - 2 * t)
    if math.hypot(x, z) > MENEL_R * 0.9:
        h = river_cut(x, z, h)
    return max(0.6, h)


# ---------------------------------------------------------------- the land cover
# 0 downs and pasture  1 farmland (grain)  2 broadleaf forest  3 fir forest  4 heath and moor  5 vineyard and orchard
# 6 rock  7 water  8 beach  9 marsh  10 the Nisimaldar (fragrant evergreens)  11 town
COVER_NAMES = ["pasture", "farmland", "broadleaf", "fir", "heath", "vineyard", "rock", "water", "beach", "marsh",
               "nisimaldar", "town"]


def cover_at(x, z, h, slope, d):
    if h <= 0.7 or d > 0:
        return 7
    md = math.hypot(x - MENEL[0], z - MENEL[1])
    if md < MENEL_R:
        return 0                               # the mountain's rock is src/numenor/nature.js's, by slope and height
    if slope > 0.55 or h > 2100:
        return 6
    if -d < 900 and h < 30 and slope < 0.12:
        return 8
    ni = TOWNS["Nindamos"]
    if math.hypot(x - ni[0], z - ni[1]) < 22000 and h < 45:
        return 9
    if NISINEN and math.hypot((x - NISINEN[0]) / (NISINEN[2] * 2.4), (z - NISINEN[1]) / (NISINEN[3] * 3)) < 1 and h < 40:
        return 9
    # the rules below read a warped position, so that no edge between two kinds of country is a ruled line
    x, z = x + (fbm(x / 26000, z / 26000, 101) - 0.5) * 52000 + (fbm(x / 7000, z / 7000, 103) - 0.5) * 9000, \
        z + (fbm(x / 26000, z / 26000, 107) - 0.5) * 52000 + (fbm(x / 7000, z / 7000, 109) - 0.5) * 9000
    el = TOWNS["Eldalonde"]
    if math.hypot(x - el[0], z - el[1]) < 38000 + 8000 * fbm(x / 9000, z / 9000, 91) and h < 600:
        return 10
    n1 = fbm(x / 9000, z / 9000, 93)
    n2 = fbm(x / 3500, z / 3500, 95)
    name, k, s, c = region(x, z)
    if k < 0.18 + 0.5 * fbm(x / 22000, z / 22000, 97):
        name = None
    if name == "Forostar":
        if h > 900 and n2 > 0.5:
            return 6
        return 3 if (n1 > 0.66 and h < 700) else 4 if n2 > 0.3 else 0
    if name == "Andustar":
        if -c > 0.1 + 0.5 * (n1 - 0.5) and h > 240:
            return 3 if n2 > 0.22 else 4
        return 1 if n1 > 0.48 else 0 if n1 > 0.3 else 2
    if name == "Hyarnustar":
        if -c > 0.15 and h > 220:
            return 5 if n2 > 0.52 and h < 900 else 3 if h > 760 else 0 if n1 > 0.42 else 2
        return 1 if n1 > 0.36 else 5 if n2 > 0.62 else 0
    if name == "Hyarrostar":
        return 1 if (n1 > 0.74 and -d > 4000) else 2
    if name == "Orrostar":
        if h > 520 and n2 > 0.4:
            return 3
        return 1 if n1 > 0.3 else 0
    # Mittalmar: the downs and pastures (Emerie, its sheep), the King's land farmed round Armenelos, the odd wood
    ad = math.hypot(x - ARMENELOS[0], z - ARMENELOS[1])
    if ad < 30000 + 22000 * fbm(x / 14000, z / 14000, 99) and n1 > 0.36:
        return 1
    if n1 > 0.7 and n2 > 0.45:
        return 2
    if -d < 30000 and n1 > 0.55:
        return 1
    return 0


TOWN_R = {"Armenelos": 2600, "Romenna": 2300, "Andunie": 1900, "Eldalonde": 1500, "Ondosto": 1300,
          "Nindamos": 1300, "Moriondë": 1100, "Hyarastorni": 1100}


# ---------------------------------------------------------------- coast lines (marching squares at y = 0)
def coastlines(H, nx, nz, x0, z0, step=STEP):
    segs = {}
    def P(i, j):
        return H[j * nx + i]
    def edge(i, j, k):
        # k: 0 top (i,j)-(i+1,j), 1 right (i+1,j)-(i+1,j+1), 2 bottom (i,j+1)-(i+1,j+1), 3 left (i,j)-(i,j+1)
        if k == 0:
            a, b, ax, az, bx, bz = P(i, j), P(i + 1, j), i, j, i + 1, j
        elif k == 1:
            a, b, ax, az, bx, bz = P(i + 1, j), P(i + 1, j + 1), i + 1, j, i + 1, j + 1
        elif k == 2:
            a, b, ax, az, bx, bz = P(i, j + 1), P(i + 1, j + 1), i, j + 1, i + 1, j + 1
        else:
            a, b, ax, az, bx, bz = P(i, j), P(i, j + 1), i, j, i, j + 1
        t = a / (a - b) if a != b else 0.5
        return (round(x0 + (ax + (bx - ax) * t) * step, 1), round(z0 + (az + (bz - az) * t) * step, 1))
    out = []
    for j in range(nz - 1):
        for i in range(nx - 1):
            c = (P(i, j) > 0) * 1 + (P(i + 1, j) > 0) * 2 + (P(i + 1, j + 1) > 0) * 4 + (P(i, j + 1) > 0) * 8
            if c in (0, 15):
                continue
            es = {1: [(0, 3)], 2: [(1, 0)], 3: [(1, 3)], 4: [(2, 1)], 5: [(0, 1), (2, 3)], 6: [(2, 0)], 7: [(2, 3)],
                  8: [(3, 2)], 9: [(0, 2)], 10: [(1, 2), (3, 0)], 11: [(1, 2)], 12: [(3, 1)], 13: [(0, 1)], 14: [(3, 0)]}[c]
            for a, b in es:
                out.append((edge(i, j, a), edge(i, j, b)))
    # orient every segment with the land on its left (the sea on its right), as nature.js's surf expects
    def hgt(x, z):
        i, j = int(round((x - x0) / step)), int(round((z - z0) / step))
        i, j = max(0, min(nx - 1, i)), max(0, min(nz - 1, j))
        return H[j * nx + i]
    oriented = []
    for a, b in out:
        dx, dz = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dz) or 1
        mx, mz = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        o = min(400.0, step * 0.6)
        lx, lz = mx - dz / L * o, mz + dx / L * o          # the left, in x east / z south
        if hgt(lx, lz) < hgt(mx + dz / L * o, mz - dx / L * o):
            a, b = b, a
        oriented.append((a, b))
    nxt = {}
    for a, b in oriented:
        nxt.setdefault(a, []).append(b)
    used = set()
    lines = []
    for a, b in oriented:
        if (a, b) in used:
            continue
        line = [a, b]
        used.add((a, b))
        cur = b
        while cur in nxt:
            cand = [c for c in nxt[cur] if (cur, c) not in used]
            if not cand:
                break
            used.add((cur, cand[0]))
            cur = cand[0]
            line.append(cur)
            if cur == line[0]:
                break
        lines.append(line)
    return lines


def clip_lines(lines, keep):
    """Cut coast lines where they cross in or out of a region, keeping the runs whose points keep(x, z) accepts."""
    out = []
    for ln in lines:
        run = []
        for pt in ln:
            if keep(*pt):
                run.append(pt)
            else:
                if len(run) > 1:
                    out.append(run)
                run = []
        if len(run) > 1:
            out.append(run)
    return out


# ---------------------------------------------------------------- fine patches
# The height grid is a kilometre, which makes a coast a staircase and a mountain a pyramid. Where it matters (the
# Meneltarma, the firth, each haven) a finer grid of the same ground is written beside it, which src/numenor/ draws
# over the coarse ground (pressed down under it). Each patch fades into the coarse grid over its last two kilometres,
# and inside a town it keeps the coarse ground wherever that is dry, so the streets and houses the engine set on the
# coarse ground stay on it.
FINE_EDGE = 2000.0


def fine_patch(name, xa, za, xb, zb, step, hat, towns):
    nx, nz = int((xb - xa) // step) + 1, int((zb - za) // step) + 1
    H = []
    for j in range(nz):
        z = za + j * step
        for i in range(nx):
            x = xa + i * step
            c = hat(x, z)
            f = terrain_height(x, z)
            e = min(x - xa, xb - x, z - za, zb - z) / FINE_EDGE
            w = 0.0 if e <= 0 else 1.0 if e >= 1 else e * e * (3 - 2 * e)
            h = c + (f - c) * w
            for (tx, tz, tr) in towns:
                if math.hypot(x - tx, z - tz) < tr * 1.25 and c > 1.5:
                    h = max(h, c)
            H.append(h)
    return {"n": name, "x0": round(xa), "z0": round(za), "step": step, "nx": nx, "nz": nz, "H": H}


# ---------------------------------------------------------------- main
def main():
    setup()
    setup_rivers()
    nx = int(2 * HX) // STEP + 1
    nz = nx
    x0 = z0 = -HX
    # the rivers' sources take the height of the land where they rise
    for rv in RIVERS:
        if rv["pts"]:
            x, z = rv["pts"][0]
            d = land_sd(x, z)
            rv["h0"] = max(4.0, land_height(x, z, d) - 30) if d < 0 else 4.0
    if NISINEN:
        lx, lz = NISINEN[0], NISINEN[1]
        lv = max(12.0, land_height(lx, lz, land_sd(lx, lz)) * 0.5)
        globals()["NISINEN"] = (lx, lz, NISINEN[2], NISINEN[3], round(lv, 1))
        # the Nunduine's profile passes through the lake
        nun = RIVERS[1]
        nun["h0"] = max(nun["h0"], lv + 40)

    H = []
    D = []
    for j in range(nz):
        z = z0 + j * STEP
        for i in range(nx):
            x = x0 + i * STEP
            d = land_sd(x, z)
            D.append(d)
            H.append(terrain_height(x, z))
        if j % 100 == 0:
            print(f"  terrain row {j}/{nz}", flush=True)

    out = {"attribution": "Numenor: fan geometry generated by tools/make-numenor.py; no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [round(-HX / MLAT, 5), round(-HX / MLON, 5), round(HX / MLAT, 5), round(HX / MLON, 5)],
           "seaLevelWater": True}
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(x0), "z0": q(z0), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in H]}

    def hat(x, z):
        """The ground as the engine will draw it: bilinear on the grid."""
        fi, fj = (x - x0) / STEP, (z - z0) / STEP
        i, j = int(math.floor(fi)), int(math.floor(fj))
        i, j = max(0, min(nx - 2, i)), max(0, min(nz - 2, j))
        f, g = fi - i, fj - j
        a, b = H[j * nx + i], H[j * nx + i + 1]
        c, e = H[(j + 1) * nx + i], H[(j + 1) * nx + i + 1]
        return (a + (b - a) * f) * (1 - g) + (c + (e - c) * f) * g

    # ---------- water: the sea is the whole box at y = 0 (the ground decides the shore); the lake stands at its level
    m = 2000
    out["water"] = [{"o": flat([(-HX - m, -HX - m), (HX + m, -HX - m), (HX + m, HX + m), (-HX - m, HX + m)]), "i": [], "n": "The Sea"}]
    if NISINEN:
        lx, lz, rx, rz, lv = NISINEN
        ring = []
        for k in range(64):
            a = k / 64 * math.tau
            w = 1 + 0.12 * math.sin(a * 3 + 1) + 0.06 * math.sin(a * 7)
            ring.append((lx + math.cos(a) * rx * w, lz + math.sin(a) * rz * w))
        out["water"].append({"o": flat(ring), "i": [], "n": "Nisinen", "y": lv})
    out["lake"], out["islands"], out["marina"], out["beach"], out["pier"] = [], [], [], [], []
    out["waterways"] = []

    # ---------- the roads
    roads = []
    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    def wander(a, b, seed, amp=None, step=1500.0):
        """A road from a to b, wandering a little, kept out of the sea and off the mountain's steep."""
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        n = max(2, int(L / step))
        amp = L * 0.06 if amp is None else amp
        pts = meander(a, b, n, amp, seed)
        res = []
        for x, z in pts:
            # keep it on land: pull a point that fell in the sea back toward the centre line
            k = 0
            while land_sd(x, z) > -300 and k < 12:
                x, z = x * 0.98 + (a[0] + b[0]) / 2 * 0.02, z * 0.98 + (a[1] + b[1]) / 2 * 0.02
                k += 1
            res.append((x, z))
        return res

    T = TOWNS
    road(wander(T["Romenna"], T["Armenelos"], 1, 4000), "trunk", 16, "The King's Road")
    # the processional way: from Armenelos to the mountain's foot, where the spiral road begins (src/numenor/)
    ux, uz = bdir(70.0)
    foot = (ux * (MENEL_R + 500), uz * (MENEL_R + 500))
    road(wander(T["Armenelos"], foot, 2, 1500), "primary", 12, "The Hallow Road")
    west = [T["Armenelos"], (-6000.0, -24000.0), (-60000.0, -30000.0), (-140000.0, -40000.0), T["Andunie"]]
    pts = []
    for i in range(len(west) - 1):
        seg = wander(west[i], west[i + 1], 10 + i, 5000)
        pts += seg if not pts else seg[1:]
    road(pts, "primary", 12, "The West Road")
    # from the West Road, south to Eldalonde past Nisinen
    fork = (-60000.0, -30000.0)
    road(wander(fork, (NISINEN[0] + 9000, NISINEN[1] - 6000), 21, 6000)
         + wander((NISINEN[0] + 9000, NISINEN[1] - 6000), T["Eldalonde"], 22, 5000)[1:], "secondary", 9, "The Road to Eldalonde")
    road(wander(T["Armenelos"], (16000.0, 30000.0), 31, 3000) + wander((16000.0, 30000.0), T["Nindamos"], 32, 9000)[1:],
         "secondary", 9, "The Siril Road")
    road(wander(T["Armenelos"], T["Ondosto"], 41, 8000), "secondary", 9, "The North Road")
    road(wander(T["Ondosto"], coast_along(358.0)[0], 42, 9000), "tertiary", 6, "The Sorontil Road")
    road(wander(T["Ondosto"], T["Moriondë"], 43, 7000), "tertiary", 6, "")
    road(wander(T["Romenna"], T["Hyarastorni"], 44, 9000), "secondary", 8, "The Shipwrights' Road")
    road(wander(T["Romenna"], T["Moriondë"], 45, 9000), "tertiary", 7, "")
    road(wander(T["Nindamos"], T["Hyarastorni"], 46, 9000), "tertiary", 6, "")
    road(wander(T["Nindamos"], T["Eldalonde"], 47, 12000), "tertiary", 6, "")
    # Noirinan: a road up the valley of the tombs
    road(wander(foot, NOIRINAN, 48, 1500), "tertiary", 7, "The Way to the Noirinan")

    # ---------- the towns, the villages and the farms
    buildings, areas, pois = [], [], []
    STONE = ["#ece6d8", "#e2dccc", "#f2eee4", "#d8d0be", "#e8e0cc", "#dcd8cc"]
    STONE_W = ["#f4f2ec", "#eceae2", "#e8e6dc"]
    FARM = ["#d8ccb0", "#cfc2a4", "#e0d6bc", "#c8bca0"]

    def put(cx, cz, w, d, rot, h, colour, roof="g", kind="house"):
        ring = rect(cx, cz, w, d, rot)
        buildings.append({"p": flat(ring), "h": round(h, 1), "t": kind, "c": colour, "r": roof})

    def land_ok(x, z, margin=30.0):
        return land_sd(x, z) < -margin and hat(x, z) > 1.5

    def town(name, cx, cz, R_, rings, harbour=None, walls=False, tall=1.0, kind="town", dense=1.0):
        """Streets in rings and spokes round a centre, houses along them on both sides, each turned to its street.
        harbour: a bearing toward the water, which the town opens to (quays along it, no houses in the sea)."""
        n0 = len(buildings)
        rings = max(rings, int(R_ / 115))
        rr = R_ / rings
        spokes = max(8, int(R_ / 200))
        sp0 = [k / spokes * math.tau + R.uniform(-0.12, 0.12) for k in range(spokes)]
        ph = [R.uniform(0, 6.3) for _ in range(6)]
        def rad(k, an):
            # a ring's radius at a bearing: wobbling, and each ring a little differently
            return rr * k * (1 + 0.07 * math.sin(3 * an + ph[0] + k * 0.3) + 0.04 * math.sin(7 * an + ph[1] + k * 0.5) + 0.025 * math.sin(13 * an + ph[2]))
        def spoke(sa, r_):
            # a spoke's bearing at a radius: bending as it goes out
            return sa + 0.22 * math.sin(r_ / 520 + sa * 3 + ph[3]) * min(1, r_ / 600)
        def near_spoke(an, ro, gap):
            return min(abs((an - spoke(sa, ro) + math.pi) % math.tau - math.pi) for sa in sp0) * ro < gap
        # streets
        for k in range(1, rings + 1):
            r = rr * k
            pts = []
            for a in range(0, 145):
                an = a / 144 * math.tau
                r = rad(k, an)
                x, z = cx + math.cos(an) * r, cz + math.sin(an) * r
                if land_ok(x, z, 10):
                    pts.append((x, z))
                elif len(pts) > 1:
                    road(pts, "residential", 6 if k < rings else 7)
                    pts = []
                else:
                    pts = []
            if len(pts) > 1:
                road(pts, "residential", 6 if k < rings else 7)
        for sa in sp0:
            pts = []
            for i in range(0, 25):
                r_ = rr * 0.6 + (R_ * 1.05 - rr * 0.6) * i / 24
                an = spoke(sa, r_)
                x, z = cx + math.cos(an) * r_, cz + math.sin(an) * r_
                if land_ok(x, z, 5):
                    pts.append((x, z))
                else:
                    break
            if len(pts) > 1:
                road(pts, "residential", 7)
        # houses along each ring street, both sides
        for k in range(1, rings + 1):
            for side in (-1, 1):
                a = R.uniform(0, 0.2)
                while a < math.tau:
                    w = R.uniform(10, 18) * (1.3 if k == 1 else 1)
                    ro = rad(k, a) + side * 15
                    an = a + w / 2 / ro
                    if not near_spoke(an, ro, 12) and R.random() < 0.93 * dense * (1 - 0.45 * k / rings):
                        x, z = cx + math.cos(an) * ro, cz + math.sin(an) * ro
                        if land_ok(x, z, 25):
                            d = R.uniform(11, 17)
                            h = (R.uniform(7, 12) + (8 if k == 1 else 0)) * tall
                            put(x + math.cos(an) * side * d / 2, z + math.sin(an) * side * d / 2, w - 1.2, d, an + math.pi / 2, h,
                                R.choice(STONE), "g" if R.random() < 0.7 else "h")
                    a += (w + R.uniform(0.5, 3)) / ro
        pois.append({"n": name, "x": q(cx), "z": q(cz), "k": kind, "ang": 0})
        # the harbour: quays out from the shore toward the water, and moles
        if harbour is not None:
            for k in range(-3, 4):
                bdeg = harbour + k * 11
                ux, uz = bdir(bdeg)
                sx, sz = coast_from(cx, cz, ux, uz, 80.0, R_ * 3)
                ln = 160 + 60 * (3 - abs(k))
                rot = math.atan2(uz, ux)
                out["pier"].append({"o": flat(rect(sx + ux * ln / 2, sz + uz * ln / 2, ln, 18, rot)), "i": []})
            # warehouses along the waterfront
            for k in range(-14, 15):
                bdeg = harbour + k * 4
                ux, uz = bdir(bdeg)
                sx, sz = coast_from(cx, cz, ux, uz, 60.0, R_ * 3)
                x, z = sx - ux * 40, sz - uz * 40
                if land_ok(x, z, 20):
                    put(x, z, R.uniform(22, 40), R.uniform(14, 20), math.atan2(uz, ux) + math.pi / 2, R.uniform(9, 14), R.choice(STONE), "g", "warehouse")
        return len(buildings) - n0

    counts = {}
    counts["Armenelos"] = town("Armenelos", *T["Armenelos"], 2400, 8, walls=True, tall=1.15, kind="city", dense=0.42)
    counts["Romenna"] = town("Romenna", *T["Romenna"], 2100, 7, harbour=108.0, kind="city", dense=0.5)
    counts["Andunie"] = town("Andunie", *T["Andunie"], 1700, 6, harbour=(ARMS[4][1] + 90) % 360, kind="city", dense=0.45)
    counts["Eldalonde"] = town("Eldalonde", *T["Eldalonde"], 1200, 5, harbour=254.0, kind="town", dense=0.5)
    counts["Ondosto"] = town("Ondosto", *T["Ondosto"], 1100, 4, kind="town", dense=0.55)
    counts["Nindamos"] = town("Nindamos", *T["Nindamos"], 1000, 4, harbour=183.0, kind="town", dense=0.55)
    counts["Moriondë"] = town("Moriondë", *T["Moriondë"], 900, 3, harbour=(ARMS[1][1] - 90) % 360, kind="town", dense=0.6)
    counts["Hyarastorni"] = town("Hyarastorni", *T["Hyarastorni"], 900, 3, harbour=(ARMS[2][1] - 90) % 360, kind="town", dense=0.6)

    # villages: a green, a ring of houses round it, a lane out; on good land, not too near a town or each other
    VILLAGE_NAMES = ["Emeriel", "Ondolin", "Arandor", "Taurenna", "Lindoros", "Nurtalë", "Fanuilos", "Calenhad", "Orthelos",
                     "Sirilond", "Hithlë", "Rómeran", "Elendil's Mead", "Vinyalondë", "Alcarinquë", "Lótesse", "Mardil",
                     "Ilmarin Low", "Anarion's Down", "Eärendur", "Oromet", "Turgonwë", "Haltar", "Noirost"]
    villages = []
    tries = 0
    while len(villages) < 150 and tries < 20000:
        tries += 1
        x, z = R.uniform(-HX * 0.9, HX * 0.9), R.uniform(-HX * 0.9, HX * 0.9)
        d = land_sd(x, z)
        if d > -2500:
            continue
        h = hat(x, z)
        if h < 4 or h > 900 or math.hypot(x, z) < MENEL_R + 3000:
            continue
        if any(math.hypot(x - tx, z - tz) < 9000 for tx, tz in T.values()):
            continue
        if any(math.hypot(x - vx, z - vz) < 14000 for vx, vz, _ in villages):
            continue
        c = cover_at(x, z, h, 0.0, d)
        if c in (2, 3, 6, 9, 10) and R.random() < 0.8:
            continue
        nm = VILLAGE_NAMES[len(villages)] if len(villages) < len(VILLAGE_NAMES) else ""
        villages.append((x, z, nm))
    for vx, vz, nm in villages:
        n = R.randint(14, 46)
        rad = 60 + n * 2.2
        for k in range(n):
            an = k / n * math.tau + R.uniform(-0.08, 0.08)
            rr = rad + R.uniform(-8, 26)
            x, z = vx + math.cos(an) * rr, vz + math.sin(an) * rr
            if land_ok(x, z, 20):
                put(x, z, R.uniform(8, 14), R.uniform(10, 15), an + math.pi / 2, R.uniform(5.5, 8.5), R.choice(FARM), "g")
        # the hall on the green
        put(vx, vz, 22, 12, R.uniform(0, 3), 10, R.choice(STONE), "g", "hall")
        if nm:
            pois.append({"n": nm, "x": q(vx), "z": q(vz), "k": "hamlet", "ang": 0})
        # a lane to the nearest road point
        best, bp = 1e18, None
        for r in roads:
            if r["c"] == "residential":
                continue
            p = r["p"]
            for i in range(0, len(p), 2):
                dd = math.hypot(p[i] / 10 - vx, p[i + 1] / 10 - vz)
                if dd < best:
                    best, bp = dd, (p[i] / 10, p[i + 1] / 10)
        if bp and best < 40000:
            road(wander((vx, vz), bp, int(vx) % 997, best * 0.08, 900.0), "unclassified", 4)

    # farmsteads: a house and a barn and a byre round a yard, scattered over the farmland and the pasture
    nfarm = 0
    tries = 0
    while nfarm < 2600 and tries < 60000:
        tries += 1
        x, z = R.uniform(-HX * 0.92, HX * 0.92), R.uniform(-HX * 0.92, HX * 0.92)
        d = land_sd(x, z)
        if d > -800:
            continue
        h = hat(x, z)
        if h < 3 or h > 1100 or math.hypot(x, z) < MENEL_R:
            continue
        c = cover_at(x, z, h, 0.0, d)
        if c not in (0, 1, 5, 4) or (c == 4 and R.random() < 0.7):
            continue
        rot = R.uniform(0, math.pi)
        put(x, z, R.uniform(10, 15), R.uniform(8, 11), rot, R.uniform(6, 8), R.choice(FARM), "g", "farmhouse")
        ox, oz = math.cos(rot), math.sin(rot)
        put(x + ox * 24 - oz * 6, z + oz * 24 + ox * 6, R.uniform(16, 24), R.uniform(9, 12), rot + math.pi / 2, R.uniform(7, 9), "#b8a888", "g", "barn")
        if R.random() < 0.6:
            put(x - ox * 4 + oz * 22, z - oz * 4 - ox * 22, R.uniform(10, 16), 7, rot, 4.5, "#c4b498", "g", "byre")
        nfarm += 1

    out["roads"] = roads
    out["areas"] = areas
    out["rail"], out["stations"] = [], []
    out["buildings"] = buildings
    out["trees"] = []
    # the peaks and the places, for the labels and the search
    pois.append({"n": "The Meneltarma", "x": 0, "z": 0, "k": "peak", "ang": 0, "h": MENEL_H})
    pois.append({"n": "The Noirinan", "x": q(NOIRINAN[0]), "z": q(NOIRINAN[1]), "k": "attraction", "ang": 0})
    pois.append({"n": "Tol Uinen", "x": q(TOL_UINEN[0]), "z": q(TOL_UINEN[1]), "k": "island", "ang": 0})
    sor = coast_along(358.0)[0]
    pois.append({"n": "Sorontil", "x": q(sor[0] * 0.985), "z": q(sor[1] * 0.985), "k": "peak", "ang": 0})
    for a in ARMS:
        ux, uz = bdir(a[1])
        s = R0 + a[2] * 0.45
        pois.append({"n": a[0], "x": q(ux * s), "z": q(uz * s), "k": "region", "ang": 0})
    pois.append({"n": "Mittalmar", "x": q(-60000), "z": q(60000), "k": "region", "ang": 0})
    pois.append({"n": "Emerie", "x": q(-70000), "z": q(-80000), "k": "region", "ang": 0})
    pois.append({"n": "Nisinen", "x": q(NISINEN[0]), "z": q(NISINEN[1]), "k": "lake", "ang": 0})
    out["pois"] = pois

    json.dump(out, open(OUT, "w", encoding="utf-8"), separators=(",", ":"))

    # ---------- the fine patches
    towns = [(T[k][0], T[k][1], TOWN_R[k]) for k in TOWN_R if k in T]
    patches = [fine_patch("Meneltarma", MENEL[0] - 15500, MENEL[1] - 15500, MENEL[0] + 15500, MENEL[1] + 15500, 100.0, hat, [])]
    fx = [p[0] for p in FIRTH] + [T["Romenna"][0]]
    fz = [p[1] for p in FIRTH] + [T["Romenna"][1]]
    patches.append(fine_patch("The Firth", min(fx) - 9000, min(fz) - 9000, max(fx) + 9000, max(fz) + 9000, 200.0, hat, towns))
    for hv in ("Andunie", "Eldalonde", "Nindamos", "Moriondë", "Hyarastorni", "Ondosto"):
        x, z = T[hv]
        patches.append(fine_patch(hv, x - 11000, z - 11000, x + 11000, z + 11000, 150.0, hat, towns))
    print("  fine patches: " + ", ".join(f"{p['n']} {p['nx']}x{p['nz']}" for p in patches), flush=True)

    def in_patch(x, z, m):
        for p in patches:
            if p["x0"] + m < x < p["x0"] + (p["nx"] - 1) * p["step"] - m and p["z0"] + m < z < p["z0"] + (p["nz"] - 1) * p["step"] - m:
                return True
        return False

    # ---------- the land file: cover, rivers, coast
    cover = []
    for j in range(nz):
        z = z0 + j * STEP
        for i in range(nx):
            x = x0 + i * STEP
            h = H[j * nx + i]
            if h <= 0.7:
                cover.append(7)
                continue
            hx = H[j * nx + min(nx - 1, i + 1)] - H[j * nx + max(0, i - 1)]
            hz = H[min(nz - 1, j + 1) * nx + i] - H[max(0, j - 1) * nx + i]
            slope = math.hypot(hx, hz) / (2 * STEP)
            cover.append(cover_at(x, z, h, slope, D[j * nx + i]))
    rle = []
    k = 0
    while k < len(cover):
        v, n = cover[k], 1
        while k + n < len(cover) and cover[k + n] == v and n < 60000:
            n += 1
        rle += [v, n]
        k += n
    rivers = [{"n": rv["n"], "w": rv["w"], "p": flat(simplify(rv["pts"], 60.0))} for rv in RIVERS if len(rv["pts"]) > 1]
    # the coarse coast outside the patches, and each patch's own coast inside it
    coast = [flat(simplify(c, 150.0)) for c in clip_lines(coastlines(H, nx, nz, x0, z0), lambda x, z: not in_patch(x, z, 1000)) if len(c) > 1]
    for p in patches:
        cl = coastlines(p["H"], p["nx"], p["nz"], p["x0"], p["z0"], p["step"])
        coast += [flat(simplify(c, 30.0)) for c in clip_lines(cl, lambda x, z: in_patch(x, z, 1000)) if len(c) > 1]
    land = {"_": "What the engine does not read and src/numenor/ does: the land cover (" + ", ".join(f"{i} {n}" for i, n in enumerate(COVER_NAMES))
            + "), the rivers with their widths, and the coast with the land on its left.",
            "cover": {"step": STEP, "nx": nx, "nz": nz, "rle": rle},
            "rivers": rivers, "coast": coast,
            "places": {k: [round(v[0]), round(v[1])] for k, v in T.items()},
            "towns": {k: [round(T[k][0]), round(T[k][1]), TOWN_R[k]] for k in TOWN_R if k in T},
            "menel": {"at": [MENEL[0], MENEL[1]], "h": MENEL_H, "r": MENEL_R, "hallow": HALLOW_R, "foot": [round(foot[0]), round(foot[1])]},
            "noirinan": [round(NOIRINAN[0]), round(NOIRINAN[1])],
            "tolUinen": [round(TOL_UINEN[0]), round(TOL_UINEN[1]), TOL_UINEN[2]],
            "firth": [[round(x), round(z)] for x, z in FIRTH],
            # heights in half-metres, rows north to south
            "fine": [{"n": p["n"], "x0": p["x0"], "z0": p["z0"], "step": p["step"], "nx": p["nx"], "nz": p["nz"],
                      "h": [int(round(h * 2)) for h in p["H"]]} for p in patches]}
    json.dump(land, open(LANDF, "w", encoding="utf-8"), separators=(",", ":"))

    # ---------- the city file
    def ll(x, z):
        return [round(-z / MLAT, 5), round(x / MLON, 5)]

    def view(cam, tgt, ch, th):
        return [ll(*cam) + [ch], ll(*tgt) + [th]]
    T2 = {k: (v[0], v[1]) for k, v in T.items()}
    hm = lambda p: round(hat(*p), 1)
    tu = (TOL_UINEN[0], TOL_UINEN[1])
    cfg = {
        "name": "Numenor",
        "note": "Fan work from Tolkien, whose world belongs to the Tolkien Estate; nothing from any book, film or game is used. "
                "The whole island at true proportion, generated by tools/make-numenor.py from the published geography: "
                "about seven hundred kilometres from the tip of one promontory to the tip of the next but one. Positions are "
                "[lat, lon] against an origin at the Meneltarma, so one degree of latitude is 111,132 m and one of longitude 111,320 m.",
        "origin": [0.0, 0.0],
        "defaultSeed": 32,
        "defaultHour": 10.5,
        "defaultView": "The Meneltarma from Armenelos",
        "bounds": out["bounds"],
        "osm": "data/cities/numenor-osm.json",
        "attribution": "Numenor is fan work: land generated by tools/make-numenor.py. Tolkien's world belongs to the Tolkien Estate. No assets used.",
        "seaLevelWater": True,
        "sky": {"day": {"top": "#4f86c6", "hor": "#cfe2ee"}, "dusk": {"top": "#34477a", "hor": "#f0a868"},
                "night": {"top": "#04070f", "hor": "#131c2c"}},
        "fog": 7e-07,
        "overcast": 0.12,
        "terrainColours": {"low": "#5e8a44", "high": "#4a7a3c", "steep": "#7a7468", "far": "#2a5a78"},
        "terrainLOD": [14000, 42000],
        "farLevel": -1.5,
        "waterColour": "#1f5a86",
        "lakeColour": "#2e6a84",
        "litWindows": 0.55,
        "streetTrees": 0,
        "parkedCars": 0,
        "traffic": 0,
        "people": 0,
        "streetFurniture": False,
        "areaColours": {"residential": "#86a060"},
        "lowRiseFar": 60000,
        "flight": True,
        "riverBoats": {"sail": 0, "motor": 0, "kayak": 0},
        "roofPitch": 0.55,
        "roofColours": ["#a86a50", "#b47858", "#8e8c88", "#9c6c56", "#8a96a0", "#b8886c", "#c09070"],
        "windows": False,
        "palette": {"brick": STONE + ["#d4ccb8"], "stone": STONE_W},
        "roadColours": {"residential": "#cfc6b0", "unclassified": "#b8ac8e", "tertiary": "#c8bea4", "secondary": "#d4cab0",
                        "primary": "#dcd2b8", "trunk": "#e4dcc4"},
        "weather": {"climate": "maritime", "cloudH": 1600, "weights": {"snow": 0.0, "storm": 0.3}, "_": "src/core/weather.js"},
        "numenor": {"_": "src/numenor/: the land cover, the forests, the rivers, the surf, the ships and the eagles",
                    "forestNear": 3800, "forestTile": 900, "forestPerTile": 3200, "forestFull": 1200, "clouds": 220,
                    "cloudBase": 1600, "surfFar": 12000, "ships": 34},
        "districts": {
            "_": "[name, hex colour, base height, tallest, box as [lat south, lon west, lat north, lon east]]",
            "armenelos": ["Armenelos", "#e8e2d4", 8, 30, [ll(T2['Armenelos'][0], T2['Armenelos'][1] + 2600)[0], ll(T2['Armenelos'][0] - 2600, 0)[1],
                                                          ll(T2['Armenelos'][0], T2['Armenelos'][1] - 2600)[0], ll(T2['Armenelos'][0] + 2600, 0)[1]]],
            "outer": ["Numenor", "#e0d8c6", 6, 16, None]},
        "focus": [],
        "landmarks": [],
        "views": {},
    }
    L = cfg["landmarks"]
    def lm(name, p, info, **kw):
        e = {"name": name, "at": ll(*p), "info": info}
        e.update(kw)
        L.append(e)
    lm("The Meneltarma", MENEL, "The Pillar of Heaven, in the midst of the island: grass on its long lower slopes, steeper as it climbs, "
       "and a flat summit with nothing built on it. The Hallow of Eru, open to the sky, where the King spoke for the people three times a year "
       "and no one else spoke at all. A road goes up it in a spiral from the north-east. Its height is ours: no figure is given.",
       model="meneltarma", aka=["The Pillar of Heaven"], height=MENEL_H, hallow=HALLOW_R, foot=MENEL_R, eagles=3,
       roadFrom=[round(foot[0]), round(foot[1])])
    lm("Armenelos", T2["Armenelos"], "The City of Kings, on its hill east of the mountain. The King's House stands in its court with a tall tower, "
       "and before it the White Tree, Nimloth, the gift of the Eldar, which flowers white and is fragrant at dusk. "
       "Every building here is our own; the texts give the city a court, a tower and a tree, not a plan.",
       model="armenelos", aka=["The City of Kings"], tower=130, walls=2820)
    # the Downfall's (src/numenor/main.js keeps a landmark tagged with an era only in that era)
    temple = (T2["Armenelos"][0] + 420.0, T2["Armenelos"][1] + 310.0)
    lm("The Temple", temple, "The temple Sauron had raised in Armenelos when the Faithful were persecuted: a drum of dark stone with a "
       "silver dome gone black with smoke, and the louver at its top always smoking. The White Tree had been cut down to feed its first fire. "
       "Its shape is ours, from the description of its size only.",
       model="temple", era="downfall", clear=[115], radius=76, wall=120)
    lm("Romenna", T2["Romenna"], "The great haven of the east, at the head of its firth: the port of the King's Road and of the ships that sailed for Middle-earth. "
       "It faces east, toward the lands Numenor went back to.", model="haven", ships=10, turn=math.radians(108 - 90))
    lm("Tol Uinen", tu, "An island in the Firth of Romenna, and the tower of Calmindon on it, built to watch the ships come and go.",
       model="calmindon", height=90)
    lm("Andunie", T2["Andunie"], "The haven of the west, facing the sunset and the land that cannot be seen from it. Its lords were the Elf-friends; "
       "the Elvish ships put in here.", model="haven", ships=6, turn=math.radians(ARMS[4][1] + 90 - 90))
    lm("Eldalonde", T2["Eldalonde"], "The Green Haven, at the head of the Bay of Eldanna, among the Nisimaldar: evergreen woods of fragrant trees, "
       "brought over the sea by the Eldar, that never lose their leaves.", model="haven", ships=4, turn=math.radians(254 - 90))
    lm("Nindamos", T2["Nindamos"], "The fishing town at the mouth of the Siril, among the marshes and the lagoons of its delta.", model="haven", ships=3,
       turn=math.radians(183 - 90))
    lm("The Noirinan", NOIRINAN, "The Valley of Tombs, at the south-west foot of the Meneltarma, where the Kings and Queens lie in tombs cut into the rock.",
       model="noirinan", turn=math.atan2(NOIRINAN[1], NOIRINAN[0]))
    lm("Sorontil", (sor[0] * 0.985, sor[1] * 0.985), "The great cliff on the north coast of Forostar, where the eagles nest.")
    lm("Ondosto", T2["Ondosto"], "The town of Forostar, near its border with Orrostar: the stone-workers', in the stony north.")
    lm("Hyarastorni", T2["Hyarastorni"], "The shipwrights' town on the coast of Hyarrostar, where the great forests come down to the sea. (The name is ours for this place.)")
    lm("Moriondë", T2["Moriondë"], "The harbour of Orrostar's north coast. (A name we have given it.)")
    lm("Nisinen", (NISINEN[0], NISINEN[1]), "The lake on the course of the Nunduine, west of the mountain, in its reeds and its marshes.")
    lm("Emerie", (-70000.0, -80000.0), "The sheep-country of Mittalmar: rolling downs, the grass close-cropped, a long way from the sea.")
    lm("The Siril", (8000.0, 90000.0), "The chief river of the island, south from the mountain to the sea at Nindamos.")

    V = cfg["views"]
    am = T2["Armenelos"]
    V["The Meneltarma from Armenelos"] = view((am[0] + 3500, am[1] + 2500), MENEL, 900, MENEL_H * 0.55)
    V["The Hallow"] = view((5200, -4200), MENEL, MENEL_H + 1500, MENEL_H)
    V["Armenelos"] = view((am[0] + 2800, am[1] + 3200), am, 1300, hm(am))
    V["The White Tree"] = view((am[0] + 160, am[1] + 130), am, hm(am) + 60, hm(am) + 25)
    rm = T2["Romenna"]
    ux, uz = bdir(108.0)
    V["Romenna and the Firth"] = view((rm[0] + ux * 9000, rm[1] + uz * 9000 + 3000), rm, 1600, 10)
    V["Tol Uinen"] = view((tu[0] - 4000, tu[1] - 3500), tu, 900, 40)
    an = T2["Andunie"]
    V["Andunie at sunset"] = view((an[0] + 3000, an[1] - 5000), an, 700, 10)
    el = T2["Eldalonde"]
    V["Eldalonde and the Nisimaldar"] = view((el[0] - 6000, el[1] + 2500), el, 1100, 20)
    V["The Noirinan"] = view((NOIRINAN[0] - 2500, NOIRINAN[1] + 3000), NOIRINAN, hm(NOIRINAN) + 600, hm(NOIRINAN) + 120)
    V["Sorontil"] = view((sor[0] * 0.94 - 6000, sor[1] * 0.94), (sor[0] * 0.985, sor[1] * 0.985), 1200, 600)
    V["The whole island"] = view((0.0, 520000.0), (0.0, 20000.0), 330000, 0)
    V["Over Mittalmar"] = view((-40000.0, 60000.0), MENEL, 4200, 1600)
    tm = temple
    cfg["eraViews"] = {"downfall": {
        "The Temple": view((tm[0] + 900, tm[1] + 700), tm, hm(tm) + 260, hm(tm) + 120),
        "The Downfall": view((70000.0, 45000.0), MENEL, 9000, 1200),
        "The Meneltarma, last": view((22000.0, 16000.0), MENEL, 4200, MENEL_H * 0.85)},
        "defaultView": "The Downfall"}
    V["Hyarrostar's forests"] = view((bdir(146)[0] * 260000, bdir(146)[1] * 260000), (bdir(146)[0] * 300000, bdir(146)[1] * 300000), 1500, 100)
    json.dump(cfg, open(CFG, "w", encoding="utf-8", newline="\n"), indent=1, ensure_ascii=False)

    from collections import Counter
    cc = Counter(cover)
    t = out["terrain"]
    print(f"wrote {OUT}: {os.path.getsize(OUT) / 1e6:.1f} MB; {2 * HX / 1000:.0f} km square; terrain {t['nx']}x{t['nz']} at {STEP} m, "
          f"{min(H):.0f}..{max(H):.0f} m; buildings {len(buildings)} {counts}; villages {len(villages)}; farms {nfarm}; roads {len(roads)}")
    print(f"wrote {LANDF}: {os.path.getsize(LANDF) / 1e6:.1f} MB; cover " + ", ".join(f"{COVER_NAMES[k]} {v}" for k, v in sorted(cc.items()))
          + f"; rivers {len(rivers)}; coast lines {len(coast)}")
    print(f"wrote {CFG}")


if __name__ == "__main__":
    main()
