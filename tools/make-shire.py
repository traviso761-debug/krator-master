#!/usr/bin/env python3
"""The Shire: Hobbiton and Bywater.

Fan work. Tolkien's world belongs to the Tolkien Estate; nothing from any book, film or game is used, and
every shape here is this project's own geometry built from the description.

Made after Tolkien's text and his watercolour 'The Hill: Hobbiton-across-the Water' (used for proportion and
arrangement only). The whole Shire is forty leagues across; this is the heart of it, a few miles of the
Westfarthing - "more or less a Warwickshire village of about the period of Queen Victoria's Diamond Jubilee":

  the Hill      a tall round hill with a tree on top, north of the Water; its south face is terraced, and the
                holes are dug into it in rows - Bag End near the top, Bagshot Row lower down, gardens in strips
                below them
  the Water     "no more than a winding black ribbon, bordered with leaning alder-trees", running east
  the mill      on the Water by the bridge at the foot of the Hill; the Old Grange above it
  the lane      from the bridge, winding up round the east side of the Hill to Bag End
  the Party Field and the Party Tree, below the Hill
  Bywater       a mile south-east of the bridge by the Bywater Road, round its Pool; the Green Dragon at the
                northern end of it
  the East Road across the south of the map
  and fields, hedges, orchards and copses everywhere else

x is east, z is south. Writes data/cities/shire-osm.json (the ground, for the engine), data/cities/shire-plan.json
(where everything is, for src/shire/) and data/cities/shire-fields.png (the patchwork, for the ground shader).
"""
import json
import math
import os
import random
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "shire-osm.json")
PLAN = os.path.join(ROOT, "data", "cities", "shire-plan.json")
FIELDS = os.path.join(ROOT, "data", "cities", "shire-fields.png")
R = random.Random(1420)                          # the year of the great harvest

HX, HZ = 2600.0, 2100.0
STEP = 8
PX = 4.0                                         # metres a pixel in the field map

HILL = (-120.0, -560.0)                          # the top of the Hill
BRIDGE = (0.0, 0.0)
POOL = (1480.0, 640.0)
ROAD_Z = 1500.0                                  # the East Road, roughly

# The Water, west to east: under the Hill, through Hobbiton by the bridge, round to Bywater Pool and on.
WATER = [(-2700, -420), (-2100, -300), (-1500, -210), (-900, -120), (-420, -40), (0, 0), (380, 60),
         (820, 220), (1180, 430), (1420, 600), (1560, 690), (1900, 820), (2300, 900), (2700, 960)]


def smooth(a, b, v):
    if a == b:
        return 0.0
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


_P = [R.random() for _ in range(4096)]


def vn(x, z):
    xi, zi = math.floor(x), math.floor(z)
    xf, zf = x - xi, z - zi
    h = lambda i, j: _P[(i * 73 + j * 151 + (i * j) % 97) & 4095]
    u, v = xf * xf * (3 - 2 * xf), zf * zf * (3 - 2 * zf)
    return (h(xi, zi) * (1 - u) * (1 - v) + h(xi + 1, zi) * u * (1 - v) + h(xi, zi + 1) * (1 - u) * v
            + h(xi + 1, zi + 1) * u * v)


def fbm(x, z):
    return vn(x, z) * 0.5 + vn(x * 2.03 + 7, z * 2.03 + 3) * 0.25 + vn(x * 4.1 + 1, z * 4.1 + 9) * 0.125


def seg_dist(px, pz, ax, az, bx, bz):
    dx, dz = bx - ax, bz - az
    L = dx * dx + dz * dz
    t = 0.0 if L == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L))
    return math.hypot(px - ax - t * dx, pz - az - t * dz), t


def line_dist(px, pz, pts):
    best, bi, bt = 1e9, 0, 0.0
    for i in range(len(pts) - 1):
        d, t = seg_dist(px, pz, *pts[i], *pts[i + 1])
        if d < best:
            best, bi, bt = d, i, t
    return best, bi, bt


