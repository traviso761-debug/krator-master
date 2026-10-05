#!/usr/bin/env python3
"""Generate Hyrule, as The Legend of Zelda: Breath of the Wild has it, as a map file the OSM engine can read.

    python3 tools/make-hyrule.py

Writes data/cities/hyrule-osm.json (terrain grid, the sea with the land cut out of it, the roads, the villages'
houses, the woods) and data/cities/hyrule-plan.json (where the castle, the towers, the shrines, the Divine Beasts and
the rest stand, the lakes and rivers with their levels, and the regions the page paints the ground by).

This is fan work. Hyrule and Breath of the Wild belong to Nintendo; nothing from the game is used, copied or
redistributed. The country is laid out by reading the game's published map by eye - where the regions, mountains,
lakes, rivers, roads and places are - and every shape is built here from simple features (a peak, a plateau, a
volcano, a basin) placed at those positions. The map image is a reference for arrangement only: no height, colour
or pixel of it is used, and it is not in the repository.

Positions below are written in the map's pixels (a 1500 x 1250 picture of the whole country, north up) and turned
into metres at 8 m a pixel: Hyrule comes out about twelve kilometres across, Hyrule Field near the middle.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep, simplify

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "hyrule-osm.json")
PLAN = os.path.join(ROOT, "data", "cities", "hyrule-plan.json")
R = random.Random(1987)

ORIGIN = (0.0, 0.0)
PX = 8.0                                    # metres per pixel of the reference
CX, CY = 760.0, 620.0                       # the pixel at the origin
X0, X1, Z0, Z1 = -6200.0, 6200.0, -5200.0, 5200.0
STEP = 24.0


def P(px, py):
    """A pixel of the reference to metres: x east, z south."""
    return ((px - CX) * PX, (py - CY) * PX)


def Pl(pts):
    return [P(a, b) for a, b in pts]


# ---------------------------------------------------------------- the coast
# The land is everything inside this outline: the sea is east and south-east (the Lanayru, Necluda and Faron seas);
# west and north the land runs on out of the map, into the mountains at the edge of the world.
COAST = Pl([(-80, -80), (1290, -80), (1300, 100), (1330, 170), (1395, 240), (1420, 330), (1425, 450), (1405, 560),
            (1395, 650), (1390, 720), (1405, 800), (1380, 870), (1330, 910), (1325, 990), (1270, 1050), (1210, 1095),
            (1100, 1112), (980, 1132), (880, 1162), (800, 1182), (720, 1196), (680, 1232), (650, 1330), (-80, 1330)])
ISLANDS = [(P(1395, 1112), 26 * PX, "Eventide Island", 160.0)] + [(P(px, py), r * PX, "an islet", top) for px, py, r, top in
           [(1405, 440, 7, 26), (1413, 470, 5, 18), (1409, 506, 7, 30), (1416, 540, 5, 16), (1402, 590, 4, 14)]]
LAKE_LEVEL = {}                                 # the levels worked out for lakes given as None (main fills it in)


def in_poly(x, z, poly):
    c = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, zi = poly[i]
        xj, zj = poly[j]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
            c = not c
        j = i
    return c


def seg_dist(x, z, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]
    L = dx * dx + dz * dz
    t = 0 if L == 0 else max(0.0, min(1.0, ((x - a[0]) * dx + (z - a[1]) * dz) / L))
    return math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)


def coast_dist(x, z):
    return min(seg_dist(x, z, COAST[i], COAST[i + 1]) for i in range(len(COAST) - 1))


# ---------------------------------------------------------------- the land's features
# (kind, pixel x, pixel y, radius x px, radius y px, height m, name). Heights are the game's proportions, made a
# little gentler: Hyrule Field around forty metres, the Great Plateau a cliff-walled table, Death Mountain a kilometre.
FEATURES = [
    # the north and the west: Hebra, Tabantha, the Gerudo Highlands, and the mountains at the edge of the world
    ("peak", 330, 230, 210, 140, 1250, "Hebra Mountains"), ("peak", 250, 170, 90, 70, 1350, "Hebra Peak"),
    ("peak", 440, 200, 110, 80, 1050, "North Tabantha"), ("hill", 520, 300, 130, 90, 480, "Tabantha Tundra"),
    ("hill", 300, 470, 120, 110, 420, "Tabantha Frontier"), ("plateau", 282, 384, 78, 66, 490, "the Rito highland"), ("hill", 600, 210, 70, 60, 300, "Tabantha Hills"),
    ("range", 0, 0, 0, 0, 1400, "the edge of the world"),
    ("peak", 210, 740, 200, 110, 1150, "Gerudo Highlands"), ("peak", 160, 720, 80, 60, 1300, "Gerudo Summit"),
    ("peak", 330, 760, 90, 60, 900, "Gerudo Highlands east"),
    ("desert", 220, 1060, 330, 200, 70, "Gerudo Desert"),
    ("hill", 520, 980, 90, 140, 320, "Gerudo Canyon"), ("hill", 560, 1150, 80, 80, 360, "Gerudo Canyon south"),
    # the middle: the Great Plateau, Mount Hylia, Hyrule Ridge (a table of land with its lake on top), the castle's hill
    ("plateau", 470, 690, 95, 78, 240, "Great Plateau"), ("peak", 415, 845, 46, 36, 520, "Mount Hylia"),
    ("plateau", 470, 548, 92, 76, 290, "Hyrule Ridge"), ("hill", 380, 600, 60, 50, 420, "Satori Mountain"),
    ("hill", 730, 505, 45, 38, 70, "Hyrule Castle's hill"),
    ("hill", 640, 860, 60, 50, 120, "Ruined hills"), ("hill", 600, 990, 70, 60, 180, "Faron Grasslands hills"),
    # the north-east: the Great Hyrule Forest, Death Mountain, Akkala
    ("plateau", 805, 345, 88, 70, 110, "Great Hyrule Forest"),
    ("volcano", 1105, 290, 128, 116, 1050, "Death Mountain"), ("hill", 1000, 260, 90, 90, 600, "Eldin Mountains"),
    ("hill", 1040, 430, 110, 70, 300, "Eldin Canyon"),
    ("hill", 1260, 330, 120, 150, 260, "Akkala Highlands"), ("hill", 1220, 230, 70, 60, 380, "North Akkala"),
    # the east: Zora's Domain, Mount Lanayru, Necluda, the Dueling Peaks
    ("plateau", 1215, 580, 110, 82, 290, "Zora's Domain"), ("peak", 1300, 560, 50, 50, 520, "Ploymus Mountain"),
    ("peak", 1300, 820, 115, 95, 950, "Mount Lanayru"),
    ("hill", 1040, 760, 110, 70, 260, "West Necluda highlands"), ("hill", 1130, 990, 120, 80, 240, "East Necluda"),
    ("peak", 936, 872, 24, 26, 440, "Dueling Peaks west"), ("peak", 966, 918, 24, 26, 430, "Dueling Peaks east"),   # split by the Squabble River
    ("hill", 960, 1050, 120, 70, 140, "Faron jungle"), ("hill", 1110, 1060, 60, 40, 160, "Lurelin hills"),
    # more of the map: Death Mountain's western lava field, the mesa south of the Gerudo canyon, Akkala's hills
    ("hill", 1000, 255, 70, 55, 640, "Eldin lava field"), ("plateau", 560, 1212, 82, 36, 200, "the southern mesa"),
    ("hill", 1210, 175, 50, 40, 330, "Skull Lake's rim"), ("hill", 1140, 780, 70, 30, 280, "Necluda ridge"),
]


def bump(x, z, c, rx, rz, inner=0.0, ragged=False):
    dx, dz = (x - c[0]) / rx, (z - c[1]) / rz
    d = math.sqrt(dx * dx + dz * dz)
    if ragged:                                               # a plateau's edge is ragged, not round
        a = math.atan2(dz, dx)
        d *= 1 + 0.07 * math.sin(3 * a + c[0] * 0.001) + 0.05 * math.sin(7 * a + c[1] * 0.002) + 0.03 * math.sin(13 * a)
    return d, max(0.0, 1.0 - smoothstep(inner, 1.0, d))


def noise(x, z):
    return (math.sin(x / 431.0 + 0.7) * math.cos(z / 377.0 - 0.4) * 0.6 + math.sin(x / 173.0 - z / 211.0) * 0.3
            + math.cos(x / 89.0 + z / 97.0) * 0.12)


def ridge(x, z):
    """0-1: sharp-crested ridges running out from the peaks, a few hundred metres apart (a low frequency: finer
    detail than the 24 m grid can hold only aliases into stripes)."""
    a = 1 - abs(math.sin(x / 290.0 + math.sin(z / 410.0) * 1.6))
    b = 1 - abs(math.sin(z / 330.0 + math.sin(x / 520.0) * 1.3))
    return max(a, b) ** 2


def feature_height(x, z):
    h = 0.0
    for kind, px, py, rx, ry, top, name in FEATURES:
        if kind == "range":
            # the mountains at the edge of the world: along the north and the west edges of the map
            e = max(smoothstep(Z0 + 1400, Z0, z) * (1 - smoothstep(4600, 5800, x)), smoothstep(X0 + 1200, X0, x) * (1 - smoothstep(1500, 3500, z)))
            h = max(h, top * e * (0.75 + 0.25 * noise(x * 0.6 + 400, z * 0.6)) * (0.85 + 0.15 * ridge(x, z)))
            continue
        c = P(px, py)
        d, k = bump(x, z, c, rx * PX, ry * PX, ragged=kind in ('plateau', 'volcano'))
        if k <= 0:
            continue
        if kind == "peak":
            v = top * (1 - d) ** 1.35 * (0.86 + 0.1 * noise(x * 0.8 + 1000, z * 0.8) + 0.12 * ridge(x, z)) if d < 1 else 0   # ridged shoulders
        elif kind == "hill":
            v = top * k * (0.82 + 0.18 * noise(x * 0.9 + 300, z * 0.9))
        elif kind == "plateau":
            v = top * (1 - smoothstep(0.86, 1.0, d)) + 6 * noise(x * 1.2, z * 1.2) * (d < 0.86)
        elif kind == "volcano":
            v = top * (1 - d) ** 1.1 if d < 1 else 0
            v -= 220 * (1 - smoothstep(0.0, 0.16, d))                 # the crater
        elif kind == "desert":
            v = top * k + 9 * math.sin(x / 61.0 + math.sin(z / 140.0) * 2) * k   # dunes, running north-south
        else:
            v = top * k
        h = max(h, v)
    return h


# ---------------------------------------------------------------- water: lakes and rivers
# lakes: (name, pixel polygon or (centre, rx, ry), water level m)
def ellipse(cx, cy, rx, ry, n=28, rot=0.0):
    c, s_ = math.cos(rot), math.sin(rot)
    return [P(cx + (rx * math.cos(a)) * c - (ry * math.sin(a)) * s_, cy + (rx * math.cos(a)) * s_ + (ry * math.sin(a)) * c)
            for a in [i / n * math.tau for i in range(n)]]


# level None: worked out from the ground round the lake (the lowest point of its shore, less a metre), so a lake up in
# the hills sits where the hills put it. hot: a hot spring - teal and steaming (the page draws it so).
LAKES = [
    ("Lake Hylia", ellipse(735, 955, 62, 46), 12.0),
    ("Lanayru Wetlands", ellipse(975, 650, 62, 28), 26.0),
    ("East Reservoir Lake", ellipse(1255, 600, 30, 42), 300.0),
    ("Lake Kolomo", ellipse(810, 205, 32, 26), 60.0),
    ("Rito Village's lake", ellipse(275, 378, 34, 28), None),   # up on the Rito highland
    ("Hyrule Ridge's lake", ellipse(482, 538, 20, 32, rot=0.3), None),
    ("Skull Lake", ellipse(1212, 168, 20, 15), None),
    ("Lake Akkala", ellipse(1290, 392, 26, 30), None),
    ("the Lanayru Great Spring", ellipse(1177, 669, 9, 9), None),
    ("Necluda's long lake", ellipse(1132, 784, 30, 6, rot=-0.45), None),
    ("the lake by the plateau", ellipse(604, 905, 28, 14), None),
    ("Hebra's long lake", ellipse(215, 310, 12, 38, rot=0.35), None),
    ("Hebra's north lake", ellipse(352, 350, 15, 20), None),
    ("Hebra's east lake", ellipse(384, 376, 20, 10, rot=0.4), None),
    ("Tabantha's lake", ellipse(313, 437, 26, 15), None),
    ("a pond in the field", ellipse(700, 792, 14, 8, rot=0.3), None),
    ("a pond by the woods", ellipse(852, 716, 8, 8), None),
    ("a pond on the plain", ellipse(618, 690, 7, 6), None),
    ("the Goron hot springs", ellipse(1084, 440, 24, 8, rot=-0.6), None, True),
    ("the hot crater lake", ellipse(1130, 160, 13, 13), None, True),
]
LAKES = [l if len(l) == 4 else l + (False,) for l in LAKES]
# moats: (name, centre px, inner radius px, outer radius px, level)
MOATS = [("Hyrule Castle's moat", (730, 505), 46, 58, 34.0), ("the moat of the Great Hyrule Forest", (805, 345), 92, 104, 42.0)]
# the two rivers that frame Hyrule Field, from the castle's water down to Lake Hylia, and the one round the plateau
RIVERS = [
    ("Hylia River", [(792, 470), (833, 468), (876, 539), (881, 635), (857, 730), (824, 802), (800, 897), (772, 930)], 32),
    ("the western river", [(668, 470), (647, 530), (618, 601), (585, 644), (576, 687), (595, 754), (585, 816), (600, 880), (690, 925), (715, 940)], 26),
    ("the plateau's river", [(560, 600), (452, 630), (382, 672), (370, 742), (410, 808), (500, 830), (560, 852), (600, 882)], 22),
    ("Lanayru River", [(1170, 640), (1080, 612), (1035, 640), (990, 600), (930, 575), (882, 590)], 30),   # into the Hylia River
    ("Faron River", [(750, 1000), (760, 1080), (768, 1180)], 26),
    ("Squabble River", [(1062, 962), (1010, 925), (951, 895), (905, 882), (860, 870), (824, 850)], 22),   # between the Dueling Peaks
    ("Zora River", [(1255, 640), (1210, 650), (1170, 640)], 26),
]


def lake_mask(x, z):
    for name, poly, lv, hot in LAKES:
        if in_poly(x, z, poly):
            return lv if lv is not None else LAKE_LEVEL.get(name, 30.0)
    for name, (px, py), r0, r1, lv in MOATS:
        c = P(px, py)
        d = math.hypot(x - c[0], z - c[1]) / PX
        if r0 <= d <= r1:
            return lv
    return None


def raw_height(x, z):
    if not in_poly(x, z, COAST) and not any(math.hypot(x - c[0], z - c[1]) < r for c, r, n, t in ISLANDS):
        return None
    base = 24 + 14 * noise(x * 0.5, z * 0.5) + 10 * noise(x * 0.25 + 900, z * 0.27)
    for c, r, n, top in ISLANDS:
        d = math.hypot(x - c[0], z - c[1]) / r
        if d < 1:
            base = max(base, top * (1 - d) ** 1.5 + 2)
    return max(base, feature_height(x, z))


def main():
    out = {"attribution": "Hyrule: fan geometry generated by tools/make-hyrule.py; nothing from the game is used",
           "units": "decimetres east (x) and south (z) of origin", "origin": list(ORIGIN), "seaLevelWater": True}
    mlat, mlon = 111132.0, 111320.0
    ll = lambda x, z: [round(ORIGIN[0] - z / mlat, 6), round(ORIGIN[1] + x / mlon, 6)]
    s0, w0 = ll(X0, Z1)
    n0, e0 = ll(X1, Z0)
    out["bounds"] = [s0, w0, n0, e0]

    # ---------- terrain: features, then the coast, then the lakes and rivers cut into it ----------
    nx = int((X1 - X0) // STEP) + 2
    nz = int((Z1 - Z0) // STEP) + 2
    H = [[0.0] * nx for _ in range(nz)]
    for j in range(nz):
        z = Z0 + j * STEP
        for i in range(nx):
            x = X0 + i * STEP
            h = raw_height(x, z)
            if h is None:                                            # the sea: shelving away from the coast
                d = coast_dist(x, z)
                h = 0.7 - min(30.0, 1.5 + d * 0.02)
            else:
                d = coast_dist(x, z) if x > 3000 or z > 3000 else 999
                h = 1.2 + (h - 1.2) * smoothstep(0, 140, d)          # a beach before the land rises
            H[j][i] = h

    def carve(poly_pts, width, depth_below):
        """Cut a channel along a polyline: down to a smooth water level that only ever falls downstream."""
        pts = Pl([(a, b) for a, b in poly_pts])
        levels = []
        for x, z in pts:
            i, j = int((x - X0) / STEP), int((z - Z0) / STEP)
            levels.append(H[max(0, min(nz - 1, j))][max(0, min(nx - 1, i))])
        for k in range(1, len(levels)):
            levels[k] = min(levels[k], levels[k - 1])                 # a river never runs uphill
        river = []
        for k in range(len(pts) - 1):
            a, b = pts[k], pts[k + 1]
            la, lb = levels[k] - depth_below, levels[k + 1] - depth_below
            x0, x1 = min(a[0], b[0]) - width * 3, max(a[0], b[0]) + width * 3
            z0, z1 = min(a[1], b[1]) - width * 3, max(a[1], b[1]) + width * 3
            for j in range(max(0, int((z0 - Z0) / STEP)), min(nz, int((z1 - Z0) / STEP) + 2)):
                for i in range(max(0, int((x0 - X0) / STEP)), min(nx, int((x1 - X0) / STEP) + 2)):
                    x, z = X0 + i * STEP, Z0 + j * STEP
                    dx, dz = b[0] - a[0], b[1] - a[1]
                    L = dx * dx + dz * dz
                    t = 0 if L == 0 else max(0.0, min(1.0, ((x - a[0]) * dx + (z - a[1]) * dz) / L))
                    d = math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)
                    bed = la + (lb - la) * t
                    if d < width * 3:
                        w = smoothstep(width * 3, width * 0.5, d)
                        H[j][i] = min(H[j][i], H[j][i] + (bed - H[j][i]) * w)
            river.append([round(a[0], 1), round(a[1], 1), round(la + depth_below - 1.0, 1)])
        river.append([round(pts[-1][0], 1), round(pts[-1][1], 1), round(levels[-1] - 1.0, 1)])
        return river

    # the lakes given without a level: the lowest ground round the shore, less a metre
    for name, poly, lv, hot in LAKES:
        if lv is None:
            rim = []
            for x, z in poly:
                i, j = int((x - X0) / STEP), int((z - Z0) / STEP)
                rim.append(H[max(0, min(nz - 1, j))][max(0, min(nx - 1, i))])
            LAKE_LEVEL[name] = round(min(rim) - 1.0, 1)
    # the Tabantha canyon: a deep cut running north-east across the tundra, spanned by the great bridge
    carve([(530, 360), (565, 318), (600, 285), (628, 262)], 45.0, 110.0)
    rivers = []
    for name, pts, wpx in RIVERS:
        rivers.append({"name": name, "width": wpx * 1.0, "pts": carve(pts, wpx * 1.0, 3.0)})
    # the lakes: a basin under each, and the shore down to the water
    for j in range(nz):
        z = Z0 + j * STEP
        for i in range(nx):
            x = X0 + i * STEP
            lv = lake_mask(x, z)
            if lv is not None:
                H[j][i] = min(H[j][i], lv - 4.0)
    hs = [int(round(H[j][i] * 10)) for j in range(nz) for i in range(nx)]
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(X0), "z0": q(Z0), "datum": 0.0, "h": hs}

    def height(x, z):
        fi, fj = (x - X0) / STEP, (z - Z0) / STEP
        i, j = max(0, min(nx - 2, int(fi))), max(0, min(nz - 2, int(fj)))
        tx, tz = max(0.0, min(1.0, fi - i)), max(0.0, min(1.0, fj - j))
        return (H[j][i] * (1 - tx) + H[j][i + 1] * tx) * (1 - tz) + (H[j + 1][i] * (1 - tx) + H[j + 1][i + 1] * tx) * tz

    # ---------- the sea: one sheet with the land cut out of it (the coast, inside the box, and the island) ----------
    m = 9000
    # north and west the land runs on out of the map, so the hole runs out to the sheet's edge there
    coast_in = [(max(X0 - m + 50, min(X1 + 300, x)) if x < 0 else min(X1 + 300, x), max(Z0 - m + 50, min(Z1 + 300, z)) if z < 0 else min(Z1 + 300, z)) for x, z in COAST]
    coast_in = [(X0 - m + 50 if x <= X0 - 300 else x, Z0 - m + 50 if z <= Z0 - 300 else z) for x, z in coast_in]
    coast_in = [(x, Z1 + m - 50 if (z >= Z1 and x < -500) else z) for x, z in coast_in]   # and the desert runs on south
    holes = [flat(coast_in)] + [flat([(c[0] + math.cos(a) * r * 0.97, c[1] + math.sin(a) * r * 0.97) for a in [k / 24 * math.tau for k in range(24)]]) for c, r, n, t in ISLANDS]
    out["water"] = [{"o": flat([(X0 - m, Z0 - m), (X1 + m, Z0 - m), (X1 + m, Z1 + m), (X0 - m, Z1 + m)]), "i": holes, "n": "The sea"}]
    out["lake"], out["islands"], out["marina"], out["waterways"], out["pier"], out["beach"] = [], [], [], [], [], []

    # ---------- the places ----------
    def site(px, py, **kw):
        x, z = P(px, py)
        d = {"x": round(x, 1), "z": round(z, 1), "y": round(height(x, z), 1), "at": ll(x, z)}
        d.update(kw)
        return d
    S = {
        "castle": site(730, 505), "castletown": site(742, 575),
        "plateau": site(470, 690), "temple_of_time": site(488, 680), "resurrection": site(455, 655), "oldman": site(500, 706),
        "kakariko": site(1015, 782), "hateno": site(1240, 930), "techlab": site(1290, 912),
        "rito": site(275, 378), "zora": site(1205, 585), "goron": site(1040, 330), "gerudo_town": site(245, 1035),
        "lurelin": site(1150, 1092), "tarrey": site(1320, 420), "korok": site(805, 345), "akkala_citadel": site(1262, 318),
        "spiral": site(1392, 338), "eventide": site(1395, 1112),
        "lomei_north": site(660, 150), "lomei_south": site(520, 1095), "lomei_island": site(1415, 135),
        "ruta": site(1255, 600), "rudania": site(1080, 330), "medoh": site(275, 378), "naboris": site(190, 1010),
        "dueling": site(951, 895), "deathmountain": site(1110, 290),
        "hylia_bridge": site(722, 958), "fort_hateno": site(1170, 900),
    }
    # the Sheikah towers, and the shrines: a few dozen, so every region has its lights
    TOWERS = {"Great Plateau Tower": (470, 700), "Central Tower": (705, 640), "Dueling Peaks Tower": (938, 850),
              "Hateno Tower": (1170, 870), "Lanayru Tower": (1012, 642), "Akkala Tower": (1232, 425), "Eldin Tower": (1000, 450),
              "Woodland Tower": (885, 430), "Ridgeland Tower": (450, 520), "Tabantha Tower": (500, 330), "Hebra Tower": (330, 185),
              "Gerudo Tower": (245, 700), "Wasteland Tower": (300, 980), "Lake Tower": (655, 950), "Faron Tower": (900, 1020)}
    towers = [dict(site(px, py), name=n) for n, (px, py) in TOWERS.items()]
    SHRINES = [(462, 645), (512, 712), (430, 700), (500, 760), (690, 610), (600, 720), (760, 700), (650, 810), (880, 600),
               (960, 720), (1000, 800), (1060, 790), (1210, 960), (1120, 920), (1270, 870), (1130, 640), (1250, 520), (1190, 470),
               (1300, 430), (1340, 300), (1000, 360), (1070, 470), (870, 470), (770, 380), (600, 420), (480, 470), (380, 420),
               (280, 320), (200, 250), (420, 260), (560, 260), (180, 700), (300, 800), (150, 1000), (320, 1100), (440, 950),
               (560, 1060), (680, 1060), (820, 1000), (960, 1080), (1060, 1040), (1180, 1080), (1390, 1110), (720, 860),
               (850, 760), (830, 540), (640, 540), (520, 610)]
    shrines = []
    for k, (px, py) in enumerate(SHRINES):
        s = site(px, py)
        if s["y"] < 2:
            continue
        shrines.append(dict(s, blue=R.random() < 0.55))
    STABLES = {"Outskirt Stable": (680, 780), "Dueling Peaks Stable": (895, 868), "Wetland Stable": (930, 625),
               "Riverside Stable": (620, 830), "Woodland Stable": (900, 455), "Serenne Stable": (560, 450),
               "Snowfield Stable": (360, 410), "Rito Stable": (420, 420), "Gerudo Canyon Stable": (480, 900),
               "Highland Stable": (620, 1000), "Lakeside Stable": (880, 1100), "Foothill Stable": (1060, 520),
               "East Akkala Stable": (1300, 480), "South Akkala Stable": (1170, 520), "Kara Kara Bazaar": (300, 1000)}
    stables = [dict(site(px, py), name=n) for n, (px, py) in STABLES.items()]
    # Bokoblin camps: out in the field, on the hills, by the roads but not on them, never in a village
    camps = []
    towns = [S[k] for k in ("kakariko", "hateno", "rito", "zora", "goron", "gerudo_town", "lurelin", "tarrey", "castle", "plateau")]
    for _ in range(400):
        if len(camps) >= 26:
            break
        px, py = R.uniform(300, 1300), R.uniform(250, 1100)
        x, z = P(px, py)
        h = height(x, z) if 'height' in dir() else 0
        if lake_mask(x, z) is not None or any(math.hypot(x - t["x"], z - t["z"]) < 700 for t in towns) or any(math.hypot(x - c["x"], z - c["z"]) < 600 for c in camps):
            continue
        camps.append(site(px, py))
    camps = [c for c in camps if 3 < c["y"] < 600]
    S["tabantha_bridge"] = site(578, 306)
    S["zora_falls"] = site(1163, 634)

    # ---------- roads: the paths across the country, as the map draws them ----------
    roads = []
    def road(pts_px, name, cls="track", w=6.0):
        pts = []
        for k in range(len(pts_px) - 1):
            (a, b), (c, d) = P(*pts_px[k]), P(*pts_px[k + 1])
            n = max(1, int(math.hypot(c - a, d - b) // 40))
            for s in range(n):
                pts.append((a + (c - a) * s / n, b + (d - b) * s / n))
        pts.append(P(*pts_px[-1]))
        pts = [p for p in pts if lake_mask(*p) is None]
        if len(pts) > 1:
            roads.append({"c": cls, "w": w, "p": flat(simplify(pts, 2.0)), "n": name})
    ROADS = [
        ("The road to the castle", [(560, 520), (640, 560), (720, 600)]),
        ("The road south", [(720, 600), (705, 700), (680, 780)]),
        ("The road to Kakariko", [(680, 780), (760, 840), (880, 862), (960, 830), (1015, 782)]),
        ("The road to Hateno", [(1015, 782), (1060, 820), (1120, 870), (1170, 900), (1240, 930)]),
        ("The road to Akkala", [(720, 600), (860, 560), (980, 520), (1060, 520), (1180, 470), (1290, 420)]),
        ("The road to Zora's Domain", [(860, 560), (930, 625), (1050, 620), (1180, 605)]),
        ("The road to Rito Village", [(560, 520), (470, 470), (420, 420), (330, 400), (290, 385)]),
        ("The road to Gerudo", [(680, 780), (620, 900), (560, 960), (480, 900), (380, 960), (300, 1000), (245, 1035)]),
        ("The road to Lurelin", [(680, 780), (700, 880), (722, 958), (700, 1060), (800, 1100), (880, 1100), (1000, 1110), (1150, 1092)]),
        ("The road to the woods", [(720, 600), (770, 480), (885, 430), (900, 455)]),
        ("The road to Goron City", [(1060, 520), (1050, 420), (1040, 330)]),
        ("The Tabantha road", [(420, 420), (500, 330), (560, 260)]),
    ]
    # and the field's own network, as the map draws it: the paths that cross Hyrule Field between the castle's
    # roads, round the Central Tower and down to the stables
    ROADS += [
        ("The field road", [(638, 606), (676, 611), (735, 620), (776, 611), (809, 577)]),
        ("The west field road", [(628, 625), (623, 687), (647, 754), (652, 802), (647, 840)]),
        ("The middle road", [(735, 620), (747, 677), (714, 725), (666, 754)]),
        ("The east field road", [(776, 635), (790, 687), (776, 725), (762, 763), (771, 802), (800, 840)]),
        ("The south field road", [(714, 725), (704, 782), (714, 830), (781, 840)]),
        ("The road to the wetlands", [(790, 687), (809, 668), (857, 644), (930, 625)]),
        ("The ridge road", [(560, 520), (500, 560), (470, 600), (452, 640)]),
        ("The Tundra road", [(500, 330), (580, 300), (640, 250), (700, 230)]),
    ]
    for name, pts in ROADS:
        road(pts, name)
    out["roads"] = roads

    # ---------- the villages' houses: small, steep-roofed, close together; the page dresses the towns ----------
    buildings = []
    def village(key, n, r, roofc, wallc, floors=(1, 2), size=(7, 11)):
        c = S[key]
        placed = []
        for _ in range(n * 6):
            if len(placed) >= n:
                break
            a, d = R.uniform(0, math.tau), r * math.sqrt(R.random())
            x, z = c["x"] + math.cos(a) * d, c["z"] + math.sin(a) * d
            if lake_mask(x, z) is not None or height(x, z) < 2 or any(math.hypot(x - u, z - v) < 15 for u, v in placed):
                continue
            w, dd = R.uniform(*size), R.uniform(*size)
            buildings.append({"p": flat(rect(x, z, w, dd, R.uniform(0, math.pi))), "h": round(3.2 * R.choice(floors), 1),
                              "t": "house", "c": R.choice(wallc), "r": "g"})
            placed.append((x, z))
    WOOD = ["#a8865a", "#9a7a50", "#b8956a", "#8a6a44"]
    WHITE = ["#ece4d2", "#e2d8c4", "#f2ead8"]
    village("kakariko", 26, 150, None, WOOD)
    village("hateno", 32, 190, None, WHITE + WOOD)
    village("lurelin", 16, 110, None, ["#d8c8a0", "#c8b088"])
    village("tarrey", 12, 70, None, ["#e8e0d0", "#d8c098"])
    village("gerudo_town", 30, 120, None, ["#e8c898", "#dcb882", "#f0d6a8"], (1, 2, 3), (8, 14))
    for st in stables:
        pass
    out["buildings"] = buildings

    # ---------- the woods ----------
    # (centre px, radius px, density): the Great Hyrule Forest, Faron's jungle, the Hyrule Ridge woods, Necluda, Akkala's
    # autumn woods, the Lost Woods, Hebra's firs, and trees thinly everywhere green
    WOODS = [((805, 345), 85, 0.9), ((930, 1060), 130, 0.75), ((420, 570), 110, 0.35), ((1080, 900), 120, 0.4),
             ((1250, 380), 110, 0.45), ((560, 700), 60, 0.3), ((350, 300), 140, 0.25), ((860, 900), 80, 0.4),
             ((640, 980), 80, 0.3), ((1150, 700), 90, 0.35)]
    trees, tset = [], []
    for _ in range(110000):
        x, z = R.uniform(X0 + 50, X1 - 50), R.uniform(Z0 + 50, Z1 - 50)
        h = height(x, z)
        if h < 3 or h > 900 or lake_mask(x, z) is not None:
            continue
        p_ = 0.09
        for (px, py), r, dens in WOODS:
            c = P(px, py)
            d = math.hypot(x - c[0], z - c[1]) / (r * PX)
            if d < 1:
                p_ = max(p_, dens * (1 - d * d))
        dz = (x - P(220, 1060)[0]) / (330 * PX), (z - P(220, 1060)[1]) / (200 * PX)
        if dz[0] ** 2 + dz[1] ** 2 < 1:
            p_ = 0.004                                             # the desert
        if h > 600:
            p_ *= 0.3                                               # few up in the snow
        if R.random() < p_:
            trees += [q(x), q(z)]
    out["trees"] = trees
    out["areas"], out["rail"], out["stations"], out["pois"] = [], [], [], []
    json.dump(out, open(OUT, "w"), separators=(",", ":"))

    # ---------- the plan ----------
    lakes = [{"name": n, "level": lv if lv is not None else LAKE_LEVEL[n], "hot": hot, "poly": [[round(x, 1), round(z, 1)] for x, z in poly]} for n, poly, lv, hot in LAKES]
    moats = [{"name": n, "x": P(px, py)[0], "z": P(px, py)[1], "r0": r0 * PX, "r1": r1 * PX, "level": lv} for n, (px, py), r0, r1, lv in MOATS]
    REGIONS = {"desert": [P(220, 1060), 330 * PX, 200 * PX], "deathmountain": [P(1080, 280), 200 * PX, 170 * PX],
               "lavafield": [P(1000, 255), 72 * PX, 55 * PX],
               "akkala": [P(1260, 360), 140 * PX, 150 * PX], "faron": [P(930, 1060), 150 * PX, 90 * PX],
               "hebra": [P(330, 230), 240 * PX, 170 * PX], "gerudo_high": [P(210, 740), 220 * PX, 130 * PX]}
    plan = {"_": "written by tools/make-hyrule.py: metres east (x) and south (z) of the origin; y is the ground",
            "sites": S, "towers": towers, "shrines": shrines, "stables": stables, "camps": camps, "lakes": lakes, "moats": moats,
            "rivers": rivers, "regions": REGIONS, "coast": [[round(x, 1), round(z, 1)] for x, z in COAST]}
    json.dump(plan, open(PLAN, "w"), indent=1)
    lo, hi = min(hs) / 10, max(hs) / 10
    print(f"terrain {nx}x{nz} at {STEP:g} m, ground {lo:.0f} to {hi:.0f} m; {len(buildings)} houses, {len(roads)} roads, "
          f"{len(trees) // 2} trees, {len(towers)} towers, {len(shrines)} shrines, {len(stables)} stables")


if __name__ == "__main__":
    main()
