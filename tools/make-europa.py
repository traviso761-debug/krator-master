#!/usr/bin/env python3
"""Conamara Station: a colony on the ice of Europa, over a bore down to the ocean.

Original work. Europa is a real place and the geology here is built from what is actually known about it -
which is the point of choosing it: it is the only body in this collection where the landscape is neither
invented nor mapped from a city, but reconstructed from a few thousand pixels of Galileo imagery and a lot
of argument about what they mean.

What the ice actually does, and what the generator therefore builds:

  the plains        smooth on the scale of kilometres and rough on the scale of metres. Europa is the
                    flattest solid surface in the solar system; there is nothing here over a few hundred
                    metres and most of it is under fifty.
  double ridges     the signature feature: two parallel ridges with a trough between them, running for
                    hundreds of kilometres, crossing each other at every angle. Nobody is sure how they
                    form. They are what the surface is made of.
  chaos terrain     where the ice has broken up and re-frozen: blocks the size of city blocks, tilted and
                    rotated, in a matrix of finer rubble. Conamara Chaos is the type example and the
                    station is named for it.
  lineae            the long cracks, stained brown by whatever comes up through them - salts, most likely,
                    from the ocean underneath. They are the only colour on the whole moon.
  the ocean         a hundred kilometres of liquid water under ten or twenty of ice, which is the only
                    reason anybody would come here. The station exists to drill it.

Everything that is built - the habitat, the bore derrick, the pads, the arrays - is a landmark and lives in
src/europa/landmarks.js.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "europa-osm.json")
R = random.Random(1610)                # the year Galileo found the moons

HX, HZ = 8000.0, 7000.0          # half-extents: 16 x 14 km
STEP = 25                        # the height grid, in metres

ICE = 140.0                      # the datum: mean surface
BORE = (700.0, -420.0)           # the shaft
PADS = (-1500.0, 900.0)          # the landing field
CHAOS = (2600.0, 2300.0)         # the chaos terrain, east-south-east
ARRAY = (-900.0, -1700.0)        # the power and comms farm

# the double ridges: (angle, offset, height, spacing of the pair)
RIDGES = [(0.42, -3100.0, 46.0, 260.0), (0.42, 900.0, 62.0, 300.0), (0.42, 4200.0, 38.0, 220.0),
          (-1.15, -2200.0, 54.0, 280.0), (-1.15, 2600.0, 40.0, 240.0),
          (2.05, 0.0, 34.0, 200.0), (2.05, 5200.0, 44.0, 250.0)]
# the lineae: long cracks, with the stain along them
LINEAE = [(0.72, -1800.0, 150.0), (-0.35, 2400.0, 190.0), (1.85, -4200.0, 120.0)]


def ring_poly(cx, cz, r, n=48):
    return [(cx + math.cos(i / n * math.tau) * r, cz + math.sin(i / n * math.tau) * r) for i in range(n)]


def along(x, z, ang, off):
    """Distance across a line at this angle and offset, and the distance along it."""
    c, s = math.cos(ang), math.sin(ang)
    return -x * s + z * c - off, x * c + z * s


def terrain_height(x, z):
    h = ICE
    # the plains: smooth at a kilometre, rough at a hundred metres. Europa is very flat.
    h += 9 * math.sin(x / 1400.0 + 0.3) * math.cos(z / 1700.0 - 0.6)
    h += 4 * math.sin(x / 320.0 - z / 380.0) + 2.2 * math.sin(x / 90.0 + z / 110.0)

    # the double ridges: two crests with a trough between, and a fan of debris either side
    for ang, off, ht, sp in RIDGES:
        d, u = along(x, z, ang, off)
        # the pair
        for sd in (-1, 1):
            dd = abs(d - sd * sp * 0.5)
            h += ht * math.exp(-(dd / (sp * 0.26)) ** 2) * (1 + 0.18 * math.sin(u / 160.0))
        # the trough between them, and the apron outside
        h -= ht * 0.32 * math.exp(-(d / (sp * 0.20)) ** 2)
        h += ht * 0.16 * math.exp(-(abs(d) / (sp * 1.6)) ** 2)

    # the lineae: a groove, wider and shallower than a ridge, with a raised lip
    for ang, off, w in LINEAE:
        d, u = along(x, z, ang, off)
        h -= 22 * math.exp(-(d / (w * 0.45)) ** 2)
        h += 7 * math.exp(-((abs(d) - w * 0.8) / (w * 0.4)) ** 2)

    # the chaos: the ice here is broken and re-frozen, so the ground is a metre or two lower and much rougher
    cd = math.hypot((x - CHAOS[0]) * 0.8, (z - CHAOS[1]) * 1.0)
    ch = smoothstep(2600.0, 900.0, cd)
    if ch > 0.01:
        h -= 16 * ch
        h += 26 * ch * (0.5 * math.sin(x / 130.0 + z / 90.0) + 0.3 * math.sin(x / 47.0 - z / 61.0)
                        + 0.2 * math.sin(x / 210.0 + z / 170.0))

    # the station pad: graded flat, because a habitat does not sit on a ridge
    for cx, cz, r in ((0.0, 0.0, 700.0), (PADS[0], PADS[1], 620.0), (BORE[0], BORE[1], 360.0),
                      (ARRAY[0], ARRAY[1], 400.0)):
        f = smoothstep(r * 1.5, r * 0.75, math.hypot(x - cx, z - cz))
        h = h * (1 - f) + (ICE + 2.0) * f

    e = smoothstep(HX, HX - 400, abs(x)) * smoothstep(HZ, HZ - 400, abs(z))
    return h * e + (ICE - 6) * (1 - e)


def main():
    out = {"attribution": "Conamara Station: original geometry generated by tools/make-europa.py",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [-0.06299, -0.07186, 0.06299, 0.07186]}

    nx = int(2 * HX) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # There is a hundred kilometres of ocean here and not one drop of it is on the surface.
    out["water"], out["lake"], out["islands"] = [], [], []
    out["marina"], out["beach"], out["pier"] = [], [], []
    out["waterways"] = []

    # ---------- the tracks ----------
    # Not roads: graded lanes, swept and marked, because a rover that leaves the lane is in rubble that will
    # take its wheels off. They run between the four things that matter and out to the far sites.
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    road([(0, 0), (260, -140), (BORE[0], BORE[1])], "primary", 14, "The Bore Road")
    road([(0, 0), (-500, 300), (PADS[0], PADS[1])], "primary", 14, "The Pad Road")
    road([(0, 0), (-400, -700), (ARRAY[0], ARRAY[1])], "primary", 12, "The Array Road")
    road([(BORE[0], BORE[1]), (1600, 600), (CHAOS[0] - 700, CHAOS[1] - 500)], "secondary", 11,
         "The Chaos Traverse")
    road([(PADS[0], PADS[1]), (-3200, 1900), (-5600, 2600), (-7200, 3600)], "secondary", 11,
         "The West Traverse")
    road([(0, 0), (900, -2200), (1600, -4600), (2100, -6400)], "secondary", 11, "The North Traverse")
    # the ring road round the station itself
    road(ring_poly(0, 0, 300, 28) + [(300, 0)], "residential", 9, "The Perimeter")
    for k in range(9):
        a = k / 9 * math.tau
        road([(math.cos(a) * 60, math.sin(a) * 60), (math.cos(a) * 300, math.sin(a) * 300)],
             "residential", 7)
    out["roads"] = roads

    # ---------- the ground ----------
    areas = [
        {"k": "plaza", "n": "", "i": [], "o": flat(ring_poly(0, 0, 320, 40))},
        {"k": "plaza", "n": "The Landing Field", "i": [], "o": flat(ring_poly(PADS[0], PADS[1], 500, 40))},
        {"k": "plaza", "n": "", "i": [], "o": flat(ring_poly(BORE[0], BORE[1], 260, 32))},
        {"k": "plaza", "n": "", "i": [], "o": flat(ring_poly(ARRAY[0], ARRAY[1], 320, 32))},
    ]
    # the stain along the lineae: the only colour on the moon, and the reason anybody looked twice at it
    for ang, off, w in LINEAE:
        c, s = math.cos(ang), math.sin(ang)
        ring = []
        for i in range(24):
            u = (i / 23 - 0.5) * 19000
            ring.append((u * c - (off + w * 0.9) * s, u * s + (off + w * 0.9) * c))
        for i in range(23, -1, -1):
            u = (i / 23 - 0.5) * 19000
            ring.append((u * c - (off - w * 0.9) * s, u * s + (off - w * 0.9) * c))
        areas.append({"k": "construction", "n": "Linea", "i": [], "o": flat(ring)})
    out["areas"] = areas
    out["rail"] = []
    out["stations"] = []

    # ---------- what is built, and what the ice has built ----------
    buildings = []

    def put(ring, h, kind=None, colour=None, name=None, minh=None, roof="f"):
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

    ICE_C = ["#c9d6df", "#bccad4", "#d4e0e8", "#b2c0cb"]
    SHADOW = ["#8fa0ad", "#9aabb7"]

    # ---- the chaos ----
    # Blocks of the old surface, tilted and turned, standing in a matrix of rubble. They are the size of city
    # blocks and they are the most dramatic thing on the moon.
    nblock = 0
    for k in range(320):
        a = R.uniform(0, math.tau)
        d = R.uniform(0, 2400)
        x = CHAOS[0] + math.cos(a) * d * 1.25
        z = CHAOS[1] + math.sin(a) * d
        if abs(x) > HX - 500 or abs(z) > HZ - 500:
            continue
        w = R.uniform(60, 340)
        dd = R.uniform(50, 260)
        hh = R.uniform(14, 70) * (1 - d / 3200)
        if hh < 5:
            continue
        put(rect(x, z, w, dd, R.uniform(0, math.pi)), hh, "rock",
            ICE_C[R.randrange(len(ICE_C))], minh=-hh * 1.2)
        nblock += 1
    # the rubble between them
    for k in range(700):
        a = R.uniform(0, math.tau)
        d = R.uniform(0, 2600)
        x = CHAOS[0] + math.cos(a) * d * 1.25
        z = CHAOS[1] + math.sin(a) * d
        if abs(x) > HX - 400 or abs(z) > HZ - 400:
            continue
        s = R.uniform(8, 40)
        put(rect(x, z, s, s * R.uniform(0.5, 1.0), R.uniform(0, math.pi)), R.uniform(2, 11), "rock",
            SHADOW[R.randrange(len(SHADOW))], minh=-6)
        nblock += 1
    # and a scatter of blocks along the ridges, where the ice has shouldered up and broken
    for k in range(260):
        ang, off, ht, sp = RIDGES[R.randrange(len(RIDGES))]
        u = R.uniform(-9000, 9000)
        d = (R.choice((-1, 1)) * sp * 0.5) + R.uniform(-40, 40)
        c, s = math.cos(ang), math.sin(ang)
        x = u * c - (off + d) * s
        z = u * s + (off + d) * c
        if abs(x) > HX - 400 or abs(z) > HZ - 400:
            continue
        put(rect(x, z, R.uniform(10, 48), R.uniform(8, 34), R.uniform(0, math.pi)), R.uniform(3, 16),
            "rock", ICE_C[R.randrange(len(ICE_C))], minh=-10)
        nblock += 1

    # ---- the station's own lesser buildings ----
    # Everything that is not the habitat, the derrick, the pads or the array: stores, the shop, the tank
    # farm, the garage. All of it low, all of it on legs to keep it off the ice, all of it the same grey.
    built = 0
    for k in range(26):
        a = k / 26 * math.tau + 0.2
        d = 150 + (k % 4) * 46
        x, z = math.cos(a) * d, math.sin(a) * d
        w = R.uniform(14, 34)
        put(rect(x, z, w, R.uniform(10, 20), a), R.uniform(5, 11), "industrial", "#7f8890", minh=1.6)
        built += 1
    for k in range(9):                                  # the tank farm
        a = k / 9 * math.tau
        x, z = -260 + math.cos(a) * 70, -80 + math.sin(a) * 70
        put(ring_poly(x, z, 11, 14), R.uniform(10, 16), "industrial", "#98a2aa")
        built += 1
    for k in range(7):                                  # the garage, and the rovers parked outside it
        put(rect(240 + k * 22, 190, 18, 11, 0.2), 6, "industrial", "#6f7880")
        built += 1
    out["buildings"] = buildings

    out["trees"] = []
    out["pois"] = [{"n": "Conamara Station", "x": 0, "z": 0, "k": "station", "ang": 0},
                   {"n": "The bore", "x": q(BORE[0]), "z": q(BORE[1]), "k": "bore", "ang": 0},
                   {"n": "The landing field", "x": q(PADS[0]), "z": q(PADS[1]), "k": "pad", "ang": 0}]

    t = out["terrain"]
    lo = min(t["h"]) / 10.0
    hi = max(t["h"]) / 10.0
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)} "
          f"({built} built, {nblock} ice); roads {len(roads)}; "
          f"terrain {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f} to {hi:.0f} m")


if __name__ == "__main__":
    main()
