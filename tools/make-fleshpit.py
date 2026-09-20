#!/usr/bin/env python3
"""Generate the surface of Mystery Flesh Pit National Park as a city data file the OSM engine can read.

    python3 tools/make-fleshpit.py

Writes data/cities/fleshpit-osm.json in the same shape tools/build-osm-city.py produces for a real city
(terrain grid, land areas, roads, buildings, trees), so fleshpit.html renders the surface with the same
stages as Chicago and Portland. What is below the surface is not here: the organism, its chambers and
everything the Park Service hung inside it are built in src/fleshpit/organism.js, because no arrangement
of footprints extruded upwards is a hole two and a half kilometres deep.

This is fan work. Mystery Flesh Pit National Park is Trevor Roberts's project
(mysteryfleshpitnationalpark.com); nothing of his is used, copied or redistributed. What is here is this
project's own low-poly geometry, laid out from the published descriptions: a cordoned stretch of West
Texas south-east of Odessa, the enlarged orifice in the middle of it, the Park Service's visitor
facilities round the rim, and the Anodyne extraction works that were there before the park was.

The surface is a caliche plain at 880 m with mesas to the north-west and arroyos draining east. The
orifice is a funnel 520 m across at the rim; inside r = 95 m the terrain drops away to nothing, and the
shaft that hangs in that hole is modelled geometry.
"""
import json
import math
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "fleshpit-osm.json")
R = random.Random(1976)          # the year the pit opened to the public

HALF = 3000.0                    # the map runs from -HALF to +HALF in both directions
RIM = 260.0                      # the orifice at the surface: 520 m across
MOUTH = 95.0                     # inside this the ground has nothing left to stand on
PLAIN = 26.0                     # the caliche plain, above the map datum
MOUTH_DEPTH = 146.0              # how far below the plain the ground stops; src/fleshpit/organism.js takes over there
                                 # (data/cities/fleshpit.json, "pit": {"mouthDepth"}) must agree with this
WORKS = (980.0, -880.0)          # the Anodyne extraction works, north-east of the rim
CAMP = (-1180.0, 760.0)          # the campground, south-west, out of sight of the orifice
GATE = (-2760.0, 240.0)          # the entrance station, where the road comes in from Gumption


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


def ring_poly(cx, cz, r, n=48, r2=None):
    r2 = r if r2 is None else r2
    return [(cx + math.cos(k / n * math.tau) * r, cz + math.sin(k / n * math.tau) * r2) for k in range(n)]


def smoothstep(a, b, v):
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def simplify(pts, eps=1.0):
    if len(pts) < 3:
        return pts
    ax, az = pts[0]
    bx, bz = pts[-1]
    dx, dz = bx - ax, bz - az
    L = math.hypot(dx, dz)
    worst, wi = 0.0, 0
    for i in range(1, len(pts) - 1):
        px, pz = pts[i]
        d = abs(dx * (az - pz) - dz * (ax - px)) / L if L else math.hypot(px - ax, pz - az)
        if d > worst:
            worst, wi = d, i
    if worst <= eps:
        return [pts[0], pts[-1]]
    return simplify(pts[:wi + 1], eps)[:-1] + simplify(pts[wi:], eps)


# ---------- the ground ----------
# A plain with a hole in it. The rim is a raised lip of spoil - thirty years of what came out of the pit
# was pushed into a ring round it - and inside that the funnel drops away. Past r = MOUTH there is no
# ground at all: the grid goes to the bottom of the map so nothing tries to stand in the shaft.
ARROYOS = [
    [(-3000, 1180), (-1500, 1290), (-400, 1420), (900, 1600), (3000, 1720)],
    [(-3000, -1560), (-1700, -1400), (-300, -1330), (1200, -1180), (3000, -980)],
]


def dist_to_polyline(x, z, pts):
    best = 1e9
    for i in range(len(pts) - 1):
        ax, az = pts[i]
        bx, bz = pts[i + 1]
        dx, dz = bx - ax, bz - az
        L = dx * dx + dz * dz
        t = 0 if L == 0 else max(0, min(1, ((x - ax) * dx + (z - az) * dz) / L))
        best = min(best, math.hypot(x - ax - t * dx, z - az - t * dz))
    return best


