#!/usr/bin/env python3
"""Build the Olympic Peninsula: the city file and its map data, from the real ground and the real map.

    python3 tools/make-olympic.py            build from what is cached
    python3 tools/make-olympic.py --fetch    download anything not yet cached first (elevation and OSM)

The whole peninsula, from Cape Flattery to Grays Harbor and from the Pacific to Hood Canal and Puget Sound:
about 162 km east to west and 167 km north to south. Olympic National Park is the middle of it, the mountains
and the rainforest valleys and the wild coast; round it are the national forest, the timberlands, the towns on
the Strait (Port Angeles, Sequim, Port Townsend), Forks, the Makah and Quileute reservations, and Aberdeen.

A real place, so nothing is invented that does not have to be. The ground is the AWS Terrain Tiles (terrarium
PNGs, from SRTM and NED) sampled on a 200 m grid, with sea level as y = 0: the Pacific, the Strait of Juan de
Fuca and Hood Canal are one sheet of water at y = 0 and the ground decides where the shore is (seaLevelWater).
The lakes stand at their own levels (Crescent at 177 m, Quinault at 56, Cushman at 225, Ozette at 10). The
roads, rivers, lakes, glaciers, buildings, peaks, falls, islets and the park boundary are OpenStreetMap's (ODbL),
cached under data/osm/raw/olympic/ and not committed.

What the map does not carry is written down here, from the published geography:

  the land cover    a grid at the terrain's step saying what covers the ground:
                      0 conifer forest     Douglas-fir, western hemlock and red cedar: most of the peninsula
                      1 rainforest         the Hoh, Queets, Quinault and Bogachiel valley floors: Sitka spruce and
                                           bigleaf maple hung with moss, the wettest place in the lower 48
                      2 subalpine meadow   Hurricane Ridge, Deer Park, the high basins: grass and lupine over
                                           1400 m where it is not steep
                      3 farmland           the Sequim prairie in the rain shadow, the Chehalis and Dungeness bottoms
                      4 rock and scree     the high peaks above the trees, and anything too steep to hold soil
                      5 snow and glacier   the mapped glaciers (Blue, Hoh, White, Humes, Anderson...) and the
                                           snowfields above about 1900 m on the shaded side
                      6 timber             the managed forest outside the park: a patchwork of clearcuts, each
                                           block its own age - bare and brown, bright young green, dark and closed
                      7 water              8 beach and dune     9 wetland and estuary
                    from the map's own glaciers, farmland, wetland and beaches, the park boundary, and the elevation.
  the valleys       which rivers' bottoms are rainforest, and how far up them.

Writes data/cities/olympic-osm.json, data/cities/olympic-land.json and data/cities/olympic.json.
"""
import glob
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request
from lib.geo import q, flat, simplify as _simplify


def simplify(pts, eps):
    return _simplify(pts, eps)


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "osm", "raw", "olympic")
OUT = os.path.join(ROOT, "data", "cities", "olympic-osm.json")
CFG = os.path.join(ROOT, "data", "cities", "olympic.json")
LANDF = os.path.join(ROOT, "data", "cities", "olympic-land.json")
UA = "WorldMenagerie-massing-model/1.0 (personal LAN project)"

S, W, N, E = 46.92, -124.78, 48.42, -122.62          # the peninsula and the water round it
LAT0, LON0 = 47.80, -123.60                         # near Mount Olympus, the middle of the map
M_LAT, M_LON = 111132.0, 111320.0 * math.cos(math.radians(LAT0))
STEP = 200                                          # the height grid, in metres
TZ = 11                                             # terrain tile zoom: about 51 m a pixel at this latitude


def xz(lat, lon):
    return ((lon - LON0) * M_LON, -(lat - LAT0) * M_LAT)


BX0, BZ0 = xz(N, W)
BX1, BZ1 = xz(S, E)


