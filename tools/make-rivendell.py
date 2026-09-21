#!/usr/bin/env python3
"""Rivendell: the Last Homely House, in the cleft of the Bruinen.

Fan work. Tolkien's world belongs to the Tolkien Estate; nothing from any book, film or game is used, and
every shape here is this project's own geometry built from the description.

The thing that makes this place is not the house, it is the ground the house is in. "A valley, deep and
narrow, with a swift stream at the bottom of it" - you come over open moor, and the ground simply stops: a
gorge three hundred metres deep opens under your feet with the river in it, and the buildings are on ledges
partway down, so you look DOWN on the roofs of them. Nothing else in this collection has that shape.

So the generator's job is the gorge:

  the moor       high, bare, rolling, six hundred metres up, and it goes to the edge and stops
  the cleft      a hundred and fifty metres across at the top, cut nearly sheer, running north-south
  the bowl       where it opens out, three hundred metres across, with terraces on the east side
  the falls      every side stream on the moor arrives over the rim, and there are a lot of side streams
  the ford       downstream to the north, where the road crosses - the only way in that is not a path

The house itself, the bridges and the falls are landmarks and live in src/rivendell/landmarks.js.
"""
import json
import math
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "rivendell-osm.json")
R = random.Random(3021)

HX, HZ = 3000.0, 2600.0          # half-extents: 6 x 5.2 km
STEP = 10                        # the height grid, in metres

MOOR = 620.0                     # the level of the open ground above
RIVER0 = 300.0                   # the water at the house
FORD = (-260.0, -1750.0)         # where the road crosses, downstream to the north

# the line of the cleft, from the head of the valley (south) to the ford (north)
CHANNEL = [(340.0, 2300.0), (250.0, 1500.0), (120.0, 800.0), (0.0, 200.0), (-40.0, -300.0),
           (-150.0, -900.0), (-260.0, -1750.0), (-380.0, -2500.0)]

# the side streams: where they come over the rim, and which side they are on
FALLS = [(-1, 640.0), (-1, -160.0), (-1, -820.0), (1, 980.0), (1, 240.0), (1, -540.0), (1, -1200.0)]


def q(v):
    return int(round(v * 10))


def flat(pts):
    out = []
    for x, z in pts:
        out.append(q(x))
        out.append(q(z))
    return out


def rect(cx, cz, w, d, rot=0.0):
    c, s = math.cos(rot), math.sin(rot)
    return [(cx + u * c - v * s, cz + u * s + v * c)
            for u, v in ((-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2))]


def smoothstep(a, b, v):
    if a == b:
        return 0.0
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def seg_dist(px, pz, ax, az, bx, bz):
    dx, dz = bx - ax, bz - az
    L = dx * dx + dz * dz
    t = 0.0 if L == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L))
    return math.hypot(px - ax - t * dx, pz - az - t * dz), t


def channel_at(z):
    """The middle of the cleft at this z, and how far along it we are (0 at the head, 1 at the map edge)."""
    for i in range(len(CHANNEL) - 1):
        (ax, az), (bx, bz) = CHANNEL[i], CHANNEL[i + 1]
        if (az >= z >= bz) or (az <= z <= bz):
            t = 0.0 if az == bz else (z - az) / (bz - az)
            return ax + (bx - ax) * t, (i + t) / (len(CHANNEL) - 1)
    return (CHANNEL[0][0], 0.0) if z > CHANNEL[0][1] else (CHANNEL[-1][0], 1.0)


def channel_dist(x, z):
    d = 1e9
    for i in range(len(CHANNEL) - 1):
        (ax, az), (bx, bz) = CHANNEL[i], CHANNEL[i + 1]
        dd, _ = seg_dist(x, z, ax, az, bx, bz)
        d = min(d, dd)
    return d


def river_level(z):
    """The water falls about sixty metres across the map, faster at the north end where it gets away."""
    _, t = channel_at(z)
    return RIVER0 - 78.0 * t ** 1.25


def cleft_half(z):
    """Half the width of the cleft at the top. It opens out where the house is and closes again below."""
    w = 150.0
    w += 260.0 * math.exp(-((z - 120.0) / 480.0) ** 2)      # the bowl
    w += 90.0 * math.exp(-((z + 1750.0) / 340.0) ** 2)      # and again at the ford
    w += 26.0 * math.sin(z / 260.0)
    return w


