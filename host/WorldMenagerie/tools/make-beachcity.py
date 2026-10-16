#!/usr/bin/env python3
"""Generate Beach City as a city data file the OSM engine can read.

    python3 tools/make-beachcity.py

Writes data/cities/beachcity-osm.json in the shape tools/build-osm-city.py produces for a real city (terrain
grid, water, beach, streets, buildings, trees), so beachcity.html renders it with the same stages as Chicago, and
data/cities/beachcity-plan.json: where the temple, the house, the lighthouse and the rest stand, which way each
faces, the waterlines and the boardwalk, in metres, for the page's own models.

This is fan work, laid out after the map of Beach City published with the show (Rebecca Sugar, 2014), which is a
reference for arrangement only and is not in the repository. North is up on it and here: x east, z south.

- The town is a few blocks of streets at the west end of a strip of land between Rehoboth Bay to the north and the
  Atlantic to the south. East-west, from the bay: Bay Street (Funland's pier is off it), Waterman Street, Sussex
  Road, Main Street, Boardwalk Street. North-south, from the west: Chestnut Road, Chesapeake Street, Fenton Street,
  Bank Street, Crawford Terrace, and Thayer Street, which runs on a slant from It's a Wash down to the beach along
  the foot of the park. Beach City Highway (Route 1A) comes in from the north-west past the water tower; Dewey
  Park is a block between Main Street and Boardwalk Street.
- The boardwalk runs along the ocean beach, the shops facing it: west to east the visitor center, Cone 'N' Son,
  the Funland Arcade, Beach Citywalk Fries, Fish Stew Pizza, the T-shirt shop, and past Thayer Street, at the foot of
  the hill, the Big Donut.
- East of Thayer Street the land rises into Lighthouse Park: open grass climbing steadily east, with a bank down to
  the bay on its north side and a tall cliff of grey rock along the whole of its ocean side, getting higher as it
  goes, the beach running under it. The temple is cut into the cliff at the tip, facing the sea, with Steven's house
  at its foot on the beach, and the lighthouse on the north edge of the tip, reached by a path across the park.
  The park stands between the house and the town.

Every shape is modelled from scratch in this project's own low-poly style; nothing from the show is used, copied or
redistributed. Steven Universe belongs to Rebecca Sugar and Cartoon Network.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep, simplify

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "beachcity-osm.json")
PLAN = os.path.join(ROOT, "data", "cities", "beachcity-plan.json")
R = random.Random(2013)

ORIGIN = (38.52, -75.06)            # the Delmarva coast, which is where the show puts it
X0, X1, Z0, Z1 = -1500.0, 1400.0, -1000.0, 1000.0   # the box: x east, z south, metres
STEP = 8.0                          # the ground grid: fine enough for a sea cliff to stand up
SAND = 96.0                         # the ocean beach, from the back of it to the waterline
BOARD = (88.0, 74.0)                # the boardwalk, measured back (north) from the waterline
WALK_X = (-930.0, -150.0)           # where the boardwalk runs, west to east
AVE = 45.0                          # Boardwalk Street, this far behind the boardwalk: the shops face the boardwalk
PARK_X = (-170.0, 550.0)            # Lighthouse Park, from the foot of Thayer Street to the tip
PARK_H = 115.0                      # the top of the tip, by the lighthouse: a tall hill, as the paintings have it
CLIFF_X = 560.0                     # the temple's cliff: the east face of the tip
EB_Z0 = -100.0                      # the north end of the beach under the temple; north of it the tip drops into the sea
WT = (-960.0, -300.0)               # the water tower's hill, wooded, at the north-west corner of town
WOODS_X = -930.0                    # west of this the land is wooded hills
BROOD = (-1220.0, 110.0)            # Brooding Hill, over the ocean at the west end

# the streets, after the map: east-west at these z, north-south at these x (Thayer Street is drawn on its own)
EW = {"Bay Street": -258.0, "Waterman Street": -185.0, "Sussex Road": -100.0, "Main Street": -15.0}
NS = {"Chestnut Road": -820.0, "Chesapeake Street": -690.0, "Fenton Street": -560.0, "Bank Street": -430.0,
      "Crawford Terrace": -300.0}
THAYER = [(-40.0, -185.0), (-90.0, -60.0), (-135.0, 60.0), (-150.0, 104.0)]


def thayer_x(z):
    """Thayer Street's x at z: the town's east edge, along the foot of the park."""
    for (ax, az), (bx, bz) in zip(THAYER, THAYER[1:]):
        if az <= z <= bz:
            return ax + (bx - ax) * (z - az) / (bz - az)
    return THAYER[0][0] if z < THAYER[0][1] else THAYER[-1][0]


def park_x(z):
    """Where the park starts rising, at z: just east of Thayer Street, and further east at the bay end, where It's a
    Wash has its flat lot."""
    return thayer_x(z) + 14 + 70 * smoothstep(-130, -200, z)


def ocean_z(x):
    """The ocean's waterline along the south: z at x."""
    return 240 + 16 * math.sin(x / 260.0) + 7 * math.sin(x / 97.0 + 0.6)