def terrain_height(x, z):
    d = math.hypot(x, z)
    # the plain, with mesas standing off it to the north-west and the ground falling away east
    mesa = 78 * smoothstep(1500, 2600, math.hypot(x + 2100, z + 1500)) if False else 0.0
    h = PLAIN
    h += 96 * smoothstep(-1700, -2650, x) * smoothstep(-400, -1500, z)          # the mesa north-west
    h += 54 * smoothstep(1900, 2800, math.hypot(x - 2400, z + 2100))            # a butte north-east
    h -= 14 * smoothstep(1200, 3000, x)                                          # the ground falls away east
    h += 5.5 * math.sin(x / 430.0 + 0.6) * math.cos(z / 510.0 - 0.3)            # the roll of the caliche
    h += mesa
    for a in ARROYOS:                                                            # the arroyos, cut into it
        h -= 16 * (1 - smoothstep(0, 90, dist_to_polyline(x, z, a)))
    # the spoil ring round the rim, and then the funnel
    h += 30 * math.exp(-((d - RIM - 90) / 130.0) ** 2)
    if d < RIM:
        t = (RIM - d) / (RIM - MOUTH)
        h -= (PLAIN + 210) * min(1.0, t) ** 1.7
    if d < MOUTH:
        # The floor of the funnel, and the end of the ground. Below this the shaft is modelled geometry, and the
        # terrain must not follow it down: a heightfield cannot have a hole in it, only a very deep well, and the
        # far wall of that well would stand square in front of the pit whenever you looked at it from outside.
        h = PLAIN - MOUTH_DEPTH
    h *= smoothstep(HALF, HALF - 340, max(abs(x), abs(z)))
    return h


