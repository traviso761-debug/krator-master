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


def patch(pt):
    """A 1 m lidar patch (tools/fetch-terrain.py terrain.patches) as heights in decimetres on a 1 m grid in the map's
    x, z, with its water sunk and its slot traced. The survey reads the water in a slot as its surface (0 to 1 m), so
    the cells under `wet` metres that reach the patch's edge through other wet cells are the sea: they are cut under the
    water level, deeper away from the rock (so the page's sea shows in the slot). The slot is the wet cells' longest way
    in from the edge, ending within `r` of `slot.near` (the Churn's head, the Spouting Horn): followed back from its
    head to the open water, with the slot's width at each point, as [x, z, width] decimetres, head first."""
    import numpy as np
    from collections import deque
    from PIL import Image
    from scipy import ndimage
    f = os.path.join(RAW, "terrain", "patch-" + pt["name"] + ".tif")
    if not os.path.exists(f):
        print(f"patch {pt['name']}: no {f} (run tools/fetch-terrain.py yachats)")
        return None
    im = Image.open(f)
    A = np.array(im, dtype=np.float64)
    tg = im.tag_v2
    sx, sy = tg[33550][0], tg[33550][1]
    w0, n0 = tg[33922][3], tg[33922][4]
    H0, W0 = A.shape
    # the grid: whole metres of the map inside the patch
    xa, za = xz({"lat": n0, "lon": w0})
    xb, zb = xz({"lat": n0 - sy * H0, "lon": w0 + sx * W0})
    gx = np.arange(math.ceil(xa) + 1, math.floor(xb) - 1)
    gz = np.arange(math.ceil(za) + 1, math.floor(zb) - 1)
    X, Z = np.meshgrid(gx, gz)
    lat, lon = LAT0 - Z / M_LAT, LON0 + X / M_LON
    px, py = (lon - w0) / sx - 0.5, (n0 - lat) / sy - 0.5
    h = ndimage.map_coordinates(A, [py, px], order=1, mode="nearest")
    h[(h < -100) | ~np.isfinite(h)] = 0.0
    wet_m = pt.get("wet", 0.9)
    wet = h < wet_m
    lab, n = ndimage.label(wet)
    edge = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    sea = np.isin(lab, [k for k in edge if k])
    d = ndimage.distance_transform_edt(sea)   # metres from the rock
    h = np.where(sea, np.minimum(h, np.maximum(-3.0, 0.3 - 0.6 * d)), h)
    # the slot: the longest way in from the patch's edge through the low cells (under `slotWet` metres: the swell in a
    # slot reads a metre or two over the sea), ending near `slot.near`; its corridor is sunk like the sea
    low = h < pt.get("slotWet", 2.0)
    lab2, _ = ndimage.label(low)
    edge2 = set(lab2[0, :]) | set(lab2[-1, :]) | set(lab2[:, 0]) | set(lab2[:, -1])
    low = np.isin(lab2, [k for k in edge2 if k])
    dlow = ndimage.distance_transform_edt(h < pt.get("wall", 4.0))   # metres to the walls (rock over `wall` metres)
    nz_, nx_ = h.shape
    dist = np.full(h.shape, -1, dtype=np.int32)
    par = {}
    q = deque()
    for j in range(nz_):
        for i in range(nx_):
            if low[j, i] and (j in (0, nz_ - 1) or i in (0, nx_ - 1)):
                dist[j, i] = 0
                q.append((j, i))
    while q:
        j, i = q.popleft()
        for dj, di in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = j + dj, i + di
            if 0 <= a < nz_ and 0 <= b < nx_ and low[a, b] and dist[a, b] < 0:
                dist[a, b] = dist[j, i] + 1
                par[(a, b)] = (j, i)
                q.append((a, b))
    slot = []
    sl = pt.get("slot")
    if sl:
        nxz = xz({"lat": sl["near"][0], "lon": sl["near"][1]})
        near = ((X - nxz[0]) ** 2 + (Z - nxz[1]) ** 2) < sl.get("r", 50) ** 2
        cand = np.where(near & low, dist, -1)
        j, i = np.unravel_index(int(np.argmax(cand)), cand.shape)
        path = [(j, i)]
        while (j, i) in par and len(path) < pt.get("slotMax", 400):
            j, i = par[(j, i)]
            path.append((j, i))
        corridor = np.zeros(h.shape, dtype=bool)
        for j, i in path:
            r_ = int(math.ceil(dlow[j, i])) + 1
            corridor[max(0, j - r_):j + r_ + 1, max(0, i - r_):i + r_ + 1] = True
        corridor &= h < pt.get("wall", 4.0)
        dc = ndimage.distance_transform_edt(corridor)
        h = np.where(corridor, np.minimum(h, np.maximum(-3.0, 0.3 - 0.8 * dc)), h)
        pts = [(float(gx[i]), float(gz[j])) for j, i in path]
        keep = simplify(pts, 1.5)
        for x, z in keep:
            i, j = int(round(x - gx[0])), int(round(z - gz[0]))
            slot += [q_(x), q_(z), q_(2 * dlow[j, i])]
    return {"name": pt["name"], "x0": q_(gx[0]), "z0": q_(gz[0]), "step": 10, "nx": int(nx_), "nz": int(nz_),
            "h": [int(round(v * 10)) for v in h.ravel()], "slot": slot}


def q_(v):
    return int(round(float(v) * 10))


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
    patches = [patch(pt) for pt in CITY.get("terrain", {}).get("patches", [])]
    patches = [q for q in patches if q]
    out = {"_": "tools/make-yachats.py: the coastline (land on the left looking north-up: with z south, the sea is on the left), the basalt shelves and the cliffs, in decimetres",
           "coast": lines, "rock": rock, "cliffs": cliffs, "patches": patches}
    dest = os.path.join(ROOT, "data", "cities", "yachats-land.json")
    with open(dest, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {dest}: {len(lines)} coast lines, {len(rock)} rock shelves, {len(cliffs)} cliffs, "
          f"{len(patches)} lidar patches ({', '.join(q['name'] + ': slot ' + str(len(q['slot']) // 3) + ' points' for q in patches)})")


if __name__ == "__main__":
    main()
