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
from lib.geo import q, flat, rect, smoothstep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "minastirith-osm.json")
R = random.Random(3019)

HX, HZ = 12000.0, 10000.0        # half-extents: 24 x 20 km
STEP = 50                        # the height grid, in metres

PLAIN = 40.0                     # the Pelennor, above the river
RIVER_X = 8600.0                 # the Anduin runs north-south down the east of the map
TIERS = 7
R_OUT = 520.0                    # the outer wall: the city is a kilometre across, not two
R_STEP = 60.0                    # each wall is this much further in: the Citadel comes out at r=160
LIFT = 30.0                      # and its tier this much higher: 100 feet, near enough
CITY_BASE = PLAIN + 36.0         # the ground the first wall stands on: the spur, above the fields
CIT = CITY_BASE + TIERS * LIFT   # the Citadel: seven hundred feet over the Pelennor
TOWER = 91.0                     # the White Tower: fifty fathoms over the Citadel
MOUNT = (-6200.0, 400.0)         # Mindolluin, west of the city
KEEL_X = 450.0                   # the point of the rock, just inside the outer wall
RAMMAS = 6400.0                  # the Rammas Echor, round the townlands
HARLOND = (7300.0, 3100.0)       # the quays, downstream on the near bank
OSGILIATH = (8600.0, -600.0)     # the ruin, astride the Anduin where the great bridge went


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
    kh = keel_half(x)
    keel = (smoothstep(kh + 22, kh - 4, kz) * smoothstep(KEEL_X + 24, KEEL_X - 40, x)
            * smoothstep(-3400, -2600, x)) if kh > 0 else 0.0
    if keel > 0:
        # Level with the Citadel the whole way, so the court at the top of the city and the top of the rock
        # are one surface, which is what every picture of the place shows.
        h = h * (1 - keel) + max(CIT, h) * keel

    h *= smoothstep(HX, HX - 900, abs(x)) * smoothstep(HZ, HZ - 900, abs(z))
    return h


# ---------------------------------------------------------------- the city

def keel_half(x):
    """Half the width of the rock at this x. It is a blade, not a ridge: eighty metres across where it runs
    through the city, drawing in to a point at the prow and spreading into the mountain behind. The model in
    src/minastirith/landmarks.js builds its faces to exactly this line, so the two cannot disagree."""
    if x > KEEL_X or x < -2600.0:
        return 0.0
    t = max(0.0, min(1.0, (x - 120.0) / (KEEL_X - 120.0)))
    h = 40.0 * (1.0 - 0.62 * t * t)
    if x < -520.0:
        h += min(60.0, (-520.0 - x) * 0.09)
    return h


def rock_half(x):
    """What the city has to keep off: the blade and a few metres either side of it."""
    h = keel_half(x)
    return 0.0 if h <= 0.0 else h + 14.0


def on_rock(x, z):
    h = rock_half(x)
    return h > 0.0 and abs(z) < h


def ring_runs(r0, ga, gap):
    """The lengths of a circle at this radius that are neither the gateway nor inside the rock. This is what
    makes the circles horseshoes rather than rings: a wall that carried straight on across the rock hung in
    mid-air off a cliff, which is exactly what the rock is there to stop."""
    STEPS = 900
    open_ = []
    for i in range(STEPS):
        a = i / STEPS * math.tau
        d = (a - ga) % math.tau
        open_.append(not (d < gap or d > math.tau - gap)
                     and not on_rock(math.cos(a) * r0, math.sin(a) * r0))
    if all(open_):
        return [(0.0, math.tau)]
    start = 0
    while open_[start]:
        start += 1
    runs = []
    run = None
    for j in range(STEPS + 1):
        i = (start + j) % STEPS
        if open_[i]:
            if run is None:
                run = start + j
        elif run is not None:
            runs.append((run / STEPS * math.tau, (start + j) / STEPS * math.tau))
            run = None
    if run is not None:
        runs.append((run / STEPS * math.tau, (start + STEPS) / STEPS * math.tau))
    return [r for r in runs if r[1] - r[0] > 0.06]