def main():
    out = {"attribution": "Mystery Flesh Pit National Park: fan geometry generated by tools/make-fleshpit.py; "
                          "no assets from the original project are used",
           "units": "decimetres east (x) and south (z) of origin",
           "origin": [31.5, -102.6],                                             # west Texas, south-east of Odessa
           "bounds": [31.4730, -102.6316, 31.5270, -102.5684]}

    # ---------- terrain ----------
    step = 20
    nx = int(2 * HALF) // step + 2
    nz = nx
    hs = []
    for j in range(nz):
        for i in range(nx):
            hs.append(terrain_height(-HALF + i * step, -HALF + j * step))
    out["terrain"] = {"step": step, "nx": nx, "nz": nz, "x0": q(-HALF), "z0": q(-HALF), "datum": 880.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # ---------- water: there is none. This is the Permian Basin ----------
    out["lake"] = []
    out["islands"] = []
    out["water"] = [{"o": flat(ring_poly(WORKS[0] + 300, WORKS[1] - 210, 150, 28, 96)), "i": [],
                     "n": "Anodyne settling pond"}]
    out["marina"], out["beach"], out["pier"] = [], [], []
    out["waterways"] = []

    # ---------- roads and trails ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(simplify(pts))}
        if name:
            r["n"] = name
        roads.append(r)

    # the park road in from the west, past the entrance station, to the rim loop
    road([(-3000, 300), GATE, (-2300, 210), (-1750, 120), (-1200, 40), (-760, -20), (-520, -40)],
         "primary", 11, "Park Road")
    # the rim loop: the road that goes round the orifice, a hundred metres back from the lip
    loop = ring_poly(0, 0, RIM + 150, 64)
    road(loop + [loop[0]], "secondary", 9, "Rim Loop Road")
    # the spurs off it
    road([(-520, -40), (-420, 60), (-395, 180)], "secondary", 9, "Visitor Center Road")
    road([(-330, 300), (-700, 560), (-1000, 690), CAMP], "tertiary", 7.5, "Campground Road")
    road([(300, -390), (620, -600), WORKS], "tertiary", 8, "Extraction Works Road")
    road([(150, 420), (330, 700), (520, 980)], "tertiary", 7, "Monorail Yard Road")
    # service roads round the works
    for k in range(4):
        road([(WORKS[0] - 230 + k * 150, WORKS[1] - 260), (WORKS[0] - 230 + k * 150, WORKS[1] + 240)], "residential", 6)
    road([(WORKS[0] - 290, WORKS[1] - 60), (WORKS[0] + 320, WORKS[1] - 60)], "residential", 6)
    # the campground loops
    for k, rr in enumerate((110, 170)):
        lp = ring_poly(CAMP[0], CAMP[1], rr, 20, rr * 0.7)
        road(lp + [lp[0]], "residential", 5.5, f"Loop {chr(65 + k)}")
    # the walking trails: the rim trail all the way round, and the paths out to the overlooks
    rim = ring_poly(0, 0, RIM + 34, 72)
    road(rim + [rim[0]], "trail", 2.4, "Rim Trail")
    for a, nm in ((0.35, "North Overlook Trail"), (2.5, "West Overlook Trail"), (4.4, "South Overlook Trail")):
        road([(math.cos(a) * (RIM + 150), math.sin(a) * (RIM + 150)), (math.cos(a) * (RIM + 40), math.sin(a) * (RIM + 40))],
             "trail", 2.2, nm)
    road([(-395, 180), (-330, 300), (-180, 360), (-40, 330), (120, 300), (260, 250)], "footway", 3, "Visitor Center Walk")
    out["roads"] = roads
    out["rail"] = [{"t": "monorail", "e": 1, "n": "Pit Rim Monorail",
                    "p": flat([(520, 980), (330, 700), (150, 420), (0, 330), (-180, 360), (-395, 200),
                               (-520, 40), (-430, -220), (-180, -350), (120, -370), (330, -250)])}]
    out["stations"] = [{"n": "Monorail Terminal", "x": q(-395), "z": q(200)},
                       {"n": "Works Platform", "x": q(330), "z": q(-250)}]

    # ---------- areas: the parking, the campground, the works yard, the apron round the rim ----------
    areas = []

    def area(ring, kind, name=""):
        a = {"k": kind, "o": flat(ring), "i": []}
        if name:
            a["n"] = name
        areas.append(a)

    area(ring_poly(0, 0, RIM + 96, 56), "brownfield", "The Apron")
    area(rect(-395, 300, 300, 150), "parking", "Visitor Center Parking")
    area(rect(-660, 250, 210, 120), "parking", "Overflow Parking")
    area(rect(330, -250, 180, 110), "parking", "Works Platform Parking")
    area(ring_poly(CAMP[0], CAMP[1], 230, 28, 170), "park", "Gumption Flat Campground")
    area(rect(WORKS[0], WORKS[1], 700, 520), "industrial", "Anodyne Extraction Works")
    area(rect(WORKS[0] - 20, WORKS[1] + 330, 520, 160), "railyard", "Tank Farm")
    area(rect(-2760, 240, 160, 110), "brownfield", "Entrance Station")
    out["areas"] = areas

    # ---------- buildings ----------
    buildings = []

    def put(ring, h, kind, colour, name="", roof="f", minh=None, mat=None):
        b = {"p": flat(ring), "h": round(h, 1), "c": colour, "t": kind, "r": roof}
        if name:
            b["n"] = name
        if minh:
            b["m"] = round(minh, 1)
        if mat:
            b["mat"] = mat
        buildings.append(b)

    PARK = "#9c8a6e"      # park service brown, sun-bleached
    ROOFED = "#7a6a52"
    STEEL = "#9aa0a4"
    RUST = ["#8a6a4c", "#96745a", "#7d6350", "#8f7a62"]

    # the Upper Visitor Center: a low NPS building looking north over the orifice, with its wings
    put(rect(-395, 180, 120, 34), 9.5, "civic", PARK, name="Upper Visitor Center", roof="f")
    put(rect(-455, 205, 34, 46), 7, "civic", PARK, roof="f")
    put(rect(-335, 205, 34, 46), 7, "civic", ROOFED, roof="f")
    put(rect(-395, 152, 44, 12), 12.5, "civic", PARK, roof="f")               # the lobby, standing proud
    put(rect(-300, 150, 40, 22), 6, "retail", ROOFED, name="Park Store", roof="f")
    put(rect(-520, 165, 46, 24), 5.5, "civic", PARK, name="Ranger Station", roof="f")
    put(rect(-560, 320, 34, 18), 5, "shed", ROOFED, roof="f")
    put(rect(-250, 250, 30, 16), 4.5, "civic", PARK, name="Comfort Station", roof="f")
    # the amphitheatre on the rim apron: a bank of seating facing the hole
    for k in range(7):
        r0 = 330 + k * 9
        put(ring_poly(-150, 330, r0, 22, r0 * 0.5)[3:9], 1.2 + k * 0.9, "wall", "#8d8578", roof="f")
    # the entrance station: a booth and a shade canopy where the road comes in
    put(rect(GATE[0], GATE[1], 14, 8), 4.5, "civic", PARK, name="Entrance Station", roof="f")
    put(rect(GATE[0], GATE[1] - 30, 46, 10), 6.5, "shed", ROOFED, roof="f")
    # the monorail terminal on the west rim, and the yard it came from
    put(rect(-395, 235, 80, 20), 13, "station", STEEL, name="Monorail Terminal", roof="f", mat="metal")
    put(rect(520, 980, 120, 40), 14, "station", STEEL, name="Monorail Yard", roof="f", mat="metal")
    put(rect(330, -250, 60, 18), 12, "station", STEEL, name="Works Platform", roof="f", mat="metal")
    # the collar: the concrete ring the Park Service poured round the lip when the orifice was enlarged,
    # and the four headframes over the elevator shafts that go down the inside of it
    n = 72
    for k in range(n):
        a0 = k / n * math.tau
        a1 = (k + 0.92) / n * math.tau
        p0 = (math.cos(a0) * (RIM + 6), math.sin(a0) * (RIM + 6))
        p1 = (math.cos(a1) * (RIM + 6), math.sin(a1) * (RIM + 6))
        dx, dz = p1[0] - p0[0], p1[1] - p0[1]
        L = math.hypot(dx, dz) or 1
        nxv, nzv = -dz / L * 9.0, dx / L * 9.0
        put([(p0[0] + nxv, p0[1] + nzv), (p1[0] + nxv, p1[1] + nzv), (p1[0] - nxv, p1[1] - nzv), (p0[0] - nxv, p0[1] - nzv)],
            4.2, "wall", "#b3ab9a", roof="f")
    for k in range(4):
        a = 0.5 + k * math.tau / 4
        hx, hz = math.cos(a) * (RIM + 30), math.sin(a) * (RIM + 30)
        put(rect(hx, hz, 26, 26, a), 44, "tower", STEEL, name=f"Shaft {k + 1} Headframe", roof="f", mat="metal")
        put(rect(hx, hz, 34, 12, a), 8, "shed", "#8d8578", roof="f")
    # the Anodyne extraction works: sheds, tanks, the pipe racks and the flare stack
    wx, wz = WORKS
    for k in range(6):
        put(rect(wx - 240 + (k % 3) * 170, wz - 140 + (k // 3) * 190, 130, 58, 0), 14 + R.random() * 8,
            "industrial", RUST[k % len(RUST)], roof="f")
    for k in range(9):
        a = k / 9 * math.tau
        put(ring_poly(wx - 30 + math.cos(a) * 190, wz + 330 + math.sin(a) * 60, 22, 16), 20, "industrial",
            "#b8b2a6", roof="f", mat="metal")
    put(rect(wx + 300, wz + 40, 16, 16), 68, "tower", "#8a8074", name="Flare Stack", roof="f")
    put(rect(wx - 330, wz + 20, 24, 210), 11, "industrial", "#7f7466", roof="f")      # the pipe rack
    put(rect(wx + 60, wz - 240, 90, 34), 16, "industrial", "#8a7a62", name="Ballast Refinery", roof="f")
    # the campground: the loops, with a shower block and shade shelters
    put(rect(CAMP[0], CAMP[1], 34, 16), 4.5, "civic", PARK, name="Campground Facilities", roof="f")
    for k in range(26):
        a = k / 26 * math.tau
        rr = 110 if k % 2 else 170
        put(rect(CAMP[0] + math.cos(a) * rr * 1.06, CAMP[1] + math.sin(a) * rr * 0.72, 7, 5, a), 2.6, "shed", ROOFED, roof="f")
    out["buildings"] = buildings

    # ---------- what grows out here: mesquite and creosote, thin on the ground ----------
    trees = []
    for _ in range(2400):
        x = R.uniform(-HALF + 60, HALF - 60)
        z = R.uniform(-HALF + 60, HALF - 60)
        if math.hypot(x, z) < RIM + 200:
            continue
        if R.random() < 0.55 and min(dist_to_polyline(x, z, a) for a in ARROYOS) > 140:
            continue                                                     # they cluster in the arroyos
        trees += [q(x), q(z)]
    out["trees"] = trees

    # ---------- the points the pages below want to find ----------
    out["pois"] = [{"n": "The Orifice", "k": "orifice", "x": 0, "z": 0},
                   {"n": "Upper Visitor Center", "k": "attraction", "x": q(-395), "z": q(180)},
                   {"n": "Anodyne Extraction Works", "k": "works", "x": q(wx), "z": q(wz)}]

    json.dump(out, open(OUT, "w"), separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)}; roads {len(roads)}; "
          f"areas {len(areas)}; terrain {nx}x{nz} at {step} m; trees {len(trees)//2}")


if __name__ == "__main__":
    main()
