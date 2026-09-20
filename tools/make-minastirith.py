#!/usr/bin/env python3
"""Generate Minas Tirith and the Pelennor as a city data file the OSM engine can read.

    python3 tools/make-minastirith.py

Fan work from Tolkien, whose work belongs to the Tolkien Estate; nothing from any book, film or game is used.
Every shape here is generated from the published description and the geometry is this project's own.

The city is the description taken literally, because the description is unusually exact and what it describes
is a piece of engineering:

  seven walls, each on its own tier, and the tier behind each wall stands a hundred feet above the one below
  so the Citadel is seven hundred feet over the Pelennor, and the White Tower another three hundred over that
  a shoulder of Mount Mindolluin comes out through the city as a keel of rock, standing as high as the Citadel
  the road up is cut round that rock, so each gate faces the other way from the one below it and no gate
  can be seen from the gate under it; twice the road goes through the rock in a tunnel
  the Great Gate faces east, out over the Pelennor towards Osgiliath and the Anduin
  the Pelennor is walled townland, the Rammas Echor, with the Causeway Forts where the road comes through it

So the generator is mostly one loop over seven tiers. Everything else - the mountain behind, the townlands in
front, the river at the edge of the map, the quays at the Harlond, the ruin of Osgiliath on the far bank - is
there to give the city something to stand in front of and a reason to be facing the way it is.

Scale: 24 km east to west, 20 km north to south, terrain every 50 m. The city is 1.4 km across at the outer
wall, which is small; that is the point of it, the same way Barad-dur is a splinter on the Mordor map.
"""
import json
import math
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "minastirith-osm.json")
R = random.Random(3019)

HX, HZ = 12000.0, 10000.0        # half-extents: 24 x 20 km
STEP = 50                        # the height grid, in metres

PLAIN = 40.0                     # the Pelennor, above the river
RIVER_X = 8600.0                 # the Anduin runs north-south down the east of the map
TIERS = 7
R_OUT = 520.0                    # the outer wall: the city is a kilometre across, not two
R_STEP = 66.0                    # each wall is this much further in
LIFT = 30.0                      # and its tier this much higher: 100 feet, near enough
CITY_BASE = PLAIN + 36.0         # the ground the first wall stands on: the spur, above the fields
CIT = CITY_BASE + TIERS * LIFT   # the Citadel: seven hundred feet over the Pelennor
TOWER = 91.0                     # the White Tower: fifty fathoms over the Citadel
MOUNT = (-6200.0, 400.0)         # Mindolluin, west of the city
KEEL_X = 450.0                   # the point of the rock, just inside the outer wall
RAMMAS = 6400.0                  # the Rammas Echor, round the townlands
HARLOND = (7300.0, 3100.0)       # the quays, downstream on the near bank
OSGILIATH = (10300.0, -300.0)    # the ruin, astride the river at the map's edge


def q(v):
    return int(round(v * 10))


def flat(pts):
    out = []
    for x, z in pts:
        out += [q(x), q(z)]
    return out


def rect(cx, cz, w, d, rot=0.0):
    c, s = math.cos(rot), math.sin(rot)
    return [(cx + x * c - z * s, cz + x * s + z * c) for x, z in
            ((-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2))]


def ring_poly(cx, cz, r, n=64, r2=None):
    """A circle, or an annulus drawn as one closed ring: out along the far edge and back along the near one."""
    out = [(cx + math.cos(k / n * math.tau) * r, cz + math.sin(k / n * math.tau) * r) for k in range(n)]
    if r2 is None:
        return out
    out.append(out[0])
    out += [(cx + math.cos(k / n * math.tau) * r2, cz + math.sin(k / n * math.tau) * r2)
            for k in range(n, -1, -1)]
    return out


def arc(cx, cz, r, a0, a1, n=None, width=None):
    """A length of wall as a footprint: an arc thickened to `width`, or just the line of it."""
    n = n or max(3, int(abs(a1 - a0) * r / 14))
    outer = [(cx + math.cos(a0 + (a1 - a0) * k / n) * r, cz + math.sin(a0 + (a1 - a0) * k / n) * r)
             for k in range(n + 1)]
    if width is None:
        return outer
    inner = [(cx + math.cos(a0 + (a1 - a0) * k / n) * (r - width),
              cz + math.sin(a0 + (a1 - a0) * k / n) * (r - width)) for k in range(n, -1, -1)]
    return outer + inner


