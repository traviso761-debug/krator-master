#!/usr/bin/env python3
"""Arrakeen, on Arrakis: the city in the basin behind the Shield Wall.

Fan work. Nothing from any book, film or game is used - every shape here is this project's own geometry,
generated from the description, and Dune belongs to the Herbert estate.

What the description gives you, and what the model is therefore about:

  the Shield Wall     a rampart of rock standing right across the north and east, which is the only reason
                      anything can live here: it keeps the great worms and the coriolis storms out of the
                      basin, and everything inside it is in its lee
  the basin           flat, stony, swept - not dune country. The dunes start where the rock stops.
  Arrakeen            a city built for a planet with no water: thick walls, small openings, flat roofs, and
                      a windtrap on every one of them, because the air is the only place there is any water
  the Residency       the great house of the fief-holder, walled off inside the city, with a garden in it
                      that is an obscenity - a few hundred square metres of green on a world that would
                      drink a man dry
  the landing field   the only way anything arrives. A plain of fused rock east of the city with the
                      Guild's lighters standing on it.
  the deep desert     south and west past the last rock: dunes in long ranks, a harvester working a spice
                      blow, a carryall over it, and the sign of what is coming up underneath

The city is drawn as the engine's cities are: a heightfield, a road network, land cover, and footprints with
a height each. The things that are only here - the Residency, the great windtrap, the lighter on its pad,
the sietch in the rock - are landmarks and live in src/arrakeen/landmarks.js.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "arrakeen-osm.json")
R = random.Random(10191)

HX, HZ = 12000.0, 10000.0        # half-extents: 24 x 20 km
STEP = 40                        # the height grid, in metres

BASIN = 210.0                    # the floor of the basin, above the datum
CITY_R = 1500.0                  # the wall of Arrakeen
FIELD = (4200.0, 900.0)          # the landing field, east of the city
SIETCH = (-6400.0, 2600.0)       # the rock the Fremen are in, west
WALL_R = 7600.0                  # how far out the Shield Wall stands


def ring_poly(cx, cz, r, n=64, r2=None):
    out = []
    for i in range(n):
        a = i / n * math.tau
        out.append((cx + math.cos(a) * r, cz + math.sin(a) * r))
    if r2 is not None:
        for i in range(n - 1, -1, -1):
            a = i / n * math.tau
            out.append((cx + math.cos(a) * r2, cz + math.sin(a) * r2))
    return out


def arc(cx, cz, r, a0, a1, n=None, width=None):
    n = n or max(4, int(abs(a1 - a0) * r / 26))
    if width is None:
        return [(cx + math.cos(a0 + (a1 - a0) * i / n) * r,
                 cz + math.sin(a0 + (a1 - a0) * i / n) * r) for i in range(n + 1)]
    out = []
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
        out.append((cx + math.cos(a) * (r + width / 2), cz + math.sin(a) * (r + width / 2)))
    for i in range(n, -1, -1):
        a = a0 + (a1 - a0) * i / n
        out.append((cx + math.cos(a) * (r - width / 2), cz + math.sin(a) * (r - width / 2)))
    return out


# ---------------------------------------------------------------- the land

def shield_wall(x, z):
    """The rampart, standing across the north and east on a great arc centred south-west of the city."""
    a = math.atan2(z + 3400.0, x + 2200.0)
    # The arc is centred south-west of the city, so the city sits at about a = 1.0 on it; the wall carries
    # from below the horizon of that round to well past it, which puts it across the north and east of the
    # basin - the side the storms and the worms come from - and leaves the south-west open to the sand.
    span = smoothstep(-0.55, -0.10, a) * smoothstep(2.60, 2.15, a)
    if span <= 0.0:
        return 0.0
    r = math.hypot(x + 2200.0, z + 3400.0)
    d = abs(r - WALL_R)
    # A wall, not a dune. It comes up out of the basin in six hundred metres and stays up, and the inner
    # face - the one Arrakeen looks at - is the steep one, because that is the side the wind has been
    # scouring for as long as there has been a wind.
    inner = r < WALL_R
    prof = smoothstep(1500.0 if inner else 2600.0, 300.0, d)
    crest = 1150.0 + 260.0 * math.sin(a * 7.0) + 140.0 * math.sin(a * 17.0 + 1.1)
    # and it is rock, so it is serrated: gullies down the face and towers left standing between them
    serr = (0.66 * math.sin(a * 61.0) + 0.24 * math.sin(a * 137.0 + 2.1)
            + 0.14 * math.sin(x / 260.0 + z / 310.0))
    return crest * prof * span * (1 + 0.20 * serr)


def terrain_height(x, z):
    h = BASIN

    # the basin floor: swept rock, tilted very slightly to the south-west, with low stony swells on it
    h += 26 * math.sin(x / 1900.0 + 0.4) * math.cos(z / 2300.0 - 0.7)
    h -= 60 * smoothstep(0.0, -9000.0, x + z * 0.4)

    # the Shield Wall, and the gap the road comes through
    w = shield_wall(x, z)
    gap = smoothstep(1400.0, 500.0, abs(math.atan2(z + 3400.0, x + 2200.0) - 0.30) * WALL_R)
    h += w * (1 - 0.86 * gap)

    # the massif the sietch is in: an outcrop of the same rock, standing alone out in the basin
    sd = math.hypot((x - SIETCH[0]) * 1.0, (z - SIETCH[1]) * 1.5)
    h += 420 * smoothstep(1500.0, 520.0, sd) * (1 + 0.22 * math.sin(sd / 90.0) + 0.1 * math.sin(x / 130.0))
    h += 120 * smoothstep(4200.0, 2000.0, sd) * (0.5 + 0.5 * math.sin(x / 400.0 + z / 330.0))

    # the landing field: fused flat, and a good deal of it
    fd = max(abs(x - FIELD[0]) / 1900.0, abs(z - FIELD[1]) / 1400.0)
    h = h * (1 - smoothstep(1.25, 0.9, fd)) + (BASIN + 6) * smoothstep(1.25, 0.9, fd)

    # the dunes: everywhere the rock is not, which here means south and west of the basin
    open_sand = smoothstep(4000.0, 6600.0, math.hypot(x + 1500.0, (z - 2400.0) * 0.8))
    if open_sand > 0.01:
        # ranks of dunes, running with the wind, with a sharper slip face on the lee side
        u = (x * 0.94 + z * 0.34) / 900.0
        v = (-x * 0.34 + z * 0.94) / 5200.0
        t = u + 0.30 * math.sin(v * 2.1) + 0.12 * math.sin(v * 5.3)
        f = t - math.floor(t)
        dune = (1 - (1 - f) ** 1.7) if f < 0.72 else (1 - (f - 0.72) / 0.28) ** 0.8
        ridge = 64 + 22 * math.sin(v * 3.7) + 12 * math.sin(u * 0.21)
        h += (dune * ridge - 10) * open_sand
        h -= 40 * open_sand

    # the city platform: Arrakeen stands on the one piece of level rock in the basin
    cd = math.hypot(x, z)
    h = h * (1 - smoothstep(CITY_R + 900, CITY_R + 120, cd)) + (BASIN + 14) * smoothstep(CITY_R + 900, CITY_R + 120, cd)

    h *= smoothstep(HX, HX - 700, abs(x)) * smoothstep(HZ, HZ - 700, abs(z))
    return h


# ---------------------------------------------------------------- the city

def main():
    out = {"attribution": "Arrakeen: fan geometry generated by tools/make-arrakeen.py; "
                          "no book, film or game assets used",
           "units": "decimetres east (x) and south (z) of origin", "origin": [0.0, 0.0],
           "bounds": [-0.08999, -0.10780, 0.08999, 0.10780]}

    nx = int(2 * HX) // STEP + 2
    nz = int(2 * HZ) // STEP + 2
    hs = []
    for j in range(nz):
        zz = -HZ + j * STEP
        for i in range(nx):
            hs.append(terrain_height(-HX + i * STEP, zz))
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(-HX), "z0": q(-HZ), "datum": 0.0,
                      "h": [int(round(h * 10)) for h in hs]}

    # there is no water on this planet that is not inside something
    out["water"], out["lake"], out["islands"] = [], [], []
    out["marina"], out["beach"], out["pier"] = [], [], []
    # The qanat is the city's water, carried from catchment basins in the Shield Wall - and every metre of
    # it is underground, because an open channel on Arrakis is a way of throwing water away. So there are no
    # waterways on this map at all. What shows on the surface is the line of plantations it feeds.
    out["waterways"] = []

    # ---------- roads ----------
    roads = []

    def road(pts, cls, w, name=""):
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        roads.append(r)

    # the four ways out of the city, and the ring inside the wall
    road([(0, 0), (1600, 300), (FIELD[0] - 600, FIELD[1]), (FIELD[0] + 1400, FIELD[1] - 200)],
         "trunk", 22, "The Landing Field Road")
    road([(0, 0), (-1100, 700), (-3400, 1800), (SIETCH[0] + 1400, SIETCH[1] - 400)],
         "primary", 16, "The West Road")
    road([(0, 0), (700, -1200), (2200, -3600), (3600, -6400), (4200, -9200)], "primary", 16, "The Wall Road")
    road([(0, 0), (-600, 1400), (-1500, 3200), (-2100, 4300)], "primary", 14, "The Sink Road")
    road(ring_poly(0, 0, CITY_R - 130, 60) + [(CITY_R - 130, 0)], "secondary", 13, "The Wall Way")
    road(ring_poly(0, 0, CITY_R * 0.62, 48) + [(CITY_R * 0.62, 0)], "secondary", 12, "The Inner Way")
    # the grid of the old town: streets deliberately narrow and crooked, because shade is the only comfort
    for k in range(13):
        a = k / 13 * math.tau
        pts = []
        for i in range(12):
            t = i / 11
            rr = 120 + t * (CITY_R - 200)
            aa = a + 0.16 * math.sin(t * 3.4 + k)
            pts.append((math.cos(aa) * rr, math.sin(aa) * rr))
        road(pts, "residential", 7, ["Sietch Way", "Cistern Row", "The Shade", "Harkonnen Steps",
                                     "Water Lane", "Stilgar Way", "The Slot", "Dune Gate Way",
                                     "Pan Row", "The Crossing", "Spice Row", "Thumper Lane",
                                     "The Narrows"][k])
    for k in range(7):
        rr = 260 + k * 190
        road(ring_poly(0, 0, rr, 40) + [(rr, 0)], "residential", 6, f"{k + 1} Circle Way")
    # the lanes: a great many, all short
    for k in range(120):
        a = R.uniform(0, math.tau)
        rr = R.uniform(200, CITY_R - 220)
        a2 = a + R.uniform(-0.22, 0.22)
        road([(math.cos(a) * rr, math.sin(a) * rr),
              (math.cos(a2) * (rr + R.uniform(90, 230)), math.sin(a2) * (rr + R.uniform(90, 230)))],
             "alley", 4)
    out["roads"] = roads

    # ---------- land cover ----------
    areas = [
        {"k": "plaza", "n": "", "i": [], "o": flat(ring_poly(0, 0, CITY_R - 40, 72))},
        {"k": "railyard", "n": "The Landing Field", "i": [],
         "o": flat(rect(FIELD[0], FIELD[1], 3600, 2600))},
        {"k": "sand", "n": "The Funeral Plain", "i": [],
         "o": flat(ring_poly(-4200, 5200, 5200, 40))},
        {"k": "park", "n": "The Residency Garden", "i": [], "o": flat(rect(-430, -560, 300, 220, 0.2))},
        {"k": "plaza", "n": "The Water Market", "i": [], "o": flat(rect(320, 300, 260, 200, 0.4))},
    ]
    # the plantations: strips of ground the qanats feed, and the only cultivated land on the planet
    for k in range(4):
        a = 0.10 + k * 0.30
        cx = math.cos(a * 0.7) * 2600 - 900
        cz = math.sin(a * 0.7) * 2600 - 1300
        rot = a * 0.7 + 1.57
        ring = []
        for i in range(30):                      # a strip, but a ragged one: it follows the water
            t = i / 29 if i < 15 else (29 - i) / 14
            u = (i % 15) / 14 * 1400 - 700
            v = (190 if i < 15 else -190) * (0.55 + 0.45 * math.sin(t * 5.1 + k))
            ring.append((cx + u * math.cos(rot) - v * math.sin(rot),
                         cz + u * math.sin(rot) + v * math.cos(rot)))
        areas.append({"k": "grass", "n": "Plantation", "i": [], "o": flat(ring)})
    out["areas"] = areas
    out["rail"] = []
    out["stations"] = []

    # ---------- what is built ----------
    buildings = []

    def put(ring, h, kind=None, colour=None, name=None, minh=None):
        b = {"p": flat(ring), "h": round(h, 1), "r": "f"}
        if kind:
            b["t"] = kind
        if colour:
            b["c"] = colour
        if name:
            b["n"] = name
        if minh is not None:
            b["m"] = round(minh, 1)
        buildings.append(b)

    SAND = ["#c9ab7f", "#bfa073", "#d3b68c", "#b4966b", "#c0a478", "#caae85"]
    SHADE = ["#a88d66", "#9c825f", "#b39871"]
    STONE = "#8d7f6a"

    # ---- the city wall ----
    # Thick, battered, and unbroken except at the four gates: it is not there to stop an army, it is there
    # to stop the sand.
    GATES = [0.0, 0.62 * math.pi, math.pi, 1.45 * math.pi]
    seg = 0
    for k in range(96):
        a0 = k / 96 * math.tau
        a1 = (k + 1) / 96 * math.tau
        if any(abs(((a0 + a1) / 2 - g + math.pi) % math.tau - math.pi) < 0.045 for g in GATES):
            continue
        put(arc(0, 0, CITY_R, a0, a1, 3, width=46), 24 + 3 * math.sin(k * 0.7), "wall", "#a89273", minh=-12)
        seg += 1
    for k in range(32):
        a = k / 32 * math.tau
        put(rect(math.cos(a) * CITY_R, math.sin(a) * CITY_R, 54, 54, a), 34, "tower", "#9e8969", minh=-12)
    for g in GATES:
        for sd in (-1, 1):
            put(rect(math.cos(g + sd * 0.05) * CITY_R, math.sin(g + sd * 0.05) * CITY_R, 70, 70, g),
                52, "tower", "#8f7b5d", minh=-12)

    # ---- the town ----
    # Courtyard houses packed shoulder to shoulder: one or two storeys, flat roofs, a hole in the middle for
    # air and shade, and no windows worth speaking of on the outside. They get taller towards the middle
    # because that is where the water is.
    # Packed shoulder to shoulder, because shade is the only comfort there is and a detached house on
    # Arrakis is a way of dying: the rings are forty-six metres apart and the blocks nearly touch, so what
    # is between them is a slot rather than a street. Every seventh ring is left as a proper street.
    total = 0
    for ring_i in range(30):
        rr = 170 + ring_i * 46
        if rr > CITY_R - 150:
            break
        if ring_i % 7 == 6:
            continue                                       # a way through, wide enough for a cart
        n = max(14, int(rr * math.tau / 40))
        for i in range(n):
            a = i / n * math.tau + ring_i * 0.09
            x, z = math.cos(a) * rr, math.sin(a) * rr
            if abs(x + 430) < 260 and abs(z + 560) < 220:
                continue                                   # the Residency stands here
            if R.random() < 0.05:
                continue
            w = R.uniform(30, 42)
            d = R.uniform(28, 38)
            h = R.uniform(6, 12) + (6 if rr < 700 else 0) + (4 if R.random() < 0.12 else 0)
            col = SAND[R.randrange(len(SAND))]
            put(rect(x, z, w, d, a), h, "residential", col)
            total += 1
            # the courtyard: a well of shade cut down through the middle of the block
            if R.random() < 0.55:
                put(rect(x, z, w * 0.4, d * 0.4, a), h - R.uniform(3, 6), "court", "#6f5f48", minh=0)
            # the parapet that makes the roof usable, and the stair box up to it
            if R.random() < 0.7:
                put(rect(x, z, w * 1.02, d * 1.02, a), h + 1.4, "wall", SHADE[R.randrange(len(SHADE))], minh=h)
            if R.random() < 0.3:
                put(rect(x + R.uniform(-w, w) * 0.3, z + R.uniform(-d, d) * 0.3, 6, 6, a), h + 3.4,
                    "hut", SHADE[R.randrange(len(SHADE))], minh=h)

    # ---- the works ----
    # The cisterns, which are the most heavily guarded things in the city; the water market beside them; and
    # the wind-catchers of the public conservatory.
    for k in range(9):
        a = k / 9 * math.tau + 0.3
        cx, cz = math.cos(a) * 820, math.sin(a) * 820
        put(rect(cx, cz, 96, 70, a), 16, "industrial", "#8a7a62", name="Cistern" if k == 0 else None)
        for j in range(4):
            aa = j / 4 * math.tau
            put(rect(cx + math.cos(aa) * 58, cz + math.sin(aa) * 44, 100, 8, aa + 1.57), 22, "wall", STONE)
    put(rect(320, 300, 190, 140, 0.4), 12, "commercial", "#b8a17c", name="The Water Market")
    for k in range(14):
        put(rect(320 + R.uniform(-80, 80), 300 + R.uniform(-60, 60), R.uniform(10, 20), R.uniform(8, 16),
                 R.uniform(0, math.pi)), R.uniform(4, 7), "stall", "#9d8a6c")

    # ---- the landing field ----
    put(rect(FIELD[0] - 1500, FIELD[1] - 1000, 220, 180, 0.0), 70, "tower", "#7f7565", name="Field Control")
    for k in range(6):
        px = FIELD[0] - 1200 + k * 480
        put(rect(px, FIELD[1] + 900, 380, 190, 0.0), 26, "industrial", "#7a7263")
    for k in range(4):
        a = k / 4 * math.tau
        put(ring_poly(FIELD[0] + math.cos(a) * 900, FIELD[1] + math.sin(a) * 700, 210, 24), 1.6,
            "pad", "#6e675b")

    # ---- the sietch, which from the outside is nothing at all ----
    for k in range(7):
        a = R.uniform(0, math.tau)
        d = R.uniform(200, 1100)
        put(rect(SIETCH[0] + math.cos(a) * d, SIETCH[1] + math.sin(a) * d, R.uniform(30, 90),
                 R.uniform(26, 70), R.uniform(0, math.pi)), R.uniform(8, 26), "rock", "#6d6355")

    # ---- the wind traps out in the basin, and the testing stations ----
    for k in range(40):
        a = R.uniform(0, math.tau)
        d = R.uniform(CITY_R + 400, 5200)
        px, pz = math.cos(a) * d, math.sin(a) * d
        if abs(px - FIELD[0]) < 2200 and abs(pz - FIELD[1]) < 1700:
            continue
        put(rect(px, pz, R.uniform(18, 40), R.uniform(14, 30), R.uniform(0, math.pi)),
            R.uniform(6, 14), "hut", "#a08a68")
        if R.random() < 0.4:
            put(rect(px + 30, pz, 10, 26, R.uniform(0, math.pi)), R.uniform(14, 26), "tower", "#8c7a5e")

    # ---- crags ----
    # A forty-metre height grid cannot hold a cliff, and the Shield Wall is nothing but cliff: the whole
    # rise happens inside a couple of samples and comes out as a swell. So the face carries rock of its own,
    # built as slabs along the line of it - the same bargain Mordor's ridges make - and the basin floor gets
    # the outcrops and wind-cut stacks that a swept rock plain actually has.
    ncrag = 0
    for k in range(420):
        a = -0.4 + R.random() * 3.0
        rr = WALL_R + R.uniform(-900, 500)
        cx = -2200 + math.cos(a) * rr
        cz = -3400 + math.sin(a) * rr
        if abs(cx) > HX - 400 or abs(cz) > HZ - 400:
            continue
        g = terrain_height(cx, cz)
        if g < BASIN + 160 or g > BASIN + 760:
            continue                                       # the skyline is the heightfield's, not ours
        hh = R.uniform(30, 120)
        put(rect(cx, cz, R.uniform(120, 330), R.uniform(90, 260), R.uniform(0, math.pi)), hh,
            "rock", "#a1916f" if R.random() < 0.6 else "#8d7f63", minh=-hh * 2.2)
        ncrag += 1
    for k in range(120):
        cx = R.uniform(-HX + 900, HX - 900)
        cz = R.uniform(-HZ + 900, HZ - 900)
        if math.hypot(cx, cz) < CITY_R + 300:
            continue
        if abs(cx - FIELD[0]) < 2100 and abs(cz - FIELD[1]) < 1600:
            continue
        if terrain_height(cx, cz) > BASIN + 260:
            continue
        if math.hypot(cx + 1500.0, (cz - 2400.0) * 0.8) > 4600:
            continue                                       # out in the sand there is nothing to stand on
        hh = R.uniform(10, 46)
        put(rect(cx, cz, R.uniform(70, 220), R.uniform(50, 170), R.uniform(0, math.pi)), hh,
            "rock", "#ab9a78", minh=-hh)
        ncrag += 1

    out["buildings"] = buildings

    # ---------- what grows here, which is almost nothing ----------
    trees = []
    for k in range(240):                                # the Residency garden and the plantations only
        if k < 90:
            x = -430 + R.uniform(-140, 140)
            z = -560 + R.uniform(-100, 100)
        else:
            a = 0.10 + R.choice((0, 1, 2, 3)) * 0.30
            cx = math.cos(a * 0.7) * 2600 - 900
            cz = math.sin(a * 0.7) * 2600 - 1300
            x = cx + R.uniform(-620, 620)
            z = cz + R.uniform(-160, 160)
        trees.append({"x": q(x), "z": q(z), "r": q(R.uniform(3, 6))})
    out["trees"] = trees

    out["pois"] = [{"n": "The Residency", "x": q(-430), "z": q(-560), "k": "palace", "ang": 0.2},
                   {"n": "The Landing Field", "x": q(FIELD[0]), "z": q(FIELD[1]), "k": "field", "ang": 0},
                   {"n": "The Shield Wall", "x": q(1800), "z": q(-6400), "k": "wall", "ang": 0}]

    t = out["terrain"]
    lo = min(t["h"]) / 10.0
    hi = max(t["h"]) / 10.0
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f} MB; buildings {len(buildings)} ({total} in the town); "
          f"roads {len(roads)}; terrain {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f} to {hi:.0f} m")


if __name__ == "__main__":
    main()
