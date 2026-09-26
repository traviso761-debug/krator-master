#!/usr/bin/env python3
"""Rivendell: the Last Homely House, in the cleft of the Bruinen.

Fan work. Tolkien's world belongs to the Tolkien Estate; nothing from any book, film or game is used, and
every shape here is this project's own geometry built from the description.

Written from Tolkien's text and from his own drawings of the place (the 1937 watercolour, and 'Rivendell
looking East' and 'looking West'), which were used as references for proportion and arrangement only:

  "They came to the edge of a steep fall in the ground so suddenly that Gandalf's horse nearly slipped" -
  you come over "a wide land the colour of heather and crumbling rock, with patches and slashes of
  grass-green", and it stops. The valley is a cleft - a riven dell - with walls of pale rock, sheer, and the
  woods on the rims above them; firs high up, "beech and oak" lower down. The river runs "in a rocky bed at
  the bottom", over a fall, and the house stands in trees on a green shelf above it on the north side, where
  Frodo's window "looked south across the ravine". The way down from the moor is "the steep zig-zag path";
  the way in from the Ford climbs a rock by a stair cut into it and comes down to "a narrow bridge of stone
  without a parapet, as narrow as a pony could well walk on".

Geography: the valley runs east-west. Its head is to the east, towards the mountains; the Bruinen runs west
out of it and bends south-west to the Ford, where the East Road crosses. x is east, z is south.

Writes data/cities/rivendell-osm.json (the ground and the paths, for the engine) and
data/cities/rivendell-valley.json (the plan of the valley: the river, the falls and where everything
stands, for src/rivendell/). The engine draws no buildings, water or trees here: the page builds its own.
"""
import json
import math
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "rivendell-osm.json")
PLAN = os.path.join(ROOT, "data", "cities", "rivendell-valley.json")
R = random.Random(3021)

HX, HZ = 3300.0, 2500.0          # half-extents: 6.6 x 5 km
STEP = 10                        # the height grid, in metres

# ---------------------------------------------------------------------------------------------- the river
# The line of the Bruinen, east (the head of the valley) to west (the Ford and beyond). The valley follows it.
LINE = [(3400, -330), (2700, -250), (2000, -130), (1400, -30), (800, 50), (300, 60), (-150, 95),
        (-650, 190), (-1200, 310), (-1750, 420), (-2330, 560), (-2900, 700), (-3400, 820)]
# The surface of the water, by x: it comes down the gorge at the head in rapids, runs easy past the house,
# drops over the fall below the bridge, and slackens towards the Ford.
LEVELS = [(3400, 392), (2600, 350), (2000, 322), (1300, 309), (300, 302), (-380, 299), (-392, 293),
          (-1200, 281), (-2330, 262), (-3400, 252)]
FALL_X = -386.0                  # the fall across the river: Tolkien draws it below the bridge
HOUSE = (140.0, None)            # x of the house; z comes from the shelf
BRIDGE_X = -70.0


def interp(tab, x):
    if x >= tab[0][0]:
        return tab[0][1]
    for (a, va), (b, vb) in zip(tab, tab[1:]):
        if a >= x >= b:
            t = (x - a) / (b - a)
            return va + (vb - va) * t
    return tab[-1][1]


def zc(x):
    """The middle of the river at this x (the line is monotonic in x, so this is a function)."""
    return interp(LINE, x)


def dzdx(x):
    return (zc(x + 5) - zc(x - 5)) / 10.0


def water(x):
    return interp(LEVELS, x)


def smooth(a, b, v):
    if a == b:
        return 0.0
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def g(x, c, w):
    return math.exp(-((x - c) / w) ** 2)


# a little value noise, so that nothing is ruled
_P = [R.random() for _ in range(4096)]


def vn(x, z):
    xi, zi = math.floor(x), math.floor(z)
    xf, zf = x - xi, z - zi
    h = lambda i, j: _P[(i * 73 + j * 151 + (i * j) % 97) & 4095]
    u, v = xf * xf * (3 - 2 * xf), zf * zf * (3 - 2 * zf)
    return (h(xi, zi) * (1 - u) * (1 - v) + h(xi + 1, zi) * u * (1 - v) + h(xi, zi + 1) * (1 - u) * v
            + h(xi + 1, zi + 1) * u * v)


def fbm(x, z):
    return vn(x, z) * 0.5 + vn(x * 2.03 + 7, z * 2.03 + 3) * 0.25 + vn(x * 4.1 + 1, z * 4.1 + 9) * 0.125