def terrain_height(x, z):
    # the moor: open, rolling, and it goes right to the edge
    h = MOOR
    h += 34 * math.sin(x / 620.0 + 0.7) * math.cos(z / 810.0 - 0.3)
    h += 16 * math.sin(x / 210.0 - z / 260.0)
    h += 120 * smoothstep(1400.0, 2900.0, math.hypot(x - 1800.0, z - 1400.0)) * 0  # (kept flat: the moor is a shelf)
    # the hills that close the head of the valley, south
    h += 260 * smoothstep(1500.0, 2600.0, z)
    # the moor falls away north towards the ford country
    h -= 90 * smoothstep(-600.0, -2400.0, z)

    cx, t = channel_at(z)
    d = abs(x - cx)
    half = cleft_half(z)
    riv = river_level(z)

    # the cleft: sheer to within thirty metres of the bottom, then a talus slope to the water
    if d < half + 420:
        # How far down we are: 1 at the middle, 0 at the rim. Sheer - the whole three hundred metres happens
        # in about eighty of horizontal, which is as steep as a ten-metre grid can carry and is the entire
        # point of the place. The first version spread it over three hundred and came out as a wooded dell.
        f = smoothstep(half + 76, half - 30, d)
        # the wall is not flat - it is benched, and the benches are what everything stands on
        bench = 0.0
        for k in range(5):
            b0 = half - 30 - k * 26
            bench += 22 * smoothstep(b0 + 14, b0 - 14, d) * (1 if k % 2 == 0 else 0.6)
        floor = riv + 6 + bench
        h = h * (1 - f) + floor * f
        # the talus: the bottom is not a knife edge
        g = smoothstep(half * 0.26, 0.0, d)
        h = h * (1 - g) + (riv - 2) * g

    # the side streams: notches cut back into the rim, which is where the falls come over
    for sd, fz in FALLS:
        dz = abs(z - fz)
        if dz > 260:
            continue
        cxx, _ = channel_at(fz)
        along = (x - cxx) * sd
        if along < 0 or along > 900:
            continue
        cut = math.exp(-(dz / 72.0) ** 2) * smoothstep(0.0, 200.0, along)
        h -= 90 * cut

    # the ford: the walls draw back and the water spreads out
    fd = math.hypot((x - FORD[0]) * 0.7, z - FORD[1])
    h = h * (1 - smoothstep(560.0, 160.0, fd)) + (river_level(FORD[1]) + 1.0) * smoothstep(560.0, 160.0, fd)

    # The moor does not stop at the edge of the box, it goes on; what the edge fade does on a map at sea
    # level - take the land down to nothing so it does not end in a wall - would here cut a four-hundred
    # metre cliff round the whole world. So the edge settles towards the moor's own level instead.
    e = smoothstep(HX, HX - 300, abs(x)) * smoothstep(HZ, HZ - 300, abs(z))
    return h * e + (MOOR - 60) * (1 - e)


