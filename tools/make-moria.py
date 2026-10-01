#!/usr/bin/env python3
"""Generate the mountains of Moria - the outside of Khazad-dum - as a city data file the OSM engine can read.

    python3 tools/make-moria.py

Fan work from Tolkien, whose work belongs to the Tolkien Estate; nothing from any book, film or game is used.
Every shape here is generated from the published description and the geometry is this project's own.

What is outside (The Fellowship of the Ring, "A Journey in the Dark" and "The Bridge of Khazad-dum"):

  three great peaks of the Misty Mountains over the Dwarrowdelf: Caradhras the Redhorn to the north, Celebdil
  the Silvertine in the middle - Zirakzigil, with Durin's Tower on its summit - and Fanuidhol the Cloudyhead
  to the south
  on the west, the Walls of Moria: sheer cliffs, and in them the West-gate, the Doors of Durin, with two great
  holly-trees standing before it and the stream Sirannon dammed into a dark lake below the cliff
  on the east, the Dimrill Gate high in the mountainside, the Dimrill Stair going down from it into the Dimrill
  Dale, and Kheled-zaram, the Mirrormere, long and oval in the dale, with Durin's Stone standing over it
  the Silverlode going away east out of the Mirrormere

Everything inside the mountain - the halls, the Bridge, the chasm, the Chamber of Mazarbul - and the two cliff
faces the gates are cut in, is modelled in src/moria/. The heightfield is only the outside, and near each gate it
is cut back to a flat standing in front of a cliff (which is the model's), because a hundred-metre grid cannot hold
a cliff.

Scale: 24 km square, terrain every 100 m (at 50 m the mountains alone were half a million triangles, drawn over the halls, and brought a laptop browser down). The gates are twelve kilometres apart, which is far less than forty miles;
the halls near the east end are drawn at their size, and the road between is one long passage.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "moria-osm.json")
R = random.Random(2941)

HX, HZ = 12000.0, 12000.0
STEP = 100
ORIGIN = (48.0, 6.0)

CARADHRAS = (-600.0, -4600.0, 3900.0)    # x, z, height: the Redhorn, to the north
CELEBDIL = (500.0, 700.0, 3750.0)        # the Silvertine, over the Dwarrowdelf, Durin's Tower on it
FANUIDHOL = (-400.0, 5600.0, 3600.0)     # Cloudyhead, to the south
WGATE = (-6000.0, 900.0, 905.0)          # the West-gate, x, z, floor
EGATE = (5600.0, 0.0, 1450.0)            # the Dimrill Gate
MIRROR = (7500.0, 380.0, 1296.0)         # Kheled-zaram: centre, and its level
WEST_LAKE = 897.0                        # the dammed Sirannon, before the Walls


def ridge(x, z):
    """The mass of the Misty Mountains, running north and south across the map, and its three peaks."""
    h = 0.0
    # the range: a broad ridge along x = 0, higher in the middle of the map
    h += 2300 * smoothstep(7200, 900, abs(x + 150 * math.sin(z / 3100.0))) ** 0.9
    for px, pz, ph in (CARADHRAS, CELEBDIL, FANUIDHOL):
        d = math.hypot(x - px, (z - pz) * 0.85)
        h += (ph - 3450) * smoothstep(5200, 300, d) ** 1.3     # over the ridge and the land it stands on
    # the serration of it: spurs and gullies, sharper high up
    n = (math.sin(x / 610.0 + z / 870.0) * 0.5 + math.sin(x / 233.0 - z / 311.0) * 0.3 + math.sin(z / 150.0 + 2.0) * 0.2)
    h += 180 * n * smoothstep(900, 2600, h)
    # and crags: ridged noise, arêtes and couloirs, only on the high mountain, so the gates and the dale are left
    h += 620 * (ridged(x, z) - 0.42) * smoothstep(1300, 2700, h)
    return h


def _vn(x, z):
    """Value noise, smooth, in [0, 1]."""
    xi, zi = math.floor(x), math.floor(z)
    fx, fz = x - xi, z - zi
    ux, uz = fx * fx * (3 - 2 * fx), fz * fz * (3 - 2 * fz)

    def hsh(i, j):
        n = (i * 374761393 + j * 668265263) & 0xFFFFFFFF
        n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
        return (n & 0xFFFF) / 65535.0
    a, b, c, d = hsh(xi, zi), hsh(xi + 1, zi), hsh(xi, zi + 1), hsh(xi + 1, zi + 1)
    return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz


def ridged(x, z):
    """Ridged multifractal: sharp crests where the noise crosses its middle."""
    s, amp, f, tot = 0.0, 1.0, 1 / 900.0, 0.0
    for o in range(4):
        r = 1 - abs(_vn(x * f + o * 17.3, z * f - o * 9.1) * 2 - 1)
        s += r * r * amp
        tot += amp
        amp *= 0.5
        f *= 2.1
    return s / tot


def terrain_height(x, z):
    # the lowlands of Eregion on the west, at nine hundred metres, and the high dale on the east at thirteen
    base = 880 + 420 * smoothstep(-3000, 7000, x)
    h = base + ridge(x, z) + 18 * math.sin(x / 420.0) * math.cos(z / 530.0)

    # ---- the West-gate ----
    # Before the Walls, a flat stretch of shore and the dark lake; behind the line of the cliff (the model's), the
    # mountain goes straight up. The cliff face is x = WGATE[0], from z -300 to 2100.
    wx, wz, wf = WGATE
    if abs(z - wz) < 1700:
        k = smoothstep(1700, 1100, abs(z - wz))
        # flat right up to the line of the face (the grid has a line of points on it), and only behind it does
        # the mountain start - or the ground rises across the last forty metres and buries the Doors
        front = smoothstep(wx + 25, wx + 5, x)
        h = h * (1 - k * front) + (wf - 4) * k * front
        # behind the face, at least the height of the cliff
        back = smoothstep(wx + 20, wx + 70, x) * k
        h = max(h, (wf + 115) * back + h * (1 - back)) if back > 0 else h
    # the lake of the dammed Sirannon: a bowl in the shore
    ld = math.hypot((x - (wx - 640)) / 1.1, z - (wz + 150))      # kept clear of the cliff line
    if ld < 520:
        h = min(h, WEST_LAKE - 6 * smoothstep(520, 150, ld) - 1)

    # ---- the Dimrill Gate and the dale ----
    ex, ez, ef = EGATE
    if abs(z - ez) < 600 and x > ex - 100:
        k = smoothstep(600, 220, abs(z - ez))
        # a terrace in front of the gate, and the Stair going down from it into the dale
        front = smoothstep(ex - 25, ex - 5, x)
        # steep for the first half-kilometre, where the Stair is, and then easing down into the dale
        stair = ef - (ef - 1345) * smoothstep(ex + 30, ex + 520, x) - 35 * smoothstep(ex + 500, ex + 900, x)
        h = h * (1 - k * front) + stair * k * front
    if abs(z - ez) < 600 and x < ex + 60:
        # only just behind the gate: unbounded to the west, this lifted a band right across the map
        k = smoothstep(600, 250, abs(z - ez)) * smoothstep(ex - 20, ex - 70, x) * smoothstep(ex - 700, ex - 450, x)
        h = max(h, (ef + 110) * k + h * (1 - k))
    # the Dimrill Dale: the mountains' arms either side of it, the shoulder of Caradhras on the north and of
    # Fanuidhol on the south, closing it in and opening only to the east, down the Silverlode
    if x > EGATE[0] - 400:
        axis = 380 + 0.18 * (x - 7500)
        dz = abs(z - axis)
        arms = smoothstep(1100, 3000, dz) * smoothstep(13000, 7600, x) * smoothstep(EGATE[0] - 400, EGATE[0] + 600, x)
        h += 950 * arms * (0.8 + 0.2 * math.sin(x / 700.0 + z / 900.0))
    # Kheled-zaram, long and oval, in the floor of the dale
    mx, mz, ml = MIRROR
    md = math.hypot((x - mx) / 2.3, (z - mz))
    if md < 700:
        rim = smoothstep(700, 320, md)
        h = h * (1 - rim) + min(h, ml + 6) * rim
        if md < 300:
            h = min(h, ml - 3 - 20 * smoothstep(300, 60, md))

    h *= 1.0
    return h


def main():
    lat0, lon0 = ORIGIN
    dlat = HZ / 111160.0
    dlon = HX / (111320.0 * math.cos(math.radians(lat0)))
    out = {"attribution": "Moria: fan geometry generated by tools/make-moria.py; no book, film or game assets used",
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

    # ---------- water: the two lakes, each at its own level ----------
    wx, wz, wf = WGATE
    west = [(wx - 640 + math.cos(a) * 500 * 1.1, wz + 150 + math.sin(a) * 500) for a in [i / 48 * math.tau for i in range(48)]]
    mx, mz, ml = MIRROR
    mirror = [(mx + math.cos(a) * 300 * 2.3, mz + math.sin(a) * 300) for a in [i / 60 * math.tau for i in range(60)]]
    out["water"] = [{"o": flat(west), "i": [], "n": "The pool before the Walls", "y": WEST_LAKE},
                    {"o": flat(mirror), "i": [], "n": "Kheled-zaram", "y": ml}]
    out["lake"], out["islands"], out["marina"], out["beach"], out["pier"] = [], [], [], [], []
    # the Silverlode, out of the Mirrormere eastward; the Sirannon, down from the pool westward
    out["waterways"] = [{"n": "Silverlode", "p": flat([(mx + 690 + k * 300, mz + 120 * math.sin(k / 3.0)) for k in range(14)])},
                        {"n": "Sirannon", "p": flat([(wx - 1250 - k * 300, wz + 220 + 160 * math.sin(k / 2.5)) for k in range(18)])}]

    # ---------- roads ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": w, "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)
    # the old road of the Elves up the Sirannon to the West-gate, along the shore of the pool
    road([(wx - 5500 + k * 250, wz + 260 + 180 * math.sin(k / 3.0)) for k in range(19)] + [(wx - 900, wz + 520), (wx - 200, wz + 300), (wx - 20, wz)],
         "track", 5, "The Gate-stream Road")
    # the Dimrill Stair, down from the gate to the dale, and the road on past the Mirrormere
    road([(EGATE[0] + 30, EGATE[1])] + [(EGATE[0] + 60 + k * 70, EGATE[1] + 26 * math.sin(k * 1.3)) for k in range(13)] + [(mx - 800, mz - 380), (mx, mz - 420), (mx + 1400, mz - 300), (HX - 100, mz - 200)],
         "track", 5, "The Dimrill Stair")
    # the pass of the Redhorn Gate, over the shoulder of Caradhras
    road([(-8000 + k * 400, -3600 - 900 * math.sin(k / 12.0 * math.pi)) for k in range(41)], "track", 4, "The Redhorn Pass")
    out["roads"] = roads
    out["areas"] = []
    out["rail"], out["stations"] = [], []

    # ---------- buildings ----------
    # Out here there is almost nothing built: the ruin of an Elvish wall on the old road to the West-gate, the
    # stumps of a watch-house by the Mirrormere. They are the map's buildings; everything of the Dwarves' is in
    # the mountain, and modelled.
    buildings = []

    def put(ring, h, kind=None, colour=None, name=None, roof=None):
        b = {"p": flat(ring), "h": round(h, 1)}
        if kind:
            b["t"] = kind
        if colour:
            b["c"] = colour
        if name:
            b["n"] = name
        if roof:
            b["r"] = roof
        buildings.append(b)
    for k in range(9):
        x = wx - 1600 - k * 34
        put(rect(x, wz + 470 + 14 * math.sin(k), 30, 2.2, 0.08 * k), R.uniform(1.2, 3.4), "ruin", "#8d8a80",
            name="The ruin of the Elvish road-wall" if k == 0 else None, roof="f")
    for k in range(3):
        put(rect(mx - 900 + k * 12, mz - 470, 9, 7, 0.2), R.uniform(2, 3.5), "ruin", "#77736a",
            name="A ruined watch-house" if k == 0 else None, roof="f")
    out["buildings"] = buildings

    # ---------- trees ----------
    # Hollin was a land of holly; there is scrub along the Sirannon and pines low in the dale. The two great
    # hollies before the Doors are the model's.
    trees = []
    for k in range(900):
        x = R.uniform(-HX + 300, wx - 300)
        z = R.uniform(-6000, 7000)
        if math.hypot((x - (wx - 640)) / 1.1, z - (wz + 150)) < 560:
            continue
        if terrain_height(x, z) > 1250:
            continue
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(3, 6))})
    for k in range(700):
        x = R.uniform(EGATE[0] + 900, HX - 300)
        z = R.uniform(-4000, 4500)
        if math.hypot((x - mx) / 2.3, z - mz) < 340:
            continue
        if terrain_height(x, z) > 1700:
            continue
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(3, 5))})
    out["trees"] = trees
    out["pois"] = [{"n": "The West-gate", "x": q(wx), "z": q(wz), "k": "gate", "ang": 0},
                   {"n": "The Dimrill Gate", "x": q(EGATE[0]), "z": q(EGATE[1]), "k": "gate", "ang": 0},
                   {"n": "Zirakzigil", "x": q(CELEBDIL[0]), "z": q(CELEBDIL[1]), "k": "peak", "ang": 0}]

    t = out["terrain"]
    lo, hi = min(t["h"]) / 10.0, max(t["h"]) / 10.0
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)}; roads {len(roads)}; "
          f"trees {len(trees)}; terrain {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f} m to {hi:.0f} m; "
          f"bounds {out['bounds']}")


if __name__ == "__main__":
    main()