def river_cx(z):
    """The middle of the Anduin at this z. The river meanders, and Osgiliath is built on it."""
    return RIVER_X + 260.0 * math.sin(z / 2600.0)


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
    tunnels = []
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
        # The Way goes through the rock and not over it. A ribbon draped on the heightfield climbed the
        # ridge like a ramp and came out forty metres above the roofs; here it is cut where it crosses, and
        # the keel landmark carries a tunnel mouth at each end of the gap.
        name = f"The Way, {k + 1}st Circle" if k == 0 else f"The Way, {k + 1}th Circle"
        runs, cur = [], []
        for (px, pz) in pts:
            if on_rock(px, pz):
                if len(cur) > 1:
                    runs.append(cur)
                    tunnels.append((round(cur[-1][0]), round(cur[-1][1]), k))
                cur = []
            else:
                if not cur and runs:
                    tunnels.append((round(px), round(pz), k))
                cur.append((px, pz))
        if len(cur) > 1:
            runs.append(cur)
        for r in runs:
            road(r, "primary", 9, name)

    # the ring streets of each tier, and the lanes off them
    for k in range(TIERS):
        r0 = R_OUT - k * R_STEP - 26
        for a, end in ring_runs(r0, gate_angle(k), 0.02):
            n = max(3, int((end - a) * r0 / 14))
            road([(math.cos(a + (end - a) * i / n) * r0, math.sin(a + (end - a) * i / n) * r0)
                  for i in range(n + 1)], "secondary", 6, f"{k + 1} Circle")
        for j in range(9):
            a = j / 9 * math.tau + 0.2 * k
            if on_rock(math.cos(a) * (r0 - 6), math.sin(a) * (r0 - 6)):
                continue
            road([(math.cos(a) * (r0 - 6), math.sin(a) * (r0 - 6)),
                  (math.cos(a) * (r0 - R_STEP + 30), math.sin(a) * (r0 - R_STEP + 30))], "residential", 4)

    # the Great Gate out onto the Pelennor, the causeway to Osgiliath, and the Harlond road
    # The Causeway stops on the west bank, where the bridge went; what is left of the bridge is built below.
    road([(R_OUT, 0), (1400, -40), (3000, -120), (RAMMAS + 60, -180), (8050, -400)], "trunk", 14, "The Causeway")
    road([(1200, 60), (3400, 900), (5600, 2100), (HARLOND[0] - 200, HARLOND[1])], "primary", 10, "Harlond Road")
    road([(900, -260), (2600, -2400), (4200, -5200), (5200, -8800)], "primary", 9, "The South Road")
    road([(700, 300), (1800, 2600), (2200, 5600), (2000, 9200)], "primary", 9, "The North Road")
    # the lanes of the townlands
    for k in range(14):
        a = -1.25 + k * 0.18
        road([(math.cos(a) * 1100, math.sin(a) * 1100), (math.cos(a) * RAMMAS, math.sin(a) * RAMMAS)],
             "residential", 4)
    out["roads"] = roads
    print("  tunnel mouths (x, z, tier):", tunnels)

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
    for k in range(5):
        areas.append({"k": "plaza", "n": "", "i": [],
                      "o": flat(ring_poly(OSGILIATH[0], OSGILIATH[1], 1500 - k * 300, 56))})
    out["areas"] = areas
    out["rail"] = []
    out["stations"] = []

    # ---------- buildings ----------
    buildings = []

    # `h` and `minh` are heights ABOVE THE GROUND under the footprint, because that is what the engine
    # does with them: it takes the lowest terrain sample under the ring and extrudes from there. Writing the
    # absolute height a wall's top should reach built the whole city twice: the seventh circle came out three
    # hundred metres over the Citadel it stands on and the White Tower was inside it.
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
        if minh is not None:
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
        top = 30 if k == 0 else 22          # over the tier in front of it; the step is in the terrain
        ga = gate_angle(k)
        gap = 0.055 if k == 0 else 0.07
        col = "#3c3b3f" if k == 0 else WALL
        for a, end in ring_runs(r0, ga, gap):
            # the wall itself, one length for each open stretch of the circle
            put(arc(0, 0, r0, a, end, width=9 if k else 13), top, "wall", col, roof="f", minh=-18)
            # towers on it, and one on each end where it runs into the rock
            nt = max(2, int((end - a) / math.tau * (16 - k)))
            for t in range(nt + 1):
                ta = a + (end - a) * min(1.0, (t + 0.5) / nt)
                put(rect(math.cos(ta) * (r0 - 4), math.sin(ta) * (r0 - 4), 12, 12, ta),
                    top + 8, "tower", col, roof="f", minh=-22)

    # ---- the keel of rock, and the prow that stands out of the city ----
    # The rock is terrain, but its point is cut sheer, and the Citadel's wall runs out along the top of it
    # to a buttress overhanging the first circle. That buttress is the one thing everyone remembers.
    put(rect(KEEL_X - 62, 0, 120, 74), 22, "rock", "#8d8a84", roof="f", minh=-70)
    put(rect(KEEL_X - 30, 0, 44, 40), 30, "rock", "#96938c", roof="f", minh=16)

    # ---- the houses, tier by tier ----
    # Packed tight and low against the wall in front of them, and thinning as they climb: the sixth circle
    # is offices and the seventh is not lived in at all.
    total = 0
    for k in range(TIERS - 1):
        r0 = R_OUT - k * R_STEP - 17
        r1 = R_OUT - (k + 1) * R_STEP + 7
        rows = max(4, int((r0 - r1) / 12))
        for row in range(rows):
            rr = r0 - row * 12 - 4
            n = max(8, int(rr * math.tau / (17 + k * 2)))
            for i in range(n):
                a = i / n * math.tau + row * 0.11 + k * 0.4
                x, z = math.cos(a) * rr, math.sin(a) * rr
                if on_rock(x, z):
                    continue                       # the rock: nothing is built on it
                if abs(a - gate_angle(k)) < 0.10 or abs(a - gate_angle(k) - math.tau) < 0.10:
                    continue                       # the gateway and the yard behind it stay clear
                if R.random() < 0.04:
                    continue
                w = R.uniform(12, 17)
                d = R.uniform(9, 14)
                h = R.uniform(8, 15) + (2.5 if k < 3 else 0)
                put(rect(x, z, w, d, a), h, "residential", HOUSE[R.randrange(len(HOUSE))], roof="g")
                total += 1
                if R.random() < 0.18:              # a hall or a guild house, taller and slated
                    put(rect(x, z, w * 1.2, d * 1.2, a), h + R.uniform(4, 9), "civic",
                        SLATE[R.randrange(len(SLATE))], roof="g", minh=h)

    # ---- the seventh circle: the Citadel ----
    # The Tower is a landmark and is built in src/minastirith/landmarks.js; what is here is the ground it
    # stands on - the hall of the kings behind it, the guard houses either side, the Hallows in the rock.
    # Everything here is inside the seventh wall, which is a circle a hundred and sixty metres in the
    # radius, and everything stands on ground the terrain already put at the Citadel's own height. The rock
    # runs through the middle of it, but at this level its top is the pavement, so the court is laid over it
    # and only the Tower stands on the point.
    put(rect(-104, 0, 128, 96), 26, "civic", "#d8d2c2", name="The Hall of the Kings", roof="f")
    for s in (-1, 1):
        put(rect(-36, s * 112, 74, 30, 0.2 * s), 12, "civic", "#cdc6b6", roof="g")
        put(rect(-118, s * 92, 46, 34, -0.3 * s), 10, "civic", "#cdc6b6", roof="g")
        put(rect(46, s * 118, 34, 26), 9, "civic", "#cdc6b6", roof="g")
    put(rect(-142, 0, 34, 70), 8, "civic", "#b8b2a4", name="The Hallows", roof="f")

    # ---- the Rammas Echor, and the Causeway Forts on the road through it ----
    put(ring_poly(0, 0, RAMMAS, 128, RAMMAS - 7), 9, "wall", "#b6ae9c", roof="f", minh=-14)
    for s in (-1, 1):
        put(rect(RAMMAS + 10, s * 70, 44, 44), 24, "tower", "#b6ae9c",
            name="Causeway Fort", roof="f")

    # ---- the Harlond ----
    for k in range(4):
        put(rect(HARLOND[0] - 130, HARLOND[1] + k * 90, 70, 22), 9, "industrial", "#a49a86", roof="f")
    put(rect(HARLOND[0] - 210, HARLOND[1] + 140, 90, 60), 16, "industrial", "#9e9484",
        name="The Harlond", roof="f")

    # ---- Osgiliath, in ruins astride the Anduin ----
    # The old capital of Gondor, taken and retaken until there was nothing left to hold. Numenorean cities
    # were laid out in rings round a centre, not in a grid, and the centre of this one was the great bridge:
    # so it is circles of street broken where the river cuts through them, radials out from the bridgehead,
    # and a ruined circuit wall round the whole of it. Walls stand to every height from a kerb to a gable,
    # the Dome of Stars is broken open, and the piers of the bridge are still in the water with the Causeway
    # stopping at the edge of the gap.
    OCX, OCZ = OSGILIATH
    RINGS = [240.0, 370.0, 500.0, 650.0, 810.0, 980.0, 1160.0, 1350.0]
    CHAN = 250.0                                 # the river, and no building in it

    def dry(x, z):
        return abs(x - river_cx(z)) >= CHAN

    def ring_road(rr, w, cls="residential"):
        run = []
        for k in range(121):
            a = k / 120.0 * math.tau
            x, z = OCX + math.cos(a) * rr, OCZ + math.sin(a) * rr
            if dry(x, z):
                run.append((x, z))
            else:
                if len(run) > 1:
                    road(run, cls, w)
                run = []
        if len(run) > 1:
            road(run, cls, w)

    for rr in RINGS:
        ring_road(rr, 7)
    for k in range(24):
        a = k / 24.0 * math.tau
        pts = [(OCX + math.cos(a) * r, OCZ + math.sin(a) * r) for r in range(200, 1400, 110)]
        run = []
        for p in pts:
            if dry(*p):
                run.append(p)
            elif len(run) > 1:
                road(run, "residential", 6)
                run = []
        if len(run) > 1:
            road(run, "residential", 6)

    ORUIN = ["#b4ac9c", "#a9a190", "#beb6a4", "#9e9686", "#b0a897"]
    ruined = 0
    for ri in range(len(RINGS) - 1):
        r0, r1 = RINGS[ri] + 18, RINGS[ri + 1] - 18
        rows = max(1, int((r1 - r0) / 44))
        for row in range(rows):
            rr = r0 + row * 44 + 14
            n = max(10, int(rr * math.tau / 52))
            for i in range(n):
                a = i / n * math.tau + row * 0.13 + ri * 0.21
                x, z = OCX + math.cos(a) * rr, OCZ + math.sin(a) * rr
                if not dry(x, z) or R.random() < 0.26:
                    continue
                r2 = R.random()
                h = R.uniform(2, 5) if r2 < 0.44 else (R.uniform(6, 13) if r2 < 0.86 else R.uniform(16, 28))
                put(rect(x, z, R.uniform(17, 34), R.uniform(14, 26), a), h,
                    "ruin", ORUIN[R.randrange(len(ORUIN))], roof="f")
                ruined += 1

    # the circuit wall, broken open in a dozen places
    for k in range(60):
        a0 = k / 60.0 * math.tau
        if R.random() < 0.3:
            continue
        x, z = OCX + math.cos(a0) * 1470, OCZ + math.sin(a0) * 1470
        if not dry(x, z):
            continue
        put(rect(x, z, 14, 160, a0), R.uniform(3, 13), "wall", "#a7a08f", roof="f")
        if k % 5 == 0:
            put(rect(x, z, 28, 28, a0), R.uniform(9, 22), "tower", "#a7a08f", roof="f")

    # the towers still standing, and the Dome of Stars over the old crossing
    for k in range(16):
        a = R.uniform(0, math.tau)
        rr = R.uniform(300, 1300)
        x, z = OCX + math.cos(a) * rr, OCZ + math.sin(a) * rr
        if not dry(x, z):
            continue
        put(rect(x, z, R.uniform(22, 36), R.uniform(22, 36), a), R.uniform(28, 56),
            "tower", "#9a9385", roof="f")
    zd = OCZ + 150
    put(rect(river_cx(zd) - 380, zd, 150, 150), 40, "civic", "#a49c8c",
        name="The Dome of Stars", roof="f")
    put(rect(river_cx(zd) - 380, zd, 104, 104), 56, "civic", "#b0a795", roof="f", minh=36)

    # the road east, to the Morgul Vale
    road([(OCX + 300, OCZ - 120), (10600, -900), (HX - 700, -1800)], "primary", 10,
         "The Road to Minas Morgul")

    # the great bridge: the piers are all that is left of the middle of it
    zb = OCZ + 240
    for k in range(9):
        px = river_cx(zb) - 300 + k * 75
        put(rect(px, zb, 26, 46), 20, "rock", "#7e776c", roof="f", minh=-4)
        if k < 3 or k > 6:
            put(rect(px, zb, 70, 30), 25, "wall", "#a39a8a", roof="f", minh=20)
    put(rect(river_cx(zb) - 430, zb, 120, 54), 26, "wall", "#a39a8a", roof="f", minh=18)
    put(rect(river_cx(zb) + 400, zb, 120, 54), 26, "wall", "#a39a8a", roof="f", minh=18)

    # ---- the farms of the townlands ----
    for k in range(150):
        a = R.uniform(-1.45, 1.45)
        d = R.uniform(1200, RAMMAS - 300)
        x, z = math.cos(a) * d, math.sin(a) * d
        h = R.uniform(5, 9)
        put(rect(x, z, R.uniform(10, 20), R.uniform(8, 16), R.uniform(0, math.tau)), h,
            "residential", HOUSE[R.randrange(len(HOUSE))], roof="g")
        if R.random() < 0.5:
            put(rect(x + R.uniform(-22, 22), z + R.uniform(-22, 22), R.uniform(12, 22), R.uniform(8, 14),
                     R.uniform(0, math.tau)), R.uniform(4, 7), "barn", "#8d7f68",
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
                   {"n": "The White Tower", "x": q(96), "z": 0, "k": "tower", "ang": 0},
                   {"n": "The Harlond", "x": q(HARLOND[0] - 200), "z": q(HARLOND[1] + 140), "k": "quay", "ang": 0},
                   {"n": "Osgiliath", "x": q(OSGILIATH[0]), "z": q(OSGILIATH[1]), "k": "ruin", "ang": 0}]

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