def bay_z(x):
    """The bay's waterline along the north: z at x. East of the town it closes in, so the park narrows to its tip."""
    return -300 + 15 * math.sin(x / 230.0 + 1) + 80 * smoothstep(100, 430, x) + 60 * smoothstep(380, CLIFF_X + 30, x) ** 2


def east_x(z):
    """The waterline of the temple's beach, east of the cliff: x at z."""
    return CLIFF_X + 140 + 25 * math.sin(z / 110.0)


def blob(x, z, c, r, inner=0.35):
    dx, dz = (x - c[0]) / r[0], (z - c[1]) / r[1]
    return 1 - smoothstep(inner, 1.0, math.sqrt(dx * dx + dz * dz))


def park(x, z):
    """0-1: how much of Lighthouse Park is under (x, z): east of Thayer Street, back from the bay."""
    x0 = park_x(z)
    return smoothstep(x0, x0 + 70, x) * smoothstep(bay_z(x) + 4, bay_z(x) + 40, z)


def park_height(x, z):
    """The park's ground: a long dome, climbing from Thayer Street to its highest near the tip, where the
    lighthouse is, and rounded across - highest along its middle, falling away towards both edges before the
    cliffs take it."""
    x0 = park_x(z)
    u = max(0.0, min(1.0, (x - x0) / (CLIFF_X - 60 - x0)))
    rise = 0.25 * smoothstep(0, 0.18, u) + 0.75 * u ** 1.35   # up steeply from the town, and harder still towards the tip, as the paintings draw it
    zn, zs = bay_z(x) + 26, ocean_z(x) - SAND
    zc, half = (zn + zs) / 2, max(40.0, (zs - zn) / 2)
    crown = 1 - 0.34 * min(1.0, abs(z - zc) / half) ** 2
    return 3 + (PARK_H - 3) * rise * crown


def west_hills(x, z):
    """(k, height): the water tower's hill, the wooded hills west of town, and Brooding Hill."""
    a = blob(x, z, WT, (200, 150), 0.25)
    w = smoothstep(WOODS_X, WOODS_X - 260, x) * smoothstep(80, -120, z)
    b = blob(x, z, BROOD, (250, 170), 0.3)
    return max(a, w, b), max(24 * a * a * (3 - 2 * a), 22 * w, 30 * b * b * (3 - 2 * b))


def hills(x, z):
    return max(park(x, z), west_hills(x, z)[0])


def noise(x, z):
    return (math.sin(x / 97.0 + 0.7) * math.cos(z / 83.0 - 0.4) * 0.6
            + math.sin(x / 41.0 - z / 57.0) * 0.25 + math.cos(x / 23.0 + z / 29.0) * 0.1)


def sea(d, k=0.035):
    """The sea floor, d metres out from the waterline."""
    return 0.72 - min(14.0, d * k) - min(10.0, max(0.0, d - 300) * 0.02)