# ---------------------------------------------------------------------------------------------- the cleft
# For each side and each x: how far out the floor goes before the cliff (F), how high the sheer part is
# (CH), how wide it is at its foot-to-top (CW: a few tens of metres for a few hundred of height), how far the
# wooded slope above it runs back to the rim (U), and the level of the moor at the rim.
def floor_half(x, side):
    base = 55 + 120 * smooth(2300, 1500, x)                      # the gorge at the head, opening westward
    base += (175 if side < 0 else 95) * g(x, 150, 700)           # the bowl the house is in: wider to the north
    base -= 70 * g(x, -1250, 380)                                # the narrows below
    base += 190 * g(x, -2330, 420)                               # and it opens again at the Ford
    # bays and buttresses at three scales: the long swing of the wall, the spurs, and the columns Tolkien draws
    o = 5 if side < 0 else 11
    base += 46 * (fbm(x * 0.0028 + o, 0.3) - 0.5) * 2
    base += 20 * (fbm(x * 0.011 + o, 1.9) - 0.5) * 2
    base += 9 * math.sin(x / 13.0 + 3 * fbm(x * 0.02 + o, 5.1))
    return max(38.0, base)


def cliff_h(x, side):
    h = 205 + 40 * smooth(1000, 2600, x) - 150 * smooth(-1500, -2700, x)
    h += 44 * (fbm(x * 0.0035 + (2 if side < 0 else 9), 1.7) - 0.5) * 2
    h += 16 * (fbm(x * 0.03 + (4 if side < 0 else 6), 2.3) - 0.5) * 2         # a ragged top edge
    return max(40.0, h)


def cliff_w(x, side):
    w = 44 + 14 * (fbm(x * 0.01 + 3, 4.2 + side) - 0.5)
    # the gully in the south wall that the zig-zag path comes down: not a cliff here but a steep slope
    if side > 0:
        w += 190 * g(x, 360, 110)
    return w


def moor(x, z):
    """The open moor: rolling, higher towards the mountains in the east, falling away west to the Ford."""
    h = 612 + 0.05 * x + 60 * smooth(1500, 3300, x) - 40 * smooth(-1200, -3200, x)
    h += 24 * (fbm(x * 0.0022, z * 0.0022) - 0.5) * 2 + 8 * (fbm(x * 0.011 + 3, z * 0.011) - 0.5)
    return h


# the side streams that come over the rim: (side, x). -1 is the north wall, 1 the south.
FALLS = [(-1, 1180), (-1, 560), (-1, -330), (-1, -1020), (1, 1500), (1, 820), (1, 170), (1, -560), (1, -1480)]


def shelf(x):
    """The shelf the house stands on, above a rocky bluff on the north bank: how high above the water, and
    how strongly it applies here."""
    return 24.0, smooth(-420, -250, x) * smooth(560, 380, x)


def terrain_height(x, z):
    c = zc(x)
    k = math.sqrt(1 + dzdx(x) ** 2)
    d = (z - c) / k                        # signed distance across the valley: negative is north
    side = -1 if d < 0 else 1
    a = abs(d)
    W = water(x)
    hw = 8 + 6 * g(x, 150, 800) + 16 * g(x, -2330, 300) - 2 * smooth(1800, 2600, x)   # half-width of the river
    F = floor_half(x, side)
    CH = cliff_h(x, side)
    CW = cliff_w(x, side)
    U = 210 + 90 * (fbm(x * 0.003 + side, 7.1) - 0.5)

    if a < hw:                                                   # the channel
        h = W - 2.6 * (1 - (a / hw) ** 2)
    elif a < F:                                                  # the floor: a bank, then meadow rising to the foot
        t = (a - hw) / (F - hw)
        h = W + 0.8 + 3.0 * smooth(0, 0.08, t) + 20 * t ** 1.7 + 3 * (fbm(x * 0.03, z * 0.03) - 0.5)
        h += 5 * (fbm(x * 0.008 + 2, z * 0.008 + 7) - 0.5) * smooth(0.15, 0.4, t)       # the floor is not a lawn
        h += 14 * smooth(0.82, 1.0, t) * fbm(x * 0.02 + 5, z * 0.02)                   # talus at the foot of the wall
        # the shelf, on the north side where the house is: a bluff up from the water, then level ground
        sh, on = shelf(x)
        if side < 0 and on > 0:
            lvl = W + sh + 4 * t
            h = h + (lvl - h) * on * smooth(hw + 14, hw + 30, a)
    else:
        foot = W + 0.8 + 3.0 + 20 + 3 * (fbm(x * 0.03, z * 0.03) - 0.5)
        sh, on = shelf(x)
        if side < 0 and on > 0:
            foot = foot + (W + sh + 4 - foot) * on
        top = foot + CH
        rim = max(moor(x, z), top + 40)
        if a < F + CW:                                           # the wall: sheer, a steep S of a curve
            t = (a - F) / CW
            # along some stretches the wall has a ledge part way up, where trees get a hold
            ledge = smooth(0.55, 0.7, fbm(x * 0.004 + (8 if side < 0 else 3), 9.3))
            if ledge > 0:
                if t < 0.42:
                    s2 = 0.46 * smooth(0, 0.42, t)
                elif t < 0.6:
                    s2 = 0.46 + 0.02 * (t - 0.42) / 0.18
                else:
                    s2 = 0.48 + 0.52 * smooth(0.6, 1.0, t)
                h = foot + CH * ((1 - ledge) * (t * t * (3 - 2 * t)) ** 0.9 + ledge * s2)
            else:
                h = foot + CH * (t * t * (3 - 2 * t)) ** 0.9
        elif a < F + CW + U:                                     # the wooded slope above it, easing to the rim
            t = (a - F - CW) / U
            h = top + (rim - top) * (1 - (1 - t) ** 2.2) + 9 * (fbm(x * 0.02, z * 0.02) - 0.5) * math.sin(math.pi * t)
        else:                                                    # the moor
            h = moor(x, z)
    # the rock the Ford path climbs over, by a stair cut into it, on the south side downstream of the bridge
    h += 34 * g(x, -610, 55) * g(d, 120, 45)
    # the side streams: a groove back across the moor, a notch at the rim, a slot down the wall
    for fs, fx in FALLS:
        if fs == side:
            gx = g(x, fx, 14)
            if gx > 0.01 and F < a < F + CW + U + 420:
                h -= gx * (6 + 4 * smooth(F + CW + U + 300, F + CW, a)) * smooth(F + CW + U + 420, F + CW + U + 300, a)
    # No edge fade: the valley runs out of the box at both ends, and the page draws the moor beyond it
    # (src/rivendell/ground.js) with a hole where the box is, instead of the engine's flat horizon plate.
    return h


