#!/usr/bin/env python3
"""Generate Water 7, the City of Water, as a city data file the OSM engine can read.

    python3 tools/make-water7.py

Fan work from Eiichiro Oda's One Piece, which belongs to its author and publishers; nothing from the manga, the
anime or any game is used. Every shape here is generated from the published description, and the geometry is this
project's own.

What the story says of the place, taken as a plan:

  the city is built like a fountain: terraces in rings, one above the next, rising to the Great Fountain on the top,
  whose water runs down through the whole city in canals and falls from tier to tier; the canals are the streets,
  and the people get about them in boats pulled by yagara bulls
  Up Town on the top, round the fountain, with the Galley-La Company's headquarters (the mayor's, Iceburg's)
  the Galley-La docks, numbered One to Seven, along the shore; Dock One the greatest
  Back Street, the old low quarter, which floods; every year Aqua Laguna, the great tide, comes over it
  Blue Station, where the sea train (the Puffing Tom) leaves along its rails laid on the sea
  Franky House, the scrapyard on the shore

  round it all, out in the sea, the sea wall: a ring of dam, its sluices letting the city's water out to the sea, its
  lock gates over the docks' mouths; a moat of calm water between it and the quay; the stone bridge out to Scrap Island

Scale: 8 km square of sea, terrain every 10 m. The island is 2.7 km across at the quay; Up Town is 176 m up, the tiers
standing one over the next like the basins of a fountain.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "water7-osm.json")
R = random.Random(1522)

HX, HZ = 4000.0, 4000.0
STEP = 10
ORIGIN = (21.0, -45.0)
# the tiers, outside in: (outer radius, height). The quay ring is the lowest; Up Town the top.
TIERS = [(1350.0, 3.0), (1180.0, 26.0), (1000.0, 52.0), (820.0, 80.0), (640.0, 110.0), (470.0, 142.0), (300.0, 176.0)]
CANAL_ANGLES = [math.radians(22.5 + 45 * k) for k in range(8)]       # the grand canals, down from the top
STREET_ANGLES = [math.radians(45 * k) for k in range(8)]             # the stairs between them
CANAL_W, STREET_W = 16.0, 9.0
CANAL_CUT = 6.0          # the bed's half-width in the terrain; the water and its walls are 13.6 either side (life.js)
CANAL_EDGE = 13.6        # where the canal's walls stand
BACKSTREET = (math.radians(196), math.radians(238))                  # south-west: the low quarter that floods
DOCK_ANGLES = [math.radians(a) for a in (270, 252, 288, 234, 306, 216, 324)]   # Dock One due north, the rest either side
SCRAP = (-1900.0, 820.0, 150.0)                                       # Scrap Island, Franky House
DAM_R = 1480.0                                                        # the sea wall's line, out in the sea
RAMP_CANAL = 0                                                        # the grand canal built as one long water ramp (the yagaras climb it)
BLUE = 0.0                                                            # Blue Station, due east


def ring_poly(cx, cz, r, n=64, r2=None):
    """A circle, or an annulus drawn as one closed ring: out along the far edge and back along the near one."""
    pts = [(cx + math.cos(i / n * math.tau) * r, cz + math.sin(i / n * math.tau) * r) for i in range(n + 1)]
    if r2 is None:
        return pts[:-1]
    inner = [(cx + math.cos(i / n * math.tau) * r2, cz + math.sin(i / n * math.tau) * r2) for i in range(n, -1, -1)]
    return pts + inner


def angdiff(a, b):
    return abs((a - b + math.pi) % math.tau - math.pi)


def tier_of(r):
    """The index of the tier at radius r (0 the quay ring, 6 Up Town), or -1 off the island."""
    k = -1
    for i, (ro, _) in enumerate(TIERS):
        if r <= ro:
            k = i
    return k


def ring_mid(k):
    """The middle radius of tier k's band."""
    ro = TIERS[k][0]
    ri = TIERS[k + 1][0] if k + 1 < len(TIERS) else 0.0
    return (ro + ri) / 2


def in_dock(x, z):
    for i, a in enumerate(DOCK_ANGLES):
        w = 130.0 if i == 0 else 80.0
        ca, sa = math.cos(a), math.sin(a)
        u = x * ca + z * sa                       # along the dock's axis, outward
        v = -x * sa + z * ca
        if 1150 < u < 1500 and abs(v) < w / 2:
            return i
    return -1


def ramp_h(r):
    """The ramp canal's bed: from Up Town's edge straight down to the quay."""
    r0, r1 = TIERS[-1][0], TIERS[0][0] - 20
    t = min(1.0, max(0.0, (r - r0) / (r1 - r0)))
    return TIERS[-1][1] + (TIERS[0][1] - TIERS[-1][1]) * t