def height(x, z):
    zo = ocean_z(x)
    if z > zo:                                              # the Atlantic, south
        return sea(z - zo)
    xe = east_x(z)
    if x > xe:                                              # the Atlantic, east of the temple's beach
        return sea(x - xe, 0.04)
    if x > CLIFF_X and z < EB_Z0:                           # north of that beach the tip goes straight into the sea
        return sea(max(x - CLIFF_X, EB_Z0 - z) + 20, 0.05)
    cx, cz_ = CLIFF_X - 60, EB_Z0 - 5                       # and its north-east corner is rounded, a headland
    if x > cx and z < cz_ and math.hypot(x - cx, z - cz_) > 60:
        return sea(math.hypot(x - cx, z - cz_) - 60 + 20, 0.05)
    zb = bay_z(x)
    if z < zb:                                              # the bay: shallow and still
        return 0.72 - min(4.0, (zb - z) * 0.05)
    # the land between: low and flat where the town is, down to a narrow beach on the bay
    base = 2.6 + min(zo - z, z - zb, 220) * 0.008 + noise(x, z) * 0.35
    base = 0.9 + (base - 0.9) * smoothstep(0, 30, z - zb)
    kw, hw = west_hills(x, z)
    if kw > 0:
        base = base + hw + noise(x * 1.5, z * 1.5) * 1.2 * kw
    # Lighthouse Park: cut off in the cliff along the ocean side and the temple's cliff at the tip
    if x > park_x(z):
        hh = park_height(x, z) + noise(x * 1.7, z * 1.7) * 1.6 * park(x, z)
        cut = smoothstep(zo - SAND + 5, zo - SAND - 3, z)    # the south cliff, behind the ocean beach
        if x > 120:
            cut = min(cut, smoothstep(zb + 18, zb + 27, z))   # and a lower one on the bay side, out along the peninsula
        if x > CLIFF_X - 20 and z > EB_Z0 - 20:
            cut = min(cut, smoothstep(CLIFF_X + 7, CLIFF_X, x))   # the temple's cliff
        if hh > base:
            base = base + (hh - base) * cut
    # the ocean beach along the south, and the temple's beach on the east: sand from the back of it to the water.
    # A straight slope, not an S: the engine lays the sand as polygons that follow the ground only at their edges,
    # so across a beach the sand is a straight line from the back to the water, and ground that bulged above that
    # line would show through it as grass.
    lin = lambda a, b, v: max(0.0, min(1.0, (v - a) / (b - a)))
    t = lin(zo, zo - SAND, z)
    on_east = x > CLIFF_X
    if on_east and z < zo - SAND:
        t = lin(xe, CLIFF_X, x)        # the temple's beach slopes east to its water; the corner keeps the south slope
    if on_east or z > zo - SAND:
        sand = 0.72 + 0.8 * t
        if on_east or park(x, z) < 0.05 or z > zo - SAND + 5:
            base = sand
    return base


def catmull(ctrl, n=8):
    out = []
    for i in range(len(ctrl) - 1):
        p0, p1, p2, p3 = ctrl[max(0, i - 1)], ctrl[i], ctrl[i + 1], ctrl[min(len(ctrl) - 1, i + 2)]
        for k in range(n):
            t = k / n
            out.append(tuple(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t * t
                                    + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t ** 3) for c in (0, 1)))
    out.append(ctrl[-1])
    return out


