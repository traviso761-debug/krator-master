#!/usr/bin/env python3
"""Write data/cities/yachats-land.json: what the Yachats page's coast needs and the engine's map file does not carry.

    data/osm/raw/venv/bin/python tools/pbf-to-overpass.py yachats data/osm/raw/oregon/oregon-latest.osm.pbf
    python3 tools/fetch-terrain.py yachats
    python3 tools/build-osm-city.py yachats          the map: buildings, roads, the ground (sea level is the datum)
    python3 tools/make-yachats.py                     this file

The map is flooded at sea level (seaLevelWater) and the shore comes out of the elevation, so the build script drops
OpenStreetMap's coastline. The surf wants it back, as lines with the land on the left; and the basalt shelves
(natural=bare_rock) and the cliffs, which the build script's land cover leaves out, are what the black rock of the
shore is painted from (src/yachats/coast.js). Coordinates are decimetres east (x) and south (z) of the origin in
yachats.json, as everywhere else. Data (c) OpenStreetMap contributors, ODbL.
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib.geo import q, flat, simplify  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "osm", "raw", "yachats")
CITY = json.load(open(os.path.join(ROOT, "data", "cities", "yachats.json"), encoding="utf-8"))
LAT0, LON0 = CITY["origin"]
M_LAT, M_LON = 111132.0, 111320.0 * math.cos(math.radians(LAT0))
S, W, N, E = CITY["bounds"]


def xz(p):
    return ((p["lon"] - LON0) * M_LON, -(p["lat"] - LAT0) * M_LAT)


def inb(p, m=0.002):
    return S - m <= p["lat"] <= N + m and W - m <= p["lon"] <= E + m


def els(name):
    return json.load(open(os.path.join(RAW, name + "-pbf.json"), encoding="utf-8"))["elements"]


def join(ways):
    """Join polylines end to end where they meet (the coastline comes in pieces of one direction)."""
    chains = [list(w) for w in ways]
    out = []
    while chains:
        c = chains.pop()
        grown = True
        while grown:
            grown = False
            for i, d in enumerate(chains):
                if d[0] == c[-1]:
                    c += d[1:]
                elif d[-1] == c[0]:
                    c = d + c[1:]
                else:
                    continue
                chains.pop(i)
                grown = True
                break
        out.append(c)
    return out


def main():
    coast = [[(round(p["lat"], 7), round(p["lon"], 7)) for p in e["geometry"]] for e in els("water")
             if e["type"] == "way" and e["tags"].get("natural") == "coastline"]
    lines = []
    for c in join(coast):
        pts = [xz({"lat": a, "lon": b}) for a, b in c if inb({"lat": a, "lon": b})]
        if len(pts) >= 2:
            lines.append(flat(simplify(pts, 1.5)))
    rock, cliffs = [], []
    for e in els("land"):
        t = e["tags"]
        if e["type"] != "way" or not any(inb(p) for p in e["geometry"]):
            continue
        pts = [xz(p) for p in e["geometry"]]
        if t.get("natural") == "bare_rock" and len(pts) >= 4:
            rock.append(flat(simplify(pts, 0.8)))
        elif t.get("natural") == "cliff":
            cliffs.append(flat(simplify(pts, 1.0)))
    out = {"_": "tools/make-yachats.py: the coastline (land on the left), the basalt shelves and the cliffs, in decimetres",
           "coast": lines, "rock": rock, "cliffs": cliffs}
    dest = os.path.join(ROOT, "data", "cities", "yachats-land.json")
    with open(dest, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {dest}: {len(lines)} coast lines, {len(rock)} rock shelves, {len(cliffs)} cliffs")


if __name__ == "__main__":
    main()
