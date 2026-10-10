#!/usr/bin/env python3
"""Turn the raw OpenStreetMap downloads (data/osm/raw/<city>/) into data/cities/<city>-osm.json for the city's page.

    python3 tools/build-osm-city.py chicago           build
    python3 tools/build-osm-city.py portland --report  also list where each landmark in the config sits in OSM

Coordinates are decimetres east (x) and south (z) of the origin in chicago.json, as integers.
Every building in the detail zones is kept; elsewhere only tall or large ones.
Data © OpenStreetMap contributors, ODbL.
"""
import glob
import json
import math
import os
import re
import sys
from lib.geo import q, flat, simplify as _simplify


def simplify(pts, eps):
    return _simplify(pts, eps, closed="drop")   # this map was made with rings simplified to their ends

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
if not _ARGS:
    raise SystemExit("usage: build-osm-city.py <city> [--report]")
CITY_ID = _ARGS[0]
RAW = os.path.join(ROOT, "data", "osm", "raw", CITY_ID)
CITY = json.load(open(os.path.join(ROOT, "data", "cities", CITY_ID + ".json")))
OUT = os.path.join(ROOT, "data", "cities", CITY_ID + "-osm.json")
FETCH = CITY.get("fetch", {})
LAT0, LON0 = CITY["origin"]
M_LAT, M_LON = 111132.0, 111320.0 * math.cos(math.radians(LAT0))
S, W, N, E = CITY["bounds"]


def xz(lat, lon):
    return ((lon - LON0) * M_LON, -(lat - LAT0) * M_LAT)


def load(prefix):
    els, seen = [], set()
    for f in sorted(glob.glob(os.path.join(RAW, prefix + "-*.json"))):
        for e in json.load(open(f))["elements"]:
            k = (e["type"], e["id"])
            if k not in seen:
                seen.add(k)
                els.append(e)
    return els


# ---------- geometry ----------
def way_pts(e):
    return [xz(p["lat"], p["lon"]) for p in e.get("geometry", []) if p]


def area(r):
    return 0.5 * sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))


def centroid(r):
    return (sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r))


def ring_simplify(r, eps):
    if len(r) > 3 and r[0] == r[-1]:
        r = r[:-1]
    if len(r) < 3:
        return r
    s = simplify(r + [r[0]], eps)[:-1]
    return s if len(s) >= 3 else r


def join_rings(ways):
    """Join way polylines that share end points into closed rings (for multipolygons and coastlines)."""
    chains = [list(w) for w in ways if len(w) >= 2]
    rings, done = [], True
    while chains:
        c = chains.pop()
        changed = True
        while changed and c[0] != c[-1]:
            changed = False
            for i, d in enumerate(chains):
                if d[0] == c[-1]:
                    c += d[1:]
                elif d[-1] == c[-1]:
                    c += d[::-1][1:]
                elif d[-1] == c[0]:
                    c = d[:-1] + c
                elif d[0] == c[0]:
                    c = d[::-1][:-1] + c
                else:
                    continue
                chains.pop(i)
                changed = True
                break
        rings.append(c)
    return rings