def main():
    out = {"attribution": "Beach City: fan geometry generated by tools/make-beachcity.py; nothing from the show is used",
           "units": "decimetres east (x) and south (z) of origin", "origin": list(ORIGIN),
           "seaLevelWater": True}   # the ground is in metres above the sea, which floods the box (see the city file)
    mlat, mlon = 111132.0, 111320.0 * math.cos(math.radians(ORIGIN[0]))
    ll = lambda x, z: [round(ORIGIN[0] - z / mlat, 6), round(ORIGIN[1] + x / mlon, 6)]
    s0, w0 = ll(X0, Z1)
    n0, e0 = ll(X1, Z0)
    out["bounds"] = [s0, w0, n0, e0]

    # ---------- terrain ----------
    nx = int((X1 - X0) // STEP) + 2
    nz = int((Z1 - Z0) // STEP) + 2
    hs = []
    for j in range(nz):
        for i in range(nx):
            hs.append(int(round(height(X0 + i * STEP, Z0 + j * STEP) * 10)))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(X0), "z0": q(Z0), "datum": 0.0, "h": hs}

    # ---------- the water: the whole box, and the ground decides (seaLevelWater) ----------
    m = 6000                            # the sheet runs on well past the map, so the rippled water meets the haze, not a seam
    # ...with the land cut out of it. One sheet of water at y = 0.7 over the whole box is drawn a little towards the
    # camera (so the shoreline does not flicker), and the town stands only two or three metres above it: seen from
    # far off, the depth buffer cannot tell them apart and the sea is drawn over the town. So the sheet has a hole
    # the shape of the land, inset a few metres from the waterline so the water still meets the sand.
    INSET = 5.0
    north, south = [], []
    for x in range(int(X0) - 8, int(X1) + 9, 8):
        zs = [z for z in range(int(Z0), int(Z1) + 1, 4) if height(x, z) > 0.75]
        if len(zs) < 3:
            continue
        north.append((max(x, X0 - 8), zs[0] + INSET))
        south.append((max(x, X0 - 8), zs[-1] - INSET))
    land = simplify(north, 1.0) + simplify(list(reversed(south)), 1.0)
    land = [(X0 - 395, land[0][1])] + land + [(X0 - 395, land[-1][1])]   # the land goes on west, out of the box (a hole stays inside its outline)
    out["water"] = [{"o": flat([(X0 - m, Z0 - m), (X1 + m, Z0 - m), (X1 + m, Z1 + m), (X0 - m, Z1 + m)]), "i": [flat(land)], "n": "The Atlantic"}]
    out["lake"], out["islands"], out["marina"], out["waterways"], out["pier"] = [], [], [], [], []

    # ---------- the beaches ----------
    # The engine follows the ground only at a polygon's corners, so the beaches go in short pieces with their back
    # edges on the sand, not at the foot of the cliffs, and the temple's beach wound the same way as the rest.
    out["beach"] = []
    xs_s = [X0 + k * 20 for k in range(int((CLIFF_X + 170 - X0) // 20) + 1)]
    for i in range(0, len(xs_s) - 1, 6):
        run = xs_s[i:i + 7]
        back = lambda x: ocean_z(x) - SAND + (6 if x < CLIFF_X - 10 else -4)   # past the corner there is no cliff to keep clear of
        out["beach"].append({"o": flat([(x, back(x)) for x in run] + [(x, ocean_z(x) + 2) for x in reversed(run)]), "i": [], "n": "The beach"})
    zs_e = [EB_Z0 + 10 + k * 10 for k in range(int((ocean_z(CLIFF_X) - SAND + 6 - EB_Z0 - 10) // 10) + 1)]
    for i in range(0, len(zs_e) - 1, 8):
        run = zs_e[i:i + 9]
        out["beach"].append({"o": flat([(CLIFF_X + 8, z) for z in reversed(run)] + [(east_x(z) + 2, z) for z in run]), "i": [], "n": "The temple's beach"})
    xs_bay = [x for x in xs_s if -900 < x < 100]
    for i in range(0, len(xs_bay) - 1, 6):
        run = xs_bay[i:i + 7]
        out["beach"].append({"o": flat([(x, bay_z(x) - 2) for x in run] + [(x, bay_z(x) + 22) for x in reversed(run)]), "i": [], "n": "The bay beach"})

    # ---------- the sites the page builds; `ang` turns a model that faces +x (east) to face its street ----------
    S_ANG, N_ANG, E_ANG = -math.pi / 2, math.pi / 2, 0.0    # facing south (the boardwalk), north (the bay), east
    def site(x, z, **kw):
        d = {"x": round(x, 1), "z": round(z, 1), "y": round(height(x, z), 2), "at": ll(x, z)}
        d.update(kw)
        return d
    shop = lambda x, back=17: site(x, ocean_z(x) - BOARD[0] - back, ang=S_ANG)
    cz = 20.0
    zm, zbw = EW["Main Street"], None
    S = {
        "temple": site(CLIFF_X, cz, face=CLIFF_X, z0=EB_Z0 - 5, z1=round(ocean_z(CLIFF_X) - SAND + 10, 1)),
        "house": site(CLIFF_X + 22, cz),                       # built over the temple's door, at the statue's navel
        "lighthouse": site(CLIFF_X - 38, bay_z(CLIFF_X - 38) + 48),   # on the north edge of the tip, above her head
        "southcliff": site(400.0, ocean_z(400) - SAND, line=[[x, round(ocean_z(x) - SAND, 1)] for x in range(-60, int(CLIFF_X) + 1, 7)],
                           north=[[x, round(bay_z(x) + 22, 1)] for x in range(130, int(CLIFF_X) - 50, 8)]),
        "visitor": shop(-890, 15), "cone": shop(-830, 14), "arcade": shop(-740, 20),
        "fries": shop(-610, 15), "pizza": shop(-490, 16), "tshirts": shop(-370, 14),
        "donut": site(-105.0, ocean_z(-105) - BOARD[0] - 10, ang=S_ANG),
        "funland": site(-560.0, bay_z(-560) - 52, ang=S_ANG, deck=2.4),
        "carwash": site(0.0, EW["Waterman Street"] - 20, ang=S_ANG),
        "olddocks": site(140.0, bay_z(140) - 26),
        "watertower": site(WT[0] + 30, WT[1] + 20),
        "ustor": site(-755.0, -145.0, ang=N_ANG),
        "mayor": site(-1090.0, -235.0, ang=S_ANG),
        "deweypark": site(-495.0, (zm + ocean_z(-495) - BOARD[0] - AVE) / 2),
        "brooding": site(BROOD[0] + 30, BROOD[1] + 40),
    }
    keep_clear = [(S[k], r) for k, r in (("visitor", 14), ("cone", 12), ("arcade", 18), ("fries", 14), ("pizza", 16),
                                           ("tshirts", 12), ("donut", 26), ("carwash", 30), ("watertower", 30), ("ustor", 30),
                                           ("mayor", 18), ("deweypark", 50), ("brooding", 20))]
    clear = lambda x, z, pad=0: all(math.hypot(x - s["x"], z - s["z"]) > r + pad for s, r in keep_clear)

    # ---------- streets ----------
    roads, streets = [], []
    def road(pts, cls, w, name="", lots=None):
        pts = simplify(pts, 0.5)
        if len(pts) < 2:
            return
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)
        if lots:
            streets.append((pts, w, lots, name))
    zbw = lambda x: ocean_z(x) - BOARD[0] - AVE                # Boardwalk Street
    W_END, THAYER_X = NS["Chestnut Road"], thayer_x
    road([(x, zbw(x)) for x in range(int(W_END) - 80, int(THAYER[-1][0]) + 1, 20)], "secondary", 12, "Boardwalk Street", "shops")
    road([(W_END, zm), (THAYER_X(zm), zm)], "secondary", 12, "Main Street", "shops")
    road([(W_END, EW["Sussex Road"]), (THAYER_X(EW["Sussex Road"]), EW["Sussex Road"])], "residential", 9, "Sussex Road", "houses")
    road([(W_END - 40, EW["Waterman Street"]), (THAYER[0][0] + 60, EW["Waterman Street"])], "residential", 9, "Waterman Street", "houses")
    road([(-800, EW["Bay Street"]), (-330, EW["Bay Street"])], "residential", 9, "Bay Street", "south")
    for name, xv in NS.items():
        top = EW["Bay Street"] if -800 <= xv <= -330 else EW["Waterman Street"]
        road([(xv, top), (xv, zbw(xv))], "residential", 9, name, "houses")
    road(catmull(THAYER, 6), "residential", 10, "Thayer Street", "west")
    road([(THAYER[-1][0] + 5, zbw(THAYER[-1][0])), (S["donut"]["x"] - 6, S["donut"]["z"] - 30), (S["donut"]["x"] + 10, ocean_z(-90) - SAND + 2)],
         "residential", 7, "Beach Access Drive")
    road([(-470, zm - 30), (-470, zm + 30)] if False else [(-640, (zm + EW["Sussex Road"]) / 2), (-560, (zm + EW["Sussex Road"]) / 2)], "alley", 4, "Cedar Alley")
    # Beach City Highway, Route 1A: in from the north-west past the water tower and the Mayor's house
    road(catmull([(W_END, EW["Sussex Road"]), (-900, -150), (-1000, -205), (-1150, -215), (-1330, -190), (X0 - 10, -170)], 8),
         "primary", 13, "Beach City Highway", None)
    # the path across Lighthouse Park to the lighthouse, and the stair down round the tip to the temple's beach
    lx, lz = S["lighthouse"]["x"], S["lighthouse"]["z"]
    road(catmull([(THAYER[1][0] + 20, -80), (110, -100), (300, -105), (lx - 12, lz + 4)], 8), "trail", 2.5, "Lighthouse Park path")
    road([(lx + 10, lz + 6), (CLIFF_X - 4, EB_Z0 - 6), (CLIFF_X + 30, EB_Z0 + 12), (CLIFF_X + 60, EB_Z0 + 30)], "pedestrian", 3, "The cliff stair")
    road([(BROOD[0] + 220, 40), (BROOD[0] + 120, 90), (S["brooding"]["x"] + 10, S["brooding"]["z"])], "trail", 3, "Brooding Hill path")
    # Funland's pier walk, from Bay Street
    road([(S["funland"]["x"], EW["Bay Street"] - 4), (S["funland"]["x"], bay_z(S["funland"]["x"]) + 6)], "pedestrian", 6, "Funland")
    out["roads"] = roads

    def on_road(x, z, pad):
        for r in roads:
            p = r["p"]
            for i in range(0, len(p) - 2, 2):
                ax, az, bx, bz = p[i] / 10, p[i + 1] / 10, p[i + 2] / 10, p[i + 3] / 10
                dx, dz = bx - ax, bz - az
                L = dx * dx + dz * dz
                t = 0 if L == 0 else max(0, min(1, ((x - ax) * dx + (z - az) * dz) / L))
                if math.hypot(x - ax - t * dx, z - az - t * dz) < r["w"] / 2 + pad:
                    return True
        return False

    # ---------- land areas ----------
    dp = S["deweypark"]
    dpw, dpd = NS["Bank Street"] - NS["Fenton Street"] - 14, zbw(dp["x"]) - zm - 14
    areas = [{"k": "park", "n": "Dewey Park", "o": flat(rect(dp["x"], dp["z"], dpw, dpd)), "i": []},
             {"k": "parking", "n": "", "o": flat(rect(S["donut"]["x"] + 4, S["donut"]["z"] - 30, 30, 16)), "i": []},
             {"k": "parking", "n": "", "o": flat(rect(S["ustor"]["x"], S["ustor"]["z"] + 26, 44, 14)), "i": []}]
    out["areas"] = areas
    out["rail"], out["stations"] = [], []

    # ---------- buildings: lots along every street, facing it ----------
    WALLS = ["#f2d7c4", "#cfe3e8", "#f4e8b8", "#e8c4cc", "#d6e6c8", "#f6f1e6", "#c9d4ec", "#f0cfa8", "#e4d2ea", "#bfe0d6"]
    SHOP = ["#e8d0a0", "#c8a07a", "#a86a54", "#d8c070", "#e8b890", "#b8c8b0", "#d0a8a0", "#f0e0b8"]
    buildings, placed, blds = [], [], []   # blds: what the page needs to dress each one (src/beachcity/details.js)
    def free(x, z, r):
        return all(math.hypot(x - a, z - b) > r + rb for a, b, rb in placed)
    def house(x, z, w, d, rot, floors, colour, kind="house", roof="g", face=None):
        h = round(3.1 * floors + (0.6 if kind == "retail" else 0), 1)
        buildings.append({"p": flat(rect(x, z, w, d, rot)), "h": h, "t": kind, "c": colour, "r": roof})
        placed.append((x, z, max(w, d) * 0.5))
        if face is None:                                   # no street to face: the side nearest the sea
            face = (0.0, 1.0)
        blds.append([round(x, 2), round(z, 2), round(w, 2), round(d, 2), round(rot, 4), h, 1 if kind == "retail" else 0,
                     round(face[0], 3), round(face[1], 3), 1 if roof == "f" else 0])
    def ok(x, z, r):
        return (clear(x, z, r) and free(x, z, r) and not on_road(x, z, r * 0.6) and hills(x, z) < 0.12
                and height(x, z) > 1.6 and z > bay_z(x) + 28 and z < zbw(x) + 30 and x > W_END - 120)
    # the shops along the boardwalk, between it and Boardwalk Street: a row facing the sea
    for x in range(int(WALK_X[0]) + 8, int(WALK_X[1]) - 10, 14):
        z = ocean_z(x) - BOARD[0] - 16
        if not clear(x, z, 6) or R.random() < 0.08:
            continue
        w, d = R.uniform(11, 13.5), R.uniform(11, 15)
        house(x, z, w, d, R.uniform(-0.02, 0.02), R.choice([1, 2, 2, 3]), R.choice(SHOP), "retail", "f" if R.random() < 0.5 else "g", (0.0, 1.0))
    # then every street: shops close and continuous on Main Street and Boardwalk Street, houses with yards elsewhere
    for pts, w, kind, name in streets:
        for i in range(len(pts) - 1):
            (ax, az), (bx, bz) = pts[i], pts[i + 1]
            L = math.hypot(bx - ax, bz - az)
            if L < 1:
                continue
            ux, uz = (bx - ax) / L, (bz - az) / L
            rot = math.atan2(uz, ux)
            shopping = kind == "shops"
            step = 15 if shopping else 19
            sides = (1,) if kind == "south" else (-1,) if kind == "west" else (-1, 1)
            if name == "Boardwalk Street":
                sides = (-1,)                                  # its south side is the row facing the boardwalk
            for side in sides:
                s = R.uniform(4, 10)
                while s < L - 4:
                    px, pz = ax + ux * s, az + uz * s
                    bw_, bd = (R.uniform(11, 15), R.uniform(12, 16)) if shopping else (R.uniform(8, 11), R.uniform(9, 12))
                    back = w / 2 + (2.5 if shopping else R.uniform(6, 9)) + bd / 2
                    nx_, nz_ = -uz * side, ux * side
                    x, z = px + nx_ * back, pz + nz_ * back
                    if ok(x, z, max(bw_, bd) * 0.5) and R.random() > (0.06 if shopping else 0.14):
                        face = (-nx_, -nz_)                    # towards the street
                        if shopping:
                            house(x, z, bw_, bd, rot + R.uniform(-0.02, 0.02), R.choice([2, 2, 3, 3]), R.choice(SHOP), "retail", "f", face)
                        else:
                            house(x, z, bw_, bd, rot + R.uniform(-0.06, 0.06), R.choice([1, 2, 2]), R.choice(WALLS), "house", "g", face)
                    s += step + R.uniform(-2, 3)
    # a few houses along the highway and round the foot of the water tower's hill
    for _ in range(140):
        x, z = R.uniform(-1450, -900), R.uniform(-260, 40)
        if on_road(x, z, 7) or west_hills(x, z)[0] > 0.45 or height(x, z) < 1.6 or not free(x, z, 7) or not clear(x, z, 8):
            continue
        a = R.uniform(0, math.pi)
        house(x, z, R.uniform(8, 12), R.uniform(9, 13), a, R.choice([1, 2]), R.choice(WALLS), "house", "g", (-math.sin(a), math.cos(a)))
    out["buildings"] = buildings

    # ---------- trees: woods on the west hills, a few on the park, some in the yards ----------
    trees = []
    for _ in range(16000):
        x, z = R.uniform(X0 + 20, X1 - 20), R.uniform(Z0 + 20, Z1 - 20)
        h = height(x, z)
        if h < 2.2 or z > ocean_z(x) - SAND - 4 or x > CLIFF_X - 25 or z < bay_z(x) + 20:
            continue
        kw = west_hills(x, z)[0]
        in_town = W_END - 60 < x < -100 and z < zbw(x)
        want = 0.9 if kw > 0.15 else 0.03 if park(x, z) > 0.2 else 0.2 if in_town else 0.4
        if R.random() > want or not clear(x, z, 10) or on_road(x, z, 4) or not free(x, z, 3):
            continue
        if math.hypot(x - S["lighthouse"]["x"], z - S["lighthouse"]["z"]) < 60:
            continue
        trees += [q(x), q(z)]
    out["trees"] = trees
    out["pois"] = []
    json.dump(out, open(OUT, "w"), separators=(",", ":"))

    # ---------- the plan: sites, the waterlines with surf, the boardwalk ----------
    # the surf runs along the real waterline, traced from the ground: west to east along the ocean beach, then north
    # up the temple's beach; the sea is on its right-hand side
    south_line = []
    for x in range(int(X0), int(X1), 12):
        zs = [z for z in range(0, int(Z1), 2) if height(x, z) > 0.72]
        if zs:
            south_line.append((x, zs[-1] + 1))
    xe0 = south_line[-1][0]
    east_line = []
    for z in range(int(south_line[-1][1]) - 10, int(EB_Z0), -10):
        xs_ = [x for x in range(int(CLIFF_X), int(X1), 2) if height(x, z) > 0.72]
        if xs_:
            east_line.append((xs_[-1] + 1, z))
    surf = [[[round(x, 1), round(z, 1)] for x, z in simplify(south_line, 0.8) + simplify(east_line, 0.8)]]
    walk = [[x, round(ocean_z(x) - BOARD[0], 2), round(ocean_z(x) - BOARD[1], 2)] for x in range(int(WALK_X[0]), int(WALK_X[1]) + 1, 4)]
    plan = {"_": "written by tools/make-beachcity.py: metres east (x) and south (z) of the origin; y is the ground; ang turns a model that faces +x",
            "sites": S, "surf": surf, "boardwalk": walk, "buildings": blds,
            "_buildings": "[x, z, w, d, rot, height, shop, face x, face z, flat roof]: rect(x, z, w, d, rot) is the footprint; face is the way its front looks",
            "gulls": [[-700, 180], [-300, 190], [150, 230], [CLIFF_X + 70, 60], [-560, -360]],
            "bay": [[-700, -420], [-300, -470], [200, -440], [-900, -520]],
            # Mayor Dewey's van goes round the town: Main Street east, up Thayer, Waterman west, down Chestnut
            "vanloop": [[round(x, 1), round(z, 1)] for x, z in
                        [(NS["Chestnut Road"] + 3, zm + 3)] + [(x, zm + 3) for x in range(-800, int(thayer_x(zm)) - 6, 20)] +
                        [(thayer_x(z) - 3, z) for z in range(int(zm), int(EW["Waterman Street"]) + 3, -15)] +
                        [(x, EW["Waterman Street"] - 3) for x in range(int(thayer_x(EW["Waterman Street"])) - 6, int(NS["Chestnut Road"]) + 3, -20)] +
                        [(NS["Chestnut Road"] - 3, z) for z in range(int(EW["Waterman Street"]), int(zm), 15)]],
            "beachgoers": [[round(R.uniform(-920, CLIFF_X - 60), 1), round(R.uniform(0.12, 0.8), 3)] for _ in range(110)],
            "umbrellas": [[x, round(ocean_z(x) - R.uniform(20, 55), 1)] for x in range(-900, int(CLIFF_X) - 80, 37) if R.random() < 0.7]}
    json.dump(plan, open(PLAN, "w"), indent=1)
    print(f"{len(buildings)} buildings, {len(roads)} roads, {len(trees) // 2} trees, terrain {nx}x{nz} at {STEP:g} m")
    for k, s in S.items():
        print(f"  {k:10s} x {s['x']:8.1f} z {s['z']:8.1f} ground {s['y']:6.1f}")


if __name__ == "__main__":
    main()
