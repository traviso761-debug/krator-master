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

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "mordor-osm.json")
R = random.Random(3019)

HX, HZ = 340000.0, 280000.0      # half-extents: 680 x 560 km
STEP = 1000                      # the height grid, in metres

DOOM = (-120000.0, -60000.0)     # Orodruin
BARAD = (-40000.0, -140000.0)    # Barad-dur, on its spur
MORANNON = (-268000.0, -232000.0)
ISENMOUTHE = (-196000.0, -150000.0)
NURNEN = (72000.0, 150000.0)     # the Sea of Nurnen
CIRITH_UNGOL = (-282000.0, -34000.0)
MINAS_MORGUL = (-310000.0, -14000.0)
DURTHANG = (-262000.0, -164000.0)

# the two ranges, as coarse polylines; the height field is built from the distance to them
ERED_LITHUI = [(-286000, -236000), (-200000, -246000), (-90000, -242000), (20000, -234000),
               (130000, -224000), (230000, -210000), (286000, -178000), (306000, -110000), (312000, -30000)]
EPHEL_DUATH = [(-292000, -238000), (-296000, -160000), (-292000, -70000), (-286000, 20000),
               (-262000, 96000), (-200000, 150000), (-110000, 182000), (0, 196000), (110000, 198000),
               (208000, 186000), (280000, 150000), (308000, 80000)]
MORGAI = [(-262000, -150000), (-266000, -70000), (-260000, 10000), (-240000, 76000)]
# the spur Barad-dur stands at the end of, running south out of the Ash Mountains
SPUR = [(-34000, -238000), (-36000, -190000), (-40000, -150000)]


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
        ax, az = path[i]
        bx, bz = path[i + 1]
        d = seg_dist(x, z, ax, az, bx, bz)
        if d < best:
            best = d
    return best


def ridge(x, z, path, width, height, rough=0.0):
    """A mountain range: a smooth profile falling away either side of its spine."""
    d = path_dist(x, z, path)
    if d > width:
        return 0.0
    f = 1 - d / width
    h = height * f * f * (3 - 2 * f)
    if rough:
        h += rough * height * math.sin(x / 5400.0) * math.cos(z / 4700.0) * f
    return h


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
    h += ridge(x, z, ERED_LITHUI, 46000, 2450, 0.16)      # the Ash Mountains
    h += ridge(x, z, EPHEL_DUATH, 42000, 2850, 0.16)      # the Mountains of Shadow
    h += ridge(x, z, MORGAI, 15000, 1150, 0.3)            # the Morgai, the inner ridge
    h += ridge(x, z, SPUR, 17000, 1250, 0.2)              # the spur Barad-dur stands on

    # Cirith Gorgor: the gap in the north-west corner where the ranges almost meet, and Udun behind it
    gap = smoothstep(52000, 0, math.hypot(x - MORANNON[0], z - MORANNON[1]))
    h *= 1 - 0.78 * gap
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
    if dd < 9000:
        cone = 1620 * (1 - dd / 9000) ** 1.45
        if dd < 1100:
            cone -= 300 * (1 - dd / 1100)                  # the Sammath Naur, sunk into the summit
        h += cone
    h += 260 * smoothstep(21000, 8000, dd)                 # the apron of spoil heaped round its foot
    # the ash that fell out of it, heaped downwind
    h += 90 * smoothstep(120000, 8000, dd) * (0.5 + 0.5 * math.sin(x / 9000.0 + z / 7000.0))

    if in_nurnen(x, z):
        dx2, dz2 = x - NURNEN[0], (z - NURNEN[1]) * 1.45
        a = math.atan2(dz2, dx2)
        f = math.hypot(dx2, dz2) / nurnen_edge(a)
        return -6.0 - 60.0 * (1 - f)
    h *= smoothstep(max(HX, HZ), max(HX, HZ) - 30000, max(abs(x), abs(z)))
    return max(2.0, h)


def main():
    out = {"attribution": "Mordor: fan geometry generated by tools/make-mordor.py; no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [-2.51951, -3.05426, 2.51951, 3.05426]}

    nx = int(2 * HX) // STEP + 2
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

    # the camps and towers of the plateau, strung along the roads
    for k in range(34):
        t = R.random()
        cx = -250000 + t * 230000 + R.uniform(-24000, 24000)
        cz = -190000 + R.random() * 190000
        if math.hypot(cx - DOOM[0], cz - DOOM[1]) < 26000 or in_nurnen(cx, cz):
            continue
        camp(cx, cz, R.randint(8, 26), R.uniform(300, 1100))
    # the slave-farms of Nurn, on the shore
    for k in range(40):
        a = R.uniform(0, math.tau)
        r = nurnen_edge(a) + R.uniform(9000, 42000)
        cx, cz = NURNEN[0] + math.cos(a) * r, NURNEN[1] + math.sin(a) * r / 1.45
        if abs(cx) > HX - 30000 or abs(cz) > HZ - 30000:
            continue
        camp(cx, cz, R.randint(6, 16), R.uniform(400, 1400))
    # Durthang, a fort in the northern Ephel Duath
    put(rect(DURTHANG[0], DURTHANG[1], 260, 200, 0.3), 90, "tower", "#2b2926", name="Durthang")
    for k in range(4):
        a = k / 4 * math.tau + 0.4
        put(rect(DURTHANG[0] + math.cos(a) * 150, DURTHANG[1] + math.sin(a) * 150, 70, 70, a), 130, "tower", "#232120")
    out["buildings"] = buildings
    out["trees"] = []
    out["pois"] = []

    json.dump(out, open(OUT, "w"), separators=(",", ":"))
    t = out["terrain"]
    lo = min(t["h"]) / 10
    hi = max(t["h"]) / 10
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; {2*HX/1000:.0f} x {2*HZ/1000:.0f} km; "
          f"terrain {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f}..{hi:.0f} m; "
          f"buildings {len(buildings)}; roads {len(roads)}")


if __name__ == "__main__":
    main()