def smoothstep(a, b, v):
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def seg_dist(px, pz, ax, az, bx, bz):
    dx, dz = bx - ax, bz - az
    L = dx * dx + dz * dz
    t = 0.0 if L == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L))
    return math.hypot(px - ax - t * dx, pz - az - t * dz)


def path_dist(x, z, path):
    best = 1e18
    for i in range(len(path) - 1):
        d = seg_dist(x, z, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1])
        if d < best:
            best = d
    return best


# ---------------------------------------------------------------- the land

def tier_of(x, z):
    """Which tier a point stands on: 0 on the Pelennor, 7 on the Citadel."""
    d = math.hypot(x, z)
    for k in range(TIERS):
        if d > R_OUT - k * R_STEP:
            return k
    return TIERS


def terrain_height(x, z):
    d = math.hypot(x, z)

    # Mindolluin, and the shoulder that comes down off it to carry the city
    h = PLAIN
    mt = math.hypot((x - MOUNT[0]) * 1.0, (z - MOUNT[1]) * 1.15)
    # A smoothstep dome is what a hill looks like, and Mindolluin is not a hill. The mass goes up steeply
    # (the power under 1), then three ridges are thrown out east off the summit with gullies between them,
    # and the whole thing is serrated by two noise waves so the skyline is peaks and saddles rather than a
    # bell. The city's spur is the lowest of those ridges.
    m = smoothstep(5600, 700, mt)
    h += 2500 * (m ** 0.62)
    h += 620 * smoothstep(8200, 3400, mt)
    if m > 0.02:
        ang = math.atan2(z - MOUNT[1], x - MOUNT[0])
        spine = (math.sin(ang * 3.0 + 0.7) * 0.55 + math.sin(ang * 7.0 - 1.4) * 0.28)
        h += 520 * m * spine
        h += 210 * m * (math.sin(x / 640.0 + z / 520.0) * 0.6 + math.sin(x / 265.0 - z / 310.0) * 0.4)
    # The shoulder the city stands on: it comes down off the mountain from the west, narrows, and stops dead
    # at the city. East of the walls there is nothing but the Pelennor - the Great Gate opens onto flat
    # ground, which is the whole reason a besieging army camps in front of it.
    spur = smoothstep(500, -2800, x) * smoothstep(3200, 1100, abs(z))
    h += 680 * spur

    # the townlands fall away gently east to the river, and the river cuts through them
    h -= 26 * smoothstep(0, RIVER_X, x)
    rv = abs(x - RIVER_X - 260 * math.sin(z / 2600.0))
    h = h * (1 - smoothstep(620, 190, rv)) + (-7.0) * smoothstep(620, 190, rv)

    # the roll of the fields, and the ditches of the townlands
    h += 5.0 * math.sin(x / 700.0 + 0.4) * math.cos(z / 810.0 - 0.7)

    # the Rammas Echor stands on a bank
    h += 9 * math.exp(-((math.hypot(x, z) - RAMMAS) / 70.0) ** 2) * smoothstep(0, 400, x + RAMMAS)

    # ---- the city itself: seven steps, and the keel of rock through them ----
    # The tiers are absolute heights, not something added to whatever the land was doing here. Adding them put
    # the city on top of the spur's own two hundred and fifty metres and then built seven hundred feet on top
    # of that, so the Pelennor in front of the Great Gate stood higher than the gate did and the camera at any
    # viewpoint outside the walls was underground looking up through the back of the world.
    if d < R_OUT + 900:
        t = smoothstep(R_OUT + 900, R_OUT + 120, d)
        h = h * (1 - t) + min(h, CITY_BASE) * t     # the land is levelled into the city's own base
    if d < R_OUT + 130:
        step = CITY_BASE
        for k in range(TIERS):
            step += LIFT * smoothstep(R_OUT - k * R_STEP + 16, R_OUT - k * R_STEP - 16, d)
        h = max(h, step)

    # the keel: a wall of rock from the mountain out to its point inside the Great Gate, level with the
    # Citadel the whole way and cut off sheer at the end, which is the prow the city is built around
    kz = abs(z)
    keel = smoothstep(96, 30, kz) * smoothstep(KEEL_X + 40, KEEL_X - 30, x) * smoothstep(-3400, -2600, x)
    if keel > 0:
        h = h * (1 - keel) + max(CIT + 6, h) * keel

    h *= smoothstep(HX, HX - 900, abs(x)) * smoothstep(HZ, HZ - 900, abs(z))
    return h


# ---------------------------------------------------------------- the city