# ---------- fetching ----------
# [name, Overpass clauses with {b}, tiles as (rows, columns)]: the big ones in tiles, or Overpass gives up
QUERIES = [
    ("water", 'nwr["natural"="water"]({b});nwr["waterway"="riverbank"]({b});', (2, 2)),
    ("coast", 'way["natural"="coastline"]({b});nwr["place"~"^(islet|island)$"]({b});nwr["natural"~"^(beach|sand|shingle)$"]({b});', (2, 2)),
    ("waterways", 'way["waterway"="river"]({b});way["waterway"="stream"]["name"]({b});', (2, 2)),
    ("roads", 'way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street)(_link)?$"]({b});'
              'way["highway"~"^(footway|path)$"]["name"]({b});way["highway"="track"]["name"]({b});', (3, 3)),
    ("buildings", 'way["building"]({b});relation["building"]({b});', (4, 4)),
    ("pois", 'nwr["natural"~"^(peak|volcano|waterfall|glacier|hot_spring|arch|cliff|cave_entrance|rock|stone|tree)$"]["name"]({b});'
             'nwr["waterway"="waterfall"]({b});nwr["tourism"~"^(attraction|viewpoint|camp_site|alpine_hut)$"]["name"]({b});'
             'nwr["man_made"~"^(lighthouse|tower|pier|breakwater)$"]({b});nwr["place"~"^(city|town|village|hamlet)$"]({b});'
             'nwr["amenity"="ferry_terminal"]({b});way["route"="ferry"]({b});nwr["boundary"="protected_area"]["name"~"Wilderness"]({b});', (1, 1)),
    ("land", 'nwr["natural"~"^(glacier|bare_rock|scree|heath|grassland|wetland|scrub)$"]({b});'
             'nwr["landuse"~"^(farmland|meadow|grass|orchard|residential|industrial|commercial|retail|cemetery)$"]({b});'
             'nwr["leisure"~"^(park|golf_course|pitch|marina)$"]({b});', (2, 2)),
    ("boundary", 'relation["boundary"~"^(national_park|protected_area)$"]["name"="Olympic National Park"];', (1, 1)),
]


def overpass(body, dest):
    data = urllib.parse.urlencode({"data": "[out:json][timeout:600];(" + body + ");out geom;"}).encode()
    for attempt in range(7):
        try:
            req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=data, headers={"User-Agent": UA})
            raw = urllib.request.urlopen(req, timeout=660).read()
            json.loads(raw)
            open(dest, "wb").write(raw)
            return len(raw)
        except Exception as err:   # 429 and 504 from a busy server: back off and try again
            print(f"  retry ({err})", flush=True)
            time.sleep(30 * (attempt + 1))
    raise SystemExit(f"giving up on {dest}")


def fetch():
    os.makedirs(RAW, exist_ok=True)
    s0, w0, n0, e0 = S - 0.01, W - 0.01, N + 0.01, E + 0.01
    for name, body, (rows, cols) in QUERIES:
        for i in range(rows):
            for j in range(cols):
                f = os.path.join(RAW, f"{name}-{i}-{j}.json")
                if os.path.exists(f):
                    continue
                b = (s0 + (n0 - s0) * i / rows, w0 + (e0 - w0) * j / cols, s0 + (n0 - s0) * (i + 1) / rows, w0 + (e0 - w0) * (j + 1) / cols)
                size = overpass(body.replace("{b}", ",".join(f"{v:.5f}" for v in b)), f)
                print(f"  {name} {i},{j}: {size // 1000} kB", flush=True)
                time.sleep(10)   # be polite to the public server
    tdir = os.path.join(RAW, "terrain")
    os.makedirs(tdir, exist_ok=True)
    (x0, y0), (x1, y1) = tile_xy(N + 0.02, W - 0.02, TZ), tile_xy(S - 0.02, E + 0.02, TZ)
    got = 0
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            f = os.path.join(tdir, f"{TZ}_{x}_{y}.png")
            if not os.path.exists(f):
                url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{TZ}/{x}/{y}.png"
                open(f, "wb").write(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read())
                got += 1
    print(f"  terrain: {got} tiles downloaded")


