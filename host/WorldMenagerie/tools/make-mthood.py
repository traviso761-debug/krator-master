#!/usr/bin/env python3
"""Mount Hood's own data, beside what tools/build-osm-city.py makes of the map (data/cities/mthood-osm.json).

    python3 tools/fetch-terrain.py mthood       the USGS 3DEP ground over the map (10 m), cached
    python3 tools/fetch-osm.py mthood           OpenStreetMap, cached (fetch.extraFiles.mountain: the mountain's features)
    python3 tools/build-osm-city.py mthood      the map: roads, trails, buildings, lakes, the 40 m ground
    python3 tools/make-mthood.py                this: the three files below
    python3 tools/make-mthood.py fine|far|mtn   one of them

Writes
  data/cities/mthood-fine.json   the upper mountain at 12.5 m from the 3DEP survey (src/core/fine.js): the summit
                                 crater, Crater Rock, the Hogsback, the glaciers' headwalls, the canyons, Timberline,
                                 Cloud Cap. Faded into the 40 m grid over its last 400 m
  data/cities/mthood-far.json    the Cascades round it, 400 km across at 1 km, from the AWS terrarium tiles (zoom 9):
                                 Mount Adams, Mount St. Helens, Mount Rainier, Mount Jefferson, the Columbia Gorge
                                 (src/sarajevo/backdrop.js; heights in metres above sea level, the datum)
  data/cities/mthood-mtn.json    the mountain from OpenStreetMap (src/mthood/): the glaciers, the trails and routes
                                 with their names, lengths and climbs (from the 3DEP ground), the ski lifts and runs,
                                 the streams and falls, peaks, viewpoints, huts, camps and trailheads
Map data (c) OpenStreetMap contributors, ODbL. Elevation: USGS 3DEP; AWS Terrain Tiles.
"""
import glob
import io
import json
import math
import os
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from lib.geo import simplify  # noqa: E402

CITY = json.load(open(os.path.join(ROOT, "data", "cities", "mthood.json"), encoding="utf-8"))
RAW = os.path.join(ROOT, "data", "osm", "raw", "mthood")
OUT = {k: os.path.join(ROOT, "data", "cities", f"mthood-{k}.json") for k in ("fine", "far", "mtn")}
LAT0, LON0 = CITY["origin"]
M_LAT, M_LON = 111132.0, 111320.0 * math.cos(math.radians(LAT0))
UA = "WorldMenagerie-massing-model/1.0 (personal LAN project)"


def xz(lat, lon):
    return ((lon - LON0) * M_LON, -(lat - LAT0) * M_LAT)


def ll(x, z):
    return (LAT0 - z / M_LAT, LON0 + x / M_LON)


# ---------- the 3DEP ground ----------
_DEM = None