def water_level(x):
    # the Water falls a few metres across the map; the Pool holds it level at Bywater
    return 96.0 - 0.0016 * (x + 2700)


# ---------------------------------------------------------------------------------------------- the ground
def hill(x, z):
    dx, dz = (x - HILL[0]) / 1.0, (z - HILL[1]) / 0.92
    r = math.hypot(dx, dz)
    h = 74 * math.exp(-(r / 255.0) ** 2.4) + 8 * math.exp(-(r / 520.0) ** 2)
    # (the rows of holes are cut in by cut_height in main(), where the holes are known)
    return h


def terrain_height(x, z):
    base = 104 + 14 * (fbm(x * 0.0011 + 3, z * 0.0011) - 0.5) * 2 + 5 * (fbm(x * 0.004, z * 0.004 + 5) - 0.5) * 2
    base += 10 * smooth(900, 1900, z) * (fbm(x * 0.0015 + 9, 2.0))               # the rise the East Road runs on
    base -= 8 * smooth(-1200, -2100, z)                                           # falling away north
    h = base + hill(x, z)
    # the Water's valley: a broad shallow trough, and the channel in the bottom of it
    d, _, _ = line_dist(x, z, WATER)
    wl = water_level(x)
    trough = wl + 2.2 + (h - wl - 2.2) * smooth(18, 180, d)
    h = min(h, trough) if d < 180 else h
    if d < 5.5:
        h = min(h, wl - 1.4 * (1 - (d / 5.5) ** 2))
    # Bywater Pool
    pd = math.hypot((x - POOL[0]) / 110.0, (z - POOL[1]) / 70.0)
    if pd < 1.6:
        pl = water_level(POOL[0])
        h = min(h, pl - 1.8 * max(0.0, 1 - pd) + (h - pl + 1.8) * smooth(1.0, 1.6, pd))
    return h


# ---------------------------------------------------------------------------------------------- the fields
# English enclosure: irregular quadrilaterals, their hedges running in two families of lines that wander.
# u and v are coordinates turned 14 degrees and warped by noise; a hedge is a line of constant u or v.
ROT = math.radians(14)
SPAN = 210.0


def uv(x, z):
    c, s = math.cos(ROT), math.sin(ROT)
    u = x * c + z * s
    v = -x * s + z * c
    u += 80 * (fbm(x * 0.0015 + 1, z * 0.0015) - 0.5) * 2 + 25 * (fbm(x * 0.006 + 5, z * 0.006) - 0.5) * 2
    v += 80 * (fbm(x * 0.0015 + 4, z * 0.0015 + 2) - 0.5) * 2 + 25 * (fbm(x * 0.006 + 2, z * 0.006 + 8) - 0.5) * 2
    return u, v


# the lines the hedges run on: uneven, a hundred to three hundred and forty metres apart
def _bounds(seed):
    rr = random.Random(seed)
    b, x = [], -5200.0
    while x < 5200:
        b.append(x)
        x += rr.uniform(100, 340)
    return b


UB, VB = _bounds(11), _bounds(23)


def _idx(b, v):
    lo, hi = 0, len(b) - 1
    while lo < hi:
        m = (lo + hi + 1) // 2
        if b[m] <= v:
            lo = m
        else:
            hi = m - 1
    return lo


def cell(x, z):
    u, v = uv(x, z)
    return _idx(UB, u), _idx(VB, v)


KINDS = [("pasture", 0.4), ("pasture2", 0.12), ("hay", 0.14), ("wheat", 0.1), ("barley", 0.07), ("plough", 0.05),
         ("roots", 0.06), ("fallow", 0.06)]
COL = {"pasture": (106, 148, 64), "pasture2": (122, 158, 72), "hay": (150, 162, 84), "wheat": (196, 176, 96),
       "barley": (176, 172, 108), "plough": (128, 102, 76), "roots": (90, 128, 60), "fallow": (138, 146, 90),
       "meadow": (116, 156, 70),
       "garden": (96, 140, 60), "green": (112, 164, 72), "village": (120, 150, 80), "orchard": (110, 150, 66)}