def main():
    out = {"attribution": "Rivendell: fan geometry generated by tools/make-rivendell.py; "
                          "no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [-0.02340, -0.02695, 0.02340, 0.02695]}

    nx = int(2 * HX) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # ---------- the Bruinen ----------
    # A ribbon down the bottom of the cleft, widening at the ford. The engine draws water flat, so the river
    # is cut into reaches - one polygon per stretch, each at its own level - which is what a mountain river
    # looks like anyway: pools with a step between them.
    water = []
    zs = [z for z in range(int(HZ), int(-HZ), -60)]
    reach = []
    for z in zs:
        cx, _ = channel_at(z)
        w = 22 + 30 * math.exp(-((z - 120.0) / 500.0) ** 2) + 44 * math.exp(-((z - FORD[1]) / 300.0) ** 2)
        reach.append((z, cx, w))
    k = 0
    while k < len(reach) - 6:
        n = 6
        seg = reach[k:k + n + 1]
        lvl = river_level(seg[len(seg) // 2][0])
        left = [(cx - w, z) for z, cx, w in seg]
        right = [(cx + w, z) for z, cx, w in seg][::-1]
        water.append({"o": flat(left + right), "i": [], "n": "The Bruinen", "y": round(lvl, 1)})
        k += n
    out["water"] = water
    out["lake"] = []
    out["islands"] = []
    out["marina"], out["beach"], out["pier"] = [], [], []
    out["waterways"] = [{"n": "The Bruinen",
                         "p": flat([(channel_at(z)[0], z) for z in range(int(HZ), int(-HZ), -50)])}]

    # ---------- the paths ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    # the road in: over the moor from the east, down to the ford, and up the valley to the house
    road([(2800, -2300), (1600, -2100), (700, -1950), (0, -1820), (FORD[0], FORD[1])],
         "primary", 8, "The East Road")
    road([(FORD[0], FORD[1]), (-200, -1400), (-90, -900), (-30, -420), (20, -60), (60, 180)],
         "primary", 7, "The Valley Path")
    # the terrace paths: they run along the benches on the east wall, which is where the house is
    for k in range(5):
        pts = []
        for z in range(700, -700, -40):
            cx, _ = channel_at(z)
            pts.append((cx + cleft_half(z) - 34 - k * 26, z))
        road(pts, "footway", 4, f"The {['First','Second','Third','Fourth','Fifth'][k]} Terrace")
    # and the paths up to the rim on both sides
    for sd in (-1, 1):
        for k in range(3):
            z0 = 500 - k * 520
            pts = []
            for i in range(14):
                t = i / 13
                cx, _ = channel_at(z0 + t * 260)
                pts.append((cx + sd * (cleft_half(z0) * (0.2 + t * 1.5)), z0 + t * 260))
            road(pts, "path", 3)
    out["roads"] = roads

    # ---------- the ground ----------
    areas = []
    # woods on both walls and along the rim: this valley is famously full of trees
    def blob(cx, cz, rx, rz, n=20, wob=0.36):
        """An irregular patch. A wood drawn as a rectangle reads as a plantation, which this is not."""
        out = []
        ph = [R.uniform(0, math.tau) for _ in range(3)]
        for i in range(n):
            a = i / n * math.tau
            f = 1 + wob * (0.6 * math.sin(a * 2 + ph[0]) + 0.3 * math.sin(a * 3 + ph[1])
                           + 0.2 * math.sin(a * 5 + ph[2]))
            out.append((cx + math.cos(a) * rx * f, cz + math.sin(a) * rz * f))
        return out

    for k in range(34):
        z = -2300 + k * 136 + R.uniform(-50, 50)
        cx, _ = channel_at(z)
        for sd in (-1, 1):
            areas.append({"k": "wood", "n": "", "i": [],
                          "o": flat(blob(cx + sd * (cleft_half(z) + R.uniform(110, 520)), z,
                                         R.uniform(90, 200), R.uniform(70, 150)))})
    # and a scatter of them out on the moor, thinning with distance from the edge
    for k in range(22):
        z = R.uniform(-HZ + 400, HZ - 400)
        cx, _ = channel_at(z)
        sd = R.choice((-1, 1))
        # out on the moor they are copses rather than forest, so they are drawn as open ground with trees
        areas.append({"k": "park", "n": "", "i": [],
                      "o": flat(blob(cx + sd * R.uniform(700, 2400), z,
                                     R.uniform(90, 220), R.uniform(80, 170)))})
    # the gardens on the terraces
    for k in range(9):
        z = 500 - k * 120
        cx, _ = channel_at(z)
        areas.append({"k": "garden", "n": "", "i": [],
                      "o": flat(rect(cx + cleft_half(z) - 70, z, 90, 80, 0.1))})
    # the sward at the ford, and the moor itself
    areas.append({"k": "grass", "n": "The Ford of Bruinen", "i": [],
                  "o": flat(rect(FORD[0], FORD[1], 620, 420, 0.2))})
    out["areas"] = areas
    out["rail"] = []
    out["stations"] = []

    # ---------- what is built ----------
    buildings = []

    def put(ring, h, kind=None, colour=None, name=None, minh=None, roof="g"):
        b = {"p": flat(ring), "h": round(h, 1), "r": roof}
        if kind:
            b["t"] = kind
        if colour:
            b["c"] = colour
        if name:
            b["n"] = name
        if minh is not None:
            b["m"] = round(minh, 1)
        buildings.append(b)

    TIMBER = ["#8a7658", "#7d6a50", "#94805f", "#6f5f48"]
    STONE = ["#a9a396", "#9c9689", "#b3ada0"]

    # The lesser halls: they step down the east wall on the benches, each one facing the water, with a
    # veranda on the valley side. Everything here is long and low and has a very steep roof.
    total = 0
    for k in range(5):
        for j in range(7):
            z = 560 - j * 110 + R.uniform(-18, 18)
            cx, _ = channel_at(z)
            x = cx + cleft_half(z) - 46 - k * 26
            if R.random() < 0.3:
                continue
            w = R.uniform(26, 52)
            d = R.uniform(14, 22)
            put(rect(x, z, w, d, 0.06), R.uniform(8, 14), "hall", TIMBER[R.randrange(len(TIMBER))])
            total += 1
            if R.random() < 0.5:                       # the veranda, out over the drop
                put(rect(x - w * 0.02 - 9, z, 10, d * 0.8, 0.06), 3.4, "deck",
                    STONE[R.randrange(len(STONE))], roof="f")
    # a few on the west wall, reached by the bridges
    for k in range(6):
        z = 420 - k * 150
        cx, _ = channel_at(z)
        x = cx - cleft_half(z) + 40
        put(rect(x, z, R.uniform(20, 34), R.uniform(13, 19), -0.06), R.uniform(7, 12), "hall",
            TIMBER[R.randrange(len(TIMBER))])
        total += 1
    # the outbuildings at the head of the valley: stables, stores, the smithy
    for k in range(10):
        z = 760 + R.uniform(-90, 200)
        cx, _ = channel_at(z)
        x = cx + R.uniform(-90, 130)
        put(rect(x, z, R.uniform(16, 30), R.uniform(10, 16), R.uniform(-0.3, 0.3)), R.uniform(6, 10),
            "outbuilding", TIMBER[R.randrange(len(TIMBER))])
    # the guard post at the ford
    put(rect(FORD[0] + 90, FORD[1] - 40, 22, 16, 0.4), 9, "hall", TIMBER[0])
    put(rect(FORD[0] - 110, FORD[1] + 60, 16, 12, -0.2), 7, "hall", TIMBER[1])

    # ---- the walls ----
    # A ten-metre grid draws a sheer face as a smooth ramp, and the temptation is to stand rock on it. Do
    # not: a box on a wall that steep has its own foot in mid-air and comes out as a pillar standing in the
    # valley. What can be built is what is at the top and the bottom of a cliff rather than on it - boulders
    # along the rim where the ground is breaking away, and the scree that has already gone.
    ncrag = 0
    for k in range(260):
        z = R.uniform(-HZ + 300, HZ - 300)
        cx, _ = channel_at(z)
        half = cleft_half(z)
        sd = R.choice((-1, 1))
        x = cx + sd * half * R.uniform(1.02, 1.3)
        g = terrain_height(x, z)
        if g < MOOR - 90:
            continue
        hh = R.uniform(3, 11)
        put(rect(x, z, R.uniform(7, 22), R.uniform(6, 17), R.uniform(0, math.pi)), hh, "rock",
            "#9a9184" if R.random() < 0.55 else "#8a8175", minh=-hh, roof="f")
        ncrag += 1
    for k in range(420):
        z = R.uniform(-HZ + 300, HZ - 300)
        cx, _ = channel_at(z)
        half = cleft_half(z)
        sd = R.choice((-1, 1))
        x = cx + sd * half * R.uniform(0.2, 0.5)
        g = terrain_height(x, z)
        riv = river_level(z)
        if g > riv + 40:
            continue                               # the scree is at the foot, not up the face
        put(rect(x, z, R.uniform(5, 16), R.uniform(4, 12), R.uniform(0, math.pi)), R.uniform(1.5, 6),
            "rock", "#9d9486", minh=-5, roof="f")
        ncrag += 1

    out["buildings"] = buildings

    # ---------- the woods ----------
    trees = []
    for k in range(2400):
        z = R.uniform(-HZ + 200, HZ - 200)
        cx, _ = channel_at(z)
        half = cleft_half(z)
        side = R.choice((-1, 1))
        # most of them on the walls and the rim, a few out on the moor
        if R.random() < 0.72:
            x = cx + side * (half * R.uniform(0.35, 1.0) + R.uniform(-40, 340))
        else:
            x = cx + side * R.uniform(400, 2600)
        if abs(x) > HX - 120:
            continue
        if abs(x - cx) < half * 0.82:
            continue                                   # nothing grows on a sheer wall or in the river
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(3, 8))})
    out["trees"] = trees

    out["pois"] = [{"n": "The Last Homely House", "x": q(150), "z": q(120), "k": "hall", "ang": 0.06},
                   {"n": "The Ford of Bruinen", "x": q(FORD[0]), "z": q(FORD[1]), "k": "ford", "ang": 0}]

    t = out["terrain"]
    lo = min(t["h"]) / 10.0
    hi = max(t["h"]) / 10.0
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)} ({total} halls, {ncrag} crags); "
          f"roads {len(roads)}; trees {len(trees)}; terrain {t['nx']}x{t['nz']} at {t['step']} m, "
          f"{lo:.0f} to {hi:.0f} m")


if __name__ == "__main__":
    main()
