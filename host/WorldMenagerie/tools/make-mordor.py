#!/usr/bin/env python3
"""Generate the whole of Mordor as a city data file the OSM engine can read.

    python3 tools/make-mordor.py

Fan work from Tolkien, whose work belongs to the Tolkien Estate; nothing from any book, film or game is used.
The land is generated from the published geography and every shape is modelled from scratch here.

This one is a country, not a city: 680 km east to west and 560 km north to south, at true proportion. That is
the point of it - Gorgoroth is a plateau you could lose a nation on, and at that scale Barad-dur is a splinter
and the Black Gate is a scratch across a valley. They are built at their real size and left small.

  Ered Lithui, the Ash Mountains, close the north and turn down the east
  Ephel Duath, the Mountains of Shadow, close the west and turn along the south
  where they nearly meet in the north-west is Cirith Gorgor, and in it the Black Gate
  behind the Gate lies Udun, and past the Isenmouthe the plateau of Gorgoroth
  Orodruin stands out on the plateau; Barad-dur sits east of it on a spur off the Ash Mountains
  south and east the land falls to Nurn and the Sea of Nurnen, which is the only water in Mordor
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "mordor-osm.json")
R = random.Random(3019)

HX, HZ = 340000.0, 280000.0      # half-extents west and north-south
HXE = 180000.0                   # and the map stops here in the east: past the Sea of Nurnen there is
                                 # nothing but more of the same, and a hundred and sixty kilometres of empty
                                 # heightfield costs as much to carry as the half of the land with Mordor in
                                 # it. Everything that survives the cut is on or around the sea.
STEP = 1000                      # the height grid, in metres

DOOM = (-120000.0, -60000.0)     # Orodruin
BARAD = (-40000.0, -140000.0)    # Barad-dur, on its spur
MORANNON = (-272000.0, -216000.0)   # in the vale between the two ranges' ends
# Cirith Gorgor, as a pass: T is the way through it (out to Dagorlad, in to Udun), U runs along the wall
# the Gate is built in. The ranges' ends lie on the U axis, thirty-four kilometres out either side.
PASS_T = (0.70711, 0.70711)
PASS_U = (-0.70711, 0.70711)
PASS_HALF = 3200.0                  # half the width of the slot the Gate closes
PASS_RAMP = 2200.0                  # and how fast the rock comes up either side of it
PASS_FLOOR = 560.0
ISENMOUTHE = (-208000.0, -152000.0)
NURNEN = (72000.0, 150000.0)     # the Sea of Nurnen
CIRITH_UNGOL = (-282000.0, -34000.0)
MINAS_MORGUL = (-310000.0, -14000.0)
DURTHANG = (-262000.0, -164000.0)

# the two ranges, as coarse polylines; the height field is built from the distance to them
# The two walls stop short of each other in the north-west. What is between their ends is Cirith Gorgor,
# and the Black Gate is built across it: a real gap in the geography rather than a notch punched in a ridge.
ERED_LITHUI = [(-248000, -240000), (-200000, -246000), (-90000, -242000), (20000, -234000),
               (130000, -224000), (230000, -210000), (286000, -178000), (306000, -110000), (312000, -30000)]
EPHEL_DUATH = [(-296000, -192000), (-298000, -150000), (-292000, -70000), (-286000, 20000),
               (-262000, 96000), (-200000, 150000), (-110000, 182000), (0, 196000), (110000, 198000),
               (208000, 186000), (280000, 150000), (308000, 80000)]
MORGAI = [(-262000, -150000), (-266000, -70000), (-260000, 10000), (-240000, 76000)]
# the spur Barad-dur stands at the end of, running south out of the Ash Mountains
SPUR = [(-34000, -238000), (-36000, -190000), (-40000, -150000)]


def seg_dist(px, pz, ax, az, bx, bz):
    dx, dz = bx - ax, bz - az
    L = dx * dx + dz * dz
    t = 0.0 if L == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L))
    return math.hypot(px - ax - t * dx, pz - az - t * dz)


def path_dist(x, z, path):
    best = 1e18
    for i in range(len(path) - 1):
        ax, az = path[i]
        bx, bz = path[i + 1]
        d = seg_dist(x, z, ax, az, bx, bz)
        if d < best:
            best = d
    return best


def ridge(x, z, path, width, height, rough=0.0, crest=0.26):
    """A mountain range built as a wall: steep flanks, a broad crest, and a serrated ridgeline.

    A smoothstep dome is what a hill looks like. These are the walls of Mordor, so the profile rises hard
    out of the plain (f ** crest, with crest well under 1) and only flattens near the top, and the crest is
    cut up by two noise waves so it reads as peaks and saddles rather than an embankment. The outermost
    tenth of the width is eased back to nothing so the toe does not land as a step.
    """
    d = path_dist(x, z, path)
    if d > width:
        return 0.0
    f = 1 - d / width
    h = height * (f ** crest) * smoothstep(0.0, 0.07, f)
    if rough:
        serr = (math.sin(x / 7300.0 + z / 5100.0) * 0.58
                + math.sin(x / 2600.0 - z / 3100.0) * 0.3
                + math.sin(x / 1150.0 + z / 1450.0) * 0.12)
        h *= 1 + rough * serr
    return h


def off_map(x, z, m=0.0):
    """Outside the box the land is drawn in, with a margin. The box is not centred any more."""
    return x < -HX + m or x > HXE - m or abs(z) > HZ - m


def nurnen_edge(a):
    """The shore of the Sea of Nurnen, an irregular oval."""
    return 92000 * (1 + 0.13 * math.sin(a * 3 + 0.7) + 0.07 * math.sin(a * 5 - 1.1))


def in_nurnen(x, z):
    dx, dz = x - NURNEN[0], (z - NURNEN[1]) * 1.45
    a = math.atan2(dz, dx)
    return math.hypot(dx, dz) < nurnen_edge(a)


def terrain_height(x, z):
    # the floor: Gorgoroth is a high ash plateau in the north-west, Nurn falls away south-east to the sea
    plateau = 620 * smoothstep(60000, -40000, z) * smoothstep(60000, -60000, x)
    base = 180 + plateau
    dxn, dzn = x - NURNEN[0], (z - NURNEN[1]) * 1.45
    toward_sea = smoothstep(240000, 40000, math.hypot(dxn, dzn))
    base = base * (1 - toward_sea * 0.92) + 12 * toward_sea
    base += 30 * math.sin(x / 26000.0) * math.cos(z / 31000.0) + 18 * math.sin(z / 12000.0 + 1.3)

    h = base
    # Deliberately exaggerated. At true vertical scale these are swells on the horizon; Tolkien's are walls,
    # and the land only reads as enclosed if they are built as walls.
    rs = [ridge(x, z, ERED_LITHUI, 21000, 7400, 0.30),    # the Ash Mountains
          ridge(x, z, EPHEL_DUATH, 19000, 8600, 0.30),    # the Mountains of Shadow
          ridge(x, z, MORGAI, 7000, 3200, 0.38),          # the Morgai, the inner ridge
          ridge(x, z, SPUR, 9000, 3600, 0.28)]            # the spur Barad-dur stands on
    # where two ranges meet they should join, not add: the tallest wins and the rest only bulk it out,
    # or the north-west corner where both walls run together stacks to twice the height of either
    top = max(rs)
    h += top + 0.25 * (sum(rs) - top)

    # Cirith Gorgor: the gap in the north-west corner where the ranges almost meet, and Udun behind it.
    # "Almost" was doing too much work here. The two ranges' ends are sixty-eight kilometres apart and the
    # floor between them was twenty-eight kilometres of open plain, so the Gate stood in the middle of it
    # blocking nothing. The vale is filled in to the height of the walls that meet there and one slot is cut
    # back out of it: the Gate is built across that slot and there is no other way through.
    gu = (x - MORANNON[0]) * PASS_U[0] + (z - MORANNON[1]) * PASS_U[1]      # across the pass
    gv = (x - MORANNON[0]) * PASS_T[0] + (z - MORANNON[1]) * PASS_T[1]      # in through it, towards Udun
    vale = smoothstep(30000, 9000, abs(gv)) * smoothstep(40000, 30000, abs(gu))
    if vale > 0:
        h = max(h, (6600 + 900 * math.sin(gu / 5200.0) + 500 * math.sin(gv / 3100.0)) * vale)
        # the slot is pinched at the Gate and opens out both ways: onto Dagorlad in front, into Udun behind,
        # so it reads as a pass narrowing to a door rather than fifty kilometres of trench
        half = PASS_HALF + 0.62 * abs(gv)
        slot = smoothstep(half + PASS_RAMP, half, abs(gu)) * smoothstep(34000, 24000, abs(gv))
        h = h * (1 - slot) + PASS_FLOOR * slot
    udun = smoothstep(62000, 0, math.hypot(x - (MORANNON[0] + 40000), z - (MORANNON[1] + 44000)))
    h = h * (1 - 0.72 * udun) + 430 * udun
    ise = smoothstep(26000, 0, math.hypot(x - ISENMOUTHE[0], z - ISENMOUTHE[1]))
    h *= 1 - 0.55 * ise
    for p in (CIRITH_UNGOL, MINAS_MORGUL):                 # the passes through the western wall
        h *= 1 - 0.6 * smoothstep(20000, 0, math.hypot(x - p[0], z - p[1]))

    # Orodruin: a cone on the plateau with a crater in its head
    dd = math.hypot(x - DOOM[0], z - DOOM[1])
    # a 26 km skirt for 1.5 km of height is a 1:17 slope, which reads as flat ground from anywhere on the plain.
    # Orodruin is a cone: about nine kilometres across its foot, and steep enough to be a mountain.
    if dd < 16000:
        # A stratovolcano is not a dome. Its profile is concave: the flanks are steep near the head, where
        # everything that comes out of it lands on itself, and they flare out at the foot where the flows ran.
        # (1 - d/R) raised to a power gives the opposite - a flat top and a straight skirt - so this is an
        # exponential, normalised to reach nought at the foot, with gullies cut down it.
        t = dd / 16000.0
        cone = 4900 * (math.exp(-3.6 * t) - math.exp(-3.6)) / (1 - math.exp(-3.6))
        ang = math.atan2(z - DOOM[1], x - DOOM[0])
        cone *= 1 + 0.075 * math.sin(ang * 9 + 0.6) + 0.04 * math.sin(ang * 21 - 1.2)   # the barrancos
        if dd < 1500:
            cone -= 760 * (1 - dd / 1500) ** 1.4           # the Sammath Naur, sunk into the summit
        h += cone
    h += 460 * smoothstep(34000, 14000, dd)                # the apron of spoil heaped round its foot
    # the ash that fell out of it, heaped downwind
    h += 90 * smoothstep(120000, 8000, dd) * (0.5 + 0.5 * math.sin(x / 9000.0 + z / 7000.0))

    if in_nurnen(x, z):
        dx2, dz2 = x - NURNEN[0], (z - NURNEN[1]) * 1.45
        a = math.atan2(dz2, dx2)
        f = math.hypot(dx2, dz2) / nurnen_edge(a)
        return -6.0 - 60.0 * (1 - f)
    fx = smoothstep(HX, HX - 30000, -x) if x < 0 else smoothstep(HXE, HXE - 30000, x)
    h *= min(fx, smoothstep(HZ, HZ - 30000, abs(z)))
    return max(2.0, h)


def main():
    out = {"attribution": "Mordor: fan geometry generated by tools/make-mordor.py; no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [-2.51951, -3.05426, 2.51951, 1.61696]}

    nx = int(HX + HXE) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # ---------- the Sea of Nurnen ----------
    ring = []
    for k in range(120):
        a = k / 120 * math.tau
        r = nurnen_edge(a)
        ring.append((NURNEN[0] + math.cos(a) * r, NURNEN[1] + math.sin(a) * r / 1.45))
    out["lake"] = []
    out["islands"] = []
    out["water"] = [{"o": flat(ring), "i": [], "n": "The Sea of Nurnen"}]
    out["marina"], out["beach"], out["pier"] = [], [], []
    out["waterways"] = []

    # ---------- the roads of Mordor ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    def curve(a, b, bow=0.0, n=26):
        ax, az = a
        bx, bz = b
        mx, mz = (ax + bx) / 2, (az + bz) / 2
        dx, dz = bx - ax, bz - az
        L = math.hypot(dx, dz) or 1
        cx, cz = mx - dz / L * bow, mz + dx / L * bow
        pts = []
        for k in range(n + 1):
            t = k / n
            u = 1 - t
            pts.append((u * u * ax + 2 * u * t * cx + t * t * bx, u * u * az + 2 * u * t * cz + t * t * bz))
        return pts

    road(curve(MORANNON, ISENMOUTHE, 9000), "trunk", 24, "The Black Gate Road")
    road(curve(ISENMOUTHE, BARAD, 28000), "trunk", 22, "The Road to Barad-dur")
    road(curve(BARAD, DOOM, -16000), "trunk", 20, "Sauron's Road")
    road(curve(ISENMOUTHE, (-150000, 40000), -20000), "primary", 16, "The West Road")
    road(curve((-150000, 40000), (-20000, 120000), 24000), "primary", 16, "The Nurn Road")
    road(curve((-20000, 120000), (NURNEN[0] - 96000, NURNEN[1] + 10000), 8000), "primary", 14, "The Nurn Road")
    road(curve(CIRITH_UNGOL, (-236000, -20000), -9000), "secondary", 12, "The Cirith Ungol Stair")
    road(curve((-236000, -20000), DOOM, 18000), "secondary", 12, "The Ash Road")
    road(curve(DURTHANG, ISENMOUTHE, 6000), "secondary", 12, "The Durthang Road")
    # the ring of slave-roads around Nurnen
    for k in range(10):
        a0 = k / 10 * math.tau
        a1 = (k + 1) / 10 * math.tau
        p0 = (NURNEN[0] + math.cos(a0) * (nurnen_edge(a0) + 16000), NURNEN[1] + math.sin(a0) * (nurnen_edge(a0) + 16000) / 1.45)
        p1 = (NURNEN[0] + math.cos(a1) * (nurnen_edge(a1) + 16000), NURNEN[1] + math.sin(a1) * (nurnen_edge(a1) + 16000) / 1.45)
        road(curve(p0, p1, 4000, 10), "secondary", 12, "The Nurnen Shore Road")
    out["roads"] = roads

    # ---------- the land ----------
    def ellipse(cx, cz, rx, rz, n=40, wob=0.0):
        return [(cx + math.cos(i / n * math.tau) * rx * (1 + wob * math.sin(i * 3.0)),
                 cz + math.sin(i / n * math.tau) * rz * (1 + wob * math.cos(i * 2.0))) for i in range(n)]

    areas = [
        {"k": "industrial", "n": "The Plateau of Gorgoroth",
         "o": flat(ellipse(-130000, -60000, 130000, 96000, 48, 0.07)), "i": []},
        {"k": "industrial", "n": "Udun", "o": flat(ellipse(-224000, -186000, 46000, 38000, 28, 0.09)), "i": []},
        {"k": "grass", "n": "The Fields of Nurn",
         "o": flat(ellipse(NURNEN[0], NURNEN[1], 168000, 116000, 48, 0.06)), "i": []},
        {"k": "industrial", "n": "The Ash Wastes", "o": flat(ellipse(40000, -130000, 150000, 80000, 40, 0.08)), "i": []},
    ]
    out["areas"] = areas
    out["rail"] = []
    out["stations"] = []

    # ---------- what is built here, which is not much and all of it small ----------
    buildings = []

    def put(ring, h, kind=None, colour=None, name=None, minh=None):
        b = {"p": flat(ring), "h": round(h, 1), "r": "f"}
        if kind:
            b["t"] = kind
        if colour:
            b["c"] = colour
        if name:
            b["n"] = name
        if minh:
            b["m"] = round(minh, 1)
        buildings.append(b)

    BLACK = ["#2a2724", "#232120", "#332f2b", "#1e1c1b"]

    def camp(cx, cz, n, spread, name=None):
        """An orc camp: huts and a palisade, a few hundred metres across and lost on the plain."""
        for k in range(n):
            a = R.uniform(0, math.tau)
            d = R.uniform(0, spread)
            px, pz = cx + math.cos(a) * d, cz + math.sin(a) * d
            put(rect(px, pz, R.uniform(14, 36), R.uniform(12, 28), R.uniform(0, math.pi)),
                R.uniform(5, 13), "hut", BLACK[R.randrange(len(BLACK))],
                name=name if (k == 0 and name) else None)

    # ---------- the industry: this is what the land is for ----------
    pois = []
    TOWN = ["Kalgur", "Durthak", "Morgath", "Uzgul", "Thrakburz", "Narkuz", "Skarn", "Gorkul", "Ashkag",
            "Bhulgrim", "Ghashmar", "Zurmak", "Oghrath", "Lugdan", "Vrakhaz", "Mazgul", "Tolkarn", "Udrak",
            "Crannog", "Belzur", "Hagrim", "Sarkoth"]
    tn = [0]

    def forge_town(cx, cz, scale=1.0, kind="forge"):
        """A works: furnace halls, barrack rows, a muster yard and a wall, with stacks that burn day and night."""
        name = TOWN[tn[0] % len(TOWN)] + ("" if tn[0] < len(TOWN) else " %d" % (tn[0] // len(TOWN) + 1))
        tn[0] += 1
        rot = R.uniform(0, math.pi)
        c, sn = math.cos(rot), math.sin(rot)
        def place(u, v):
            return cx + u * c - v * sn, cz + u * sn + v * c
        # the furnace halls, long and heavy, in a row
        halls = R.randint(3, 7)
        for k in range(halls):
            u = (k - (halls - 1) / 2) * 150 * scale
            hx, hz = place(u, -120 * scale)
            put(rect(hx, hz, 120 * scale, 78 * scale, rot), R.uniform(26, 46) * scale, "industrial", "#302c27",
                name=name + " Forges" if k == 0 else None)
            pois.append({"n": name, "x": q(hx), "z": q(hz), "k": kind, "ang": round(rot, 3)})
        # slag: low wide heaps behind the halls
        for k in range(R.randint(3, 8)):
            sx, sz = place(R.uniform(-1, 1) * 420 * scale, R.uniform(180, 400) * scale)
            put(rect(sx, sz, R.uniform(70, 160) * scale, R.uniform(60, 130) * scale, R.uniform(0, math.pi)),
                R.uniform(9, 26) * scale, "slag", "#3a332b")
        # barracks: rows of them, all the same, because they hold the same thing
        rows = R.randint(4, 9)
        for k in range(rows):
            for j in range(R.randint(3, 7)):
                bx, bz = place(-500 * scale + j * 96 * scale, 60 * scale + k * 54 * scale)
                put(rect(bx, bz, 78 * scale, 26 * scale, rot), R.uniform(9, 15) * scale, "barracks", "#2b2724")
        # the muster yard, walled
        for k in range(16):
            a = k / 16 * math.tau
            wx, wz = place(math.cos(a) * 620 * scale, math.sin(a) * 520 * scale - 40 * scale)
            put(rect(wx, wz, 90 * scale, 16 * scale, rot + a), 16 * scale, "wall", "#332f2a")
        # towers on the corners
        for k in range(4):
            a = k / 4 * math.tau + 0.6
            tx, tz = place(math.cos(a) * 600 * scale, math.sin(a) * 500 * scale - 40 * scale)
            put(rect(tx, tz, 40 * scale, 40 * scale, rot), R.uniform(40, 70) * scale, "tower", "#262320")
        return name

    # the works of Gorgoroth: strung along the road between the Isenmouthe, Barad-dur and Orodruin
    for k in range(52):
        t = R.random()
        cx = -230000 + t * 200000 + R.uniform(-30000, 30000)
        cz = -180000 + R.random() * 170000
        if math.hypot(cx - DOOM[0], cz - DOOM[1]) < 20000 or in_nurnen(cx, cz):
            continue
        if math.hypot(cx - BARAD[0], cz - BARAD[1]) < 9000:
            continue
        forge_town(cx, cz, R.uniform(0.8, 1.5))
    # the mine workings, cut into the flanks of both walls
    for k in range(40):
        path = ERED_LITHUI if k % 2 else EPHEL_DUATH
        i = R.randrange(len(path) - 1)
        ax, az = path[i]
        bx, bz = path[i + 1]
        t = R.random()
        mx, mz = ax + (bx - ax) * t, az + (bz - az) * t
        inward = 1 if path is ERED_LITHUI else 1
        mx += R.uniform(14000, 30000) * (1 if path is EPHEL_DUATH else 0)
        mz += R.uniform(14000, 30000) * (1 if path is ERED_LITHUI else 0)
        if off_map(mx, mz, 40000) or in_nurnen(mx, mz):
            continue
        forge_town(mx, mz, R.uniform(0.5, 0.9), kind="mine")
    # the slave-fields of Nurn: the camps that work them, round the shore
    for k in range(64):
        a = R.uniform(0, math.tau)
        r = nurnen_edge(a) + R.uniform(11000, 46000)
        cx, cz = NURNEN[0] + math.cos(a) * r, NURNEN[1] + math.sin(a) * r / 1.45
        if off_map(cx, cz, 30000):
            continue
        if R.random() < 0.45:
            forge_town(cx, cz, R.uniform(0.5, 0.8), kind="camp")
        else:
            camp(cx, cz, R.randint(8, 18), R.uniform(500, 1500))
    # the fissures: Gorgoroth is cracked open, and what is under it shows through
    for k in range(90):
        fx = -250000 + R.random() * 240000
        fz = -200000 + R.random() * 210000
        if in_nurnen(fx, fz) or math.hypot(fx - DOOM[0], fz - DOOM[1]) < 9000:
            continue
        if off_map(fx, fz, 40000):
            continue
        pois.append({"n": "fissure", "x": q(fx), "z": q(fz), "k": "fissure", "ang": round(R.uniform(0, math.pi), 3)})

    # the lesser camps, scattered over the plateau
    for k in range(140):
        cx = -250000 + R.random() * 230000
        cz = -190000 + R.random() * 190000
        if math.hypot(cx - DOOM[0], cz - DOOM[1]) < 20000 or in_nurnen(cx, cz):
            continue
        camp(cx, cz, R.randint(10, 30), R.uniform(300, 1400))
    # ---------- what holds the country together ----------
    # A war economy this size is not forges and camps with empty ground between them. It is the road furniture:
    # a tower within sight of the last one the whole length of every road, posts at the junctions, quarries and
    # spoil where the stone came from, pens for the beasts, wain parks, and the muster fields where an army is
    # put together before it is marched anywhere. All of it is low, black and repetitive, which is the point.

    def watchtower(tx, tz, h=70, name=None):
        """A tower of the Eye's own: a square base, a taller shaft, and a fire basket on top."""
        rot = R.uniform(0, math.pi)
        put(rect(tx, tz, 46, 46, rot), h * 0.42, "tower", "#242220", name=name)
        put(rect(tx, tz, 30, 30, rot), h, "tower", "#2b2926", minh=h * 0.42)
        put(rect(tx, tz, 16, 16, rot), h + 14, "beacon", "#3a2a20", minh=h)
        pois.append({"n": name or "watchtower", "x": q(tx), "z": q(tz), "k": "tower", "ang": round(rot, 3)})

    def stockade(cx, cz, r, n=14, h=11):
        """A ring of palisade stakes, and a gate gap in it facing the road."""
        gap = R.uniform(0, math.tau)
        for k in range(n):
            a = k / n * math.tau
            if abs((a - gap + math.pi) % math.tau - math.pi) < 0.28:
                continue
            put(rect(cx + math.cos(a) * r, cz + math.sin(a) * r, r * 0.52, 14, a),
                h * R.uniform(0.85, 1.15), "wall", "#332f2a")

    def quarry(cx, cz, r):
        """Stepped benches cut down into the rock, and the spoil thrown out beside them."""
        for k in range(5):
            rr = r * (1 - k * 0.17)
            for j in range(10):
                a = j / 10 * math.tau
                put(rect(cx + math.cos(a) * rr, cz + math.sin(a) * rr, rr * 0.7, 40, a),
                    -8 - k * 9, "quarry", "#1f1d1b", minh=-18 - k * 9)
        for k in range(R.randint(4, 9)):
            a = R.uniform(0, math.tau)
            d = r * R.uniform(1.4, 2.4)
            put(rect(cx + math.cos(a) * d, cz + math.sin(a) * d, R.uniform(80, 220), R.uniform(70, 180),
                     R.uniform(0, math.pi)), R.uniform(14, 44), "slag", "#37302a")

    def pens(cx, cz, n=6):
        """Stock pens: what the wains are drawn by, and what the trolls are fed."""
        rot = R.uniform(0, math.pi)
        for k in range(n):
            u = (k - n / 2) * 150
            px = cx + u * math.cos(rot)
            pz = cz + u * math.sin(rot)
            for j in range(4):
                a = j / 4 * math.tau + rot
                put(rect(px + math.cos(a) * 60, pz + math.sin(a) * 60, 118, 9, a + math.pi / 2), 7, "wall", "#2e2b27")
            put(rect(px, pz, 26, 20, rot), 9, "hut", "#292624")

    def wain_park(cx, cz, rows=6, per=12):
        """Wagons parked up in ranks, waiting for the road to clear."""
        rot = R.uniform(0, math.pi)
        c2, s2 = math.cos(rot), math.sin(rot)
        for r2 in range(rows):
            for j in range(per):
                u, v = (j - per / 2) * 26, (r2 - rows / 2) * 34
                put(rect(cx + u * c2 - v * s2, cz + u * s2 + v * c2, 18, 9, rot), 6, "wain", "#2c2722")

    def muster_field(cx, cz, w=2600, d=1800, name=None):
        """A field of tents in ranks, a drill ground beaten flat beside it, and a stockade round the lot."""
        rot = R.uniform(0, math.pi)
        c2, s2 = math.cos(rot), math.sin(rot)
        rows = int(d / 120)
        per = int(w / 130)
        for r2 in range(rows):
            for j in range(per):
                if R.random() < 0.08:
                    continue
                u = (j - per / 2) * 130 + R.uniform(-14, 14)
                v = (r2 - rows / 2) * 120 + R.uniform(-12, 12)
                put(rect(cx + u * c2 - v * s2, cz + u * s2 + v * c2, R.uniform(50, 90), R.uniform(40, 70), rot),
                    R.uniform(9, 16), "tent", "#26231f",
                    name=name if (r2 == 0 and j == 0 and name) else None)
        stockade(cx, cz, max(w, d) * 0.62, 26, 13)
        for k in range(4):
            a = k / 4 * math.tau + 0.4
            watchtower(cx + math.cos(a) * max(w, d) * 0.62, cz + math.sin(a) * max(w, d) * 0.62, 56)
        wain_park(cx + math.cos(rot) * w * 0.55, cz + math.sin(rot) * w * 0.55)
        pens(cx - math.cos(rot) * w * 0.55, cz - math.sin(rot) * w * 0.55)

    # towers the length of every road, one every twenty-five kilometres, which is as far as a fire can be seen
    for r2 in roads:
        if not r2.get("n"):
            continue
        pts = [(r2["p"][i] / 10.0, r2["p"][i + 1] / 10.0) for i in range(0, len(r2["p"]), 2)]
        run = 0.0
        for i in range(len(pts) - 1):
            seg = math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
            run += seg
            if run < 25000:
                continue
            run = 0.0
            nx, nz2 = pts[i][1] - pts[i + 1][1], pts[i + 1][0] - pts[i][0]
            nl = math.hypot(nx, nz2) or 1
            off = R.choice((-1, 1)) * R.uniform(700, 2200)
            tx, tz = pts[i][0] + nx / nl * off, pts[i][1] + nz2 / nl * off
            if off_map(tx, tz, 12000) or in_nurnen(tx, tz):
                continue
            watchtower(tx, tz, R.uniform(50, 95))
            if R.random() < 0.45:
                stockade(tx, tz, R.uniform(180, 380))
                camp(tx, tz, R.randint(5, 14), R.uniform(140, 320))

    # the muster fields: behind the Gate, in Udun, on the plateau and at the Isenmouthe
    muster_field(MORANNON[0] + 26000, MORANNON[1] + 20000, 3400, 2400, "The Muster of the Morannon")
    muster_field(MORANNON[0] + 62000, MORANNON[1] + 56000, 3000, 2200, "The Muster of Udun")
    muster_field(ISENMOUTHE[0] + 14000, ISENMOUTHE[1] + 18000, 2600, 1900, "The Isenmouthe Muster")
    muster_field(BARAD[0] - 26000, BARAD[1] + 22000, 3200, 2200, "The Muster of the Tower")
    muster_field(DOOM[0] + 34000, DOOM[1] + 30000, 2400, 1700)
    muster_field(-190000, 30000, 2600, 1800)

    # quarries: where the stone for all of it came out of the ground
    for k in range(22):
        qx = -250000 + R.random() * 230000
        qz = -200000 + R.random() * 200000
        if in_nurnen(qx, qz) or math.hypot(qx - DOOM[0], qz - DOOM[1]) < 16000:
            continue
        if off_map(qx, qz, 30000):
            continue
        quarry(qx, qz, R.uniform(300, 900))
        camp(qx + R.uniform(-2000, 2000), qz + R.uniform(-2000, 2000), R.randint(8, 20), R.uniform(300, 900))

    # pens and wain parks along the trunk roads, because an army eats and everything has to be carted
    for k in range(30):
        px2 = -250000 + R.random() * 230000
        pz2 = -200000 + R.random() * 200000
        if in_nurnen(px2, pz2) or off_map(px2, pz2, 30000):
            continue
        if R.random() < 0.5:
            pens(px2, pz2, R.randint(4, 9))
        else:
            wain_park(px2, pz2, R.randint(4, 8), R.randint(8, 16))


    # ---------- the Sea of Nurnen ----------
    # This is the half of Mordor nobody draws. Gorgoroth is the forge and it cannot feed itself; Nurn is
    # where the food comes from, worked by people who were brought here to do it. So the shore is not
    # wilderness: it is field strips running back from the water, irrigation cut between them, salt pans on
    # the south where the sea is shallow and bitter, fishing hamlets with their boats drawn up, and a guard
    # tower over every one of them, because none of this is voluntary.
    def shore_at(a):
        r = nurnen_edge(a)
        return NURNEN[0] + math.cos(a) * r, NURNEN[1] + math.sin(a) * r / 1.45

    hamlets = 0
    for k in range(38):
        a = k / 38 * math.tau + R.uniform(-0.04, 0.04)
        sx, sz = shore_at(a)
        ox, oz = math.cos(a), math.sin(a) / 1.45          # outward from the water
        if off_map(sx, sz, 6000):
            continue
        # the hamlet, just back from the water
        hx, hz = sx + ox * 1400, sz + oz * 1400
        rot = math.atan2(oz, ox)
        for j in range(R.randint(9, 22)):
            px = hx + R.uniform(-520, 520)
            pz = hz + R.uniform(-520, 520)
            put(rect(px, pz, R.uniform(16, 34), R.uniform(12, 24), R.uniform(0, math.pi)),
                R.uniform(5, 11), "hut", "#3a342b")
        # the quay, out into the water, and the boats drawn up beside it
        out["pier"].append({"o": flat(rect(sx - ox * 420, sz - oz * 420, 620, 90, rot)), "i": []})
        for j in range(R.randint(3, 9)):
            bx = sx - ox * R.uniform(200, 700) + R.uniform(-300, 300)
            bz = sz - oz * R.uniform(200, 700) + R.uniform(-300, 300)
            put(rect(bx, bz, R.uniform(30, 60), R.uniform(10, 16), R.uniform(0, math.pi)), 4, "boat", "#2e2a24")
        watchtower(hx + ox * 900, hz + oz * 900, R.uniform(40, 64))
        pois.append({"n": "Nurn", "x": q(hx), "z": q(hz), "k": "hearth", "ang": 0})
        # the field strips: long and narrow, running back from the shore, with a ditch between each pair
        for f in range(R.randint(10, 20)):
            v = (f - 9) * 620
            fx = sx + ox * (4000 + R.uniform(-600, 600)) - math.sin(rot) * v
            fz = sz + oz * (4000 + R.uniform(-600, 600)) + math.cos(rot) * v
            if off_map(fx, fz, 4000) or in_nurnen(fx, fz):
                continue
            areas.append({"k": "grass", "n": "", "i": [],
                          "o": flat(rect(fx, fz, 5200, 420, rot))})
        # the irrigation, cut back from the water between the strips
        for f in range(R.randint(3, 6)):
            v = (f - 2) * 2400
            ax = sx - math.sin(rot) * v
            az = sz + math.cos(rot) * v
            out["waterways"].append({"n": "irrigation",
                                     "p": flat([(ax + ox * t, az + oz * t) for t in range(0, 9000, 900)])})
        hamlets += 1

    # the salt pans: a grid of shallow walled squares on the flat south shore
    for k in range(7):
        a = math.pi * (0.55 + 0.32 * k / 6)
        sx, sz = shore_at(a)
        ox, oz = math.cos(a), math.sin(a) / 1.45
        for i in range(6):
            for j in range(5):
                px = sx + ox * (700 + i * 520) + (j - 2) * 520 * -math.sin(math.atan2(oz, ox))
                pz = sz + oz * (700 + i * 520) + (j - 2) * 520 * math.cos(math.atan2(oz, ox))
                if off_map(px, pz, 3000) or in_nurnen(px, pz):
                    continue
                for e in range(4):
                    ea = e / 4 * math.tau
                    put(rect(px + math.cos(ea) * 230, pz + math.sin(ea) * 230, 470, 26, ea + math.pi / 2),
                        3, "wall", "#4a4338")

    # the granaries and the wain road that takes it all north: this is why Nurn exists
    for k in range(9):
        a = R.uniform(0, math.tau)
        gx, gz = shore_at(a)
        gx += math.cos(a) * 9000
        gz += math.sin(a) * 9000 / 1.45
        if off_map(gx, gz, 8000):
            continue
        rot = R.uniform(0, math.pi)
        for j in range(R.randint(4, 8)):
            put(rect(gx + (j - 3) * 150 * math.cos(rot), gz + (j - 3) * 150 * math.sin(rot),
                     130, 60, rot), R.uniform(22, 34), "industrial", "#3d362c",
                name="The Granaries of Nurn" if (k == 0 and j == 0) else None)
        pois.append({"n": "Nurn", "x": q(gx), "z": q(gz), "k": "hearth", "ang": 0})
        stockade(gx, gz, 900, 22, 12)
        watchtower(gx, gz + 1100, 70)
        wain_park(gx + 1600, gz, 6, 14)

    # ---------- crags ----------
    # A one-kilometre height grid cannot hold a cliff: the steepest profile still comes out as a smooth swell
    # because the whole rise happens inside a single sample. So the ridgelines carry rock of their own -
    # angular masses extruded from the ground, vertical by construction, giving the ranges a skyline.
    def crags(path, spacing, count, hmin, hmax, wmin, wmax, jitter):
        n = 0
        for i in range(len(path) - 1):
            ax, az = path[i]
            bx, bz = path[i + 1]
            L = math.hypot(bx - ax, bz - az)
            steps = max(1, int(L // spacing))
            for k in range(steps):
                t = k / steps
                cx0 = ax + (bx - ax) * t
                cz0 = az + (bz - az) * t
                for _ in range(count):
                    px = cx0 + R.uniform(-jitter, jitter)
                    pz = cz0 + R.uniform(-jitter, jitter)
                    if off_map(px, pz, 12000):
                        continue
                    w = R.uniform(wmin, wmax)
                    d = w * R.uniform(0.5, 1.0)
                    put(rect(px, pz, w, d, R.uniform(0, math.pi)),
                        R.uniform(hmin, hmax), "crag",
                        ["#332f29", "#2b2723", "#3c362e", "#262320"][R.randrange(4)])
                    n += 1
        return n

    # the two walls of Cirith Gorgor, which have to be sheer where the Gate meets them: narrow masses set
    # tight to the edge of the slot, so the rock goes up beside the Gate instead of sloping away from it
    def pass_wall(side):
        path = []
        for v in range(-24000, 24001, 2000):
            half = PASS_HALF + 0.62 * abs(v) + 1600
            path.append((MORANNON[0] + PASS_U[0] * side * half + PASS_T[0] * v,
                         MORANNON[1] + PASS_U[1] * side * half + PASS_T[1] * v))
        return path

    ncrag = 0
    for side in (-1, 1):
        ncrag += crags(pass_wall(side), 1500, 3, 2200, 5400, 900, 2600, 600)
    ncrag += crags(ERED_LITHUI, 2600, 5, 1400, 4600, 1400, 5200, 5000)
    ncrag += crags(EPHEL_DUATH, 2600, 5, 1600, 5200, 1400, 5600, 4600)
    ncrag += crags(MORGAI, 3000, 3, 700, 2200, 900, 2800, 2600)
    ncrag += crags(SPUR, 3000, 3, 900, 2600, 1000, 3000, 3000)

    # Durthang, a fort in the northern Ephel Duath
    put(rect(DURTHANG[0], DURTHANG[1], 260, 200, 0.3), 90, "tower", "#2b2926", name="Durthang")
    for k in range(4):
        a = k / 4 * math.tau + 0.4
        put(rect(DURTHANG[0] + math.cos(a) * 150, DURTHANG[1] + math.sin(a) * 150, 70, 70, a), 130, "tower", "#232120")
    out["buildings"] = buildings
    out["trees"] = []
    out["pois"] = pois

    json.dump(out, open(OUT, "w"), separators=(",", ":"))
    t = out["terrain"]
    lo = min(t["h"]) / 10
    hi = max(t["h"]) / 10
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; {(HX+HXE)/1000:.0f} x {2*HZ/1000:.0f} km; "
          f"terrain {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f}..{hi:.0f} m; "
          f"buildings {len(buildings)}; crags {ncrag}; roads {len(roads)}")


if __name__ == "__main__":
    main()