def tile_xy(lat, lon, z):
    n = 2 ** z
    la = math.radians(lat)
    return int((lon + 180) / 360 * n), int((1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n)


def load(name):
    out, seen = [], set()
    for f in sorted(glob.glob(os.path.join(RAW, name + "-*.json"))):
        for e in json.load(open(f))["elements"]:
            k = (e["type"], e["id"])   # a way across a tile edge comes back from both tiles
            if k not in seen:
                seen.add(k)
                out.append(e)
    return out


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
    chains = [list(w) for w in ways if len(w) >= 2]
    rings = []
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


def polys_of(e):
    if e["type"] == "way":
        pts = way_pts(e)
        return [(pts, [])] if len(pts) >= 4 and pts[0] == pts[-1] else []
    if e["type"] == "relation":
        outers = [way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") in ("outer", "")]
        inners = [way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") == "inner"]
        o = [r for r in join_rings(outers) if len(r) >= 4 and r[0] == r[-1]]
        i = [r for r in join_rings(inners) if len(r) >= 4 and r[0] == r[-1]]
        return [(r, [h for h in i if inside(centroid(h), r)]) for r in o]
    return []


def in_bounds(p, pad=0):
    return BX0 - pad <= p[0] <= BX1 + pad and BZ0 - pad <= p[1] <= BZ1 + pad


# ---------- the ground ----------
def elevation(TZ=TZ):
    from PIL import Image
    tiles = {}
    for f in glob.glob(os.path.join(RAW, "terrain", f"{TZ}_*.png")):
        _, x, y = os.path.basename(f)[:-4].split("_")
        tiles[(int(x), int(y))] = Image.open(f).convert("RGB").load()
    n = 2 ** TZ * 256

    def elev(lat, lon):   # bilinear over the terrarium pixels: height = R*256 + G + B/256 - 32768
        la = math.radians(lat)
        px = (lon + 180) / 360 * n - 0.5
        py = (1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n - 0.5
        x0, y0 = int(math.floor(px)), int(math.floor(py))
        fx, fy = px - x0, py - y0
        tot = wsum = 0.0
        for dx, dy, wgt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
            X, Y = x0 + dx, y0 + dy
            t = tiles.get((X // 256, Y // 256))
            if t is None:
                continue
            r, g, b = t[X % 256, Y % 256]
            tot += wgt * (r * 256 + g + b / 256 - 32768)
            wsum += wgt
        return tot / wsum if wsum else -20.0
    return elev


# ---------- what the map does not carry ----------
# The rainforest valleys: [river, how far up it in metres above the sea]. Their floors, flat and low, are Sitka
# spruce and bigleaf maple in moss, the temperate rainforest; the slopes either side are hemlock like anywhere.
RAINFOREST = [("Hoh River", 260), ("Queets River", 300), ("Quinault River", 260), ("North Fork Quinault River", 300),
              ("Bogachiel River", 240), ("Sol Duc River", 200), ("Clearwater River", 220), ("Calawah River", 200),
              ("Salmon River", 150), ("Elwha River", 150)]
# The towns, [name, lat, lon, radius in metres]: inside one every building and every street is kept; outside, only
# the big or named buildings (the barns, the mills, the lodges) and the roads above residential. 350,000 buildings
# and every cul-de-sac on the peninsula would be a page nobody's machine could load.
TOWNS = [("Port Angeles", 48.105, -123.44, 5500), ("Sequim", 48.08, -123.10, 4000), ("Port Townsend", 48.11, -122.775, 4200),
         ("Port Hadlock", 48.03, -122.76, 2200), ("Forks", 47.95, -124.385, 2500), ("Aberdeen and Hoquiam", 46.98, -123.85, 6500),
         ("Shelton", 47.215, -123.10, 3500), ("Neah Bay", 48.368, -124.62, 1500), ("La Push", 47.908, -124.636, 900),
         ("Quilcene", 47.82, -122.875, 1500), ("Brinnon", 47.68, -122.90, 1200), ("Hoodsport", 47.405, -123.14, 1200),
         ("Lake Crescent", 48.058, -123.80, 1500), ("Lake Quinault", 47.468, -123.85, 2000), ("Kalaloch", 47.61, -124.375, 800),
         ("Joyce", 48.135, -123.73, 1000), ("Clallam Bay", 48.255, -124.26, 1500), ("Amanda Park", 47.46, -123.90, 1000),
         ("Montesano", 46.98, -123.60, 2500), ("Elma", 47.00, -123.405, 2000), ("Ocean Shores", 46.97, -124.16, 4000)]
SEA_FLOOR = -8.0   # the bed under the sea, just under the water; the tiles carry the Strait's depths, which nobody sees


def main():
    if "--fetch" in sys.argv:
        fetch()
    elev = elevation()

    # ---- the height grid
    nx, nz = int((BX1 - BX0) // STEP) + 2, int((BZ1 - BZ0) // STEP) + 2
    abs_h = []
    for j in range(nz):
        z = BZ0 + j * STEP
        for i in range(nx):
            x = BX0 + i * STEP
            abs_h.append(elev(LAT0 - z / M_LAT, LON0 + x / M_LON))
    H = [max(h, SEA_FLOOR) for h in abs_h]

    def gh(x, z):
        fx, fz = (x - BX0) / STEP, (z - BZ0) / STEP
        i, j = max(0, min(nx - 2, int(fx))), max(0, min(nz - 2, int(fz)))
        tx, tz = max(0.0, min(1.0, fx - i)), max(0.0, min(1.0, fz - j))
        a, b, c, d = H[j * nx + i], H[j * nx + i + 1], H[(j + 1) * nx + i], H[(j + 1) * nx + i + 1]
        return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz

    out = {"attribution": "Map data © OpenStreetMap contributors (ODbL) · elevation: AWS Terrain Tiles (SRTM/NED)",
           "units": "decimetres east (x) and south (z) of origin", "origin": [LAT0, LON0], "bounds": [S, W, N, E],
           "terrain": {"step": STEP, "nx": nx, "nz": nz, "x0": q(BX0), "z0": q(BZ0), "datum": 0,
                       "h": [int(round(h * 10)) for h in H],
                       "_": "heights in decimetres above sea level; the sea bed is held just under the water"},
           "seaLevelWater": True, "lake": [], "islands": [], "marina": [], "beach": [], "pier": [], "rail": [], "stations": [], "trees": []}

    # ---- the sea: one sheet over the whole box at sea level, which the ground stands out of. Then the lakes, each
    # at its own level (the lower quartile of its shore off the grid), and the sea-level ones (lagoons, Dungeness's
    # ponds) left to the sheet
    m = 3000
    water = [{"o": flat([(BX0 - m, BZ0 - m), (BX1 + m, BZ0 - m), (BX1 + m, BZ1 + m), (BX0 - m, BZ1 + m)]), "i": [], "n": "Sea level", "a": 1e12}]
    for e in load("water"):
        t = e.get("tags", {})
        if t.get("water") in ("river", "stream", "canal", "tidal", "lagoon", "reservoir_watershed") or t.get("waterway") == "riverbank":
            continue
        for o, holes in polys_of(e):
            a = abs(area(o))
            if a < (6000 if t.get("name") else 40000) or not in_bounds(centroid(o), -500):
                continue
            r = ring_simplify(o, 6 if a < 1e6 else 15)
            ys = sorted(gh(x, z) for x, z in r[::max(1, len(r) // 60)])
            level = ys[len(ys) // 4]
            if level < 4:   # at sea level: the sheet already covers it
                continue
            water.append({"o": flat(r), "i": [flat(ring_simplify(h, 8)) for h in holes if abs(area(h)) > 3000],
                          "n": t.get("name", ""), "y": round(level + 0.4, 1), "a": a})
    water.sort(key=lambda w: -w["a"])
    for w in water:
        del w["a"]
    out["water"] = water

    # ---- rivers, as centre lines with widths (src/olympic/nature.js draws them as ribbons)
    rivers = []
    for e in load("waterways"):
        t = e.get("tags", {})
        pts = way_pts(e)
        if len(pts) < 2 or not any(in_bounds(p) for p in pts):
            continue
        big = t.get("waterway") == "river"
        rivers.append({"n": t.get("name", ""), "w": (22 if t.get("name") in ("Hoh River", "Queets River", "Quinault River", "Elwha River", "Chehalis River", "Dungeness River", "Skokomish River", "Wynoochee River", "Humptulips River", "Wishkah River", "Satsop River", "Sol Duc River", "Bogachiel River", "Quillayute River") else 12) if big else 5,
                       "p": flat(simplify(pts, 8 if big else 15))})
    out["waterways"] = [{"n": r["n"], "p": r["p"]} for r in rivers if r["w"] > 10]

    TZ_ = [(xz(la, lo), r) for _, la, lo, r in TOWNS]
    in_town = lambda p: any((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 < r * r for c, r in TZ_)

    # ---- roads, and the named trails
    WIDTH = {"motorway": 20, "trunk": 14, "primary": 11, "secondary": 10, "tertiary": 9, "unclassified": 7, "residential": 7, "living_street": 6}
    roads = []
    for e in load("roads"):
        t = e.get("tags", {})
        hw = (t.get("highway") or "").replace("_link", "")
        pts = way_pts(e)
        if e["type"] != "way" or len(pts) < 2 or not any(in_bounds(p, 50) for p in pts) or t.get("tunnel") == "yes":
            continue
        if hw in ("residential", "living_street") and not any(in_town(p) for p in pts[::max(1, len(pts) // 4)]):
            continue   # a street out of town: the cul-de-sacs of the subdivisions are left out
        if hw in WIDTH:
            r = {"c": hw, "w": WIDTH[hw], "p": flat(simplify(pts, 2.0))}
        else:
            r = {"c": "trail", "w": 1.8, "p": flat(simplify(pts, 5.0))}
        if t.get("name"):
            r["n"] = t["name"]
        if t.get("bridge") not in (None, "no"):
            r["b"] = 1
        roads.append(r)
    out["roads"] = roads

    # ---- buildings
    MODELLED = ("lake crescent lodge", "lake quinault lodge", "hurricane ridge visitor center", "point wilson lighthouse",
                "new dungeness lighthouse", "cape flattery lighthouse", "kalaloch lodge")
    DEF_H = {"house": 6, "detached": 6, "residential": 7, "apartments": 11, "cabin": 4.5, "hotel": 11, "commercial": 7, "retail": 6,
             "industrial": 9, "warehouse": 9, "garage": 3.5, "garages": 3.5, "shed": 3, "hut": 3.5, "roof": 4, "barn": 8,
             "farm_auxiliary": 6, "church": 11, "school": 8, "public": 8, "yes": 5.5}
    buildings = []
    for e in load("buildings"):
        t = e.get("tags", {})
        if (t.get("name") or "").lower() in MODELLED:
            continue
        for o, holes in polys_of(e):
            if not any(in_bounds(p) for p in o) or abs(area(o)) < 12:
                continue
            if not t.get("name") and abs(area(o)) < 600 and not in_town(o[0]):
                continue   # out of town, only the big ones: barns, mills, sheds of the logging companies
            r = ring_simplify(o, 0.5)
            if area(r) < 0:
                r = r[::-1]
            typ = t.get("building", "yes")
            h = None
            try:
                h = float(str(t.get("height", "")).split()[0])
            except (ValueError, IndexError):
                pass
            if h is None and t.get("building:levels"):
                try:
                    h = float(t["building:levels"]) * 3.2 + 1.5
                except ValueError:
                    pass
            hsh = (math.sin(r[0][0] * 12.9898 + r[0][1] * 78.233) * 43758.5453) % 1
            rec = {"p": flat(r), "h": round((h or DEF_H.get(typ, 5.5) * (0.85 + 0.3 * hsh)), 1), "r": "g" if abs(area(r)) < 700 else "h"}
            if typ != "yes":
                rec["t"] = typ
            if t.get("name"):
                rec["n"] = t["name"]
            buildings.append(rec)
    out["buildings"] = buildings

    # ---- points: peaks, falls, glaciers by name, lighthouses, towns, viewpoints, camps, springs, named trees
    pois, ferries = [], []
    for e in load("pois"):
        t = e.get("tags", {})
        if t.get("route") == "ferry":
            pts = way_pts(e)
            if len(pts) > 1:
                ferries.append({"n": t.get("name", ""), "p": flat(simplify(pts, 30))})
            continue
        kind = (t.get("natural") or ("waterfall" if t.get("waterway") == "waterfall" else None) or t.get("man_made")
                or t.get("tourism") or t.get("place") or ("ferry" if t.get("amenity") == "ferry_terminal" else None)
                or ("wilderness" if t.get("boundary") == "protected_area" else None))
        if not kind or kind == "wilderness":
            continue
        if e["type"] == "node":
            p = xz(e["lat"], e["lon"])
        else:
            g = [pt for mm in ([e] if e["type"] == "way" else e.get("members", [])) for pt in way_pts(mm)]
            if not g:
                continue
            p = centroid(g)
        if not in_bounds(p):
            continue
        if kind in ("pier", "breakwater", "tower") and not t.get("name"):
            continue
        rec = {"n": t.get("name", ""), "x": q(p[0]), "z": q(p[1]), "k": kind}
        if t.get("ele"):
            try:
                rec["h"] = round(float(str(t["ele"]).split()[0]))
            except ValueError:
                pass
        if kind in ("city", "town", "village", "hamlet") and t.get("population"):
            try:
                rec["pop"] = int(str(t["population"]).replace(",", ""))
            except ValueError:
                pass
        pois.append(rec)
    out["pois"] = pois

    # ---- the towns' land use, for the engine's ground (yards, shops, industry, parks)
    AK = {("landuse", "residential"): "residential", ("landuse", "commercial"): "commercial", ("landuse", "retail"): "commercial",
          ("landuse", "industrial"): "industrial", ("landuse", "cemetery"): "cemetery", ("leisure", "park"): "park",
          ("leisure", "golf_course"): "golf", ("leisure", "pitch"): "pitch", ("leisure", "marina"): "plaza"}
    areas = []
    landels = load("land")
    for e in landels:
        t = e.get("tags", {})
        kind = next((v for (k, val), v in AK.items() if t.get(k) == val), None)
        if not kind:
            continue
        for o, holes in polys_of(e):
            if abs(area(o)) < 400 or not any(in_bounds(p) for p in o):
                continue
            areas.append({"k": kind, "n": t.get("name", ""), "o": flat(ring_simplify(o, 2)), "i": [flat(ring_simplify(h, 2)) for h in holes]})
    out["areas"] = areas

    # ---- the park boundary
    bnd_rings = []
    for e in load("boundary"):
        outers = [way_pts(mm) for mm in e.get("members", []) if mm.get("type") == "way" and mm.get("role") in ("outer", "")]
        bnd_rings += [r for r in join_rings(outers) if len(r) > 3]

    # ---- land cover, on the terrain grid
    from PIL import Image, ImageDraw
    img = Image.new("L", (nx, nz), 0)
    dr = ImageDraw.Draw(img)
    gx = lambda x: (x - BX0) / STEP
    gz = lambda z: (z - BZ0) / STEP

    def paint(ring, v, d=dr):
        if len(ring) >= 3:
            d.polygon([(gx(x), gz(z)) for x, z in ring], fill=v)

    park = Image.new("L", (nx, nz), 0)
    pd = ImageDraw.Draw(park)
    for r in bnd_rings:
        if r[0] == r[-1]:
            paint(r, 1, pd)
    parkpx = park.load()

    def hashn(i, j, k):
        v = math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453
        return v - math.floor(v)

    def vnoise(x, y, k):
        i, j = int(math.floor(x)), int(math.floor(y))
        fx, fy = x - i, y - j
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        a, b, c, d = hashn(i, j, k), hashn(i + 1, j, k), hashn(i, j + 1, k), hashn(i + 1, j + 1, k)
        return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy

    # the rainforest rivers, densified, on a 1 km bucket grid for the distance test
    rf_pts = {}
    rf_set = {n: lim for n, lim in RAINFOREST}
    for rv in rivers:
        if rv["n"] in rf_set:
            pts = [(rv["p"][k] / 10, rv["p"][k + 1] / 10) for k in range(0, len(rv["p"]), 2)]
            for k in range(len(pts) - 1):
                (ax, az), (bx, bz) = pts[k], pts[k + 1]
                n = max(1, int(math.hypot(bx - ax, bz - az) // 100))
                for u in range(n):
                    x, z = ax + (bx - ax) * u / n, az + (bz - az) * u / n
                    rf_pts.setdefault((int(x // 1000), int(z // 1000)), []).append((x, z, rf_set[rv["n"]]))

    def rf_near(x, z, reach):
        best = None
        for di in (-2, -1, 0, 1, 2):
            for dj in (-2, -1, 0, 1, 2):
                for px_, pz_, lim in rf_pts.get((int(x // 1000) + di, int(z // 1000) + dj), []):
                    d = math.hypot(px_ - x, pz_ - z)
                    if d < reach and (best is None or d < best[0]):
                        best = (d, lim)
        return best

    # timber blocks: the clearcut patchwork, a cell each, each its own age (0 fresh, 1 young, 2 closed)
    BLOCK = 600
    def timber_age(x, z):
        bi, bj = int(math.floor((x + 3e5) / BLOCK)), int(math.floor((z + 3e5) / BLOCK))
        # blocks are not on a grid in life: jitter the cell edges by noise, so they read as cut units, not squares
        jx, jz = (vnoise(x / 900, z / 900, 41) - 0.5) * BLOCK * 0.6, (vnoise(x / 900, z / 900, 43) - 0.5) * BLOCK * 0.6
        bi, bj = int(math.floor((x + jx + 3e5) / BLOCK)), int(math.floor((z + jz + 3e5) / BLOCK))
        r = hashn(bi, bj, 7)
        return 0 if r < 0.16 else 1 if r < 0.48 else 2

    slope_at = [0.0] * (nx * nz)
    face_n = [0.0] * (nx * nz)
    for j in range(nz):
        for i in range(nx):
            hx = abs_h[j * nx + min(nx - 1, i + 1)] - abs_h[j * nx + max(0, i - 1)]
            hzv = abs_h[min(nz - 1, j + 1) * nx + i] - abs_h[max(0, j - 1) * nx + i]
            slope_at[j * nx + i] = math.hypot(hx, hzv) / (2 * STEP)
            face_n[j * nx + i] = hzv / (2 * STEP)   # > 0: the ground falls away to the north (z grows southward)
    AGE = [0] * (nx * nz)
    for j in range(nz):
        for i in range(nx):
            k = j * nx + i
            a = abs_h[k]
            if a < 0.5:
                img.putpixel((i, j), 7)
                continue
            x, z = BX0 + i * STEP, BZ0 + j * STEP
            sl = slope_at[k]
            nn = vnoise(i / 5, j / 5, 3) - 0.5
            v = 0
            if a > 1950 + 140 * nn and sl < 0.75 and (face_n[k] < 0.05 or a > 2150):
                v = 5   # the snowfields: on the shaded north and east faces first
            elif a > 1700 + 160 * nn or sl > 0.95:
                v = 4
            elif a > 1350 + 150 * nn and sl < 0.5:
                v = 2
            else:
                inpark = parkpx[i, j] if 0 <= i < nx and 0 <= j < nz else 0
                rf = rf_near(x, z, 1600) if a < 340 and sl < 0.18 else None
                if rf and a < rf[1]:
                    v = 1
                elif not inpark and a < 1150 + 120 * nn:
                    v = 6
                    AGE[k] = timber_age(x, z)
            if v:
                img.putpixel((i, j), v)
    # the map's own: glaciers, farmland, wetland, rock; then the beaches and the lakes over it
    LAND = {"glacier": 5, "bare_rock": 4, "scree": 4, "farmland": 3, "meadow": 3, "grass": 3, "orchard": 3, "wetland": 9, "heath": 2, "grassland": 2}
    nland = 0
    for e in landels:
        t = e.get("tags", {})
        v = LAND.get(t.get("natural")) or LAND.get(t.get("landuse"))
        if not v:
            continue
        for o, holes in polys_of(e):
            paint(o, v)
            for h in holes:
                paint(h, 0)
            nland += 1
    beaches = []
    stacks = []
    coast_ways = []
    for e in load("coast"):
        t = e.get("tags", {})
        if t.get("natural") in ("beach", "sand", "shingle"):
            for o, holes in polys_of(e):
                paint(o, 8)
            continue
        if t.get("natural") == "coastline":
            pts = way_pts(e)
            if len(pts) > 1 and any(in_bounds(p) for p in pts):
                coast_ways.append(pts)
            continue
        if t.get("place") in ("islet", "island"):
            if e["type"] == "node":
                p, r = xz(e["lat"], e["lon"]), 25
            else:
                g = [pt for mm in ([e] if e["type"] == "way" else e.get("members", [])) for pt in way_pts(mm)]
                if not g:
                    continue
                p, r = centroid(g), math.sqrt(abs(area(g)) / math.pi) if len(g) > 2 else 25
            if in_bounds(p) and r < 260:
                stacks.append({"x": q(p[0]), "z": q(p[1]), "r": round(max(8, r), 1), "n": t.get("name", "")})
    # small closed coastline rings are islets too (the sea stacks off the coast are mostly mapped this way)
    for ring in join_rings(coast_ways):
        if ring[0] == ring[-1] and len(ring) > 3:
            a = abs(area(ring))
            if a < 2e5:
                c = centroid(ring)
                if in_bounds(c) and not any(abs(s["x"] / 10 - c[0]) < 30 and abs(s["z"] / 10 - c[1]) < 30 for s in stacks):
                    stacks.append({"x": q(c[0]), "z": q(c[1]), "r": round(max(8, math.sqrt(a / math.pi)), 1), "n": ""})
    for w in water[1:]:
        o = [(w["o"][k] / 10, w["o"][k + 1] / 10) for k in range(0, len(w["o"]), 2)]
        paint(o, 7)
    cover = list(img.getdata())
    rle, k = [], 0
    while k < len(cover):
        v, n = cover[k], 1
        while k + n < len(cover) and cover[k + n] == v and n < 60000:
            n += 1
        rle += [v, n]
        k += n
    arle, k = [], 0
    while k < len(AGE):
        v, n = AGE[k], 1
        while k + n < len(AGE) and AGE[k + n] == v and n < 60000:
            n += 1
        arle += [v, n]
        k += n
    # the coast as lines, simplified, for the surf: the open Pacific coast gets the big surf, the Strait a little
    coast = [flat(simplify(r, 25)) for r in join_rings(coast_ways) if len(r) > 6 and abs(area(r) if r[0] == r[-1] else 1e9) > 2e5]
    land = {"cover": {"step": STEP, "nx": nx, "nz": nz, "rle": rle,
                      "_": "0 conifer forest, 1 rainforest, 2 subalpine meadow, 3 farmland, 4 rock, 5 snow and glacier, 6 timber, 7 water, 8 beach, 9 wetland"},
            "age": {"rle": arle, "_": "the timber's age, cell by cell: 0 fresh clearcut, 1 young plantation, 2 closed forest"},
            "boundary": [flat(simplify(r, 60)) for r in bnd_rings],
            "rivers": rivers, "stacks": stacks, "coast": coast, "ferries": ferries,
            "_": "What the engine does not read and src/olympic/ does: the land cover and the timber's ages, the park boundary, the rivers with their widths, the sea stacks, the coast and the ferry routes. Written by tools/make-olympic.py."}
    json.dump(out, open(OUT, "w"), separators=(",", ":"), ensure_ascii=False)
    json.dump(land, open(LANDF, "w"), separators=(",", ":"), ensure_ascii=False)
    import collections
    cc = collections.Counter(cover)
    print(f"wrote {LANDF}: {os.path.getsize(LANDF) / 1e6:.1f} MB; cover {dict(sorted(cc.items()))}")
    print(f"wrote {OUT}: {os.path.getsize(OUT) / 1e6:.1f} MB; terrain {nx}x{nz} at {STEP} m, top {max(H):.0f} m; lakes {len(water) - 1}; "
          f"rivers {len(rivers)}; roads {len(roads)}; buildings {len(buildings)}; pois {len(pois)}; areas {len(areas)}; "
          f"stacks {len(stacks)}; coast lines {len(coast)}; ferries {len(ferries)}; land polygons {nland}; boundary rings {len(bnd_rings)}")
    write_config(gh)


# ---------- the city file ----------
def write_config(gh):
    def view(f, t, fh, th):
        """A viewpoint, heights given above the ground (or the sea) under each end."""
        fx, fz = xz(*f)
        tx, tz = xz(*t)
        return [[f[0], f[1], round(max(gh(fx, fz), 0) + fh, 1)], [t[0], t[1], round(max(gh(tx, tz), 0) + th, 1)]]
    keep = {}
    if os.path.exists(CFG):
        keep = json.load(open(CFG))
    import olympic_places as P   # the landmarks and the views: tools/olympic_places.py
    cfg = P.config(view, (S, W, N, E), (LAT0, LON0))
    # what was tuned by hand in the city file and is not the generator's (none yet) is kept
    for k in keep.get("_keep", []):
        if k in keep:
            cfg[k] = keep[k]
    json.dump(cfg, open(CFG, "w"), ensure_ascii=False, indent=1)
    print(f"wrote {CFG}: {len(cfg['landmarks'])} landmarks, {len(cfg['views'])} views")


if __name__ == "__main__":
    if "--fetch-only" in sys.argv:
        fetch()
        sys.exit(0)
    main()