def terrain_height(x, z):
    r = math.hypot(x, z)
    a = math.atan2(z, x) % math.tau
    sx, sz, sr = SCRAP
    d = math.hypot(x - sx, z - sz)
    if d < sr + 60:
        return 2.5 if d < sr else 2.5 - (d - sr) / 60 * 14
    if r > TIERS[0][0]:
        if r < DAM_R + 40:
            return -6.0                           # the moat, and the sea wall's footing
        return max(-14.0, -6.0 - (r - DAM_R - 40) * 0.04)
    if in_dock(x, z) >= 0:
        return -6.0                               # the dock basins, open to the sea
    k = tier_of(r)
    h = TIERS[k][1]
    # the tier walls are steep: a few metres of slope at each step, so the step reads as a wall and not a hill
    ro = TIERS[k][0]
    if k > 0 and ro - r < 5:
        h = TIERS[k - 1][1] + (h - TIERS[k - 1][1]) * ((ro - r) / 5)
    if k <= 1 and BACKSTREET[0] < a < BACKSTREET[1]:
        return -0.6                               # Back Street, sunk: its ground floors under the sea, the tide in its streets
    # the canals are cut into the ground: the grand canals down every tier, a ring canal round the middle of each
    for ci, ca in enumerate(CANAL_ANGLES):
        if r > TIERS[-1][0] - 30 and angdiff(a, ca) * r < CANAL_CUT:
            if ci == RAMP_CANAL:
                return ramp_h(r) - 3.0
            return h - 3.0
    if 0 < k < 6 and abs(r - ring_mid(k)) < CANAL_CUT:
        return h - 3.0
    return h