_kind = {}


def field_kind(ci):
    if ci not in _kind:
        r = random.Random(hash(ci) & 0xffffffff).random()
        acc = 0
        for k, p in KINDS:
            acc += p
            if r <= acc:
                _kind[ci] = k
                break
        else:
            _kind[ci] = "pasture"
    return _kind[ci]


def zone(x, z):
    """What a place is before it is a field: the Hill, the village, the water meadows, the Pool."""
    wob = 70 * (fbm(x * 0.008 + 3, z * 0.008) - 0.5) * 2
    if math.hypot((x - HILL[0]) / 1.0, (z - HILL[1]) / 0.92) < 400 + wob:
        return "hill"
    if math.hypot(x - 0, z - 60) < 330 + wob or math.hypot((x - 1330) / 1.4, z - 760) < 300 + wob:
        return "village"
    d, _, _ = line_dist(x, z, WATER)
    if d < 45:
        return "meadow"
    return None


def main():
    out = {"attribution": "The Shire: fan geometry generated by tools/make-shire.py after Tolkien's text and "
                          "drawings; no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [-HZ / 111132, -HX / 111320, HZ / 111132, HX / 111320]}
    q = lambda v: int(round(v * 10))
    H = terrain_height

    # ---------------------------------------------------------------- the Hill's holes
    def on_contour(level, a0, a1, n, jitter=0.0):
        """n points round the Hill's south face at a height, between two bearings (0 = due south)."""
        pts = []
        for k in range(n):
            a = a0 + (a1 - a0) * (k + 0.5 + R.uniform(-jitter, jitter)) / n
            lo, hi = 20.0, 520.0
            for _ in range(40):
                m = (lo + hi) / 2
                x, z = HILL[0] + math.sin(a) * m, HILL[1] + math.cos(a) * m * 0.92
                if H(x, z) > level:
                    lo = m
                else:
                    hi = m
            x, z = HILL[0] + math.sin(a) * lo, HILL[1] + math.cos(a) * lo * 0.92
            face = math.atan2(math.sin(a), math.cos(a) * 0.92)      # facing out of the Hill, downhill
            pts.append((x, z, H(x, z), face))
        return pts

    top = H(*HILL)
    holes = []
    DOORS = ["#2f6a34", "#b8423a", "#2f5f8a", "#d4a73a", "#6a3a6a", "#3a7a6a", "#c0703a", "#4a8a3a", "#a83a5a"]
    be = on_contour(top - 9, -0.05, 0.05, 1)[0]
    holes.append({"name": "Bag End", "x": round(be[0], 1), "z": round(be[1], 1), "y": round(be[2], 1),
                  "face": round(be[3], 3), "door": "#2f6a34", "size": 1.35, "windows": 5, "bagEnd": True})
    for i, p in enumerate(on_contour(top - 14, -0.95, -0.2, 6, 0.2) + on_contour(top - 14, 0.25, 0.8, 4, 0.2)):
        holes.append({"x": round(p[0], 1), "z": round(p[1], 1), "y": round(p[2], 1), "face": round(p[3], 3),
                      "door": DOORS[i % len(DOORS)], "size": 1.0, "windows": R.choice([2, 2, 3, 4])})
    for i, p in enumerate(on_contour(top - 38, -0.85, 0.75, 11, 0.25)):
        holes.append({"row": "Bagshot Row", "x": round(p[0], 1), "z": round(p[1], 1), "y": round(p[2], 1),
                      "face": round(p[3], 3), "door": DOORS[(i + 3) % len(DOORS)], "size": 0.95,
                      "windows": R.choice([1, 2, 2, 3])})
    # holes in the banks along the lanes and round the edges of Hobbiton and Bywater
    for k in range(26):
        for _ in range(60):
            x, z = R.uniform(-900, 1800), R.uniform(-300, 1000)
            gx = (H(x + 4, z) - H(x - 4, z)) / 8
            gz = (H(x, z + 4) - H(x, z - 4)) / 8
            sl = math.hypot(gx, gz)
            if sl < 0.07 or zone(x, z) in ("hill",) or line_dist(x, z, WATER)[0] < 60:
                continue
            if any(math.hypot(x - h2["x"], z - h2["z"]) < 60 for h2 in holes):
                continue
            face = math.atan2(-gx, -gz)
            holes.append({"x": round(x, 1), "z": round(z, 1), "y": round(H(x, z), 1), "face": round(face, 3),
                          "door": DOORS[k % len(DOORS)], "size": 0.9, "windows": R.choice([1, 2, 2])})
            break

    # ---------------------------------------------------------------- cutting the holes in
    # A hole is dug into a slope: level ground in front of the door for the garden, and a bank behind that
    # rises well over the face of it. Without the cut, a hole near the top of the Hill (Bag End is) stands on
    # nearly level ground and its face is a drum set down on the grass.
    cuts = []
    for h2 in holes:
        s2 = h2["size"]
        W2 = (3.8 + h2["windows"] * 1.05) * s2
        GD = (9 if h2.get("bagEnd") else 6) * s2
        cuts.append((h2["x"], h2["z"], h2["y"], math.sin(h2["face"]), math.cos(h2["face"]), W2, GD, 2.7 * s2))

    def cut_height(x, z):
        h = terrain_height(x, z)
        for cx, cz, cy, fx, fz, W2, GD, Hf in cuts:
            dx, dz = x - cx, z - cz
            if abs(dx) > 40 or abs(dz) > 40:
                continue
            w = dx * fx + dz * fz                    # out of the hill
            u = dx * fz - dz * fx                    # across
            half = W2 / 2 + 3
            side = smooth(half + 6, half, abs(u))
            if -1 < w < GD + 3:                      # the garden: level with the door
                k = side * smooth(GD + 3, GD, w)
                h = h + (cy - 0.15 - h) * k
            if -14 < w <= 1:                         # the bank: earth over the face, falling back into the hill
                bank = cy + Hf + 1.2 - 0.25 * max(0.0, -w - 2) ** 1.2
                k = side * smooth(-14, -2, w) * (1 if w < 0.2 else 0)
                if bank > h:
                    h = h + (bank - h) * k
        return h

    nx, nz = int(2 * HX) // STEP + 2, int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(cut_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # ---------------------------------------------------------------- what stands above ground
    sites = {"hill": {"x": HILL[0], "z": HILL[1], "y": round(top, 1)}, "bridge": {"x": 0, "z": 0, "y": round(water_level(0), 2)},
             "mill": {"x": 26, "z": -16, "y": round(water_level(26), 2), "turn": round(math.atan2(60, 380), 3)},
             "grange": {"x": -70, "z": -150, "y": round(H(-70, -150), 1)},
             "partyTree": {"x": -330, "z": -250, "y": round(H(-330, -250), 1)},
             "pool": {"x": POOL[0], "z": POOL[1], "rx": 110, "rz": 70, "y": round(water_level(POOL[0]), 2)},
             "greenDragon": {"x": 1190, "z": 560, "y": round(H(1190, 560), 1)}}
    houses = []

    def house(x, z, kind, rot=None, w=None, d=None):
        if any(math.hypot(x - o["x"], z - o["z"]) < 22 for o in houses):
            return
        if line_dist(x, z, WATER)[0] < 14:
            return
        gx = (H(x + 4, z) - H(x - 4, z)) / 8
        gz = (H(x, z + 4) - H(x, z - 4)) / 8
        houses.append({"x": round(x, 1), "z": round(z, 1), "y": round(H(x, z), 1), "kind": kind,
                       "rot": round(rot if rot is not None else math.atan2(-gx, -gz) + R.uniform(-0.2, 0.2), 3),
                       "w": round(w or R.uniform(9, 14), 1), "d": round(d or R.uniform(6, 8), 1),
                       "roof": R.choice(["tile", "tile", "tile", "thatch"])})
    # Hobbiton over the bridge: a few houses along the lane and round the Grange
    for k in range(10):
        a = R.uniform(0, math.tau)
        house(40 + math.cos(a) * R.uniform(80, 260), -60 + math.sin(a) * R.uniform(50, 180), "house")
    # Bywater: along the road south of the Pool
    for k in range(26):
        t = R.uniform(0, 1)
        x = 1180 + t * 560
        z = 730 + 70 * math.sin(t * 3) + R.choice([-1, 1]) * R.uniform(24, 60)
        house(x, z, "house")
    # farms out in the fields
    farms = []
    for k in range(9):
        for _ in range(80):
            x, z = R.uniform(-2300, 2300), R.uniform(-1800, 1800)
            if zone(x, z) or any(math.hypot(x - f[0], z - f[1]) < 500 for f in farms) or abs(z - ROAD_Z) < 60:
                continue
            farms.append((x, z))
            rot = R.uniform(0, math.tau)
            house(x, z, "farmhouse", rot, 16, 8)
            house(x + math.cos(rot) * 26, z + math.sin(rot) * 26, "barn", rot + math.pi / 2, 22, 10)
            break

    # ---------------------------------------------------------------- lanes and roads
    lanes = []

    def lane(pts, w, name="", kind="lane"):
        lanes.append({"n": name, "w": w, "k": kind, "p": [[round(x, 1), round(z, 1)] for x, z in pts]})

    # up the Hill: from the bridge north past the mill and the Grange, round the east side, and back west to Bag End
    up = [BRIDGE, (10, -60), (30, -140), (70, -240), (120, -340), (110, -440)]
    a0 = math.atan2(up[-1][0] - HILL[0], (up[-1][1] - HILL[1]) / 0.92)
    for k in range(1, 9):
        a = a0 - k * 0.09
        r = 190 - k * 8
        up.append((HILL[0] + math.sin(a) * r, HILL[1] + math.cos(a) * r * 0.92))
    up.append((be[0] + 6, be[1] + 8))
    lane(up, 4.5, "The Hill lane")
    # Bagshot Row, along the lower terrace
    bs = [h for h in holes if h.get("row") == "Bagshot Row"]
    lane([(h["x"] + math.sin(h["face"]) * 9, h["z"] + math.cos(h["face"]) * 9) for h in sorted(bs, key=lambda h: h["x"])], 3,
         "Bagshot Row")
    # the Bywater Road, a mile south-east to the Green Dragon and the Pool, and on to the East Road
    bw = [BRIDGE, (160, 120), (380, 250), (620, 380), (860, 470), (1060, 530), (1190, 585), (1320, 680),
          (1480, 760), (1640, 800), (1820, 900), (1980, 1150), (2080, ROAD_Z)]
    lane(bw, 5, "The Bywater Road")
    # the Great East Road
    er = [(-2700, ROAD_Z - 80)]
    for x in range(-2400, 2800, 300):
        er.append((x, ROAD_Z + 60 * math.sin(x / 900.0)))
    lane(er, 7, "The Great East Road", "road")
    # west along the Water, and over it by a plank bridge (the way Frodo went)
    lane([BRIDGE, (-200, -10), (-500, -20), (-800, -60), (-1000, -140), (-1100, -60), (-1300, 150), (-1500, 500),
          (-1700, 900), (-1900, ROAD_Z)], 3, "The lane west")
    # farm tracks
    for fx, fz in farms:
        d, i, t = line_dist(fx, fz, er)
        tx = er[i][0] + (er[i + 1][0] - er[i][0]) * t
        tz = er[i][1] + (er[i + 1][1] - er[i][1]) * t
        best = min([(line_dist(fx, fz, L["p"])[0], L) for L in lanes if L["k"] != "road"] + [(d, None)], key=lambda q2: q2[0])
        if best[1] is None:
            lane([(fx, fz), ((fx + tx) / 2 + 40, (fz + tz) / 2), (tx, tz)], 2.6, "", "track")
        else:
            d2, i2, t2 = line_dist(fx, fz, best[1]["p"])
            p = best[1]["p"]
            lane([(fx, fz), (p[i2][0] + (p[i2 + 1][0] - p[i2][0]) * t2, p[i2][1] + (p[i2 + 1][1] - p[i2][1]) * t2)], 2.6, "", "track")

    # ---------------------------------------------------------------- the patchwork, and the hedges between it
    W, Hh = int(2 * HX / PX), int(2 * HZ / PX)
    img = Image.new("RGBA", (W, Hh))
    px = img.load()
    lane_near = lambda x, z: min(line_dist(x, z, L["p"])[0] - L["w"] for L in lanes) if lanes else 1e9
    for j in range(Hh):
        z = -HZ + (j + 0.5) * PX
        for i in range(W):
            x = -HX + (i + 0.5) * PX
            zn = zone(x, z)
            a = 0
            if zn == "hill":
                # the gardens in strips below the rows of holes, bright; the rest of the Hill is grass
                hh = H(x, z) - (top - 82)
                ang = math.atan2(x - HILL[0], z - HILL[1])
                plot = int((ang + 3.2) / 0.16)
                strip = (hh > 18 and hh < 36 and abs(ang) < 0.95 and plot % 4 != 3)
                if strip:
                    k = int((x + 2000) // 7) % 6
                    c = [(170, 90, 70), (200, 150, 70), (90, 150, 60), (120, 110, 170), (210, 190, 90), (100, 160, 110)][k]
                    a = 40
                else:
                    c = COL["green"]
            elif zn == "village":
                c = COL["village"]
            elif zn == "meadow":
                c = COL["meadow"]
            else:
                ci = cell(x, z)
                k = field_kind(ci)
                c = COL[k]
                r2 = random.Random(hash(ci) & 0xffffffff)
                r2.random()
                ang = int(r2.random() * 200) + 50        # the direction of the rows, 50..250 (0 means no rows)
                a = ang if k in ("wheat", "barley", "plough", "roots", "hay") else 0
                shade = 0.9 + 0.2 * r2.random()
                c = tuple(max(0, min(255, int(v * shade))) for v in c)
            px[i, j] = (c[0], c[1], c[2], a if a else 255)
    img.save(FIELDS, optimize=True)

    # the hedges: every line of constant u and v, in pieces, with some pieces left out so fields join up
    hedges = []

    def trace(fixed_is_u, k):
        pts = []
        # walk along the other coordinate; find the point where the fixed coordinate equals k*span
        c, s = math.cos(ROT), math.sin(ROT)
        if abs(k) > 3800:
            return []
        for tt in range(-3600, 3600, 20):
            # a first guess in unwarped coordinates, then correct for the warp
            if fixed_is_u:
                u0, v0 = k, tt
            else:
                u0, v0 = tt, k
            x, z = u0 * c - v0 * s, u0 * s + v0 * c
            for _ in range(6):
                u, v = uv(x, z)
                du = (u0 - u) if fixed_is_u else 0
                dv = (v0 - v) if not fixed_is_u else 0
                x += du * c - dv * s
                z += du * s + dv * c
            if abs(x) < HX - 5 and abs(z) < HZ - 5:
                pts.append((x, z))
            else:
                pts.append(None)
        return pts

    for fixed_is_u in (True, False):
        for bnd in (UB if fixed_is_u else VB):
            pts = trace(fixed_is_u, bnd)
            run = []
            for p in pts + [None]:
                ok = p is not None and not zone(*p) and lane_near(*p) > 3 and abs(p[1] - ROAD_Z) > 20
                if ok and R.random() < 0.985:
                    run.append(p)
                else:
                    if len(run) > 3 and R.random() < 0.72:
                        hedges.append([[round(x, 1), round(z, 1)] for x, z in run])
                    run = []
    # hedges along both sides of the Bywater Road and the lanes, where they run between fields
    for L in lanes:
        if L["k"] == "track":
            continue
        p = L["p"]
        for sd in (-1, 1):
            side = []
            for i in range(len(p) - 1):
                (ax, az), (bx, bz) = p[i], p[i + 1]
                n = max(1, int(math.hypot(bx - ax, bz - az) / 12))
                ln = math.hypot(bx - ax, bz - az) or 1
                nx, nz = -(bz - az) / ln, (bx - ax) / ln
                for s in range(n):
                    t = s / n
                    x, z = ax + (bx - ax) * t + nx * sd * (L["w"] / 2 + 2.5), az + (bz - az) * t + nz * sd * (L["w"] / 2 + 2.5)
                    zz = zone(x, z)
                    if zz == "village" or (zz == "hill" and L["n"] != "The Hill lane"):
                        continue
                    side.append((x, z))
            if len(side) > 2:
                hedges.append([[round(x, 1), round(z, 1)] for x, z in side])

    # orchards and copses
    orchards, copses = [], []
    for k in range(8):
        for _ in range(60):
            x, z = R.uniform(-1500, 2200), R.uniform(-900, 1300)
            if zone(x, z) or lane_near(x, z) < 20:
                continue
            orchards.append({"x": round(x, 1), "z": round(z, 1), "w": R.uniform(60, 120), "d": R.uniform(50, 90),
                             "rot": round(ROT + R.choice([0, math.pi / 2]), 3)})
            break
    for k in range(22):
        for _ in range(60):
            x, z = R.uniform(-2500, 2500), R.uniform(-2000, 2000)
            if zone(x, z) or lane_near(x, z) < 20 or math.hypot(x - HILL[0], z - HILL[1]) < 600:
                continue
            copses.append({"x": round(x, 1), "z": round(z, 1), "r": round(R.uniform(50, 160), 1)})
            break

    water = [[round(x, 1), round(z, 1), round(water_level(x), 2), round(4.5 + 2 * math.sin(x / 400.0), 1)] for x, z in WATER]
    plan = {"_": "the plan of Hobbiton and Bywater, written by tools/make-shire.py: read by src/shire/",
            "water": water, "sites": sites, "holes": holes, "houses": houses, "lanes": lanes, "hedges": hedges,
            "orchards": orchards, "copses": copses, "farms": [[round(x, 1), round(z, 1)] for x, z in farms],
            "fields": {"image": "data/cities/shire-fields.png", "x0": -HX, "z0": -HZ, "w": 2 * HX, "d": 2 * HZ}}
    for k in ("water", "lake", "islands", "marina", "beach", "pier", "waterways", "areas", "rail", "stations",
              "buildings", "trees", "roads"):
        out[k] = []
    out["pois"] = [{"n": "Bag End", "x": q(be[0]), "z": q(be[1]), "k": "hall", "ang": 0}]
    json.dump(out, open(OUT, "w"), separators=(",", ":"))
    json.dump(plan, open(PLAN, "w"), separators=(",", ":"))
    t = out["terrain"]
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; terrain {t['nx']}x{t['nz']} at {STEP} m, "
          f"{min(t['h'])/10:.0f} to {max(t['h'])/10:.0f} m")
    print(f"wrote {PLAN}: {os.path.getsize(PLAN)/1e3:.0f} KB; {len(holes)} holes, {len(houses)} houses, "
          f"{len(lanes)} lanes, {len(hedges)} hedges, {len(orchards)} orchards, {len(copses)} copses")
    print(f"wrote {FIELDS}: {os.path.getsize(FIELDS)/1e3:.0f} KB, {W}x{Hh}")


if __name__ == "__main__":
    main()