def gate_angle(k):
    """Where the gate through wall k stands. The Great Gate faces east; every gate above it is round the
    other side of the rock from the one below, which is why you cannot see one from the other."""
    if k == 0:
        return 0.0
    side = 1 if k % 2 else -1
    return side * (0.62 + 0.20 * k)


def main():
    out = {"attribution": "Minas Tirith: fan geometry generated by tools/make-minastirith.py; "
                          "no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [43.0, 5.0],
           "bounds": [42.91004, 4.85289, 43.08996, 5.14711]}

    nx = int(2 * HX) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # ---------- the Anduin ----------
    east = []
    west = []
    for j in range(-40, 41):
        z = j * (HZ / 40)
        cx = RIVER_X + 260 * math.sin(z / 2600.0)
        west.append((cx - 240, z))
        east.append((cx + 240, z))
    out["water"] = [{"o": flat(west + east[::-1]), "i": [], "n": "Anduin"}]
    out["lake"] = []
    out["islands"] = []
    out["marina"], out["beach"] = [], []
    out["pier"] = [{"o": flat(rect(HARLOND[0], HARLOND[1] + k * 90, 150, 26)), "i": []} for k in range(4)]
    out["waterways"] = [{"n": "Anduin", "p": flat([(RIVER_X + 260 * math.sin(z / 2600.0), z)
                                                   for z in range(-10000, 10001, 400)])}]

    # ---------- roads ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    # the road up: a switchback between each pair of gates, round whichever side of the rock is open
    for k in range(TIERS):
        r0 = R_OUT - k * R_STEP
        r1 = R_OUT - (k + 1) * R_STEP
        a0 = gate_angle(k)
        a1 = gate_angle(k + 1) if k + 1 < TIERS else gate_angle(k) * -0.4
        pts = []
        n = 22
        for i in range(n + 1):
            t = i / n
            a = a0 + (a1 - a0) * t
            rr = r0 - (r0 - r1) * t
            pts.append((math.cos(a) * rr, math.sin(a) * rr))
        road(pts, "primary", 9, f"The Way, {k + 1}st Circle" if k == 0 else f"The Way, {k + 1}th Circle")

    # the ring streets of each tier, and the lanes off them
    for k in range(TIERS):
        r0 = R_OUT - k * R_STEP - 26
        road(ring_poly(0, 0, r0, 48) + [(r0, 0)], "secondary", 6, f"{k + 1} Circle")
        for j in range(9):
            a = j / 9 * math.tau + 0.2 * k
            road([(math.cos(a) * (r0 - 6), math.sin(a) * (r0 - 6)),
                  (math.cos(a) * (r0 - R_STEP + 30), math.sin(a) * (r0 - R_STEP + 30))], "residential", 4)

    # the Great Gate out onto the Pelennor, the causeway to Osgiliath, and the Harlond road
    road([(R_OUT, 0), (1400, -40), (3000, -120), (RAMMAS + 60, -180), (9000, -240)], "trunk", 14, "The Causeway")
    road([(1200, 60), (3400, 900), (5600, 2100), (HARLOND[0] - 200, HARLOND[1])], "primary", 10, "Harlond Road")
    road([(900, -260), (2600, -2400), (4200, -5200), (5200, -8800)], "primary", 9, "The South Road")
    road([(700, 300), (1800, 2600), (2200, 5600), (2000, 9200)], "primary", 9, "The North Road")
    # the lanes of the townlands
    for k in range(14):
        a = -1.25 + k * 0.18
        road([(math.cos(a) * 1100, math.sin(a) * 1100), (math.cos(a) * RAMMAS, math.sin(a) * RAMMAS)],
             "residential", 4)
    out["roads"] = roads

    # ---------- the ground of the townlands, and the courts of the city ----------
    # The tiers are paved. Without this the ground inside the walls is whatever colour the fields are, and a
    # stone city on a green hillside reads as a hill with buildings on it rather than as a city.
    areas = [{"k": "plaza", "n": "The Court of the Fountain",
              "o": flat(ring_poly(-40, 0, 120, 28)), "i": []},
             {"k": "plaza", "n": "The Gate Yard", "o": flat(rect(560, 0, 150, 190)), "i": []}]
    for k in range(TIERS):
        areas.append({"k": "plaza", "n": "", "i": [],
                      "o": flat(ring_poly(0, 0, R_OUT - k * R_STEP - 2, 72))})
    for k in range(26):
        a = R.uniform(-1.4, 1.4)
        d = R.uniform(1500, RAMMAS - 500)
        areas.append({"k": "grass", "n": "", "o": flat(rect(math.cos(a) * d, math.sin(a) * d,
                                                            R.uniform(380, 900), R.uniform(300, 700))), "i": []})
    for k in range(10):
        a = R.uniform(-1.1, 1.1)
        d = R.uniform(1800, RAMMAS - 800)
        areas.append({"k": "wood", "n": "", "o": flat(rect(math.cos(a) * d, math.sin(a) * d,
                                                           R.uniform(260, 620), R.uniform(240, 520))), "i": []})
    out["areas"] = areas
    out["rail"] = []
    out["stations"] = []

    # ---------- buildings ----------
    buildings = []

    def put(ring, h, kind=None, colour=None, name=None, roof=None, minh=None):
        b = {"p": flat(ring), "h": round(h, 1)}
        if kind:
            b["t"] = kind
        if colour:
            b["c"] = colour
        if name:
            b["n"] = name
        if roof:
            b["r"] = roof
        if minh:
            b["m"] = round(minh, 1)
        buildings.append(b)

    WALL = "#e6e0cd"          # the white stone, weathered
    SLATE = ["#7b8086", "#6d737a", "#868a8e", "#666c73"]
    HOUSE = ["#ded7c2", "#d4ccb6", "#e8e1ce", "#cac2ad", "#dbd2bb"]

    # ---- the seven walls ----
    # Each wall is one footprint: the arc taken out along its face and back along its back, so it extrudes
    # as a wall rather than as a disc. Every wall is broken for its gate, and the outermost is unbroken
    # black stone, which is the one thing about the first circle the description insists on.
    for k in range(TIERS):
        r0 = R_OUT - k * R_STEP
        base = CITY_BASE + k * LIFT
        top = base + (30 if k == 0 else 21)
        ga = gate_angle(k)
        gap = 0.055 if k == 0 else 0.07
        col = "#3c3b3f" if k == 0 else WALL
        a = ga + gap
        end = ga + math.tau - gap
        # the wall itself, in two lengths so the gateway is a hole in it and not a doorway painted on
        put(arc(0, 0, r0, a, end, width=9 if k else 13), top, "wall", col, roof="f", minh=base - 4)
        # towers on it
        nt = 16 - k
        for t in range(nt):
            ta = a + (end - a) * (t + 0.5) / nt
            put(rect(math.cos(ta) * (r0 - 4), math.sin(ta) * (r0 - 4), 13, 13, ta),
                top + 7, "tower", col, roof="f", minh=base - 4)

    # ---- the keel of rock, and the prow that stands out of the city ----
    # The rock is terrain, but its point is cut sheer, and the Citadel's wall runs out along the top of it
    # to a buttress overhanging the first circle. That buttress is the one thing everyone remembers.
    put(rect(KEEL_X - 62, 0, 120, 74), CIT + 26, "rock", "#8d8a84", roof="f", minh=CIT - 40)
    put(rect(KEEL_X - 30, 0, 44, 40), CIT + 34, "rock", "#96938c", roof="f", minh=CIT + 20)

    # ---- the houses, tier by tier ----
    # Packed tight and low against the wall in front of them, and thinning as they climb: the sixth circle
    # is offices and the seventh is not lived in at all.
    total = 0
    for k in range(TIERS - 1):
        r0 = R_OUT - k * R_STEP - 17
        r1 = R_OUT - (k + 1) * R_STEP + 7
        base = CITY_BASE + k * LIFT
        rows = max(4, int((r0 - r1) / 12))
        for row in range(rows):
            rr = r0 - row * 12 - 4
            n = max(8, int(rr * math.tau / (17 + k * 2)))
            for i in range(n):
                a = i / n * math.tau + row * 0.11 + k * 0.4
                x, z = math.cos(a) * rr, math.sin(a) * rr
                if abs(z) < 118 and -3000 < x < KEEL_X + 40:
                    continue                       # the rock: nothing is built on it
                if abs(a - gate_angle(k)) < 0.10 or abs(a - gate_angle(k) - math.tau) < 0.10:
                    continue                       # the gateway and the yard behind it stay clear
                if R.random() < 0.04:
                    continue
                w = R.uniform(12, 17)
                d = R.uniform(9, 14)
                h = R.uniform(8, 15) + (2.5 if k < 3 else 0)
                put(rect(x, z, w, d, a), base + h, "residential", HOUSE[R.randrange(len(HOUSE))], roof="g")
                total += 1
                if R.random() < 0.18:              # a hall or a guild house, taller and slated
                    put(rect(x, z, w * 1.2, d * 1.2, a), base + h + R.uniform(4, 9), "civic",
                        SLATE[R.randrange(len(SLATE))], roof="g", minh=base + h)

    # ---- the seventh circle: the Citadel ----
    # The Tower is a landmark and is built in src/minastirith/landmarks.js; what is here is the ground it
    # stands on - the hall of the kings behind it, the guard houses either side, the Hallows in the rock.
    put(rect(-210, 0, 150, 210), CIT + 26, "civic", "#d8d2c2", name="The Hall of the Kings", roof="f")
    put(rect(-330, 0, 90, 130), CIT + 18, "civic", "#cdc6b6", roof="f")
    for s in (-1, 1):
        put(rect(-60, s * 150, 70, 34), CIT + 12, "civic", "#cdc6b6", roof="g")
        put(rect(-190, s * 170, 46, 30), CIT + 10, "civic", "#cdc6b6", roof="g")
    put(rect(-520, 0, 60, 90), CIT + 8, "civic", "#b8b2a4", name="The Hallows", roof="f")

    # ---- the Rammas Echor, and the Causeway Forts on the road through it ----
    put(ring_poly(0, 0, RAMMAS, 128, RAMMAS - 7), PLAIN + 3.5, "wall", "#b6ae9c", roof="f", minh=PLAIN - 6)
    for s in (-1, 1):
        put(rect(RAMMAS + 10, s * 70, 44, 44), PLAIN - 4 + 22, "tower", "#b6ae9c",
            name="Causeway Fort", roof="f")

    # ---- the Harlond ----
    for k in range(4):
        put(rect(HARLOND[0] - 130, HARLOND[1] + k * 90, 70, 22), PLAIN - 28 + 9, "industrial", "#a49a86", roof="f")
    put(rect(HARLOND[0] - 210, HARLOND[1] + 140, 90, 60), PLAIN - 28 + 16, "industrial", "#9e9484",
        name="The Harlond", roof="f")

    # ---- Osgiliath, in ruins on both banks ----
    for k in range(120):
        a = R.uniform(0, math.tau)
        rr = R.uniform(60, 1500)
        x = OSGILIATH[0] + math.cos(a) * rr
        z = OSGILIATH[1] + math.sin(a) * rr * 0.8
        if x > HX - 400:
            continue
        h = R.uniform(4, 22)
        put(rect(x, z, R.uniform(8, 26), R.uniform(8, 22), R.uniform(0, math.tau)), -6 + h,
            "ruin", "#8e887c", roof="f")

    # ---- the farms of the townlands ----
    for k in range(150):
        a = R.uniform(-1.45, 1.45)
        d = R.uniform(1200, RAMMAS - 300)
        x, z = math.cos(a) * d, math.sin(a) * d
        h = R.uniform(5, 9)
        put(rect(x, z, R.uniform(10, 20), R.uniform(8, 16), R.uniform(0, math.tau)), PLAIN - 26 * (x / RIVER_X) + h,
            "residential", HOUSE[R.randrange(len(HOUSE))], roof="g")
        if R.random() < 0.5:
            put(rect(x + R.uniform(-22, 22), z + R.uniform(-22, 22), R.uniform(12, 22), R.uniform(8, 14),
                     R.uniform(0, math.tau)), PLAIN - 26 * (x / RIVER_X) + R.uniform(4, 7), "barn", "#8d7f68",
                roof="g")

    out["buildings"] = buildings

    # ---------- trees, and the points of interest ----------
    trees = []
    for k in range(1400):
        a = R.uniform(-1.5, 1.5)
        d = R.uniform(1000, RAMMAS - 200)
        x, z = math.cos(a) * d, math.sin(a) * d
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(3, 7))})
    for k in range(300):                            # the woods on the skirts of Mindolluin
        x = R.uniform(-9000, -3000)
        z = R.uniform(-4000, 4000)
        if terrain_height(x, z) > 900:
            continue
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(4, 8))})
    out["trees"] = trees

    out["pois"] = [{"n": "The Great Gate", "x": q(R_OUT - 6), "z": 0, "k": "gate", "ang": 0},
                   {"n": "The White Tower", "x": q(40), "z": 0, "k": "tower", "ang": 0},
                   {"n": "The Harlond", "x": q(HARLOND[0] - 200), "z": q(HARLOND[1] + 140), "k": "quay", "ang": 0}]

    t = out["terrain"]
    lo = min(t["h"]) / 10.0
    hi = max(t["h"]) / 10.0
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)} "
          f"({total} in the city); roads {len(roads)}; trees {len(trees)}; "
          f"terrain {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f} m to {hi:.0f} m")


if __name__ == "__main__":
    main()