# ---------------------------------------------------------------------------------------------- output
def q(v):
    return int(round(v * 10))


def flat(pts):
    out = []
    for x, z in pts:
        out += [q(x), q(z)]
    return out


def main():
    out = {"attribution": "Rivendell: fan geometry generated by tools/make-rivendell.py after Tolkien's text "
                          "and drawings; no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [-HZ / 111132, -HX / 111320, HZ / 111132, HX / 111320]}
    nx = int(2 * HX) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}
    H = lambda x, z: terrain_height(x, z)

    def north_bank(x, off):
        c = zc(x)
        return c - off * math.sqrt(1 + dzdx(x) ** 2)

    def south_bank(x, off):
        c = zc(x)
        return c + off * math.sqrt(1 + dzdx(x) ** 2)

    # ---------------------------------------------------------------- the plan of the valley
    river = []
    for x in range(int(HX + 100), int(-HX - 100), -8):
        hw = 8 + 6 * g(x, 150, 800) + 16 * g(x, -2330, 300) - 2 * smooth(1800, 2600, x)
        river.append([round(x, 1), round(zc(x), 1), round(water(x), 2), round(hw + 1.5, 1)])
    sites = {}
    # the house: on the shelf, set back from the bluff, facing south over the water
    hx = HOUSE[0]
    hz = north_bank(hx, 110)
    sites["house"] = {"x": hx, "z": round(hz, 1), "y": round(H(hx, hz), 1),
                      "turn": round(math.atan2(dzdx(hx), 1), 3)}
    # the bridge: stone, one arch, no parapet, from the south bank up to the foot of the shelf
    bx = BRIDGE_X
    sites["bridge"] = {"x": bx, "zN": round(north_bank(bx, 14), 1), "zS": round(south_bank(bx, 14), 1),
                       "y": round(water(bx), 2)}
    # the rock with the stair cut into it, on the path from the Ford
    sites["stair"] = {"x": -610, "z": round(zc(-610) + 120, 1)}
    sites["fall"] = {"x": FALL_X}
    sites["ford"] = {"x": -2330, "z": round(zc(-2330), 1), "y": round(water(-2330), 2)}
    # the pavilions: at the edge of the shelf over the bluff, and one out on the rock at the head of the garden
    pav = []
    for px, off in ((-190, 44), (330, 40), (520, 70)):
        pz = north_bank(px, off)
        pav.append({"x": px, "z": round(pz, 1), "y": round(H(px, pz), 1)})
    sites["pavilions"] = pav
    # the falls: where each stream starts on the moor, where it comes over the rim, the lip of the sheer
    # wall, the foot of it, and where it reaches the river - all worked out along the line across the valley
    falls = []
    for fs, fx in FALLS:
        k = math.sqrt(1 + dzdx(fx) ** 2)
        F, CH, CW = floor_half(fx, fs), cliff_h(fx, fs), cliff_w(fx, fs)
        U = 210 + 90 * (fbm(fx * 0.003 + fs, 7.1) - 0.5)
        at = lambda a: (fx, zc(fx) + fs * a * k)
        pts = []
        for a in [F + CW + U + 320, F + CW + U + 160, F + CW + U, F + CW + U * 0.5, F + CW + 2]:
            x, z = at(a)
            pts.append([x, round(z, 1), round(H(x, z) + 0.6, 1)])
        lip = at(F + CW - 1)
        foot = at(F + 4)
        bank = at(14)
        falls.append({"side": fs, "moor": pts, "lip": [lip[0], round(lip[1], 1), round(H(*lip), 1)],
                      "foot": [foot[0], round(foot[1], 1), round(H(*foot), 1)],
                      "bank": [bank[0], round(bank[1], 1), round(H(*bank), 1)],
                      "drop": round(H(*lip) - H(*foot), 1)})
    plan = {"_": "the plan of the valley, written by tools/make-rivendell.py: read by src/rivendell/",
            "river": river, "fallX": FALL_X, "falls": falls, "sites": sites,
            "rim": {"north": [[x, round(north_bank(x, floor_half(x, -1) + cliff_w(x, -1)), 1)] for x in range(-3200, 3300, 100)],
                    "south": [[x, round(south_bank(x, floor_half(x, 1) + cliff_w(x, 1)), 1)] for x in range(-3200, 3300, 100)]}}

    # ---------------------------------------------------------------- the paths (the engine draws these)
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    ford = (-2330, zc(-2330))
    # the East Road: from the west, over the Ford, and away east across the southern moor to the mountains
    road([(-3400, 180), (-2900, 330), (-2560, 470), ford, (-2130, 760), (-1700, 1080), (-900, 1380),
          (0, 1560), (1100, 1700), (2200, 1800), (3400, 1900)], "primary", 7, "The East Road")
    # the way from the Ford up the valley: along the south floor, over the rock by the stair, down to the bridge
    path = [ford]
    for x in range(-2200, -700, 100):
        path.append((x, south_bank(x, min(floor_half(x, 1) * 0.55, 70))))
    path += [(-700, zc(-700) + 95), (-640, zc(-640) + 116), (-600, zc(-600) + 122), (-560, zc(-560) + 112),
             (-470, zc(-470) + 80), (-300, south_bank(-300, 40)), (-140, south_bank(-140, 26)),
             (bx, sites["bridge"]["zS"])]
    road(path, "path", 3, "The path from the Ford")
    # across the bridge and up the bluff to the house
    road([(bx, sites["bridge"]["zN"]), (bx + 30, north_bank(bx + 30, 30)), (bx + 70, north_bank(bx + 70, 58)),
          (hx - 20, hz + 40)], "footway", 3, "Up to the house")
    # the steep zig-zag path, down the gully in the south wall from the Road on the moor
    zig = [(420, 1500), (400, 1100)]
    top = south_bank(360, floor_half(360, 1) + cliff_w(360, 1) + 180)
    zig.append((380, top))
    bot = south_bank(360, floor_half(360, 1) - 20)
    n = 9
    for i in range(1, n + 1):
        t = i / n
        z = top + (bot - top) * t
        zig.append((360 + (60 if i % 2 else -60), z))
    zig.append((300, south_bank(300, 40)))
    zig.append((bx + 40, south_bank(bx + 40, 22)))
    road(zig, "path", 2.5, "The zig-zag path")
    # the garden walks on the shelf, and the river walk along the terrace
    road([(-380, north_bank(-380, 36)), (-150, north_bank(-150, 34)), (100, north_bank(100, 38)),
          (380, north_bank(380, 34)), (560, north_bank(560, 60))], "footway", 2.5, "The river terrace")
    road([(hx + 60, hz), (hx + 200, hz - 30), (hx + 330, hz - 20), (520, north_bank(520, 70))], "footway", 2.5,
         "The east garden")
    out["roads"] = roads
    for k in ("water", "lake", "islands", "marina", "beach", "pier", "waterways", "areas", "rail", "stations",
              "buildings", "trees"):
        out[k] = []
    out["pois"] = [{"n": "The Last Homely House", "x": q(hx), "z": q(hz), "k": "hall", "ang": 0},
                   {"n": "The Ford of Bruinen", "x": q(ford[0]), "z": q(ford[1]), "k": "ford", "ang": 0}]
    json.dump(out, open(OUT, "w"), separators=(",", ":"))
    json.dump(plan, open(PLAN, "w"), separators=(",", ":"))
    t = out["terrain"]
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; terrain {t['nx']}x{t['nz']} at {t['step']} m, "
          f"{min(t['h'])/10:.0f} to {max(t['h'])/10:.0f} m; roads {len(roads)}")
    print(f"wrote {PLAN}: {os.path.getsize(PLAN)/1e3:.0f} KB; river {len(river)} points, {len(falls)} falls; "
          f"house at {sites['house']}")


if __name__ == "__main__":
    main()