def main():
    lat0, lon0 = ORIGIN
    mlat, mlon = 111132.0, 111320.0 * math.cos(math.radians(lat0))
    out = {"attribution": "Water 7: fan geometry generated by tools/make-water7.py; no manga, anime or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [lat0, lon0],
           "bounds": [round(lat0 - HZ / mlat, 5), round(lon0 - HX / mlon, 5), round(lat0 + HZ / mlat, 5), round(lon0 + HX / mlon, 5)],
           "seaLevelWater": True}
    nx = int(2 * HX) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        z = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, z))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}
    # the sea: the whole box, the island cut out of it (its outline notched where the docks open to the sea) and Scrap Island
    outline = []
    for i in range(720):
        an = i / 720 * math.tau
        rr = TIERS[0][0] + 2
        if in_dock(math.cos(an) * 1300, math.sin(an) * 1300) >= 0:
            rr = 1150.0
        outline.append((math.cos(an) * rr, math.sin(an) * rr))
    m = 400
    out["water"] = [{"o": flat([(-HX - m, -HZ - m), (HX + m, -HZ - m), (HX + m, HZ + m), (-HX - m, HZ + m)]),
                     "i": [flat(outline), flat(ring_poly(SCRAP[0], SCRAP[1], SCRAP[2] + 2, 40))], "n": "The Sea"}]
    out["lake"], out["islands"], out["marina"], out["beach"] = [], [], [], []
    out["pier"] = []
    # the canals as centrelines, for the boats and the water (src/water7/canals.js): grand canals with their
    # heights stepping down, ring canals at their tier's height
    canals = []
    for ci, ca in enumerate(CANAL_ANGLES):
        if ci == RAMP_CANAL:
            pts = [[round(math.cos(ca) * r, 1), round(math.sin(ca) * r, 1), round(ramp_h(r), 1)] for r in range(int(TIERS[-1][0]) + 2, int(TIERS[0][0]) - 10, 20)]
            canals.append({"kind": "ramp", "p": pts})           # it ends at the quay's edge, where the yagaras start
            continue
        pts = []
        sunk = BACKSTREET[0] < ca % math.tau < BACKSTREET[1]
        for k in range(6, -1, -1):
            ro = TIERS[k][0]
            ri = TIERS[k + 1][0] if k + 1 < len(TIERS) else 200.0
            for r in (ri + 17 if k + 1 < len(TIERS) else ri + 2, ro - 5):     # each fall goes over the tier wall, which stands 15 m out (life.js)
                pts.append([round(math.cos(ca) * r, 1), round(math.sin(ca) * r, 1), 0.7 if (sunk and k <= 1) else TIERS[k][1]])
        pts.append([round(math.cos(ca) * 1358, 1), round(math.sin(ca) * 1358, 1), 0.0])   # over the quay wall into the moat
        canals.append({"kind": "grand", "p": pts})
    for k in range(1, 6):
        rm = ring_mid(k)
        canals.append({"kind": "ring", "tier": k, "r": rm, "h": TIERS[k][1]})
    out["water7"] = {"canals": canals, "tiers": TIERS, "docks": [[round(math.degrees(a), 1), 130 if i == 0 else 80] for i, a in enumerate(DOCK_ANGLES)],
                     "scrap": SCRAP, "backstreet": [math.degrees(BACKSTREET[0]), math.degrees(BACKSTREET[1])],
                     "damR": DAM_R, "canalAngles": [round(math.degrees(a), 2) for a in CANAL_ANGLES], "streetAngles": [round(math.degrees(a), 2) for a in STREET_ANGLES],
                     "rampCanal": RAMP_CANAL, "canalW": CANAL_W}
    out["waterways"] = []

    # ---------- streets: the ring streets either side of each ring canal, the stairs between the grand canals ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    TIER_NAMES = ["the Quay", "Lower Town", "Canal Town", "Market Terrace", "Guild Terrace", "High Terrace", "Up Town"]
    for k in range(1, 6):
        rm = ring_mid(k)
        for side in (-1, 1):
            rr = rm + side * (CANAL_EDGE + 5.5)
            n = int(rr * math.tau / 20)
            pts = [(math.cos(i / n * math.tau) * rr, math.sin(i / n * math.tau) * rr) for i in range(n + 1)]
            road(pts, "residential", 7, f"{TIER_NAMES[k]} Promenade")
    # the quay road all round, broken at the docks
    rr = TIERS[0][0] - 40
    n = 360
    run = []
    for i in range(n + 1):
        a = i / n * math.tau
        x, z = math.cos(a) * rr, math.sin(a) * rr
        if in_dock(x * 1.02, z * 1.02) >= 0:
            if len(run) > 1:
                road(run, "secondary", 10, "The Quay")
            run = []
        else:
            run.append((x, z))
    if len(run) > 1:
        road(run, "secondary", 10, "The Quay")
    # the stairs, top to bottom
    # broken at each ring canal, where its bridge carries the walk over
    rings = [ring_mid(k) for k in range(1, 6)]
    for sa in STREET_ANGLES:
        run = []
        for r in range(int(TIERS[-1][0]) - 10, int(TIERS[0][0]) - 20, 4):
            if any(abs(r - rm) < CANAL_EDGE + 1 for rm in rings):
                if len(run) > 1:
                    road(run, "pedestrian", STREET_W, "The Steps")
                run = []
            else:
                run.append((math.cos(sa) * r, math.sin(sa) * r))
        if len(run) > 1:
            road(run, "pedestrian", STREET_W, "The Steps")
    # Up Town's square round the fountain
    road([(math.cos(i / 64 * math.tau) * 240, math.sin(i / 64 * math.tau) * 240) for i in range(65)], "pedestrian", 12, "Fountain Square")
    out["roads"] = roads

    # ---------- the ground: paved terraces, the plateau's gardens, Scrap Island's dirt ----------
    areas = [{"k": "plaza", "n": "Up Town", "o": flat(ring_poly(0, 0, TIERS[-1][0] - 2, 72)), "i": []},
             {"k": "park", "n": "The Mayor's Gardens", "o": flat(rect(-200, -150, 90, 60, 0.4)), "i": []}]
    for k in range(0, 6):
        ro = TIERS[k][0]
        ri = TIERS[k + 1][0]
        # kept 30 m from the tier's steps: the paving is draped over the ground in 25 m cells, and a cell across a step tents
        areas.append({"k": "plaza", "n": TIER_NAMES[k], "o": flat(ring_poly(0, 0, ro - 30, 120, ri + 30)), "i": []})
    areas.append({"k": "industrial", "n": "Scrap Island", "o": flat(ring_poly(SCRAP[0], SCRAP[1], SCRAP[2] - 12, 96)), "i": []})
    out["areas"] = areas
    out["rail"] = []
    out["stations"] = [{"n": "Blue Station", "x": q(TIERS[0][0] - 60), "z": 0}]

    # ---------- the buildings ----------
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

    # tan and peach, mostly, as the city is drawn; the odd pale blue or green
    WALLS = ["#ecd2b0", "#e8c8a0", "#f0d8b8", "#e0b890", "#f2e0c8", "#e8b898", "#d8a878", "#f0c8a8", "#e4c0a0", "#f4e4cc",
             "#d8b088", "#ecd8c0", "#c8d8e0", "#d0e0d0"]

    def clear(x, z, pad=0.0):
        r = math.hypot(x, z)
        a = math.atan2(z, x) % math.tau
        if in_dock(x, z) >= 0 or in_dock(x * 1.05, z * 1.05) >= 0:
            return False
        for ca in CANAL_ANGLES:
            if angdiff(a, ca) * r < CANAL_EDGE + 3.5 + pad:
                return False
        for sa in STREET_ANGLES:
            if angdiff(a, sa) * r < STREET_W / 2 + 3 + pad:
                return False
        k = tier_of(r)
        if 0 < k < 6 and abs(r - ring_mid(k)) < CANAL_EDGE + 9.5 + pad:
            return False
        if k >= 0 and TIERS[k][0] - r < 6 + pad:
            return False                          # off the edge of the tier wall
        return True

    houses = 0
    for k in range(0, 6):
        ro = TIERS[k][0]
        ri = TIERS[k + 1][0]
        rm = ring_mid(k) if k > 0 else None
        # rows of houses: along the outer edge of the band, both sides of the ring canal's promenades, the inner edge
        rows = []
        rr = ri + 14
        while rr < ro - 14:
            if not (rm and abs(rr - rm) < CANAL_EDGE + 22):     # clear of the ring canal and its promenades
                rows.append(rr)
            rr += 24
        for rr in rows:
            a = R.uniform(0, 0.05)
            while a < math.tau:
                w = R.uniform(9, 16)
                x, z = math.cos(a) * rr, math.sin(a) * rr
                back = k <= 1 and BACKSTREET[0] < (a % math.tau) < BACKSTREET[1]
                if clear(x, z):
                    d = R.uniform(10, 15)
                    h = (R.uniform(4, 8) if back else R.uniform(8, 19)) if k > 0 else R.uniform(7, 14)
                    # about half under barrel vaults (src/core/dress.js puts them on the flat roofs), half gabled
                    put(rect(x, z, d, w, a), h, "residential", WALLS[R.randrange(len(WALLS))], roof="f" if R.random() < 0.5 else "g")
                    houses += 1
                a += (w + R.uniform(0.6, 2.0)) / rr
    # Up Town: the mansions in a ring round the fountain's square, gardens between
    a = 0.0
    while a < math.tau:
        rr = R.uniform(255, 285)
        x, z = math.cos(a) * rr, math.sin(a) * rr
        if clear(x, z) and not (-75 < x < 75 and -300 < z < -215):     # clear of Galley-La
            put(rect(x, z, R.uniform(18, 26), R.uniform(16, 24), a), R.uniform(12, 20), "residential", WALLS[R.randrange(len(WALLS))], roof="g")
            houses += 1
        a += R.uniform(0.16, 0.24)
    # the quay's warehouses and the docks' sheds
    for i, ang in enumerate(DOCK_ANGLES):
        w = 130 if i == 0 else 80
        ca, sa = math.cos(ang), math.sin(ang)
        for side in (-1, 1):
            cx, cz = ca * 1230 - sa * side * (w / 2 + 26), sa * 1230 + ca * side * (w / 2 + 26)
            put(rect(cx, cz, 110, 40, ang), 24 if i == 0 else 17, "industrial", "#c8b89a", name=f"Dock {i + 1}" if side == 1 else None, roof="f")
    # Scrap Island's wrecks and Franky House are a landmark (src/water7/landmarks.js, franky)
    out["buildings"] = buildings

    trees = []
    for k in range(60):
        a = R.uniform(0, math.tau)
        d = R.uniform(244, 292)
        if clear(math.cos(a) * d, math.sin(a) * d):
            trees.append({"x": q(math.cos(a) * d), "z": q(math.sin(a) * d), "r": q(R.uniform(3, 5))})
    out["trees"] = trees
    out["pois"] = [{"n": "The Great Fountain", "x": 0, "z": 0, "k": "fountain", "ang": 0},
                   {"n": "Blue Station", "x": q(TIERS[0][0] - 60), "z": 0, "k": "station", "ang": 0},
                   {"n": "Dock One", "x": 0, "z": q(-1250), "k": "dock", "ang": 0},
                   {"n": "Franky House", "x": q(SCRAP[0]), "z": q(SCRAP[1]), "k": "house", "ang": 0}]
    t = out["terrain"]
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)} ({houses} houses); roads {len(roads)}; "
          f"terrain {t['nx']}x{t['nz']} at {t['step']} m, {min(t['h'])/10:.0f} m to {max(t['h'])/10:.0f} m")


if __name__ == "__main__":
    main()