def polys_of(e):
    """Outer and inner rings (metres) of a closed way or a multipolygon relation."""
    if e["type"] == "way":
        pts = way_pts(e)
        if len(pts) >= 4 and pts[0] == pts[-1]:
            return [(pts, [])]
        return []
    if e["type"] == "relation":
        outers = [way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") in ("outer", "")]
        inners = [way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") == "inner"]
        o = [r for r in join_rings(outers) if len(r) >= 4 and r[0] == r[-1]]
        i = [r for r in join_rings(inners) if len(r) >= 4 and r[0] == r[-1]]
        res = []
        for r in o:
            holes = [h for h in i if inside(centroid(h), r)]
            res.append((r, holes))
        return res
    return []


def inside(p, r):
    x, z = p
    c = False
    j = len(r) - 1
    for i in range(len(r)):
        xi, zi = r[i]
        xj, zj = r[j]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / ((zj - zi) or 1e-12) + xi:
            c = not c
        j = i
    return c


BX0, BZ0 = xz(N, W)
BX1, BZ1 = xz(S, E)


def in_bounds(p, pad=0):
    return BX0 - pad <= p[0] <= BX1 + pad and BZ0 - pad <= p[1] <= BZ1 + pad


# ---------- detail zones: everything is kept here ----------
def zone_rect(s, w, n, e):
    x0, z0 = xz(n, w)
    x1, z1 = xz(s, e)
    return lambda p: x0 <= p[0] <= x1 and z0 <= p[1] <= z1


ZONES = [zone_rect(*z) for z in FETCH.get("detailZones", [])]   # [south, west, north, east] boxes from the city's config


def detailed(p):
    return any(z(p) for z in ZONES)


# ---------- heights ----------
def num(v):
    if v is None:
        return None
    m = re.match(r"\s*(-?[\d.]+)\s*(m|ft|')?", str(v))
    if not m:
        return None
    try:
        x = float(m.group(1))
    except ValueError:
        return None
    return x * 0.3048 if m.group(2) in ("ft", "'") else x


DEFAULT_H = {"house": 8, "detached": 8, "residential": 11, "apartments": 13, "garage": 3.2, "garages": 3.2, "shed": 2.8, "roof": 5,
             "commercial": 10, "retail": 7, "industrial": 9, "warehouse": 9, "church": 16, "school": 12, "office": 24, "hotel": 30,
             "hospital": 25, "university": 18, "parking": 12, "stadium": 25, "train_station": 12, "yes": 9}


# A city whose untagged buildings are not suburban can say so: "defaultHeights" in its config overrides DEFAULT_H by
# type, and "heightSpread" (a fraction) varies those defaults building by building, the same way every build, so a
# block of untagged palazzi is not one flat slab. Only the defaults move: a height or a level count in the map wins.
CITY_H = {**DEFAULT_H, **{k: v for k, v in CITY.get("defaultHeights", {}).items() if k != "_"}}
SPREAD = float(CITY.get("heightSpread", 0))
ROAD_W = {k: v for k, v in CITY.get("roadWidths", {}).items() if k != "_"}   # a width by name, for a street the tags get wrong
COURTYARDS = float(CITY.get("courtyards", 0))   # keep a building's inner rings (its courtyards) of at least this many m²; 0 drops them
# ruins take their own default: anything tagged as ruins or an archaeological site, and - since excavations are
# often mapped as plain buildings - anything untagged inside a "ruinZones" box ([lat S, lon W, lat N, lon E])
RUIN_BOXES = [(*xz(b[0], b[1]), *xz(b[2], b[3])) for b in CITY.get("ruinZones", [])]
def in_ruins(c):
    return any(min(x0, x1) <= c[0] <= max(x0, x1) and min(z0, z1) <= c[1] <= max(z0, z1) for x0, z0, x1, z1 in RUIN_BOXES)


def height_of(t, c=None):
    h = num(t.get("height"))
    lv = num(t.get("building:levels"))
    if h is None and lv is not None:
        h = lv * 3.4 + (1 if lv > 2 else 0.5)
    typ = t.get("building") if t.get("building") not in (None, "yes") else t.get("building:part")
    if h is None:
        ruin = "ruins" in CITY_H and (t.get("historic") in ("ruins", "archaeological_site") or t.get("ruins") == "yes"
                                      or typ == "ruins" or (typ in (None, "yes") and c is not None and in_ruins(c)))
        h = CITY_H["ruins"] if ruin else CITY_H.get(typ or "yes", CITY_H["yes"])
        if SPREAD and c is not None:
            k = math.sin(c[0] * 12.9898 + c[1] * 78.233) * 43758.5453
            h *= 1 + SPREAD * (2 * (k - math.floor(k)) - 1)
    mh = num(t.get("min_height"))
    ml = num(t.get("building:min_level"))
    if mh is None and ml is not None:
        mh = ml * 3.4
    return max(2.5, h), max(0.0, mh or 0.0)


# ---------- elevation ----------
def terrain_grid():
    """Sample the cached terrain tiles into a height grid over the map, with the water level as zero."""
    cfg = CITY.get("terrain")
    tdir = os.path.join(RAW, "terrain")
    if not cfg or not os.path.isdir(tdir):
        return None
    try:
        from PIL import Image
    except ImportError:
        print("terrain: Pillow not installed, skipping")
        return None
    z = cfg.get("zoom", 14)
    tiles = {}
    for f in glob.glob(os.path.join(tdir, f"{z}_*.png")):
        _, x, y = os.path.basename(f)[:-4].split("_")
        tiles[(int(x), int(y))] = Image.open(f).convert("RGB").load()
    if not tiles:
        return None
    n = 2 ** z * 256

    def elev(lat, lon):   # bilinear over the terrarium pixels: height = R*256 + G + B/256 - 32768
        la = math.radians(max(-85.0, min(85.0, lat)))
        px = (lon + 180) / 360 * n - 0.5
        py = (1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n - 0.5
        x0, y0 = int(math.floor(px)), int(math.floor(py))
        fx, fy = px - x0, py - y0
        tot = 0.0
        for dx, dy, wgt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
            X, Y = x0 + dx, y0 + dy
            t = tiles.get((X // 256, Y // 256))
            if t is None:
                continue
            r, g, b = t[X % 256, Y % 256]
            tot += wgt * (r * 256 + g + b / 256 - 32768)
        return tot

    step = cfg.get("step", 20)
    nx, nz = int(BX1 - BX0) // step + 2, int(BZ1 - BZ0) // step + 2
    hs = []
    for j in range(nz):
        zz = BZ0 + j * step
        for i in range(nx):
            xx = BX0 + i * step
            hs.append(elev(LAT0 - zz / M_LAT, LON0 + xx / M_LON))
    # terrain.filter (metres): where the elevation carries the city's surface (Tokyo's: towers as spikes, pits of
    # metres on flat ground, and every street laid over them dips), a grey opening takes out what is raised and
    # narrower than `open`, a closing fills pits narrower than `close`, and a box blur over `blur` smooths the rest
    water = sorted(hs)[len(hs) // 20]   # the 5th percentile: river or lake level (taken before any filtering)
    flt = cfg.get("filter")
    if flt:
        import numpy as np
        from scipy import ndimage
        A = np.array(hs, dtype=np.float32).reshape(nz, nx)
        cells = lambda m: max(1, int(round(m / step)) | 1)
        A = ndimage.grey_opening(A, size=cells(flt.get("open", 150)))
        A = ndimage.grey_closing(A, size=cells(flt.get("close", 60)))
        A = ndimage.uniform_filter(A, size=cells(flt.get("blur", 48)), mode="nearest")
        hs = [float(v) for v in A.ravel()]
    # A tidal city's tiles carry the harbour's bathymetry, which is metres of depth nobody will ever see through
    # the water plane, and the odd bad sample a long way below that. The bed is clamped just under the surface.
    floor = -6.0 if CITY.get("seaLevelWater") else -400.0
    res = {"step": step, "nx": nx, "nz": nz, "x0": q(BX0), "z0": q(BZ0), "datum": round(water, 1),
            "h": [int(round(max(h - water, floor) * 10)) for h in hs],
            "_": "heights in decimetres above the water level (datum, metres above sea level)"}
    if flt:
        res["filtered"] = {k: v for k, v in flt.items() if k != "_"}
    return res


def main():
    report = "--report" in sys.argv
    out = {"attribution": "Map data © OpenStreetMap contributors (ODbL)", "units": "decimetres east (x) and south (z) of origin",
           "origin": CITY["origin"], "bounds": CITY["bounds"]}

    # ---- the lake: join the coastline, keep what is in the box, close it round the east
    water = load("water")
    coast = [way_pts(e) for e in water if e["type"] == "way" and e.get("tags", {}).get("natural") == "coastline"]
    # in OSM the Great Lakes are water areas: take the Lake Michigan relation's outer ways that reach the map
    for e in water:
        t = e.get("tags", {})
        if e["type"] == "relation" and FETCH.get("lakeRelation") and t.get("name") == FETCH["lakeRelation"]:
            coast += [pts for pts in (way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") in ("outer", "")) if pts and any(in_bounds(p, 3000) for p in pts)]
    chains = join_rings(coast)
    islands = [c for c in chains if c[0] == c[-1] and abs(area(c)) < 4e6]
    open_chains = sorted([c for c in chains if c[0] != c[-1] or abs(area(c)) >= 4e6], key=lambda c: -len(c))
    lake = None
    if open_chains:
        c = [p for p in open_chains[0] if in_bounds(p, 1500)]
        if c and c[0][1] > c[-1][1]:   # make it run north (smaller z) to south
            c = c[::-1]
        c = simplify(c, 1.0)
        far = BX1 + 2500
        lake = [(c[0][0], BZ0 - 2500)] + c + [(c[-1][0], BZ1 + 2500), (far, BZ1 + 2500), (far, BZ0 - 2500)]
    # A city whose water is tidal (New York) has its shores mapped as coastline, not as water areas, and its land
    # masses are cut by the map box so they never close into rings. Rather than clip and stitch them, such a city
    # floods the whole box at sea level and lets the elevation grid decide what is land: the engine draws water at
    # y = 0 and the terrain stands above it, so the shoreline comes out of the DEM at its own resolution.
    if CITY.get("seaLevelWater"):
        lake = None
        out["seaLevelWater"] = True
    out["lake"] = flat(lake or [])
    out["islands"] = [flat(ring_simplify(r, 1.0)) for r in islands if any(in_bounds(p) for p in r)]

    # ---- inland water (the river, harbour basins, lagoons), marinas, beaches, breakwaters and piers
    polys = {"water": [], "marina": [], "beach": [], "pier": []}
    if CITY.get("seaLevelWater"):
        m = 400
        polys["water"].append({"o": [(BX0 - m, BZ0 - m), (BX1 + m, BZ0 - m), (BX1 + m, BZ1 + m), (BX0 - m, BZ1 + m)],
                               "i": [], "n": "Sea level"})
    for e in water:
        t = e.get("tags", {})
        kind = ("marina" if t.get("leisure") == "marina" else "beach" if t.get("natural") == "beach" else
                "pier" if t.get("man_made") in ("breakwater", "pier", "groyne") else
                "water" if t.get("natural") == "water" or t.get("waterway") == "riverbank" else None)
        if not kind or (FETCH.get("lakeRelation") and t.get("name") == FETCH["lakeRelation"]):
            continue
        if kind == "pier" and e["type"] == "way":
            pts = way_pts(e)
            if pts and pts[0] != pts[-1]:
                polys["pier"].append({"line": flat(simplify(pts, 0.5)), "w": 6, "n": t.get("name", "")})
                continue
        for o, holes in polys_of(e):
            if not any(in_bounds(p) for p in o) or abs(area(o)) < 150:
                continue
            polys[kind].append({"o": flat(ring_simplify(o, 0.7)), "i": [flat(ring_simplify(h, 0.7)) for h in holes], "n": t.get("name", "")})
    out.update(polys)

    ww = [e for e in load("waterways")] if glob.glob(os.path.join(RAW, "waterways-*.json")) else []
    out["waterways"] = [{"n": e.get("tags", {}).get("name", ""), "p": flat(simplify(way_pts(e), 2.0))} for e in ww if e["type"] == "way" and any(in_bounds(p) for p in way_pts(e))]

    # ---- land cover: parks, gardens, pitches, plazas, the zoo, stadiums; named attractions as points
    land = load("land")
    KIND = [("leisure", "stadium", "stadium"), ("leisure", "pitch", "pitch"), ("leisure", "garden", "garden"), ("leisure", "playground", "play"),
            ("leisure", "golf_course", "golf"), ("leisure", "nature_reserve", "reserve"), ("leisure", "track", "track"), ("leisure", "dog_park", "grass"),
            ("leisure", "ice_rink", "plaza"), ("tourism", "zoo", "zoo"), ("landuse", "cemetery", "cemetery"), ("landuse", "railway", "railyard"),
            ("natural", "wood", "wood"), ("landuse", "forest", "wood"), ("natural", "scrub", "scrub" if CITY.get("scrub") == "low" else "wood"), ("natural", "sand", "sand"), ("natural", "grassland", "grass"),
            ("landuse", "grass", "grass"), ("landuse", "recreation_ground", "grass"), ("place", "square", "plaza"), ("highway", "pedestrian", "plaza"),
            ("leisure", "park", "park")]
    # a city may map land the list above leaves out ("extraKinds": [[key, value, kind], ...]): Antigua's coffee
    # fincas are landuse=orchard, and without this they are dropped
    KIND += [tuple(k) for k in CITY.get("extraKinds", [])]
    areas, pois = [], []
    for e in land:
        t = e.get("tags", {})
        kind = next((k for key, val, k in KIND if t.get(key) == val), None)
        name = t.get("name", "")
        if t.get("tourism") in ("attraction", "artwork", "museum") or t.get("amenity") == "fountain":
            if e["type"] == "node":
                p = xz(e["lat"], e["lon"])
            else:
                g = [pt for m in ([e] if e["type"] == "way" else e.get("members", [])) for pt in way_pts(m)]
                p = centroid(g) if g else None
            if p and in_bounds(p) and name:
                rec = {"n": name, "x": q(p[0]), "z": q(p[1]), "k": t.get("tourism") or t.get("amenity")}
                if e["type"] != "node" and len(g) >= 3:   # the long axis of a mapped outline (Cloud Gate's length runs along it)
                    cx, cz = p
                    sxx = sum((u - cx) ** 2 for u, _ in g); szz = sum((v - cz) ** 2 for _, v in g); sxz = sum((u - cx) * (v - cz) for u, v in g)
                    rec["ang"] = round(0.5 * math.atan2(2 * sxz, sxx - szz), 3)
                pois.append(rec)
        if not kind:
            continue
        for o, holes in polys_of(e):
            if not any(in_bounds(pt) for pt in o) or abs(area(o)) < 60:
                continue
            areas.append({"k": kind, "n": name, "o": flat(ring_simplify(o, 0.6)), "i": [flat(ring_simplify(h, 0.6)) for h in holes], "a": int(abs(area(o)))})
    # land use underneath everything else: yards, shops, industry, parking, campuses
    LU = {"residential": "residential", "commercial": "commercial", "retail": "commercial", "industrial": "industrial", "construction": "construction",
          "brownfield": "construction", "garages": "parking", "religious": "campus", "education": "campus"}
    trees = []
    lu_els = load("landuse") if glob.glob(os.path.join(RAW, "landuse-*.json")) else []
    for e in lu_els:
        t = e.get("tags", {})
        if e["type"] == "node":
            if t.get("natural") == "tree":
                p = xz(e["lat"], e["lon"])
                if in_bounds(p):
                    trees += [q(p[0]), q(p[1])]
            continue
        kind = "parking" if t.get("amenity") == "parking" else "campus" if t.get("amenity") in ("school", "hospital", "university", "college") else LU.get(t.get("landuse"))
        if not kind or t.get("parking") in ("underground", "multi-storey", "rooftop"):
            continue
        for o, holes in polys_of(e):
            if not any(in_bounds(pt) for pt in o) or abs(area(o)) < 80:
                continue
            areas.append({"k": kind, "n": t.get("name", ""), "o": flat(ring_simplify(o, 0.8)), "i": [flat(ring_simplify(h, 0.8)) for h in holes], "a": int(abs(area(o)))})
    out["trees"] = trees
    order = {"residential": -3, "commercial": -3, "industrial": -3, "construction": -2, "campus": -2, "parking": -1, "park": 0, "golf": 1, "cemetery": 1, "railyard": 1, "reserve": 2, "wood": 3, "grass": 4, "zoo": 4, "garden": 5, "sand": 5, "plaza": 6, "pitch": 7, "track": 7, "play": 8, "stadium": 9}
    areas.sort(key=lambda a: (order.get(a["k"], 5), -a["a"]))   # big parks first, details painted over them
    for a in areas:
        del a["a"]
    out["areas"] = areas
    out["pois"] = pois

    # ---- roads, alleys, trails
    WIDTH = {"motorway": 26, "trunk": 22, "primary": 18, "secondary": 15, "tertiary": 13, "residential": 9.5, "unclassified": 9, "living_street": 7,
             "pedestrian": 8, "motorway_link": 9, "trunk_link": 9, "primary_link": 8, "secondary_link": 8, "tertiary_link": 7, "service": 5,
             "cycleway": 4, "footway": 3.2, "path": 3}
    roads = []
    for e in load("roads"):
        t = e.get("tags", {})
        hw = t.get("highway")
        if e["type"] != "way" or hw not in WIDTH or t.get("tunnel") in ("yes", "building_passage") or t.get("layer", "0").startswith("-"):
            continue
        pts = way_pts(e)
        if len(pts) < 2 or not any(in_bounds(p, 50) for p in pts):
            continue
        lanes = num(t.get("lanes"))
        w = WIDTH[hw] if not lanes or hw in ("service", "cycleway", "footway", "path") else max(WIDTH[hw] * 0.7, lanes * 3.3 + 2)
        c = "alley" if hw == "service" else "trail" if hw in ("cycleway", "footway", "path") else hw.replace("_link", "")
        if hw == "service" and t.get("name") and CITY.get("namedService") and re.match(CITY.get("namedServiceMatch", "."), t["name"]):
            c = CITY["namedService"]   # a named service road is a street the city closed to traffic (Rome's Via dei Fori Imperiali)
        if t.get("name") in ROAD_W:
            w = ROAD_W[t["name"]]
        if c == "trail" and not (t.get("name") or t.get("bicycle") == "designated"):
            continue
        r = {"c": c, "w": round(w, 1), "p": flat(simplify(pts, 0.4))}
        if t.get("name"):
            r["n"] = t["name"]
        if t.get("bridge") not in (None, "no"):
            r["b"] = 1 if t.get("bridge:movable") is None and t.get("bridge") != "movable" else 2
        if t.get("layer") and t["layer"] not in ("0",):
            r["l"] = int(float(t["layer"])) if re.match(r"^-?\d+(\.\d+)?$", t["layer"]) else 0
        roads.append(r)
    out["roads"] = roads

    # what a city fetched as extraFiles: footbridges (the steel bridges over the main roads, drawn by the page itself)
    # and convenience stores, by brand (a page puts the right fascia at the right door)
    if glob.glob(os.path.join(RAW, "footbridges-*.json")):
        fbs = []
        for e in load("footbridges"):
            pts = way_pts(e)
            if e["type"] == "way" and len(pts) >= 2 and any(in_bounds(p) for p in pts):
                w = num(e.get("tags", {}).get("width")) or 3.0
                fbs.append({"p": flat(simplify(pts, 0.3)), "w": round(min(w, 6), 1)})
        out["footbridges"] = fbs
    if glob.glob(os.path.join(RAW, "shops-*.json")):
        BRANDS = (("seven", ("セブン", "7-eleven", "seven")), ("family", ("ファミリーマート", "familymart", "family")), ("lawson", ("ローソン", "lawson")),
                  ("ministop", ("ミニストップ", "ministop")), ("daily", ("デイリーヤマザキ", "daily")))
        kon = []
        for e in load("shops"):
            t = e.get("tags", {})
            label = (t.get("brand", "") + " " + t.get("name", "") + " " + t.get("brand:en", "")).lower()
            b = next((k for k, keys in BRANDS if any(x.lower() in label for x in keys)), "other")
            if e["type"] == "node":
                p = xz(e["lat"], e["lon"])
            else:
                g = way_pts(e)
                p = centroid(g) if len(g) >= 3 else (g[0] if g else None)
            if p and in_bounds(p):
                kon.append({"x": q(p[0]), "z": q(p[1]), "b": b})
        out["konbini"] = kon

    # ---- rail: the L (elevated where it is a bridge), Metra; stations
    rails, stations = [], []
    for e in load("rail"):
        t = e.get("tags", {})
        if e["type"] == "node":
            p = xz(e["lat"], e["lon"])
            if in_bounds(p) and t.get("name"):
                stations.append({"n": t["name"], "x": q(p[0]), "z": q(p[1]), "net": t.get("network", t.get("operator", ""))})
            continue
        if e["type"] != "way" or t.get("tunnel") == "yes" or t.get("railway") not in ("subway", "light_rail", "tram", "rail"):
            continue
        pts = way_pts(e)
        if not any(in_bounds(p, 50) for p in pts):
            continue
        rails.append({"t": "L" if t.get("railway") in ("subway", "light_rail") else "tram" if t.get("railway") == "tram" else "rail", "e": 1 if (t.get("bridge") not in (None, "no") or t.get("layer") in ("1", "2")) else 0,
                      "p": flat(simplify(pts, 0.8)), "n": t.get("name", "")})
    out["rail"] = rails
    # one station per name, averaged
    byname = {}
    for s in stations:
        byname.setdefault(s["n"], []).append(s)
    out["stations"] = [{"n": n, "x": sum(s["x"] for s in L) // len(L), "z": sum(s["z"] for s in L) // len(L)} for n, L in byname.items()]

    # ---- buildings and building parts
    bl = load("buildings")
    parts, outlines = [], []
    for e in bl:
        t = e.get("tags", {})
        if t.get("location") in ("underground", "underwater") or str(t.get("layer", "0")).startswith("-") or t.get("building") == "underground":
            continue   # below the plaza or the street (Park Grill under McCormick Tribune Plaza, Millennium Park's garages)
        for o, holes in polys_of(e):
            if not any(in_bounds(p) for p in o):
                continue
            a = abs(area(o))
            if a < 12:
                continue
            c = centroid(o)
            h, mh = height_of(t, c)
            rec = {"o": o, "h": h, "mh": mh, "t": t, "a": a, "c": c, "i": holes}
            (parts if "building:part" in t and "building" not in t else outlines).append(rec)
    # an outline with parts inside is drawn by its parts (Willis Tower's tubes, Hancock's taper)
    grid = {}
    for p in parts:
        grid.setdefault((int(p["c"][0] // 100), int(p["c"][1] // 100)), []).append(p)
    kept = []
    dropped_by_parts = 0
    for b in outlines:
        gx, gz = int(b["c"][0] // 100), int(b["c"][1] // 100)
        near = [p for dx in (-1, 0, 1) for dz in (-1, 0, 1) for p in grid.get((gx + dx, gz + dz), [])]
        inner = [p for p in near if inside(p["c"], b["o"])]
        if inner:
            # parts that all start well above the ground (a spire mapped as parts, the shaft only as the outline): keep
            # the outline, up to where the lowest part begins, or the tower floats
            low = min(p["mh"] or 0 for p in inner)
            if low > 3:
                b["h"] = min(b["h"], low)
            else:
                dropped_by_parts += 1
                continue
        kept.append(b)
    kept += parts
    buildings, skipped = [], 0
    for b in kept:
        t = b["t"]
        small_type = t.get("building") in ("garage", "garages", "shed", "carport", "roof")
        if not detailed(b["c"]) and t.get("building") in ("shed", "carport", "roof") and b["a"] < 40:
            skipped += 1   # every building is kept; only tiny sheds outside the detail zones are dropped
            continue
        r = ring_simplify(b["o"], 0.35)
        if area(r) < 0:   # counter-clockwise in x/z (so walls face out)
            r = r[::-1]
        rec = {"p": flat(r), "h": round(b["h"], 1)}
        if COURTYARDS:
            hs = [ring_simplify(hr, 0.35) for hr in b["i"] if abs(area(hr)) >= COURTYARDS]
            hs = [hr for hr in hs if len(hr) >= 3]
            if hs:
                rec["i"] = [flat(hr) for hr in hs]
        if b["mh"]:
            rec["m"] = round(b["mh"], 1)
        typ = t.get("building") or t.get("building:part")
        if typ and typ != "yes":
            rec["t"] = typ
        col = t.get("building:colour") or t.get("colour")
        if col:
            rec["c"] = col
        mat = t.get("building:material")
        if mat:
            rec["mat"] = mat
        if t.get("name"):
            rec["n"] = t["name"]
        if t.get("roof:shape") in ("gabled", "hipped", "pyramidal", "dome", "flat"):
            rec["r"] = t["roof:shape"][0]
        lv = num(t.get("building:levels"))
        if lv:
            rec["lv"] = int(lv)
        buildings.append(rec)
    out["buildings"] = buildings
    t = terrain_grid()
    if t:
        out["terrain"] = t
        lo, hi = min(t["h"]) / 10, max(t["h"]) / 10
        print(f"terrain: {t['nx']}x{t['nz']} at {t['step']} m, {lo:.0f}..{hi:.0f} m above the water level "
              f"(datum {t['datum']} m above sea level)")
    json.dump(out, open(OUT, "w"), separators=(",", ":"), ensure_ascii=False)
    size = os.path.getsize(OUT)
    print(f"wrote {OUT}: {size / 1e6:.1f} MB; buildings {len(buildings)} (skipped {skipped} small outside the detail zones, "
          f"{dropped_by_parts} outlines drawn by their parts); roads {len(roads)}; areas {len(areas)}; water {len(polys['water'])}; "
          f"marinas {len(polys['marina'])}; beaches {len(polys['beach'])}; rail {len(rails)}; stations {len(out['stations'])}; pois {len(pois)}; "
          f"lake points {len(out['lake']) // 2}; trees {len(out['trees']) // 2}")

    if report:
        named = []
        for b in buildings:
            if b.get("n"):
                pts = [(b["p"][k] / 10, b["p"][k + 1] / 10) for k in range(0, len(b["p"]), 2)]
                named.append((b["n"], centroid(pts), b["h"]))
        for p in pois:
            named.append((p["n"], (p["x"] / 10, p["z"] / 10), 0))
        for L in CITY.get("landmarks", []):
            x, z = xz(*L["at"])
            keys = [k.lower() for k in [L["name"]] + L.get("aka", [])]
            exact = [n for n in named if n[0].lower() in keys]
            words = [w for w in re.findall(r"[a-z0-9]+", keys[0]) if len(w) > 3 and w not in ("chicago", "street", "north", "south", "park", "building", "tower", "church", "harbor", "beach")]
            loose = [n for n in named if words and all(w in n[0].lower() for w in words)]
            cand = sorted(exact or loose, key=lambda n: math.hypot(n[1][0] - x, n[1][1] - z))[:2]
            if cand:
                n = cand[0]
                la, lo = LAT0 - n[1][1] / M_LAT, LON0 + n[1][0] / M_LON
                print(f"{L['name']:36s} off {math.hypot(n[1][0] - x, n[1][1] - z):6.0f} m  osm '{n[0]}' h={n[2]:.0f}  at [{la:.5f}, {lo:.5f}]")
            else:
                print(f"{L['name']:36s} not found")

if __name__ == "__main__":
    main()