def dem():
    """elev(x, z) in metres above sea level, bilinear on the 3DEP GeoTIFF (tools/fetch-terrain.py)."""
    global _DEM
    if _DEM:
        return _DEM
    import numpy as np
    from PIL import Image
    im = Image.open(os.path.join(RAW, "terrain", "3dep.tif"))
    tg = im.tag_v2
    W, H = im.size
    sx, sy = tg[33550][0], tg[33550][1]
    w, n = tg[33922][3], tg[33922][4]
    A = np.array(im, dtype=np.float32)

    def elev(x, z):
        lat, lon = ll(x, z)
        px, py = (lon - w) / sx - 0.5, (n - lat) / sy - 0.5
        i, j = int(math.floor(px)), int(math.floor(py))
        fx, fy = px - i, py - j
        i, j = max(0, min(W - 2, i)), max(0, min(H - 2, j))
        a, b, c, d = A[j, i], A[j, i + 1], A[j + 1, i], A[j + 1, i + 1]
        return float((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy)

    def grid(xs, zs):
        """The ground at every (x in xs, z in zs), vectorised: rows by z."""
        X, Z = np.meshgrid(np.asarray(xs, dtype=np.float64), np.asarray(zs, dtype=np.float64))
        lat, lon = LAT0 - Z / M_LAT, LON0 + X / M_LON
        px, py = (lon - w) / sx - 0.5, (n - lat) / sy - 0.5
        i, j = np.clip(np.floor(px).astype(int), 0, W - 2), np.clip(np.floor(py).astype(int), 0, H - 2)
        fx, fy = np.clip(px - i, 0, 1), np.clip(py - j, 0, 1)
        return (A[j, i] * (1 - fx) + A[j, i + 1] * fx) * (1 - fy) + (A[j + 1, i] * (1 - fx) + A[j + 1, i + 1] * fx) * fy

    _DEM = (elev, grid)
    return _DEM


def coarse():
    """The 40 m grid the engine draws (data/cities/mthood-osm.json), as hat(x, z) in metres."""
    T = json.load(open(os.path.join(ROOT, "data", "cities", "mthood-osm.json"), encoding="utf-8"))["terrain"]
    import numpy as np
    Hh = np.array(T["h"], dtype=np.float32).reshape(T["nz"], T["nx"]) / 10 + T["datum"]
    x0, z0, st = T["x0"] / 10, T["z0"] / 10, T["step"]

    def hat(X, Z):
        fx, fz = (X - x0) / st, (Z - z0) / st
        i, j = np.clip(np.floor(fx).astype(int), 0, T["nx"] - 2), np.clip(np.floor(fz).astype(int), 0, T["nz"] - 2)
        tx, tz = np.clip(fx - i, 0, 1), np.clip(fz - j, 0, 1)
        return (Hh[j, i] * (1 - tx) + Hh[j, i + 1] * tx) * (1 - tz) + (Hh[j + 1, i] * (1 - tx) + Hh[j + 1, i + 1] * tx) * tz
    return hat, T


# ---------- the fine ground over the upper mountain ----------
FINE = {"x": (-5600, 5600), "z": (-5200, 6000), "step": 12.5, "edge": 400.0,
        "_": "the summit to Timberline (4.7 km south) and Mount Hood Meadows' upper lifts, Cloud Cap (3.2 km north-east) "
             "and the Sandy and Reid glaciers' headwalls to the west"}


def make_fine():
    import numpy as np
    _, grid = dem()
    hat, T = coarse()
    (xa, xb), (za, zb), st, E = FINE["x"], FINE["z"], FINE["step"], FINE["edge"]
    xs = np.arange(xa, xb + 0.01, st)
    zs = np.arange(za, zb + 0.01, st)
    F = grid(xs, zs)
    X, Z = np.meshgrid(xs, zs)
    C = hat(X, Z)
    e = np.minimum(np.minimum(X - xa, xb - X), np.minimum(Z - za, zb - Z)) / E
    wgt = np.clip(e, 0, 1)
    wgt = wgt * wgt * (3 - 2 * wgt)
    Hm = C + (F - C) * wgt - T["datum"]
    patch = {"n": "Mount Hood", "x0": float(xa), "z0": float(za), "step": st, "nx": len(xs), "nz": len(zs),
             "h": [int(v) for v in np.round(Hm * 2).astype(int).ravel()]}
    json.dump({"_": "Fine ground for src/core/fine.js: heights in half-metres above the datum (sea level), metres east and "
                    "south of the summit; the USGS 3DEP survey at 12.5 m, made by tools/make-mthood.py",
               "fine": [patch]}, open(OUT["fine"], "w", encoding="utf-8", newline="\n"), separators=(",", ":"))
    print(f"fine: {len(xs)}x{len(zs)} at {st} m, {float(Hm.min()):.0f}..{float(Hm.max()):.0f} m -> {OUT['fine']}")


# ---------- the far Cascades ----------
FAR = {"half": 200000, "step": 1000, "zoom": 9}


def make_far():
    from PIL import Image
    tdir = os.path.join(RAW, "far")
    os.makedirs(tdir, exist_ok=True)
    z = FAR["zoom"]
    n = 2 ** z

    def txy(lat, lon):
        la = math.radians(lat)
        return ((lon + 180) / 360 * n * 256, (1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n * 256)
    half, st = FAR["half"], FAR["step"]
    lat_n, lon_w = ll(-half, -half)
    lat_s, lon_e = ll(half, half)
    (x0, y0), (x1, y1) = txy(lat_n, lon_w), txy(lat_s, lon_e)
    tiles = {}
    for ty in range(int(y0 // 256), int(y1 // 256) + 1):
        for tx in range(int(x0 // 256), int(x1 // 256) + 1):
            f = os.path.join(tdir, f"{z}_{tx}_{ty}.png")
            if not os.path.exists(f):
                url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{tx}/{ty}.png"
                data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read()
                open(f, "wb").write(data)
                time.sleep(0.2)
            tiles[(tx, ty)] = Image.open(f).convert("RGB").load()

    def elev(lat, lon):
        px, py = txy(lat, lon)
        px, py = px - 0.5, py - 0.5
        i, j = int(math.floor(px)), int(math.floor(py))
        fx, fy = px - i, py - j
        tot = 0.0
        for dx, dy, wg in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
            X, Y = i + dx, j + dy
            r, g, b = tiles[(X // 256, Y // 256)][X % 256, Y % 256]
            tot += wg * (r * 256 + g + b / 256 - 32768)
        return tot
    N = int(2 * half // st) + 1
    H = []
    for j in range(N):
        for i in range(N):
            # the peak of each cell, not its centre: at a kilometre a sampled cone loses its top (Rainier's 4392 m
            # read 4100); the highest of five samples keeps the volcanoes standing as tall as they are
            x, zz = -half + i * st, -half + j * st
            v = max(elev(*ll(x + dx, zz + dz)) for dx, dz in ((0, 0), (-st / 3, 0), (st / 3, 0), (0, -st / 3), (0, st / 3)))
            H.append(int(round(max(v, 0))))
    json.dump({"_": "the Cascades round Mount Hood, 400 km across at 1 km, metres above sea level (the datum), from the AWS "
                    "terrarium tiles at zoom 9 (SRTM), each point the highest of five samples in its cell: "
                    "src/sarajevo/backdrop.js. Made by tools/make-mthood.py",
               "step": st, "x0": -half, "z0": -half, "n": N, "h": H}, open(OUT["far"], "w", encoding="utf-8", newline="\n"), separators=(",", ":"))
    print(f"far: {N}x{N} at {st} m, {min(H)}..{max(H)} m -> {OUT['far']}")


# ---------- the mountain from OpenStreetMap ----------
# the glaciers' debris-covered tongues: below these heights (metres) the ice is under rubble
DEBRIS = {"Eliot Glacier": 2050, "Coe Glacier": 2100, "Ladd Glacier": 1950, "Langille Glacier": 2050, "Newton Clark Glacier": 2000,
          "White River Glacier": 2150, "Zigzag Glacier": 2050, "Sandy Glacier": 2000, "Reid Glacier": 2100, "Glisan Glacier": 2000}
# waterfalls whose heights OSM does not give (metres): the guidebooks'
FALLS_H = {"Ramona Falls": 37, "Tamanawas Falls": 33, "Umbrella Falls": 18, "Sahalie Falls": 30, "Little Zigzag Falls": 11,
           "Yocum Falls": 45, "Switchback Falls": 30, "Pencil Falls": 12, "Heather Canyon Falls": 15, "Mirror Lake Falls": 6,
           "Pinnacle Falls": 20, "Mitchell Creek Falls": 9, "Stalactite Falls": 25, "Sandy River Falls": 6, "Laurel Falls": 8}
RIVER_W = {"Sandy River": 14, "Zigzag River": 10, "White River": 12, "East Fork Hood River": 14, "Salmon River": 9, "Muddy Fork": 8,
           "Clear Fork": 7, "Still Creek": 6, "Camp Creek": 5, "Polallie Creek": 4, "Newton Creek": 6, "Clark Creek": 5,
           "Eliot Branch": 7, "Compass Creek": 4, "Coe Branch": 6, "Lost Creek": 5, "Lake Branch": 6, "Iron Creek": 4}


def _load(name):
    out, seen = [], set()
    for f in sorted(glob.glob(os.path.join(RAW, name))):
        for e in json.load(open(f, encoding="utf-8"))["elements"]:
            k = (e["type"], e["id"])
            if k not in seen:
                seen.add(k)
                out.append(e)
    return out


def _pts(geom):
    return [xz(g["lat"], g["lon"]) for g in geom if g]


def _flat(pts):
    return [v for x, z in pts for v in (int(round(x * 10)), int(round(z * 10)))]


def _join(lines):
    """Join way pieces end to end into rings or chains (a multipolygon's outer ways)."""
    lines = [list(l) for l in lines if len(l) > 1]
    out = []
    while lines:
        cur = lines.pop(0)
        grown = True
        while grown and cur[0] != cur[-1]:
            grown = False
            for i, l in enumerate(lines):
                if _near(l[0], cur[-1]):
                    cur += l[1:]
                elif _near(l[-1], cur[-1]):
                    cur += l[::-1][1:]
                elif _near(l[-1], cur[0]):
                    cur = l + cur[1:]
                elif _near(l[0], cur[0]):
                    cur = l[::-1] + cur[1:]
                else:
                    continue
                lines.pop(i)
                grown = True
                break
        out.append(cur)
    return out


def _near(a, b):
    return abs(a[0] - b[0]) < 0.5 and abs(a[1] - b[1]) < 0.5


def _areas(els, test):
    """Closed ways and multipolygon relations whose tags pass `test`, as {n, o, i} in decimetres, simplified to 3 m."""
    res = []
    for e in els:
        t = e.get("tags", {})
        if not test(t):
            continue
        if e["type"] == "way" and e.get("geometry"):
            p = _pts(e["geometry"])
            if len(p) > 3 and _near(p[0], p[-1]):
                res.append({"n": t.get("name", ""), "o": _flat(simplify(p, 3.0, closed="distance")), "i": []})
        elif e["type"] == "relation":
            outer = [_pts(m["geometry"]) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") in ("outer", "") and m.get("geometry")]
            inner = [_pts(m["geometry"]) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") == "inner" and m.get("geometry")]
            for r in _join(outer):
                if len(r) > 3:
                    res.append({"n": t.get("name", ""), "o": _flat(simplify(r, 3.0, closed="distance")),
                                "i": [_flat(simplify(q, 3.0, closed="distance")) for q in _join(inner) if len(q) > 3]})
    return res


def _profile(pts, elev):
    """Length, ascent and descent (metres, from the 3DEP ground every 20 m, smoothed over 60 m), the high and low points."""
    xs, L = [], 0.0
    for k in range(len(pts) - 1):
        (ax, az), (bx, bz) = pts[k], pts[k + 1]
        d = math.hypot(bx - ax, bz - az)
        n = max(1, int(d // 20))
        for s in range(n):
            xs.append((ax + (bx - ax) * s / n, az + (bz - az) * s / n))
        L += d
    xs.append(pts[-1])
    hs = [elev(x, z) for x, z in xs]
    sm = [sum(hs[max(0, i - 1):i + 2]) / len(hs[max(0, i - 1):i + 2]) for i in range(len(hs))]
    up = sum(max(0.0, sm[i + 1] - sm[i]) for i in range(len(sm) - 1))
    dn = sum(max(0.0, sm[i] - sm[i + 1]) for i in range(len(sm) - 1))
    return {"len": round(L), "up": round(up), "down": round(dn), "hi": round(max(hs)), "lo": round(min(hs)),
            "prof": [round(h) for h in hs[::max(1, len(hs) // 120)]]}


def make_mtn():
    elev, _ = dem()
    S, W, N, E = CITY["bounds"]
    inb = lambda lat, lon: S <= lat <= N and W <= lon <= E
    mt = _load("mountain-extra.json")
    land = _load("land-extra.json") + _load("land-0-0.json")
    roads = _load("roads-extra.json") + _load("roads-*-*.json")
    out = {"_": "Mount Hood from OpenStreetMap (c) OpenStreetMap contributors, ODbL, with lengths and heights from the USGS 3DEP "
                "ground: made by tools/make-mthood.py, read by src/mthood/. Coordinates are decimetres east and south of the summit."}
    # the glaciers, the meadows, the rock
    gl = _areas(mt + land, lambda t: t.get("natural") == "glacier")
    seen, glaciers = set(), []
    for g in gl:
        k = (g["n"], g["o"][0], g["o"][1])
        if k not in seen:
            seen.add(k)
            glaciers.append(g)
    out["glaciers"] = glaciers
    out["debris"] = [dict(g, db=DEBRIS[g["n"]]) for g in glaciers if g["n"] in DEBRIS]
    out["meadows"] = _areas(land, lambda t: t.get("landuse") == "meadow" or t.get("natural") in ("grassland", "heath", "wetland"))
    out["rock"] = _areas(land, lambda t: t.get("natural") in ("bare_rock", "scree", "shingle"))
    print(f"mtn: {len(glaciers)} glaciers ({', '.join(sorted({g['n'] for g in glaciers if g['n']}))}), "
          f"{len(out['meadows'])} meadows, {len(out['rock'])} rock")
    # the streams and the falls
    streams = []
    for e in mt:
        t = e.get("tags", {})
        if e["type"] == "way" and t.get("waterway") in ("stream", "river") and e.get("geometry"):
            p = simplify(_pts(e["geometry"]), 2.0, closed="distance")
            if len(p) > 1:
                w = RIVER_W.get(t.get("name", ""), 9 if t["waterway"] == "river" else 2.5)
                streams.append({"n": t.get("name", ""), "k": t["waterway"], "w": w, "p": _flat(p), "int": t.get("intermittent") == "yes"})
    out["streams"] = streams
    falls = []
    for e in mt:
        t = e.get("tags", {})
        if e["type"] == "node" and (t.get("waterway") == "waterfall" or t.get("natural") == "waterfall") and inb(e["lat"], e["lon"]):
            x, z = xz(e["lat"], e["lon"])
            h = t.get("height")
            try:
                h = float(str(h).replace("m", "").strip()) if h else None
            except ValueError:
                h = None
            nm = t.get("name", "")
            falls.append({"n": nm, "at": [round(x, 1), round(z, 1)], "h": h or FALLS_H.get(nm, 8), "ele": round(elev(x, z))})
    out["falls"] = falls
    # the lifts: their lines, their towers (pylon nodes on the way), their kind and capacity
    lifts = []
    for e in mt:
        t = e.get("tags", {})
        if e["type"] == "way" and t.get("aerialway") and t["aerialway"] not in ("pylon", "station", "goods") and e.get("geometry"):
            p = _pts(e["geometry"])
            lo, hi = elev(*p[0]), elev(*p[-1])
            if lo > hi:   # bottom to top
                p = p[::-1]
                lo, hi = hi, lo
            lifts.append({"n": t.get("name", ""), "k": t["aerialway"], "occ": int(t.get("aerialway:occupancy", "0") or 0) if str(t.get("aerialway:occupancy", "0")).isdigit() else 0,
                          "p": _flat(p), "len": round(sum(math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]) for i in range(len(p) - 1))),
                          "lo": round(lo), "hi": round(hi), "op": t.get("operator", "")})
    out["lifts"] = lifts
    # the ski runs: lines and areas, by difficulty
    pistes = []
    for e in mt:
        t = e.get("tags", {})
        if not t.get("piste:type") or e["type"] == "node":
            continue
        d = t.get("piste:difficulty", "")
        nm = t.get("piste:name") or t.get("name", "")
        if e["type"] == "way" and e.get("geometry"):
            p = _pts(e["geometry"])
            if t.get("area") == "yes" or (len(p) > 3 and _near(p[0], p[-1]) and t["piste:type"] == "downhill"):
                pistes.append({"n": nm, "k": t["piste:type"], "d": d, "area": True, "o": _flat(simplify(p, 3.0, closed="distance")), "i": []})
            else:
                if elev(*p[0]) < elev(*p[-1]) and t["piste:type"] == "downhill":
                    p = p[::-1]   # top to bottom
                pistes.append({"n": nm, "k": t["piste:type"], "d": d, "p": _flat(simplify(p, 2.0, closed="distance")), "g": t.get("piste:grooming", "")})
    out["pistes"] = pistes
    # the trails: every path, track and footway, joined by name (OSM cuts a trail into many ways), with its profile
    byname, loose = {}, []
    for e in roads:
        t = e.get("tags", {})
        if e["type"] != "way" or t.get("highway") not in ("path", "footway", "track", "bridleway", "steps") or not e.get("geometry"):
            continue
        p = _pts(e["geometry"])
        if len(p) < 2:
            continue
        nm = t.get("name", "")
        if nm:
            byname.setdefault(nm, {"n": nm, "ref": t.get("ref", ""), "k": t["highway"], "sac": t.get("sac_scale", ""), "segs": []})["segs"].append(p)
        elif t["highway"] != "track":
            loose.append(p)
    trails = []
    for nm, tr in byname.items():
        chains = _join(tr["segs"])
        chains = [simplify(c, 2.0, closed="distance") for c in chains]
        allp = [q for c in chains for q in c]
        pr = {"len": 0, "up": 0, "down": 0, "hi": -1e9, "lo": 1e9, "prof": []}
        for c in chains:
            q = _profile(c, elev)
            pr["len"] += q["len"]
            pr["up"] += q["up"]
            pr["down"] += q["down"]
            pr["hi"] = max(pr["hi"], q["hi"])
            pr["lo"] = min(pr["lo"], q["lo"])
        pr["prof"] = _profile(max(chains, key=len), elev)["prof"]
        if pr["len"] < 60:
            continue
        trails.append({"n": nm, "ref": tr["ref"], "k": tr["k"], "sac": tr["sac"], "c": [_flat(c) for c in chains], **pr})
    trails.sort(key=lambda t: -t["len"])
    out["trails"] = trails
    out["paths"] = [_flat(simplify(p, 2.0, closed="distance")) for p in loose]
    # the long routes: the Timberline Trail round the mountain, the Pacific Crest Trail, the climbing routes
    routes = []
    for e in mt:
        t = e.get("tags", {})
        if e["type"] != "relation" or t.get("route") not in ("hiking", "foot", "ski", "piste"):
            continue
        segs = [_pts(m["geometry"]) for m in e.get("members", []) if m.get("type") == "way" and m.get("geometry")]
        segs = [[q for q in s if inb(*ll(*q))] for s in segs]
        segs = [s for s in segs if len(s) > 1]
        if not segs:
            continue
        chains = [simplify(c, 2.0, closed="distance") for c in _join(segs)]
        pr = {"len": 0, "up": 0, "down": 0, "hi": -1e9, "lo": 1e9}
        for c in chains:
            q = _profile(c, elev)
            for k in ("len", "up", "down"):
                pr[k] += q[k]
            pr["hi"], pr["lo"] = max(pr["hi"], q["hi"]), min(pr["lo"], q["lo"])
        routes.append({"n": t.get("name", ""), "ref": t.get("ref", ""), "k": t["route"], "net": t.get("network", ""),
                       "c": [_flat(c) for c in chains], "prof": _profile(max(chains, key=len), elev)["prof"], **pr})
    out["routes"] = routes
    # the named places: peaks, viewpoints, huts, shelters, camps, trailheads, falls, historic sites
    pois, seen = [], set()
    KEYS = (("natural", ("peak", "volcano", "saddle", "spring", "cave_entrance", "rock", "stone", "cliff", "arete", "ridge", "valley", "couloir", "fumarole")),
            ("tourism", ("viewpoint", "camp_site", "alpine_hut", "wilderness_hut", "information", "attraction", "hotel")),
            ("amenity", ("shelter", "ranger_station")), ("highway", ("trailhead",)), ("historic", None), ("geological", None), ("landuse", ("winter_sports",)))
    for e in mt + land:
        t = e.get("tags", {})
        kind = None
        for k, vals in KEYS:
            if k in t and (vals is None or t[k] in vals):
                kind = t[k] if k != "historic" else "historic:" + t[k]
                break
        if not kind:
            continue
        if e["type"] == "node":
            lat, lon = e["lat"], e["lon"]
        elif e.get("geometry"):
            g = [q for q in e["geometry"] if q]
            lat, lon = sum(q["lat"] for q in g) / len(g), sum(q["lon"] for q in g) / len(g)
        elif e.get("bounds"):
            b = e["bounds"]
            lat, lon = (b["minlat"] + b["maxlat"]) / 2, (b["minlon"] + b["maxlon"]) / 2
        else:
            continue
        if not inb(lat, lon):
            continue
        nm = t.get("name", "")
        if (nm, kind) in seen and nm:
            continue
        seen.add((nm, kind))
        x, z = xz(lat, lon)
        rec = {"n": nm, "k": kind, "at": [round(x, 1), round(z, 1)], "ele": round(elev(x, z))}
        for k in ("ele", "description", "wikipedia", "operator", "inscription", "start_date"):
            if k in t:
                rec["t_" + k] = t[k]
        if kind in ("cliff", "arete", "ridge", "valley", "couloir") and e["type"] == "way" and e.get("geometry"):
            rec["p"] = _flat(simplify(_pts(e["geometry"]), 5.0, closed="distance"))
        pois.append(rec)
    out["pois"] = pois
    json.dump(out, open(OUT["mtn"], "w", encoding="utf-8", newline="\n"), ensure_ascii=False, separators=(",", ":"))
    print(f"mtn: {len(streams)} streams, {len(falls)} falls ({', '.join(f['n'] for f in falls if f['n'])}), {len(lifts)} lifts, "
          f"{len(pistes)} runs, {len(trails)} named trails, {len(out['paths'])} other paths, {len(routes)} routes "
          f"({', '.join(r['n'] for r in routes)}), {len(pois)} places; {os.path.getsize(OUT['mtn']) / 1e6:.1f} MB -> {OUT['mtn']}")


if __name__ == "__main__":
    what = [a for a in sys.argv[1:] if not a.startswith("--")] or ["fine", "far", "mtn"]
    for w in what:
        {"fine": make_fine, "far": make_far, "mtn": lambda: make_mtn()}[w]()
