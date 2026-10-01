#!/usr/bin/env python3
"""Generate Isengard and Nan Curunir as a city data file the OSM engine can read.

    python3 tools/make-isengard.py

Fan work from Tolkien, whose work belongs to the Tolkien Estate; nothing from any book, film or game is used.
Every shape here is generated from the published description and the geometry is this project's own.

The description (The Two Towers, "The Road to Isengard"):

  a great ring-wall of stone, like towering cliffs, standing out from the shelter of the mountain-side, from
  which it ran out and then returned again; one entrance, a great arch in the southern wall, and through it a
  long tunnel hewn in the black rock, closed at either end with doors of iron
  inside, a plain, a great circle, somewhat hollowed like a vast shallow bowl, a mile from rim to rim
  once green, with avenues and groves of fruitful trees, watered by streams from the mountains; in Saruman's
  day paved with stone flags, dark and hard, the roads lined with pillars joined by heavy chains, and the plain
  bored and delved - shafts driven deep into the ground, their upper ends covered by low mounds and domes of
  stone, smoke and steam coming up out of them
  all the roads ran between their chains to the centre, where Orthanc stood
  the river Isen comes down from Methedras, the last peak of the Misty Mountains, which stands behind the Ring
  to the north; it comes into the Ring at the north-east and goes out by the gate in the south

So the generator lays out the valley of Nan Curunir running south from Methedras, the Isen down it and through
the Ring, the road south to the Fords, the roads inside the Ring to the centre, Saruman's forges on the plain,
and the edge of Fangorn on the hills to the east. The Ring-wall, Orthanc, the domes and shafts and pillars are
modelled in src/isengard/ - a fifty-metre heightfield cannot hold a cliff, which is the lesson of the keel of
Minas Tirith, so the wall is not in the terrain at all.

Scale: 24 km square, terrain every 50 m. The Ring is 1.7 km across outside the wall.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "isengard-osm.json")
R = random.Random(3019)

HX, HZ = 12000.0, 12000.0        # half-extents: 24 x 24 km
STEP = 50
ORIGIN = (47.0, 8.0)
FLOOR = 480.0                    # the floor of Nan Curunir at the Ring
RING_IN = 790.0                  # the inner face of the Ring-wall: a mile from rim to rim
RING_OUT = 860.0                 # its outer face
BOWL = 14.0                      # how far the plain is hollowed at the centre
METHEDRAS = (-600.0, -9800.0)    # the last peak of the Misty Mountains, behind the Ring
GATE_A = math.pi / 2             # the gate is in the south (+z is south)
INFLOW_A = -math.pi / 4          # the Isen comes in at the north-east
DAM_Z = -1700.0                  # Saruman's dam across the Isen, above the Ring (its x is the river's)
RES_BED = 548.0                  # the floor of the reservoir behind it
RES_TOP = 2300.0                 # how far up the glen the basin reaches (z = -RES_TOP)
FANGORN_X = 5200.0               # the edge of the forest, on the hills to the east


def isen(z):
    """The middle of the Isen at this z, outside the Ring. It comes down from Methedras to the north-east of the
    Ring, and goes on south from the gate."""
    if z < -RING_OUT:
        t = smoothstep(-11000, -RING_OUT, z)
        return 150 + 520 * t + (230 * math.sin(z / 800.0) + 90 * math.sin(z / 330.0 + 1.0)) * (1 - t ** 3)
    return 90 + 260 * smoothstep(RING_OUT, 5000, z) + 140 * math.sin(z / 1700.0) * smoothstep(RING_OUT, 3000, z)


def channel():
    """The Isen's course through the Ring: in at the north-east under the wall, round the east side of the plain
    in a stone-lined cut, and out beside the gate in the south."""
    pts = []
    a0, a1 = INFLOW_A, GATE_A - 0.11
    for i in range(25):
        t = i / 24
        a = a0 + (a1 - a0) * t
        r = RING_IN - 60 - 40 * math.sin(t * math.pi)
        pts.append((math.cos(a) * r, math.sin(a) * r))
    return pts


def river_line():
    """The whole course, north to south, as one polyline."""
    north = [(isen(z), z) for z in range(-4400, -900, 150)]
    ax, az = math.cos(INFLOW_A) * (RING_OUT + 20), math.sin(INFLOW_A) * (RING_OUT + 20)
    ex, ez = math.cos(GATE_A - 0.11) * (RING_OUT + 30), math.sin(GATE_A - 0.11) * (RING_OUT + 30)
    south = [(isen(z), z) for z in range(1000, 12001, 200)]
    return north + [(ax, az)] + channel() + [(ex, ez)] + south


def seg_dist(px, pz, ax, az, bx, bz):
    dx, dz = bx - ax, bz - az
    L = dx * dx + dz * dz
    t = 0.0 if L == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L))
    return math.hypot(px - ax - dx * t, pz - az - dz * t)


RIVER = river_line()


def river_dist(x, z):
    best = 1e9
    for i in range(len(RIVER) - 1):
        ax, az = RIVER[i]
        bx, bz = RIVER[i + 1]
        if min(ax, bx) - 400 > x or max(ax, bx) + 400 < x or min(az, bz) - 400 > z or max(az, bz) + 400 < z:
            continue
        best = min(best, seg_dist(x, z, ax, az, bx, bz))
    return best


def terrain_height(x, z):
    d = math.hypot(x, z)
    # the floor of the valley, falling gently south towards the Gap
    h = FLOOR - 0.018 * z
    # Methedras, and the mountains that close the valley on the west and the north
    md = math.hypot((x - METHEDRAS[0]) * 0.8, z - METHEDRAS[1])
    h += 2600 * smoothstep(8200, 900, md) ** 0.8
    h += 1500 * smoothstep(-3200, -9000, x) * (0.75 + 0.25 * math.sin(z / 1900.0 + 1.1))
    h += 420 * smoothstep(-1800, -4200, x) * smoothstep(9000, -2000, z)
    # the arms of the mountain that come down either side of the Ring, and the Ring stands out from between them
    h += 380 * smoothstep(2600, 1100, abs(x + 300)) * smoothstep(-900, -3200, z)
    # the hills on the east, where Fangorn begins
    h += 260 * smoothstep(2500, 7500, x) * (0.7 + 0.3 * math.sin(z / 1400.0) * math.cos(x / 1700.0))
    # the roughness of it
    h += 22 * math.sin(x / 530.0 + 0.7) * math.cos(z / 610.0 - 0.3) + 9 * math.sin(x / 170.0) * math.sin(z / 230.0)

    # ---- the Ring ----
    # Inside the wall the plain is levelled and hollowed like a shallow bowl; under the wall it is flat (the wall
    # is modelled, and stands on this); outside, the land comes down to the foot of the wall all round, and at
    # the north the mountain comes right down to it.
    base = FLOOR
    if d < RING_IN:
        h = base - BOWL * (1 - (d / RING_IN) ** 2)
    elif d < RING_OUT + 20:
        h = base + 1.0
    elif d < RING_OUT + 520:
        h = base + 1.0 + (h - base - 1.0) * smoothstep(RING_OUT + 20, RING_OUT + 520, d)

    # ---- the Isen ----
    # Its glen down the flank of Methedras, and its bed: the water itself is drawn by the page
    # (src/isengard/isen.js), as a surface that falls with the bed - the engine draws water at one level, which
    # is right for a river on a plain and wrong for one coming down a mountain.
    rd = river_dist(x, z)
    if z < -RING_OUT and rd < 700:
        # a V, not a trench: deepest at the water and dying away up the sides
        h -= 110 * (1 - rd / 700.0) ** 1.6 * smoothstep(-900, -2400, z) * smoothstep(-4500, -3400, z)
    if rd < 200:
        bed = h - (5.0 if d < RING_OUT + 40 else 6.0)
        h = h * smoothstep(10, 110, rd) + bed * (1 - smoothstep(10, 110, rd))

    # ---- the dam and its reservoir ----
    # Rock shoulders either side of the glen at the dam, for its ends to be built into; and behind it, up the
    # glen, the basin the water stands in, dug out below the reservoir's level (src/isengard/dam.js draws the
    # dam and the water, which drains when the Ents break it).
    dx = x - isen(DAM_Z)
    if abs(z - DAM_Z) < 150 and 150 < abs(dx) < 640:
        k = smoothstep(150, 80, abs(z - DAM_Z)) * smoothstep(150, 220, abs(dx)) * smoothstep(640, 500, abs(dx))
        h = max(h, h * (1 - k) + 596 * k)
    if -RES_TOP < z < DAM_Z - 15:
        rx = isen(z)
        wr = 230 + 60 * smoothstep(DAM_Z, -1900, z) - 90 * smoothstep(-2000, -RES_TOP, z)
        k = smoothstep(wr + 40, wr - 60, abs(x - rx)) * smoothstep(DAM_Z - 15, DAM_Z - 60, z) * smoothstep(-RES_TOP, -RES_TOP + 250, z)
        h = h * (1 - k) + min(h, RES_BED) * k

    return h


def main():
    lat0, lon0 = ORIGIN
    dlat = HZ / 111160.0
    dlon = HX / (111320.0 * math.cos(math.radians(lat0)))
    out = {"attribution": "Isengard: fan geometry generated by tools/make-isengard.py; "
                          "no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [lat0, lon0],
           "bounds": [round(lat0 - dlat, 5), round(lon0 - dlon, 5), round(lat0 + dlat, 5), round(lon0 + dlon, 5)]}

    nx = int(2 * HX) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # ---------- the Isen ----------
    # (its water is drawn by the page, along the waterway)
    out["water"] = []
    out["lake"], out["islands"], out["marina"], out["beach"], out["pier"] = [], [], [], [], []
    out["waterways"] = [{"n": "Isen", "p": flat(RIVER)}]

    # ---------- roads ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": w, "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    gx, gz = math.cos(GATE_A) * RING_OUT, math.sin(GATE_A) * RING_OUT
    # south out of the gate, down the valley towards the Fords of Isen
    south = [(gx, gz + 10)]
    for z in range(int(gz) + 200, 12000, 250):
        south.append((isen(z) - 140 - 60 * math.sin(z / 2100.0), z))
    road(south, "primary", 12, "The Isen Road")
    # from the gate, through the tunnel, to the foot of Orthanc
    road([(0, RING_OUT), (0, RING_IN - 10), (0, 90)], "primary", 12, "The Way of the Gate")
    # the roads of the plain: all of them run to the centre, between their chains
    for k in range(8):
        a = GATE_A + (k + 0.5) / 8 * math.tau
        pts = [(math.cos(a) * r, math.sin(a) * r) for r in (RING_IN - 30, 520, 300, 90)]
        road(pts, "secondary", 9, "The Ways of Isengard")
    # a ring road round the plain, broken where the Isen's cut crosses it
    for r0, cls in ((520, "secondary"), (300, "residential")):
        pts = []
        for i in range(97):
            a = i / 96 * math.tau
            pts.append((math.cos(a) * r0, math.sin(a) * r0))
        road(pts, cls, 7 if r0 > 400 else 6)
    # tracks up the valley to the north, to the dam and the mountain
    road([(isen(z) - 120, z) for z in range(int(-RING_OUT - 60), -4300, -300)], "track", 5, "The Methedras Track")
    # the track east over the hills to the eaves of Fangorn, where the wood-cutting was
    road([(RING_OUT * 0.72, -RING_OUT * 0.72 + 30)] + [(x, -600 + 300 * math.sin(x / 900.0)) for x in range(900, 6000, 300)],
         "track", 5, "The Fangorn Track")
    out["roads"] = roads
    out["areas"] = [{"k": "plaza", "n": "The Plain of Isengard",
                     "o": flat([(math.cos(i / 96 * math.tau) * (RING_IN - 2), math.sin(i / 96 * math.tau) * (RING_IN - 2)) for i in range(96)]),
                     "i": []}]
    out["rail"], out["stations"] = [], []

    # ---------- buildings ----------
    # Saruman's forges and furnace-houses on the plain: black, low, flat-roofed, clustered between the roads and
    # clear of the Isen's cut, of the centre and of the wall. The halls in the wall and the domes over the shafts
    # are modelled in src/isengard/.
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
        if minh is not None:
            b["m"] = round(minh, 1)
        buildings.append(b)

    ch = channel()

    def clear(x, z, pad):
        d = math.hypot(x, z)
        if d < 190 or d > RING_IN - 70:
            return False
        if min(math.hypot(x - cx, z - cz) for cx, cz in ch) < 40 + pad:
            return False
        a = math.atan2(z, x)
        for k in range(8):
            ra = GATE_A + (k + 0.5) / 8 * math.tau
            da = abs(((a - ra) + math.pi) % math.tau - math.pi)
            if da * d < 16 + pad:
                return False
        if abs(((a - GATE_A) + math.pi) % math.tau - math.pi) * d < 22 + pad:
            return False
        for r0 in (520, 300):
            if abs(d - r0) < 12 + pad:
                return False
        return True

    FORGE = ["#2c2a29", "#33302d", "#282624", "#3a3531"]
    placed = []
    tries = 0
    while len(placed) < 70 and tries < 6000:
        tries += 1
        a = R.uniform(0, math.tau)
        d = R.uniform(210, RING_IN - 90)
        x, z = math.cos(a) * d, math.sin(a) * d
        w, dp = R.uniform(18, 40), R.uniform(12, 22)
        if not clear(x, z, max(w, dp) / 2):
            continue
        if any(math.hypot(x - px, z - pz) < (max(w, dp) + pr) * 0.6 for px, pz, pr in placed):
            continue
        placed.append((x, z, max(w, dp)))
        put(rect(x, z, w, dp, a + math.pi / 2), R.uniform(6, 13), "industrial", FORGE[R.randrange(len(FORGE))], roof="f")
    # ---- the farmsteads of the valley ----
    # Before Saruman, Nan Curunir was farmed: a few steadings down the valley by the road and the river, stone
    # houses with a byre, long empty and roofless. They are there in both Isengards, and they are the map's
    # buildings - the engine's are permanent, which is right for these and wrong for everything else here.
    FARM = "#6f6a60"
    for k in range(14):
        z = R.uniform(2200, 10500)
        x = isen(z) + R.choice([-1, 1]) * R.uniform(260, 900)
        a = R.uniform(0, math.pi)
        put(rect(x, z, R.uniform(14, 20), R.uniform(7, 9), a), R.uniform(3.5, 5.5), "ruin", FARM, name="A ruined steading", roof="f")
        put(rect(x + math.cos(a + 1.3) * 16, z + math.sin(a + 1.3) * 16, R.uniform(8, 12), R.uniform(5, 7), a + 0.1), R.uniform(2.5, 4), "ruin", FARM, roof="f")
        put(rect(x - math.cos(a) * 22, z - math.sin(a) * 22, 26, 1.2, a), 1.4, "wall", FARM, roof="f")
    kept = list(buildings[-14 * 3:])
    # The forges are Saruman's and go when the Ents have had the place: so they are not the engine's buildings,
    # which stand for good, but the page's (src/isengard/works.js), which lays them out by the same rules and
    # hides them in the Treegarth. This loop is kept as the record of those rules.
    out["buildings"] = kept

    # ---------- trees ----------
    # Fangorn: old, big and close together on the hills to the east, its edge ragged where it was cut. The rest of
    # the valley is mostly bare - Saruman had it felled for his furnaces - with a few thickets up the Isen.
    trees = []
    # Fangorn itself is drawn by the page (src/isengard/fangorn.js): a forest meant to be seen as a dark wall on
    # the hills from the Ring needs to be drawn at any distance, and the engine's trees are not. What is here is
    # the ground under it, dark with leaf-litter.
    edge_pts = [(FANGORN_X + 500 * math.sin(z / 1100.0) + 300 * math.sin(z / 370.0) - 60, z) for z in range(int(-HZ), int(HZ) + 1, 200)]
    out["areas"].append({"k": "wood", "n": "Fangorn", "o": flat(edge_pts + [(HX, HZ), (HX, -HZ)]), "i": []})
    n = 5200
    while n < 5200:
        x = R.uniform(FANGORN_X - 900, HX - 300)
        z = R.uniform(-HZ + 400, HZ - 400)
        edge = FANGORN_X + 500 * math.sin(z / 1100.0) + 300 * math.sin(z / 370.0)
        if x < edge:
            continue
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(6, 11))})
        n += 1
    for k in range(260):
        z = R.uniform(-4300, -1600)
        x = isen(z) + R.uniform(-260, 260)
        if river_dist(x, z) < 30:
            continue
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(3, 6))})
    out["trees"] = trees

    out["pois"] = [{"n": "Orthanc", "x": 0, "z": 0, "k": "tower", "ang": 0},
                   {"n": "The Gate of Isengard", "x": q(gx), "z": q(gz), "k": "gate", "ang": 0},
                   {"n": "Methedras", "x": q(METHEDRAS[0]), "z": q(METHEDRAS[1]), "k": "peak", "ang": 0}]

    t = out["terrain"]
    lo, hi = min(t["h"]) / 10.0, max(t["h"]) / 10.0
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)}; roads {len(roads)}; "
          f"trees {len(trees)}; terrain {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f} m to {hi:.0f} m; "
          f"bounds {out['bounds']}")


if __name__ == "__main__":
    main()
